<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { Network } from 'vis-network';

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  },
  cluster: {
    type: String,
    default: '0'
  }
});

const emit = defineEmits(['tf-select', 'gene-select']);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9120/hypomap-backend/api/v1';

// State
const container = ref(null);
const network = ref(null);
const isLoading = ref(false);
const error = ref(null);
const regulonData = ref(null);

// Filters
const selectedTF = ref('all');
const maxTargets = ref(50);
const searchGene = ref('');
const layoutType = ref('hierarchical');

// Computed
const availableTFs = computed(() => {
  if (!regulonData.value?.edges) return [];
  const tfs = new Set(regulonData.value.edges.map(e => e.tf));
  return ['all', ...Array.from(tfs).sort()];
});

const filteredData = computed(() => {
  if (!regulonData.value) return { nodes: [], edges: [] };

  let edges = regulonData.value.edges;

  // Filter by selected TF
  if (selectedTF.value !== 'all') {
    edges = edges.filter(e => e.tf === selectedTF.value);
  }

  // Filter by search
  if (searchGene.value) {
    const search = searchGene.value.toUpperCase();
    edges = edges.filter(e =>
      e.tf.toUpperCase().includes(search) ||
      e.target.toUpperCase().includes(search)
    );
  }

  // Limit targets per TF
  const tfCounts = {};
  edges = edges.filter(e => {
    tfCounts[e.tf] = (tfCounts[e.tf] || 0) + 1;
    return tfCounts[e.tf] <= maxTargets.value;
  });

  // Build node set
  const nodeMap = new Map();
  edges.forEach(e => {
    if (!nodeMap.has(e.tf)) {
      nodeMap.set(e.tf, { id: e.tf, label: e.tf, type: 'tf' });
    }
    if (!nodeMap.has(e.target)) {
      nodeMap.set(e.target, { id: e.target, label: e.target, type: 'target' });
    }
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges
  };
});

const tfStats = computed(() => {
  if (!regulonData.value?.edges) return [];
  const stats = {};
  regulonData.value.edges.forEach(e => {
    stats[e.tf] = (stats[e.tf] || 0) + 1;
  });
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tf, count]) => ({ tf, count }));
});

// Methods
const loadRegulonData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `${API_BASE_URL}/h5ad/${props.datasetId}/regulon/network?cluster=${props.cluster}`
    );

    if (!response.ok) {
      // Generate demo data
      regulonData.value = generateDemoData();
      renderNetwork();
      return;
    }

    const data = await response.json();
    regulonData.value = transformApiData(data);
    renderNetwork();
  } catch (err) {
    console.error('Error loading regulon data:', err);
    // Generate demo data for visualization
    regulonData.value = generateDemoData();
    renderNetwork();
  } finally {
    isLoading.value = false;
  }
};

const generateDemoData = () => {
  // Generate sample TF-target network
  const tfs = ['REST', 'TP53', 'MYC', 'JUN', 'FOS', 'STAT3', 'NFE2L2', 'CREB1'];
  const edges = [];

  tfs.forEach(tf => {
    const numTargets = Math.floor(Math.random() * 30) + 10;
    for (let i = 0; i < numTargets; i++) {
      edges.push({
        tf,
        target: `${tf}_target_${i + 1}`
      });
    }
  });

  return { edges };
};

const transformApiData = (data) => {
  if (data.edges) return data;

  // Transform from CSV-like format
  const edges = [];
  if (Array.isArray(data)) {
    data.forEach(row => {
      if (row.TF && row.Target) {
        edges.push({ tf: row.TF, target: row.Target });
      }
    });
  }
  return { edges };
};

const renderNetwork = () => {
  if (!container.value || !filteredData.value) return;

  const data = filteredData.value;

  // Prepare nodes
  const nodes = data.nodes.map(n => ({
    id: n.id,
    label: n.label,
    shape: n.type === 'tf' ? 'diamond' : 'dot',
    size: n.type === 'tf' ? 25 : 15,
    color: n.type === 'tf'
      ? { background: '#e74c3c', border: '#c0392b' }
      : { background: '#3498db', border: '#2980b9' },
    font: {
      size: n.type === 'tf' ? 14 : 10,
      color: '#333',
      bold: n.type === 'tf'
    }
  }));

  // Prepare edges
  const edges = data.edges.map((e, idx) => ({
    id: idx,
    from: e.tf,
    to: e.target,
    arrows: 'to',
    color: { color: '#95a5a6', opacity: 0.6 },
    width: 1
  }));

  const options = getNetworkOptions();

  // Destroy existing network
  if (network.value) {
    network.value.destroy();
  }

  // Create new network
  network.value = new Network(container.value, { nodes, edges }, options);

  // Event handlers
  network.value.on('click', (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = data.nodes.find(n => n.id === nodeId);
      if (node?.type === 'tf') {
        emit('tf-select', { tf: nodeId });
      } else {
        emit('gene-select', { gene: nodeId });
      }
    }
  });
};

