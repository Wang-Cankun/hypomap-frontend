<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
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

const emit = defineEmits(['tf-select', 'gene-select', 'view-expression']);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9120/hypomap-backend/api/v1';
const MYGENE_API = 'https://mygene.info/v3';

// State
const container = ref(null);
const network = ref(null);
const isLoading = ref(false);
const error = ref(null);
const regulonData = ref(null);

// Gene info panel state
const showGenePanel = ref(false);
const selectedGene = ref(null);
const geneInfo = ref(null);
const geneInfoLoading = ref(false);
const geneTFRegulators = ref([]);
const geneCCCInfo = ref({ asLigand: [], asReceptor: [] });

// Filters
const selectedTF = ref('all');
const selectedTFs = ref([]);  // For multi-select mode
const showTopN = ref(true);   // Show top N TFs by default
const topNCount = ref(1);     // Default to top 1 TF (first TF)
const maxTargets = ref(50);
const searchGene = ref('');
const layoutType = ref('force');  // Default to force-directed layout

// Computed
const availableTFs = computed(() => {
  if (!regulonData.value?.edges) return [];
  const tfs = new Set(regulonData.value.edges.map(e => e.tf));
  return ['all', ...Array.from(tfs).sort()];
});

// Get top N TFs for combined view
const topTFs = computed(() => {
  return tfStats.value.slice(0, topNCount.value).map(s => s.tf);
});

