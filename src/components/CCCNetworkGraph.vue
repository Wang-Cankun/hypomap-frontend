<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { Network } from 'vis-network';

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  },
  selectedCluster: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['node-click', 'edge-click']);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9120/hypomap-backend/api/v1';

// State
const container = ref(null);
const network = ref(null);
const isLoading = ref(false);
const error = ref(null);
const cccData = ref(null);

// Filters
const selectedPathway = ref('all');
const minProbability = ref(0);
const showLabels = ref(false);  // Off by default - too cluttered
const maxEdges = ref(100);  // Limit edges for performance
const showTable = ref(true);  // Show data table

// Computed
const availablePathways = computed(() => {
  // Use pathways from API if available
  if (cccData.value?.pathways?.length) {
    return ['all', ...cccData.value.pathways];
  }
  // Fallback: extract from edges
  if (!cccData.value?.edges) return [];
  const pathways = new Set(cccData.value.edges.map(e => e.pathway).filter(Boolean));
  return ['all', ...Array.from(pathways).sort()];
});

const filteredData = computed(() => {
  if (!cccData.value) return { nodes: [], edges: [] };

  let edges = [...cccData.value.edges];

  // Filter by pathway
  if (selectedPathway.value !== 'all') {
    edges = edges.filter(e => e.pathway === selectedPathway.value);
  }

  // Filter by probability (higher is better, so filter out low probability)
  if (minProbability.value > 0) {
    edges = edges.filter(e => (e.prob || 0) >= minProbability.value);
  }

  // Filter edges involving selected cluster
  if (props.selectedCluster) {
    const clusterLabel = `C${props.selectedCluster}`;
    edges = edges.filter(e =>
      e.from === clusterLabel || e.to === clusterLabel
    );
  }

  // Sort by probability (highest first) and limit
  edges.sort((a, b) => (b.prob || 0) - (a.prob || 0));

  // Limit edges for performance
  if (maxEdges.value > 0 && edges.length > maxEdges.value) {
    edges = edges.slice(0, maxEdges.value);
  }

  // Get nodes that are connected
  const connectedNodes = new Set();
  edges.forEach(e => {
    connectedNodes.add(e.from);
    connectedNodes.add(e.to);
  });

  const nodes = cccData.value.nodes.filter(n => connectedNodes.has(n.id));

  return { nodes, edges };
});

// Stats for display
const totalEdgesCount = computed(() => cccData.value?.edges?.length || 0);
const filteredEdgesCount = computed(() => filteredData.value.edges.length);

// Table data for current view
const tableData = computed(() => {
  return filteredData.value.edges.map((e, idx) => ({
    id: idx,
    from: e.from,
    to: e.to,
    ligand: e.ligand,
    receptor: e.receptor,
    pathway: e.pathway,
    prob: e.prob
  }));
});