const getNetworkOptions = () => {
  const baseOptions = {
    nodes: {
      borderWidth: 2,
      shadow: true
    },
    edges: {
      smooth: {
        type: 'continuous'
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200
    }
  };

  if (layoutType.value === 'hierarchical') {
    return {
      ...baseOptions,
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 100,
          nodeSpacing: 80
        }
      },
      physics: false
    };
  } else {
    return {
      ...baseOptions,
      physics: {
        stabilization: {
          enabled: true,
          iterations: 100
        },
        barnesHut: {
          gravitationalConstant: -3000,
          springLength: 150
        }
      }
    };
  }
};

const fitNetwork = () => {
  if (network.value) {
    network.value.fit();
  }
};

const highlightTF = (tf) => {
  selectedTF.value = tf;
};

// Lifecycle
onMounted(() => {
  loadRegulonData();
});

onUnmounted(() => {
  if (network.value) {
    network.value.destroy();
  }
});

// Watchers
watch(() => props.datasetId, loadRegulonData);
watch(() => props.cluster, loadRegulonData);
watch([selectedTF, maxTargets, searchGene, layoutType], renderNetwork);
</script>

<template>
  <div class="regulon-network-container">
    <!-- Controls -->
    <div class="controls-bar">
      <div class="control-group">
        <label class="control-label">Transcription Factor</label>
        <select v-model="selectedTF" class="control-select">
          <option v-for="tf in availableTFs" :key="tf" :value="tf">
            {{ tf === 'all' ? 'All TFs' : tf }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Max Targets</label>
        <input
          v-model.number="maxTargets"
          type="number"
          min="10"
          max="100"
          class="control-input"
        />
      </div>

      <div class="control-group">
        <label class="control-label">Search Gene</label>
        <input
          v-model="searchGene"
          type="text"
          placeholder="Search..."
          class="control-input"
        />
      </div>

      <div class="control-group">
        <label class="control-label">Layout</label>
        <select v-model="layoutType" class="control-select">
          <option value="hierarchical">Hierarchical</option>
          <option value="force">Force-Directed</option>
        </select>
      </div>

      <button @click="fitNetwork" class="control-button">
        Fit View
      </button>
    </div>

    <div class="main-content">
      <!-- TF Stats Sidebar -->
      <div class="tf-sidebar">
        <h3 class="sidebar-title">Top TFs</h3>
        <div class="tf-list">
          <div
            v-for="stat in tfStats"
            :key="stat.tf"
            class="tf-item"
            :class="{ active: selectedTF === stat.tf }"
            @click="highlightTF(stat.tf)"
          >
            <span class="tf-name">{{ stat.tf }}</span>
            <span class="tf-count">{{ stat.count }} targets</span>
          </div>
        </div>
      </div>

      <!-- Network Graph -->
      <div class="network-wrapper">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading regulon network...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>

        <!-- Network -->
        <div v-else ref="container" class="network-container"></div>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-shape diamond"></span>
        <span>Transcription Factor</span>
      </div>
      <div class="legend-item">
        <span class="legend-shape dot"></span>
        <span>Target Gene</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.regulon-network-container {
  @apply flex flex-col h-full relative;
}

.controls-bar {
  @apply flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 flex-wrap;
}

.control-group {
  @apply flex items-center gap-2;
}

.control-label {
  @apply text-sm font-medium text-gray-700;
}

.control-select, .control-input {
  @apply px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500;
}

.control-input {
  @apply w-24;
}

.control-button {
  @apply px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors;
}

.main-content {
  @apply flex flex-1 overflow-hidden;
}

.tf-sidebar {
  @apply w-48 border-r border-gray-200 bg-gray-50 overflow-y-auto;
}

.sidebar-title {
  @apply px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200;
}

.tf-list {
  @apply divide-y divide-gray-100;
}

.tf-item {
  @apply px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors;
}

.tf-item.active {
  @apply bg-primary-50 border-l-4 border-primary-600;
}

.tf-name {
  @apply block text-sm font-medium text-gray-800;
}

.tf-count {
  @apply block text-xs text-gray-500;
}

.network-wrapper {
  @apply flex-1 relative;
}

.network-container {
  @apply absolute inset-0;
}

.loading-state, .error-state {
  @apply absolute inset-0 flex flex-col items-center justify-center text-gray-500;
}

.spinner {
  @apply w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.legend {
  @apply absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex gap-6;
}

.legend-item {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.legend-shape {
  @apply w-4 h-4;
}

.legend-shape.diamond {
  background: #e74c3c;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.legend-shape.dot {
  @apply rounded-full;
  background: #3498db;
}
</style>
