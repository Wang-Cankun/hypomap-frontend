<template>
  <!-- Toggle Button (visible when panel is closed) -->
  <button
    v-if="!isOpen"
    @click="$emit('update:isOpen', true)"
    class="fixed right-4 top-24 z-40 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl hover:border-primary-300 transition-all"
  >
    <AppIcon name="adjustments" size="sm" class="text-primary-600" />
    <span class="text-sm font-medium text-gray-700">Filter</span>
    <span 
      v-if="activeFilterCount > 0"
      class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full"
    >
      {{ activeFilterCount }}
    </span>
  </button>

  <!-- Slide-out Panel -->
  <Transition name="slide-panel">
    <div 
      v-if="isOpen"
      class="fixed right-0 top-20 z-50 w-[420px] h-[calc(100vh-80px)] bg-white border-l border-gray-200 shadow-2xl flex flex-col"
    >
      <!-- Panel Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex items-center gap-2">
          <AppIcon name="adjustments" size="md" class="text-primary-600" />
          <h2 class="text-lg font-semibold text-gray-900">Advanced Cell Filter</h2>
        </div>
        <button
          @click="$emit('update:isOpen', false)"
          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Stats Bar -->
      <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <FilterStatsBar
          :total-cells="totalCellCount"
          :filtered-cells="filteredCellCount"
          :active-filter-count="activeFilterCount"
        />
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <!-- Category Filters Section -->
        <CategoryFilterBuilder
          :filters="categoryFilters"
          :available-columns="availableColumns"
          :column-values="columnValues"
          :column-value-counts="columnValueCounts"
          @add="addCategoryFilter"
          @remove="removeCategoryFilter"
          @update="updateCategoryFilter"
        />

        <!-- Global Logic Selector (between category and gene filters) -->
        <div v-if="categoryFilters.length > 0 && geneFilters.length > 0" class="flex justify-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <span class="text-xs text-gray-500">Combine with:</span>
            <select
              :value="globalLogic"
              @change="$emit('update:globalLogic', $event.target.value)"
              class="px-2 py-1 text-xs font-medium border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        </div>

        <!-- Gene Expression Filters Section -->
        <GeneExpressionFilterBuilder
          :filters="geneFilters"
          :gene-expression-cache="geneExpressionCache"
          :search-genes="searchGenes"
          @add="addGeneFilter"
          @remove="removeGeneFilter"
          @update="updateGeneFilter"
        />

        <!-- Divider -->
        <hr class="border-gray-200" />

        <!-- Presets Section -->
        <FilterPresetManager
          :presets="presetList"
          :has-active-filters="hasActiveFilters"
          :encode-filters="encodeFilters"
          @save="savePreset"
          @load="loadPreset"
          @delete="deletePreset"
        />
      </div>

      <!-- Footer Actions -->
      <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex items-center justify-between">
          <button
            @click="resetFilters"
            :disabled="!hasActiveFilters"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset All
          </button>
          
          <div class="flex items-center gap-2">
            <button
              @click="copyShareLink"
              :disabled="!hasActiveFilters"
              class="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy shareable link"
            >
              <AppIcon name="link" size="sm" />
            </button>
            <button
              @click="$emit('update:isOpen', false)"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <!-- Copy Success Toast -->
      <Transition name="fade">
        <div 
          v-if="showCopySuccess"
          class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
        >
          Filter link copied to clipboard!
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- Backdrop (optional, for mobile) -->
  <Transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/20 lg:hidden"
      @click="$emit('update:isOpen', false)"
    ></div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';
import {
  FilterStatsBar,
  CategoryFilterBuilder,
  GeneExpressionFilterBuilder,
  FilterPresetManager,
} from './cell-filter';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
  // Stats
  totalCellCount: {
    type: Number,
    default: 0,
  },
  filteredCellCount: {
    type: Number,
    default: 0,
  },
  activeFilterCount: {
    type: Number,
    default: 0,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
  // Category filters
  categoryFilters: {
    type: Array,
    default: () => [],
  },
  availableColumns: {
    type: Array,
    default: () => [],
  },
  columnValues: {
    type: Object,
    default: () => ({}),
  },
  columnValueCounts: {
    type: Object,
    default: () => ({}),
  },
  // Gene filters
  geneFilters: {
    type: Array,
    default: () => [],
  },
  geneExpressionCache: {
    type: Object,
    default: () => ({}),
  },
  searchGenes: {
    type: Function,
    default: null,
  },
  // Global logic
  globalLogic: {
    type: String,
    default: 'AND',
  },
  // Presets
  presetList: {
    type: Array,
    default: () => [],
  },
  encodeFilters: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  'update:isOpen',
  'update:globalLogic',
  // Category filter events
  'addCategoryFilter',
  'removeCategoryFilter',
  'updateCategoryFilter',
  // Gene filter events
  'addGeneFilter',
  'removeGeneFilter',
  'updateGeneFilter',
  // Actions
  'resetFilters',
  'savePreset',
  'loadPreset',
  'deletePreset',
]);

const showCopySuccess = ref(false);

// Forward events to parent
const addCategoryFilter = () => emit('addCategoryFilter');
const removeCategoryFilter = (id) => emit('removeCategoryFilter', id);
const updateCategoryFilter = (id, updates) => emit('updateCategoryFilter', id, updates);

const addGeneFilter = (gene) => emit('addGeneFilter', gene);
const removeGeneFilter = (id) => emit('removeGeneFilter', id);
const updateGeneFilter = (id, updates) => emit('updateGeneFilter', id, updates);

const resetFilters = () => emit('resetFilters');
const savePreset = (name) => emit('savePreset', name);
const loadPreset = (id) => emit('loadPreset', id);
const deletePreset = (id) => emit('deletePreset', id);

const copyShareLink = async () => {
  if (!props.encodeFilters) return;
  
  try {
    const encoded = props.encodeFilters();
    if (encoded) {
      const url = new URL(window.location.href);
      url.searchParams.set('filter', encoded);
      await navigator.clipboard.writeText(url.toString());
      
      showCopySuccess.value = true;
      setTimeout(() => {
        showCopySuccess.value = false;
      }, 2000);
    }
  } catch (e) {
    console.warn('Failed to copy link:', e);
  }
};
</script>

<style scoped>
/* Slide panel animation */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