const filteredData = computed(() => {
  if (!regulonData.value) return { nodes: [], edges: [] };

  let edges = regulonData.value.edges;

  // Filter by TFs
  if (showTopN.value) {
    // Show top N TFs combined
    const tfsToShow = topTFs.value;
    edges = edges.filter(e => tfsToShow.includes(e.tf));
  } else if (selectedTF.value !== 'all') {
    // Single TF selection
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
      return;
    }

    const data = await response.json();
    regulonData.value = transformApiData(data);
  } catch (err) {
    console.error('Error loading regulon data:', err);
    // Generate demo data for visualization
    regulonData.value = generateDemoData();
  } finally {
    isLoading.value = false;
    // Wait for DOM update then render network
    await nextTick();
    renderNetwork();
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
      // Open gene info panel instead of directly emitting
      handleNodeClick(nodeId, node?.type || 'target');
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
  showTopN.value = false;  // Turn off top N mode when selecting specific TF
  selectedTF.value = tf;
};

const showTopTFs = () => {
  showTopN.value = true;
  selectedTF.value = 'all';
};

// Gene info panel functions
const handleNodeClick = async (nodeId, nodeType) => {
  selectedGene.value = { id: nodeId, type: nodeType };
  showGenePanel.value = true;

  // Find TF regulators for this gene
  if (nodeType === 'target') {
    geneTFRegulators.value = regulonData.value?.edges
      ?.filter(e => e.target === nodeId)
      ?.map(e => e.tf) || [];
  } else {
    geneTFRegulators.value = [];
  }

  // Fetch CCC info (check if gene is ligand/receptor)
  await fetchCCCInfo(nodeId);

  // Fetch gene info from MyGene.info
  await fetchGeneInfo(nodeId);
};

const fetchGeneInfo = async (geneSymbol) => {
  geneInfoLoading.value = true;
  geneInfo.value = null;

  try {
    const response = await fetch(
      `${MYGENE_API}/query?q=symbol:${geneSymbol}&species=human&fields=symbol,name,summary,entrezgene,ensembl.gene,uniprot.Swiss-Prot,go,pathway`
    );
    const data = await response.json();

    if (data.hits?.length > 0) {
      const hit = data.hits[0];
      geneInfo.value = {
        symbol: hit.symbol,
        name: hit.name,
        summary: hit.summary,
        entrezgene: hit.entrezgene,
        ensembl: hit.ensembl?.gene,
        uniprot: hit.uniprot?.['Swiss-Prot'],
        go: hit.go,
        pathway: hit.pathway
      };
    }
  } catch (err) {
    console.error('Error fetching gene info:', err);
  } finally {
    geneInfoLoading.value = false;
  }
};

const fetchCCCInfo = async (geneSymbol) => {
  geneCCCInfo.value = { asLigand: [], asReceptor: [] };

  try {
    // Fetch CCC data to check if gene is ligand/receptor
    const response = await fetch(`${API_BASE_URL}/h5ad/${props.datasetId}/ccc/network`);
    if (response.ok) {
      const data = await response.json();
      if (data.edges) {
        // Find interactions where this gene is a ligand
        const asLigand = data.edges
          .filter(e => e.ligand?.toUpperCase() === geneSymbol.toUpperCase())
          .map(e => ({ from: e.from, to: e.to, receptor: e.receptor, pathway: e.pathway }));

        // Find interactions where this gene is a receptor
        const asReceptor = data.edges
          .filter(e => e.receptor?.toUpperCase().includes(geneSymbol.toUpperCase()))
          .map(e => ({ from: e.from, to: e.to, ligand: e.ligand, pathway: e.pathway }));

        geneCCCInfo.value = {
          asLigand: [...new Map(asLigand.map(x => [JSON.stringify(x), x])).values()].slice(0, 5),
          asReceptor: [...new Map(asReceptor.map(x => [JSON.stringify(x), x])).values()].slice(0, 5)
        };
      }
    }
  } catch (err) {
    console.error('Error fetching CCC info:', err);
  }
};

const closeGenePanel = () => {
  showGenePanel.value = false;
  selectedGene.value = null;
  geneInfo.value = null;
};

const viewExpression = () => {
  if (selectedGene.value) {
    emit('view-expression', { gene: selectedGene.value.id });
    closeGenePanel();
  }
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
watch([selectedTF, showTopN, topNCount, maxTargets, searchGene, layoutType], renderNetwork);
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
        <div class="sidebar-header">
          <h3 class="sidebar-title">Top TFs</h3>
          <div class="top-n-buttons">
            <button
              @click="showTopN = true; topNCount = 1"
              class="top-n-btn"
              :class="{ active: showTopN && topNCount === 1 }"
              title="Show top 1 TF"
            >
              Top 1
            </button>
            <button
              @click="showTopN = true; topNCount = 5"
              class="top-n-btn"
              :class="{ active: showTopN && topNCount === 5 }"
              title="Show top 5 TFs combined"
            >
              Top 5
            </button>
          </div>
        </div>
        <div class="tf-list">
          <div
            v-for="stat in tfStats"
            :key="stat.tf"
            class="tf-item"
            :class="{
              active: !showTopN && selectedTF === stat.tf,
              'in-top': showTopN && topTFs.includes(stat.tf)
            }"
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

    <!-- Gene Info Panel (Modal) -->
    <div v-if="showGenePanel" class="gene-panel-overlay" @click.self="closeGenePanel">
      <div class="gene-panel">
        <div class="gene-panel-header">
          <div>
            <h3 class="gene-panel-title">{{ selectedGene?.id }}</h3>
            <span class="gene-type-badge" :class="selectedGene?.type">
              {{ selectedGene?.type === 'tf' ? 'Transcription Factor' : 'Target Gene' }}
            </span>
          </div>
          <button @click="closeGenePanel" class="close-button">&times;</button>
        </div>

        <div class="gene-panel-content">
          <!-- Loading -->
          <div v-if="geneInfoLoading" class="loading-spinner">
            <div class="spinner"></div>
            <span>Loading gene info...</span>
          </div>

          <!-- Gene Info -->
          <div v-else-if="geneInfo" class="gene-info-section">
            <h4 class="section-title">Gene Information</h4>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">{{ geneInfo.name || 'N/A' }}</span>
            </div>
            <div v-if="geneInfo.summary" class="info-row summary">
              <span class="info-label">Summary:</span>
              <p class="info-value">{{ geneInfo.summary.slice(0, 200) }}{{ geneInfo.summary.length > 200 ? '...' : '' }}</p>
            </div>
            <div class="external-links">
              <a v-if="geneInfo.entrezgene" :href="`https://www.ncbi.nlm.nih.gov/gene/${geneInfo.entrezgene}`" target="_blank" class="ext-link">
                NCBI Gene
              </a>
              <a v-if="geneInfo.ensembl" :href="`https://ensembl.org/Homo_sapiens/Gene/Summary?g=${geneInfo.ensembl}`" target="_blank" class="ext-link">
                Ensembl
              </a>
              <a v-if="geneInfo.uniprot" :href="`https://www.uniprot.org/uniprot/${geneInfo.uniprot}`" target="_blank" class="ext-link">
                UniProt
              </a>
            </div>
          </div>

          <!-- TF Regulators -->
          <div v-if="geneTFRegulators.length > 0" class="gene-info-section">
            <h4 class="section-title">Regulated by TFs</h4>
            <div class="tf-chips">
              <span v-for="tf in geneTFRegulators" :key="tf" class="tf-chip">{{ tf }}</span>
            </div>
          </div>

          <!-- CCC Info -->
          <div v-if="geneCCCInfo.asLigand.length > 0 || geneCCCInfo.asReceptor.length > 0" class="gene-info-section">
            <h4 class="section-title">Cell-Cell Communication</h4>
            <div v-if="geneCCCInfo.asLigand.length > 0" class="ccc-subsection">
              <span class="ccc-role">As Ligand:</span>
              <div v-for="(item, idx) in geneCCCInfo.asLigand" :key="'l'+idx" class="ccc-item">
                {{ item.from }} → {{ item.to }} ({{ item.receptor }})
              </div>
            </div>
            <div v-if="geneCCCInfo.asReceptor.length > 0" class="ccc-subsection">
              <span class="ccc-role">As Receptor:</span>
              <div v-for="(item, idx) in geneCCCInfo.asReceptor" :key="'r'+idx" class="ccc-item">
                {{ item.from }} → {{ item.to }} ({{ item.ligand }})
              </div>
            </div>
          </div>
        </div>

        <div class="gene-panel-footer">
          <button @click="viewExpression" class="view-expression-btn">
            View Expression
          </button>
        </div>
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

.sidebar-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-gray-200;
}

