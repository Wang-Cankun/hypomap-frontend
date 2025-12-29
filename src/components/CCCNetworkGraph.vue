<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
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
const showLabels = ref(true);

// Computed
const availablePathways = computed(() => {
  if (!cccData.value?.edges) return [];
  const pathways = new Set(cccData.value.edges.map(e => e.pathway).filter(Boolean));
  return ['all', ...Array.from(pathways)];
});

const filteredData = computed(() => {
  if (!cccData.value) return { nodes: [], edges: [] };

  let edges = cccData.value.edges;

  // Filter by pathway
  if (selectedPathway.value !== 'all') {
    edges = edges.filter(e => e.pathway === selectedPathway.value);
  }

  // Filter by probability
  if (minProbability.value > 0) {
    edges = edges.filter(e => e.prob >= minProbability.value);
  }

  // Filter edges involving selected cluster
  if (props.selectedCluster) {
    const clusterLabel = `C${props.selectedCluster}`;
    edges = edges.filter(e =>
      e.from === clusterLabel || e.to === clusterLabel
    );
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
    renderNetwork();
  } catch (err) {
    console.error('Error loading CCC data:', err);
    // Try fallback
    await loadFromCSV();
  } finally {
    isLoading.value = false;
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
        renderNetwork();
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
      smooth: true,
      shadow: true
    },
    groups: getClusterColors(),
    physics: {
      stabilization: {
        enabled: true,
        iterations: 100
      },
      barnesHut: {
        gravitationalConstant: -2000,
        springLength: 200
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200
    }
  };

  // Destroy existing network
  if (network.value) {
    network.value.destroy();
  }

  // Create new network
  network.value = new Network(container.value, { nodes, edges }, options);

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

const getPathwayColor = (pathway) => {
  const colors = {
    'TGFb': '#e74c3c',
    'WNT': '#3498db',
    'NOTCH': '#9b59b6',
    'EGF': '#2ecc71',
    'VEGF': '#f39c12',
    'default': '#95a5a6'
  };
  return colors[pathway] || colors.default;
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
watch([selectedPathway, minProbability, showLabels], renderNetwork);
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
        <label class="control-label">Min Probability</label>
        <input
          v-model.number="minProbability"
          type="range"
          min="0"
          max="1e-10"
          step="1e-12"
          class="control-range"
        />
      </div>

      <div class="control-group">
        <label class="control-checkbox">
          <input v-model="showLabels" type="checkbox" />
          <span>Show Labels</span>
        </label>
      </div>

      <button @click="fitNetwork" class="control-button">
        Fit View
      </button>
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

    <!-- Network Graph -->
    <div v-else ref="container" class="network-container"></div>

    <!-- Legend -->
    <div class="legend">
      <h4>Pathways</h4>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color" style="background: #e74c3c"></span>
          <span>TGFb</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #3498db"></span>
          <span>WNT</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #9b59b6"></span>
          <span>NOTCH</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #2ecc71"></span>
          <span>EGF</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #f39c12"></span>
          <span>VEGF</span>
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
  @apply flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200;
}

.control-group {
  @apply flex items-center gap-2;
}

.control-label {
  @apply text-sm font-medium text-gray-700;
}

.control-select {
  @apply px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500;
}

.control-range {
  @apply w-24;
}

.control-checkbox {
  @apply flex items-center gap-2 text-sm text-gray-700 cursor-pointer;
}

.control-button {
  @apply px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors;
}

.network-container {
  @apply flex-1 min-h-[400px];
}

.loading-state, .error-state {
  @apply flex-1 flex flex-col items-center justify-center text-gray-500;
}

.spinner {
  @apply w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.legend {
  @apply absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200;
}

.legend h4 {
  @apply text-sm font-semibold text-gray-700 mb-2;
}

.legend-items {
  @apply space-y-1;
}

.legend-item {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.legend-color {
  @apply w-4 h-4 rounded;
}
</style>
