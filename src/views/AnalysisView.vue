<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

// Import components
import CCCNetworkGraph from '@/components/CCCNetworkGraph.vue';
import RegulonNetworkGraph from '@/components/RegulonNetworkGraph.vue';

const route = useRoute();
const datasetId = computed(() => route.params.id);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9120/hypomap-backend/api/v1';

// State
const activeTab = ref('umap');
const datasetInfo = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Cluster selection
const selectedCluster = ref(null);
const clusters = ref([]);

// AI Chat
const chatMessages = ref([]);
const chatInput = ref('');
const isChatLoading = ref(false);
const suggestedQuestions = ref([]);

// UMAP data
const umapData = ref(null);

// Load dataset info
const loadDatasetInfo = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE_URL}/h5ad/${datasetId.value}/info`);
    if (response.ok) {
      datasetInfo.value = await response.json();
      clusters.value = datasetInfo.value.clusters || [];
      if (clusters.value.length > 0) {
        selectedCluster.value = clusters.value[0];
      }
    } else {
      // Try upload datasets endpoint
      const uploadResponse = await fetch(`${API_BASE_URL}/upload/datasets`);
      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        const dataset = data.datasets.find(d => d.dataset_id === datasetId.value);
        if (dataset) {
          datasetInfo.value = dataset;
        }
      }
    }
  } catch (err) {
    console.error('Error loading dataset info:', err);
    error.value = 'Failed to load dataset information';
  } finally {
    isLoading.value = false;
  }
};

// Load UMAP data
const loadUMAPData = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/h5ad/${datasetId.value}/plot-data?embedding=umap&metadata=cell_type`
    );
    if (response.ok) {
      umapData.value = await response.json();
    }
  } catch (err) {
    console.error('Error loading UMAP data:', err);
  }
};

