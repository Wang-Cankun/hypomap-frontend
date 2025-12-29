<template>
  <!-- Floating Toggle Button -->
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Panel -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="absolute bottom-16 right-0 w-96 h-[32rem] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span class="font-semibold">AI Assistant</span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Model Selector -->
            <select
              v-model="selectedModel"
              class="text-xs bg-white/20 border border-white/30 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/50"
            >
              <option v-for="(info, modelId) in availableModels" :key="modelId" :value="modelId" class="text-gray-900">
                {{ info.name }}
              </option>
            </select>
            <button @click="isOpen = false" class="hover:bg-white/20 rounded p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Cluster Context Selector -->
        <div v-if="clusters.length > 0" class="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-600">Cluster:</span>
            <select
              v-model="selectedCluster"
              class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All clusters</option>
              <option v-for="cluster in clusters" :key="cluster" :value="cluster">
                {{ cluster }}
              </option>
            </select>
          </div>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center py-8">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">Hi! I'm your AI assistant</h3>
            <p class="text-sm text-gray-600 mb-4">
              Ask me questions about your single-cell data analysis.
            </p>

            <!-- Suggested Questions -->
            <div class="space-y-2">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Suggested questions:</p>
              <div class="space-y-1">
                <button
                  v-for="question in suggestedQuestions"
                  :key="question.id"
                  @click="askQuestion(question.question)"
                  class="w-full text-left text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  {{ question.question }}
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div v-for="(message, index) in messages" :key="index" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[85%] rounded-lg px-4 py-2"
              :class="message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'"
            >
              <div v-if="message.role === 'assistant'" class="prose prose-sm max-w-none" v-html="renderMarkdown(message.content)"></div>
              <div v-else class="text-sm">{{ message.content }}</div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-gray-100 rounded-lg px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </div>
                <span class="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 p-3">
          <div class="flex gap-2">
            <input
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Ask a question..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              :disabled="isLoading"
            />
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div v-if="error" class="mt-2 text-xs text-red-600">{{ error }}</div>
        </div>
      </div>
    </Transition>

    <!-- Toggle Button -->
    <button
      @click="isOpen = !isOpen"
      class="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      :class="{ 'bg-primary-700': isOpen }"
    >
      <svg v-if="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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
const isOpen = ref(false);
const inputMessage = ref('');
const messages = ref([]);
const isLoading = ref(false);
const error = ref(null);
const selectedCluster = ref('');
const selectedModel = ref('qwen3:30b');
const messagesContainer = ref(null);

// Available models from backend
const availableModels = ref({
  'qwen3:30b': { name: 'Qwen3 30B', description: 'High-quality responses' },
  'gpt-oss:20b': { name: 'GPT-OSS 20B', description: 'General purpose' },
  'deepseek-r1:8b': { name: 'DeepSeek R1', description: 'Fast reasoning' },
  'qwen3:0.6b': { name: 'Qwen3 0.6B', description: 'Quick responses' }
});

// Suggested questions
const suggestedQuestions = computed(() => {
  const cluster = selectedCluster.value || 'selected';
  return [
    {
      id: 'gene_function',
      question: `What is the function of the key marker genes in cluster ${cluster}?`,
      category: 'Gene Analysis'
    },
    {
      id: 'cell_type',
      question: `What cell type is cluster ${cluster} likely to be based on its marker genes?`,
      category: 'Cell Type Identification'
    },
    {
      id: 'pathways',
      question: `What biological pathways are most active in cluster ${cluster}?`,
      category: 'Pathway Analysis'
    },
    {
      id: 'tf_regulation',
      question: `Which transcription factors are mainly influencing cluster ${cluster}?`,
      category: 'Regulatory Analysis'
    },
    {
      id: 'hypothesis',
      question: `Generate testable hypotheses about the biological role of cluster ${cluster}.`,
      category: 'Hypothesis Generation'
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

// Send message to backend
const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // Add user message
  messages.value.push({ role: 'user', content: message });
  inputMessage.value = '';
  error.value = null;
  isLoading.value = true;

  try {
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
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    messages.value.push({ role: 'assistant', content: data.answer });
  } catch (err) {
    console.error('AI request error:', err);
    error.value = err.message || 'Failed to get response. Please try again.';
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error processing your request. Please try again.'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Markdown prose styles */
.prose h1, .prose h2, .prose h3 {
  @apply font-semibold mt-3 mb-2;
}
.prose h1 { @apply text-lg; }
.prose h2 { @apply text-base; }
.prose h3 { @apply text-sm; }
.prose p { @apply mb-2; }
.prose ul, .prose ol { @apply ml-4 mb-2; }
.prose li { @apply mb-1; }
.prose code { @apply bg-gray-200 px-1 rounded text-xs; }
.prose pre { @apply bg-gray-800 text-white p-2 rounded text-xs overflow-x-auto my-2; }
.prose pre code { @apply bg-transparent text-white; }
.prose strong { @apply font-semibold; }
.prose a { @apply text-primary-600 underline; }
</style>