// Methods
const loadCCCData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE_URL}/h5ad/${props.datasetId}/ccc/network`);

    if (!response.ok) {
      // Try to load from precomputed CSV
      await loadFromCSV();
      return;
    }

    const data = await response.json();
    cccData.value = transformApiData(data);
  } catch (err) {
    console.error('Error loading CCC data:', err);
    // Try fallback
    await loadFromCSV();
  } finally {
    isLoading.value = false;
    // Wait for DOM update then render network
    await nextTick();
    renderNetwork();
  }
};

const loadFromCSV = async () => {
  try {
    // Fetch raw CSV data if available
    const response = await fetch(`${API_BASE_URL}/upload/datasets`);
    if (response.ok) {
      const data = await response.json();
      const dataset = data.datasets.find(d => d.dataset_id === props.datasetId);
      if (dataset?.has_ccc) {
        // Construct mock data for demo
        cccData.value = generateMockCCCData();
        // renderNetwork will be called in finally block of loadCCCData
      } else {
        error.value = 'No CCC data available for this dataset';
      }
    }
  } catch (err) {
    error.value = 'Failed to load CCC data';
  }
};

const generateMockCCCData = () => {
  // Generate sample CCC network for demonstration
  const clusters = ['C0', 'C1', 'C2', 'C3', 'C4', 'C5'];
  const pathways = ['TGFb', 'WNT', 'NOTCH', 'EGF', 'VEGF'];
  const ligands = ['TGFB1', 'WNT5A', 'DLL1', 'EGF', 'VEGFA'];
  const receptors = ['TGFBR1', 'FZD1', 'NOTCH1', 'EGFR', 'KDR'];

  const nodes = clusters.map(id => ({
    id,
    label: id,
    group: id
  }));

  const edges = [];
  for (let i = 0; i < 20; i++) {
    const from = clusters[Math.floor(Math.random() * clusters.length)];
    const to = clusters[Math.floor(Math.random() * clusters.length)];
    if (from !== to) {
      const pathwayIdx = Math.floor(Math.random() * pathways.length);
      edges.push({
        from,
        to,
        ligand: ligands[pathwayIdx],
        receptor: receptors[pathwayIdx],
        pathway: pathways[pathwayIdx],
        prob: Math.random() * 1e-10
      });
    }
  }

  return { nodes, edges };
};

const transformApiData = (data) => {
  // Transform API response to vis-network format
  // Handle both new format (nodes/edges) and old format (interactions)

  // New format from CSV endpoint - already has nodes and edges
  if (data.nodes && data.edges) {
    return {
      nodes: data.nodes,
      edges: data.edges,
      pathways: data.pathways || []
    };
  }

  // Old format with interactions array
  const nodeMap = new Map();
  const edges = [];

  if (data.interactions) {
    data.interactions.forEach(interaction => {
      const source = interaction.source;
      const target = interaction.target;

      if (!nodeMap.has(source)) {
        nodeMap.set(source, { id: source, label: source, group: source });
      }
      if (!nodeMap.has(target)) {
        nodeMap.set(target, { id: target, label: target, group: target });
      }

      edges.push({
        from: source,
        to: target,
        ligand: interaction.ligand,
        receptor: interaction.receptor,
        pathway: interaction.pathway_name,
        prob: interaction.prob
      });
    });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges
  };
};

const renderNetwork = () => {
  if (!container.value || !filteredData.value) return;

  const data = filteredData.value;

  // Prepare nodes
  const nodes = data.nodes.map(n => ({
    id: n.id,
    label: n.label,
    group: n.group,
    shape: 'circle',
    size: 30,
    font: { size: 14, color: '#333' }
  }));

  // Prepare edges
  const edges = data.edges.map((e, idx) => ({
    id: idx,
    from: e.from,
    to: e.to,
    label: showLabels.value ? `${e.ligand}-${e.receptor}` : '',
    title: `${e.ligand} -> ${e.receptor}\nPathway: ${e.pathway}\nProbability: ${e.prob?.toExponential(2) || 'N/A'}`,
    width: Math.max(1, Math.min(5, -Math.log10(e.prob || 1e-15) / 3)),
    arrows: 'to',
    smooth: { type: 'curvedCW', roundness: 0.2 },
    color: {
      color: getPathwayColor(e.pathway),
      opacity: 0.8
    },
    font: { size: 10, color: '#666', align: 'middle' }
  }));

  const options = {
    nodes: {
      borderWidth: 2,
      shadow: true
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.2
      },
      shadow: false  // Disable shadow for performance
    },
    groups: getClusterColors(),
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        iterations: 200,
        updateInterval: 25
      },
      barnesHut: {
        gravitationalConstant: -3000,
        centralGravity: 0.3,
        springLength: 250,
        springConstant: 0.02,
        damping: 0.09,
        avoidOverlap: 0.5
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      zoomView: true,
      dragView: true
    },
    layout: {
      improvedLayout: true,
      randomSeed: 42  // Consistent layout
    }
  };

  // Destroy existing network
  if (network.value) {
    network.value.destroy();
  }

  // Create new network
  network.value = new Network(container.value, { nodes, edges }, options);

  // Disable physics after stabilization to stop spinning
  network.value.on('stabilizationIterationsDone', () => {
    network.value.setOptions({ physics: { enabled: false } });
  });

  // Event handlers
  network.value.on('click', (params) => {
    if (params.nodes.length > 0) {
      emit('node-click', { nodeId: params.nodes[0] });
    } else if (params.edges.length > 0) {
      const edge = data.edges[params.edges[0]];
      emit('edge-click', { edge });
    }
  });
};

// Pathway color palette
const pathwayColors = {
  'TGFb': '#e74c3c',
  'WNT': '#3498db',
  'ncWNT': '#2980b9',
  'NOTCH': '#9b59b6',
  'EGF': '#2ecc71',
  'VEGF': '#f39c12',
  'FGF': '#e67e22',
  'PDGF': '#1abc9c',
  'BMP': '#d35400',
  'HH': '#8e44ad',
  'TNF': '#c0392b',
  'IL': '#16a085',
  'CCL': '#27ae60',
  'CXCL': '#2980b9',
  'default': '#7f8c8d'
};

const getPathwayColor = (pathway) => {
  if (pathwayColors[pathway]) return pathwayColors[pathway];
  // Try partial match
  for (const [key, color] of Object.entries(pathwayColors)) {
    if (pathway?.includes(key) || key.includes(pathway)) return color;
  }
  return pathwayColors.default;
};

const getClusterColors = () => {
  const colors = ['#1abc9c', '#3498db', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#e67e22', '#2ecc71'];
  const groups = {};
  for (let i = 0; i < 20; i++) {
    groups[`C${i}`] = {
      color: {
        background: colors[i % colors.length],
        border: colors[i % colors.length]
      }
    };
  }
  return groups;
};

const fitNetwork = () => {
  if (network.value) {
    network.value.fit();
  }
};

// Lifecycle
onMounted(() => {
  loadCCCData();
});

onUnmounted(() => {
  if (network.value) {
    network.value.destroy();
  }
});

// Watchers
watch(() => props.datasetId, loadCCCData);
watch(() => props.selectedCluster, renderNetwork);
watch([selectedPathway, minProbability, showLabels, maxEdges], renderNetwork);
</script>

<template>
  <div class="ccc-network-container">
    <!-- Controls -->
    <div class="controls-bar">
      <div class="control-group">
        <label class="control-label">Pathway</label>
        <select v-model="selectedPathway" class="control-select">
          <option v-for="pathway in availablePathways" :key="pathway" :value="pathway">
            {{ pathway === 'all' ? 'All Pathways' : pathway }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Max Edges</label>
        <select v-model.number="maxEdges" class="control-select">
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="200">200</option>
          <option :value="500">500</option>
          <option :value="0">All</option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-checkbox">
          <input v-model="showLabels" type="checkbox" />
          <span>Labels</span>
        </label>
      </div>

      <div class="control-group">
        <label class="control-checkbox">
          <input v-model="showTable" type="checkbox" />
          <span>Table</span>
        </label>
      </div>

      <button @click="fitNetwork" class="control-button">
        Fit View
      </button>

      <span class="stats-text">
        Showing {{ filteredEdgesCount }} of {{ totalEdgesCount }} interactions
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading CCC network...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Main Content: Network + Table -->
    <div v-else class="main-content">
      <!-- Network Graph -->
      <div ref="container" class="network-container" :class="{ 'with-table': showTable }"></div>

      <!-- Data Table -->
      <div v-if="showTable" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Ligand</th>
              <th>Receptor</th>
              <th>Pathway</th>
              <th>Prob</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableData" :key="row.id">
              <td>{{ row.from }}</td>
              <td>{{ row.to }}</td>
              <td class="gene-name">{{ row.ligand }}</td>
              <td class="gene-name">{{ row.receptor }}</td>
              <td>
                <span class="pathway-badge" :style="{ background: getPathwayColor(row.pathway) }">
                  {{ row.pathway }}
                </span>
              </td>
              <td class="prob-value">{{ row.prob?.toExponential(2) || 'N/A' }}</td>
            </tr>
            <tr v-if="tableData.length === 0">
              <td colspan="6" class="no-data">No interactions to display</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="availablePathways.length > 1 && !showTable" class="legend">
      <h4>Pathways</h4>
      <div class="legend-items">
        <div
          v-for="pathway in availablePathways.slice(1, 8)"
          :key="pathway"
          class="legend-item"
        >
          <span class="legend-color" :style="{ background: getPathwayColor(pathway) }"></span>
          <span>{{ pathway }}</span>
        </div>
        <div v-if="availablePathways.length > 8" class="legend-item text-gray-400">
          +{{ availablePathways.length - 8 }} more
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ccc-network-container {
  @apply flex flex-col h-full relative;
}

.controls-bar {
  @apply flex flex-wrap items-center gap-3 p-3 bg-gray-50 border-b border-gray-200;
}

.control-group {
  @apply flex items-center gap-2;
}

.control-label {
  @apply text-sm font-medium text-gray-700;
}

.control-select {
  @apply px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500;
}

.control-checkbox {
  @apply flex items-center gap-1 text-sm text-gray-700 cursor-pointer;
}

.control-button {
  @apply px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors;
}

.stats-text {
  @apply ml-auto text-xs text-gray-500;
}

.main-content {
  @apply flex-1 flex overflow-hidden;
}

.network-container {
  @apply flex-1 min-h-[350px];
}

.network-container.with-table {
  @apply w-1/2;
}

.table-container {
  @apply w-1/2 overflow-auto border-l border-gray-200 bg-white;
}

.data-table {
  @apply w-full text-xs;
}

.data-table th {
  @apply sticky top-0 bg-gray-100 px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200;
}

.data-table td {
  @apply px-2 py-1.5 border-b border-gray-100;
}

.data-table tr:hover {
  @apply bg-gray-50;
}

.gene-name {
  @apply font-mono text-primary-600;
}

.pathway-badge {
  @apply inline-block px-1.5 py-0.5 rounded text-white text-[10px] font-medium;
}

.prob-value {
  @apply font-mono text-gray-500;
}

.no-data {
  @apply text-center text-gray-400 py-8;
}

.loading-state, .error-state {
  @apply flex-1 flex flex-col items-center justify-center text-gray-500;
}

.spinner {
  @apply w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.legend {
  @apply absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10;
}

.legend h4 {
  @apply text-xs font-semibold text-gray-700 mb-2;
}

.legend-items {
  @apply space-y-1;
}

.legend-item {
  @apply flex items-center gap-2 text-xs text-gray-600;
}

.legend-color {
  @apply w-3 h-3 rounded;
}
</style>