.sidebar-title {
  @apply text-sm font-semibold text-gray-700;
}

.top-n-buttons {
  @apply flex gap-1;
}

.top-n-btn {
  @apply px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors;
}

.top-n-btn.active {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.top-n-button {
  @apply px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors;
}

.top-n-button.active {
  @apply bg-primary-600 text-white;
}

.top-n-control {
  @apply px-4 py-2 border-b border-gray-200 flex items-center gap-2;
}

.top-n-select {
  @apply text-xs border border-gray-300 rounded px-2 py-1;
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

.tf-item.in-top {
  @apply bg-green-50 border-l-4 border-green-500;
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

/* Gene Info Panel Styles */
.gene-panel-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.gene-panel {
  @apply bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col;
}

.gene-panel-header {
  @apply flex items-start justify-between p-4 border-b border-gray-200;
}

.gene-panel-title {
  @apply text-lg font-bold text-gray-900;
}

.gene-type-badge {
  @apply inline-block px-2 py-0.5 text-xs rounded-full mt-1;
}

.gene-type-badge.tf {
  @apply bg-red-100 text-red-700;
}

.gene-type-badge.target {
  @apply bg-blue-100 text-blue-700;
}

.close-button {
  @apply text-2xl text-gray-400 hover:text-gray-600 leading-none;
}

.gene-panel-content {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.loading-spinner {
  @apply flex items-center justify-center gap-2 py-8 text-gray-500;
}

.gene-info-section {
  @apply border-b border-gray-100 pb-4 last:border-0;
}

.section-title {
  @apply text-sm font-semibold text-gray-700 mb-2;
}

.info-row {
  @apply flex gap-2 text-sm mb-1;
}

.info-row.summary {
  @apply flex-col;
}

.info-label {
  @apply text-gray-500 font-medium min-w-[60px];
}

.info-value {
  @apply text-gray-800;
}

.external-links {
  @apply flex gap-2 mt-3;
}

.ext-link {
  @apply px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors;
}

.tf-chips {
  @apply flex flex-wrap gap-1;
}

.tf-chip {
  @apply px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded;
}

.ccc-subsection {
  @apply mb-2;
}

.ccc-role {
  @apply text-xs font-medium text-gray-500 block mb-1;
}

.ccc-item {
  @apply text-xs text-gray-600 pl-2 border-l-2 border-gray-200 mb-1;
}

.gene-panel-footer {
  @apply p-4 border-t border-gray-200;
}

.view-expression-btn {
  @apply w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium;
}
</style>
