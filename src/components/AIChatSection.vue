<template>
  <div class="h-full flex" style="max-height: calc(100vh - 180px);">
    <!-- Left Panel: Settings & Suggested Questions -->
    <div class="w-72 border-r border-gray-200 bg-gray-50 p-4 flex flex-col overflow-hidden">
      <!-- Model Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
        <select
          v-model="selectedModel"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="(info, modelId) in availableModels" :key="modelId" :value="modelId">
            {{ info.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          {{ availableModels[selectedModel]?.description || '' }}
        </p>
      </div>

      <!-- Cluster Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Cluster Context</label>
        <select
          v-model="selectedCluster"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All clusters (general)</option>
          <option v-for="cluster in clusters" :key="cluster" :value="cluster">
            {{ cluster }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Select a cluster to get context-specific answers
        </p>
      </div>

      <!-- Suggested Questions -->
      <div class="flex-1 overflow-y-auto">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Suggested Questions</h3>
        <div class="space-y-2">
          <button
            v-for="question in suggestedQuestions"
            :key="question.id"
            @click="askQuestion(question.question)"
            class="w-full text-left text-sm px-3 py-2 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg transition-colors text-gray-700"
          >
            <span class="text-xs text-primary-600 font-medium block mb-1">{{ question.category }}</span>
            {{ question.question }}
          </button>
        </div>
      </div>

      <!-- Clear Chat -->
      <button
        v-if="messages.length > 0"
        @click="clearChat"
        class="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        Clear conversation
      </button>
    </div>

    <!-- Right Panel: Chat Area -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Messages Area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="pt-4">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Welcome to AI Assistant</h3>
              <p class="text-gray-600 text-sm">
                I can help you analyze your single-cell RNA-seq data. Ask me about gene functions,
                cell type identification, pathway analysis, or hypothesis generation.
              </p>
              <p class="text-sm text-gray-500 mt-2">
                Select a cluster from the left panel for context-specific answers.
              </p>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-for="(message, index) in messages" :key="index" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
          <div
            class="max-w-[75%] rounded-xl px-4 py-3 shadow-sm"
            :class="message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-900'"
          >
            <div v-if="message.role === 'assistant'" class="prose prose-sm max-w-none" v-html="renderMarkdown(message.content)"></div>
            <div v-else>{{ message.content }}</div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
              <span class="text-sm text-gray-500">AI is thinking...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="px-6 py-2 bg-red-50 border-t border-red-200">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-200 p-3 bg-white flex-shrink-0">
        <div class="flex gap-2">
          <input
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Ask a question about your data..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            :disabled="isLoading"
          />
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isLoading"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            <span>Send</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  },
  clusters: {
    type: Array,
    default: () => []
  },
  apiBaseUrl: {
    type: String,
    default: ''
  }
});

// State
const inputMessage = ref('');
const messages = ref([]);
const isLoading = ref(false);
const error = ref(null);
const selectedCluster = ref('');
const selectedModel = ref('qwen3:0.6b'); // Default to fast model
const messagesContainer = ref(null);

// Available models from backend
const availableModels = ref({
  'qwen3:30b': { name: 'Qwen3 30B', description: 'High-quality responses, best for complex biology questions' },
  'gpt-oss:20b': { name: 'GPT-OSS 20B', description: 'General purpose, versatile tasks' },
  'deepseek-r1:8b': { name: 'DeepSeek R1 8B', description: 'Reasoning-focused, good for analysis' },
  'qwen3:0.6b': { name: 'Qwen3 0.6B', description: 'Fast, lightweight for quick responses' }
});

// Suggested questions
const suggestedQuestions = computed(() => {
  const cluster = selectedCluster.value || 'this';
  return [
    {
      id: 'gene_function',
      question: `What is the function of the key marker genes in cluster ${cluster}?`,
      category: 'Gene Analysis'
    },
    {
      id: 'top_gene',
      question: `What is the highest expressed gene in cluster ${cluster} and what does it indicate?`,
      category: 'Gene Analysis'
    },
    {
      id: 'cell_type',
      question: `What cell type is cluster ${cluster} likely to be based on its marker genes?`,
      category: 'Cell Type'
    },
    {
      id: 'pathways',
      question: `What biological pathways are most active in cluster ${cluster}?`,
      category: 'Pathways'
    },
    {
      id: 'tf_regulation',
      question: `Which transcription factors are mainly influencing cluster ${cluster}?`,
      category: 'Regulation'
    },
    {
      id: 'ccc_signals',
      question: `What cell-cell communication signals is cluster ${cluster} sending and receiving?`,
      category: 'Communication'
    },
    {
      id: 'hypothesis',
      question: `Generate testable hypotheses about the biological role of cluster ${cluster}.`,
      category: 'Hypothesis'
    },
    {
      id: 'validation',
      question: `What experiments would you recommend to validate the identity of cluster ${cluster}?`,
      category: 'Experiments'
    }
  ];
});

// Fetch available models on mount
onMounted(async () => {
  try {
    const response = await fetch(`${props.apiBaseUrl}/ai/models`);
    if (response.ok) {
      const data = await response.json();
      availableModels.value = data.models;
      selectedModel.value = data.default || 'qwen3:30b';
    }
  } catch (err) {
    console.warn('Could not fetch available models:', err);
  }
});

// Render markdown
const renderMarkdown = (text) => {
  if (!text) return '';
  return marked.parse(text, { breaks: true, gfm: true });
};

// Scroll to bottom of messages
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Watch messages and scroll
watch(messages, scrollToBottom, { deep: true });

// Ask a question (from suggested or input)
const askQuestion = (question) => {
  inputMessage.value = question;
  sendMessage();
};

// Clear chat
const clearChat = () => {
  messages.value = [];
  error.value = null;
};

// Send message to backend
const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // Add user message
  messages.value.push({ role: 'user', content: message });
  inputMessage.value = '';
  error.value = null;
  isLoading.value = true;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

  try {
    console.log('Sending AI request to:', `${props.apiBaseUrl}/ai/ask`);
    console.log('Request payload:', {
      dataset_id: props.datasetId,
      cluster: selectedCluster.value || '0',
      question: message,
      model: selectedModel.value
    });

    const response = await fetch(`${props.apiBaseUrl}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataset_id: props.datasetId,
        cluster: selectedCluster.value || '0',
        question: message,
        model: selectedModel.value,
        include_context: ['deg', 'regulon', 'ccc'],
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', data);
    messages.value.push({ role: 'assistant', content: data.answer });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('AI request error:', err);

    if (err.name === 'AbortError') {
      error.value = 'Request timed out. The AI model may be loading. Please try again.';
    } else {
      error.value = err.message || 'Failed to get response. Please try again.';
    }
    messages.value.push({
      role: 'assistant',
      content: `Sorry, I encountered an error: ${error.value}`
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Markdown prose styles */
.prose h1, .prose h2, .prose h3 {
  @apply font-semibold mt-4 mb-2;
}
.prose h1 { @apply text-lg; }
.prose h2 { @apply text-base; }
.prose h3 { @apply text-sm font-medium; }
.prose p { @apply mb-3 leading-relaxed; }
.prose ul, .prose ol { @apply ml-5 mb-3; }
.prose ul { @apply list-disc; }
.prose ol { @apply list-decimal; }
.prose li { @apply mb-1; }
.prose code { @apply bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono; }
.prose pre { @apply bg-gray-800 text-white p-3 rounded-lg text-sm overflow-x-auto my-3; }
.prose pre code { @apply bg-transparent text-white p-0; }
.prose strong { @apply font-semibold; }
.prose em { @apply italic; }
.prose a { @apply text-primary-600 underline hover:text-primary-700; }
.prose blockquote { @apply border-l-4 border-gray-300 pl-4 italic text-gray-600; }
</style>