// Load suggested questions
const loadSuggestedQuestions = async () => {
  if (!selectedCluster.value) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/ai/suggested-questions/${datasetId.value}/${selectedCluster.value}`
    );
    if (response.ok) {
      suggestedQuestions.value = await response.json();
    }
  } catch (err) {
    console.error('Error loading suggested questions:', err);
  }
};

// Send chat message
const sendMessage = async (message = null) => {
  const question = message || chatInput.value.trim();
  if (!question || isChatLoading.value) return;

  chatInput.value = '';
  chatMessages.value.push({ role: 'user', content: question });
  isChatLoading.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataset_id: datasetId.value,
        cluster: selectedCluster.value || '0',
        question: question,
        include_context: ['deg', 'regulon', 'ccc']
      })
    });

    if (response.ok) {
      const data = await response.json();
      chatMessages.value.push({ role: 'assistant', content: data.answer });
    } else {
      chatMessages.value.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the AI service is configured.'
      });
    }
  } catch (err) {
    chatMessages.value.push({
      role: 'assistant',
      content: 'Failed to connect to AI service. Please check your configuration.'
    });
  } finally {
    isChatLoading.value = false;
  }
};

// Handle suggested question click
const askSuggestedQuestion = (question) => {
  sendMessage(question.question);
};

// Lifecycle
onMounted(() => {
  loadDatasetInfo();
  loadUMAPData();
});

watch(selectedCluster, loadSuggestedQuestions);
</script>

<template>
  <div class="analysis-view">
    <!-- Header -->
    <header class="analysis-header">
      <div class="header-content">
        <div>
          <h1 class="header-title">
            {{ datasetId }}
          </h1>
          <p v-if="datasetInfo" class="header-subtitle">
            {{ datasetInfo.n_cells?.toLocaleString() || '?' }} cells |
            {{ datasetInfo.n_genes?.toLocaleString() || '?' }} genes
          </p>
        </div>

        <!-- Cluster Selector -->
        <div class="cluster-selector">
          <label class="selector-label">Cluster</label>
          <select v-model="selectedCluster" class="selector-input">
            <option v-for="cluster in clusters" :key="cluster" :value="cluster">
              {{ cluster }}
            </option>
            <option v-if="clusters.length === 0" value="0">Cluster 0</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-large"></div>
      <p>Loading dataset...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="main-layout">
      <!-- Sidebar Tabs -->
      <nav class="sidebar-nav">
        <button
          v-for="tab in [
            { id: 'umap', label: 'UMAP', icon: 'scatter' },
            { id: 'ccc', label: 'CCC Network', icon: 'network' },
            { id: 'regulon', label: 'TF-Regulon', icon: 'hierarchy' },
            { id: 'genes', label: 'Genes', icon: 'dna' }
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['nav-button', { active: activeTab === tab.id }]"
        >
          <span class="nav-icon">{{ tab.icon === 'scatter' ? '&#10687;' : tab.icon === 'network' ? '&#9673;' : tab.icon === 'hierarchy' ? '&#11043;' : '&#129516;' }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Visualization Panel -->
      <div class="viz-panel">
        <!-- UMAP Tab -->
        <div v-if="activeTab === 'umap'" class="tab-content">
          <div class="umap-placeholder">
            <div class="placeholder-icon">&#10687;</div>
            <h3>UMAP Visualization</h3>
            <p>UMAP embedding visualization will appear here</p>
            <p class="placeholder-hint">
              Use the existing SingleCellAnalysis view for full UMAP functionality
            </p>
            <router-link
              :to="`/atlas/analysis/${datasetId}`"
              class="placeholder-link"
            >
              Open Full Analysis View
            </router-link>
          </div>
        </div>

        <!-- CCC Network Tab -->
        <div v-if="activeTab === 'ccc'" class="tab-content">
          <CCCNetworkGraph
            :dataset-id="datasetId"
            :selected-cluster="selectedCluster"
            @node-click="(e) => console.log('Node clicked:', e)"
            @edge-click="(e) => console.log('Edge clicked:', e)"
          />
        </div>

        <!-- Regulon Tab -->
        <div v-if="activeTab === 'regulon'" class="tab-content">
          <RegulonNetworkGraph
            :dataset-id="datasetId"
            :cluster="selectedCluster || '0'"
            @tf-select="(e) => console.log('TF selected:', e)"
            @gene-select="(e) => console.log('Gene selected:', e)"
          />
        </div>

        <!-- Genes Tab -->
        <div v-if="activeTab === 'genes'" class="tab-content">
          <div class="genes-placeholder">
            <div class="placeholder-icon">&#129516;</div>
            <h3>Gene Expression Analysis</h3>
            <p>Heatmaps, dotplots, and expression visualization</p>
            <router-link
              :to="`/atlas/analysis/${datasetId}`"
              class="placeholder-link"
            >
              Open Full Analysis View
            </router-link>
          </div>
        </div>
      </div>

      <!-- AI Chat Panel -->
      <div class="chat-panel">
        <div class="chat-header">
          <h3>AI Assistant</h3>
          <span class="chat-badge">Claude</span>
        </div>

        <!-- Suggested Questions -->
        <div v-if="suggestedQuestions.length > 0 && chatMessages.length === 0" class="suggestions">
          <p class="suggestions-title">Suggested questions:</p>
          <div class="suggestions-list">
            <button
              v-for="q in suggestedQuestions.slice(0, 4)"
              :key="q.id"
              @click="askSuggestedQuestion(q)"
              class="suggestion-button"
            >
              {{ q.question }}
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" ref="chatContainer">
          <div
            v-for="(msg, idx) in chatMessages"
            :key="idx"
            :class="['message', msg.role]"
          >
            <div class="message-avatar">
              {{ msg.role === 'user' ? '&#128100;' : '&#129302;' }}
            </div>
            <div class="message-content">
              <div v-html="formatMessage(msg.content)"></div>
            </div>
          </div>

          <div v-if="isChatLoading" class="message assistant loading">
            <div class="message-avatar">&#129302;</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input-container">
          <input
            v-model="chatInput"
            @keyup.enter="sendMessage()"
            :disabled="isChatLoading"
            placeholder="Ask about this cluster..."
            class="chat-input"
          />
          <button
            @click="sendMessage()"
            :disabled="!chatInput.trim() || isChatLoading"
            class="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Helper to format markdown-like messages
function formatMessage(content) {
  if (!content) return '';

  // Simple markdown formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
}

export default {
  methods: {
    formatMessage
  }
};
</script>

<style scoped>
.analysis-view {
  @apply min-h-screen bg-gray-50;
}

.analysis-header {
  @apply bg-white border-b border-gray-200 shadow-sm sticky top-16 z-10;
}

.header-content {
  @apply max-w-7xl mx-auto px-6 py-4 flex justify-between items-center;
}

.header-title {
  @apply text-2xl font-bold text-gray-900;
}

.header-subtitle {
  @apply text-sm text-gray-500 mt-1;
}

.cluster-selector {
  @apply flex items-center gap-3;
}

.selector-label {
  @apply text-sm font-medium text-gray-700;
}

.selector-input {
  @apply px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500;
}

.loading-container {
  @apply flex flex-col items-center justify-center h-96 text-gray-500;
}

.spinner-large {
  @apply w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.main-layout {
  @apply flex h-[calc(100vh-8rem)];
}

.sidebar-nav {
  @apply w-48 bg-white border-r border-gray-200 p-4 space-y-2;
}

.nav-button {
  @apply w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors;
}

.nav-button.active {
  @apply bg-primary-50 text-primary-700 font-medium;
}

.nav-icon {
  @apply text-lg;
}

.nav-label {
  @apply text-sm;
}

.viz-panel {
  @apply flex-1 overflow-hidden;
}

.tab-content {
  @apply h-full;
}

.umap-placeholder, .genes-placeholder {
  @apply h-full flex flex-col items-center justify-center text-gray-500;
}

.placeholder-icon {
  @apply text-6xl mb-4 opacity-50;
}

.placeholder-hint {
  @apply text-sm text-gray-400 mt-2;
}

.placeholder-link {
  @apply mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700;
}

.chat-panel {
  @apply w-96 border-l border-gray-200 bg-white flex flex-col;
}

.chat-header {
  @apply px-4 py-3 border-b border-gray-200 flex items-center justify-between;
}

.chat-header h3 {
  @apply font-semibold text-gray-800;
}

.chat-badge {
  @apply px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded;
}

.suggestions {
  @apply p-4 border-b border-gray-100;
}

.suggestions-title {
  @apply text-sm text-gray-500 mb-3;
}

.suggestions-list {
  @apply space-y-2;
}

.suggestion-button {
  @apply w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.message {
  @apply flex gap-3;
}

.message-avatar {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0;
}

.message.user .message-avatar {
  @apply bg-primary-100;
}

.message.assistant .message-avatar {
  @apply bg-purple-100;
}

.message-content {
  @apply flex-1 text-sm text-gray-700 leading-relaxed;
}

.message.user .message-content {
  @apply bg-primary-50 rounded-lg p-3;
}

.message.assistant .message-content {
  @apply bg-gray-50 rounded-lg p-3;
}

.typing-indicator {
  @apply flex gap-1;
}

.typing-indicator span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-pulse;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input-container {
  @apply p-4 border-t border-gray-200 flex gap-2;
}

.chat-input {
  @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm;
}

.send-button {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors;
}
</style>
