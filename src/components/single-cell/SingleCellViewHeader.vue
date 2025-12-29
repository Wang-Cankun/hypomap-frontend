<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link
            :to="backLink"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {{ backLinkText }}
          </router-link>
          <div class="h-6 w-px bg-gray-300"></div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold text-gray-900">
              {{ pageTitle }}
            </h1>
            <!-- Dataset selector - hidden in Atlas mode -->
            <select
              v-if="!isAtlasMode"
              :value="datasetId"
              @change="handleDatasetChange"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option
                v-for="ds in availableDatasets"
                :key="ds.dataset_id"
                :value="ds.dataset_id"
              >
                {{ ds.dataset_id }} ({{ ds.n_cells?.toLocaleString() }} cells)
              </option>
            </select>
            <!-- Show dataset info badge in Atlas mode -->
            <span
              v-else
              class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
            >
              {{ metadata.cells?.toLocaleString() }} cells •
              {{ metadata.genes?.toLocaleString() }} genes
            </span>
          </div>
        </div>
        <!-- Metadata badges - hidden in Atlas mode since data comes from database -->
        <div v-if="!isAtlasMode" class="flex items-center gap-2 flex-wrap">
          <span
            v-if="metadata.species && metadata.species !== 'N/A'"
            class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
          >
            {{ metadata.species }}
          </span>
          <span
            v-if="metadata.disease && metadata.disease !== 'N/A'"
            class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium"
          >
            {{ metadata.disease }}
          </span>
          <span
            v-if="metadata.sex && metadata.sex !== 'N/A'"
            class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
          >
            {{ metadata.sex }}
          </span>
          <span
            v-if="metadata.status && metadata.status !== 'N/A'"
            class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
          >
            {{ metadata.status }}
          </span>
          <span
            v-if="metadata.protocol && metadata.protocol !== 'N/A'"
            class="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium"
          >
            {{ metadata.protocol }}
          </span>
          <span
            v-if="metadata.tissue && metadata.tissue !== 'N/A'"
            class="px-3 py-1 bg-pink-100 text-rose-700 rounded-full text-sm font-medium"
          >
            {{ metadata.tissue }}
          </span>
        </div>
        <!-- Atlas mode: show basic info -->
        <div v-else class="flex items-center gap-2">
          <span
            class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
          >
            Human
          </span>
          <span
            class="px-3 py-1 bg-pink-100 text-rose-700 rounded-full text-sm font-medium"
          >
            Multi-region Brain Atlas
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  isAtlasMode: {
    type: Boolean,
    default: false,
  },
  datasetId: {
    type: String,
    required: true,
  },
  availableDatasets: {
    type: Array,
    default: () => [],
  },
  metadata: {
    type: Object,
    default: () => ({}),
  },
  pageTitle: {
    type: String,
    required: true,
  },
  backLink: {
    type: String,
    required: true,
  },
  backLinkText: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:datasetId"]);

const handleDatasetChange = (event) => {
  emit("update:datasetId", event.target.value);
};
</script>
