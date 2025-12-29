<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <AppIcon name="dna" size="sm" />
        Gene Expression Filters
      </h3>
      <button
        @click="addNewFilter"
        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
      >
        <AppIcon name="plus" size="xs" />
        Add Filter
      </button>
    </div>

    <!-- Empty State -->
    <div 
      v-if="filters.length === 0" 
      class="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300"
    >
      <AppIcon name="dna" size="lg" class="mx-auto text-gray-400 mb-2" />
      <p class="text-sm text-gray-500">No gene expression filters</p>
      <button
        @click="addNewFilter"
        class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        Filter by gene expression
      </button>
    </div>

    <!-- Filter List -->
    <div v-else class="space-y-2">
      <div 
        v-for="(filter, index) in filters" 
        :key="filter.id"
        class="bg-white rounded-lg border border-gray-200 p-3"
        :class="{ 'border-amber-300 bg-amber-50/30': hasPendingChanges(filter.id) }"
      >
        <!-- Filter Row -->
        <div class="flex items-start gap-2">
          <!-- Gene Input with Autocomplete -->
          <div class="flex-1 min-w-0 relative">
            <label class="block text-xs text-gray-500 mb-1">Gene</label>
            <input
              type="text"
              :value="getLocalGeneValue(filter)"
              @input="onGeneInput(filter, $event.target.value)"
              @focus="showSuggestions[filter.id] = true"
              @blur="hideSuggestions(filter.id)"
              @keydown.enter="applyFilter(filter.id)"
              placeholder="e.g., APOE"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              :class="{ 
                'border-red-300': filter.gene && !geneExpressionCache[filter.gene] && !filter.isLoading && !hasPendingChanges(filter.id),
                'border-amber-400': hasPendingChanges(filter.id)
              }"
            />
            
            <!-- Loading Indicator -->
            <div v-if="filter.isLoading" class="absolute right-2 top-7">
              <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Gene Found Indicator -->
            <div v-else-if="filter.gene && geneExpressionCache[filter.gene] && !hasPendingChanges(filter.id)" class="absolute right-2 top-7">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Autocomplete Dropdown -->
            <div 
              v-if="showSuggestions[filter.id] && geneSuggestions[filter.id]?.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto"
            >
              <button
                v-for="gene in geneSuggestions[filter.id]"
                :key="gene.symbol || gene"
                @mousedown.prevent="selectGene(filter, gene.symbol || gene)"
                class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
              >
                {{ gene.symbol || gene }}
              </button>
            </div>
          </div>

          <!-- Operator Select -->
          <div class="w-20">
            <label class="block text-xs text-gray-500 mb-1">Op</label>
            <select
              :value="getLocalOperatorValue(filter)"
              @change="onOperatorChange(filter, $event.target.value)"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-amber-400': hasPendingChanges(filter.id) }"
            >
              <option value=">">&gt;</option>
              <option value=">=">&ge;</option>
              <option value="<">&lt;</option>
              <option value="<=">&le;</option>
              <option value="==">=</option>
              <option value="!=">&ne;</option>
            </select>
          </div>

          <!-- Value Input -->
          <div class="w-20">
            <label class="block text-xs text-gray-500 mb-1">Value</label>
            <input
              type="number"
              step="0.01"
              :value="getLocalValueValue(filter)"
              @input="onValueChange(filter, $event.target.value)"
              @keydown.enter="applyFilter(filter.id)"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-amber-400': hasPendingChanges(filter.id) }"
            />
          </div>

          <!-- Apply Button -->
          <button
            v-if="hasPendingChanges(filter.id)"
            @click="applyFilter(filter.id)"
            class="mt-5 px-2 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
            title="Apply filter"
          >
            Apply
          </button>

          <!-- Remove Button -->
          <button
            @click="removeFilter(filter.id)"
            class="mt-5 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remove filter"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Pending Changes Indicator -->
        <div v-if="hasPendingChanges(filter.id)" class="mt-2 text-xs text-amber-600 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Unsaved changes - click Apply or press Enter</span>
        </div>

        <!-- Expression Stats (if gene loaded) -->
        <div v-else-if="filter.gene && geneExpressionCache[filter.gene]" class="mt-2 text-xs text-gray-500">
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-400"></span>
            Expression data loaded
          </span>
          <span class="ml-2">
            Range: {{ getExpressionRange(filter.gene) }}
          </span>
        </div>

        <!-- Logic Connector (if not last) -->
        <div v-if="index < filters.length - 1" class="flex justify-center pt-3">
          <select
            :value="filter.logic"
            @change="$emit('update', filter.id, { logic: $event.target.value })"
            class="px-3 py-1 text-xs font-medium border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps({
  filters: {
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
});

const emit = defineEmits(['add', 'remove', 'update']);

const showSuggestions = reactive({});
const geneSuggestions = reactive({});
// Local state for pending filter values (not yet applied)
const pendingValues = reactive({});
let searchTimeout = null;

// Initialize pending values for a filter
const initPendingValues = (filterId, filter) => {
  if (!pendingValues[filterId]) {
    pendingValues[filterId] = {
      gene: filter.gene || '',
      operator: filter.operator || '>',
      value: filter.value ?? 0,
    };
  }
};

// Get local gene value (pending if exists, otherwise from filter)
const getLocalGeneValue = (filter) => {
  initPendingValues(filter.id, filter);
  return pendingValues[filter.id]?.gene ?? filter.gene ?? '';
};

const getLocalOperatorValue = (filter) => {
  initPendingValues(filter.id, filter);
  return pendingValues[filter.id]?.operator ?? filter.operator ?? '>';
};

const getLocalValueValue = (filter) => {
  initPendingValues(filter.id, filter);
  return pendingValues[filter.id]?.value ?? filter.value ?? 0;
};

// Check if filter has pending (unapplied) changes
const hasPendingChanges = (filterId) => {
  const pending = pendingValues[filterId];
  const filter = props.filters.find(f => f.id === filterId);
  if (!pending || !filter) return false;
  
  return (
    pending.gene !== (filter.gene || '') ||
    pending.operator !== (filter.operator || '>') ||
    pending.value !== (filter.value ?? 0)
  );
};

// Handle gene input - only updates local state, doesn't emit
const onGeneInput = async (filter, value) => {
  initPendingValues(filter.id, filter);
  pendingValues[filter.id].gene = value.toUpperCase();
  
  // Search for gene suggestions with debounce
  if (props.searchGenes && value.length >= 2) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const results = await props.searchGenes(value);
        geneSuggestions[filter.id] = Array.isArray(results) ? results.slice(0, 10) : [];
      } catch (e) {
        geneSuggestions[filter.id] = [];
      }
    }, 300);
  } else {
    geneSuggestions[filter.id] = [];
  }
};

const onOperatorChange = (filter, value) => {
  initPendingValues(filter.id, filter);
  pendingValues[filter.id].operator = value;
};

const onValueChange = (filter, value) => {
  initPendingValues(filter.id, filter);
  pendingValues[filter.id].value = parseFloat(value) || 0;
};

// Apply filter - emit the update to parent
const applyFilter = (filterId) => {
  const pending = pendingValues[filterId];
  if (!pending) return;
  
  // Emit the update with all pending values
  emit('update', filterId, {
    gene: pending.gene,
    operator: pending.operator,
    value: pending.value,
  });
  
  // Clear suggestions
  showSuggestions[filterId] = false;
  geneSuggestions[filterId] = [];
};

// Add a new filter
const addNewFilter = () => {
  emit('add', '');
};

// Remove a filter and clean up local state
const removeFilter = (filterId) => {
  delete pendingValues[filterId];
  delete showSuggestions[filterId];
  delete geneSuggestions[filterId];
  emit('remove', filterId);
};

const selectGene = (filter, gene) => {
  initPendingValues(filter.id, filter);
  pendingValues[filter.id].gene = gene.toUpperCase();
  showSuggestions[filter.id] = false;
  geneSuggestions[filter.id] = [];
  // Auto-apply when selecting from autocomplete
  applyFilter(filter.id);
};

const hideSuggestions = (filterId) => {
  setTimeout(() => {
    showSuggestions[filterId] = false;
  }, 200);
};

const getExpressionRange = (gene) => {
  const expr = props.geneExpressionCache[gene];
  if (!expr || !expr.length) return 'N/A';
  
  const nonZero = expr.filter(v => v > 0);
  if (nonZero.length === 0) return '0 (all zeros)';
  
  const min = Math.min(...nonZero).toFixed(2);
  const max = Math.max(...nonZero).toFixed(2);
  return `${min} - ${max}`;
};

// Sync pending values when filters prop changes (e.g., loaded from preset)
watch(() => props.filters, (newFilters) => {
  newFilters.forEach(filter => {
    // Only update if there are no pending changes for this filter
    if (!hasPendingChanges(filter.id)) {
      pendingValues[filter.id] = {
        gene: filter.gene || '',
        operator: filter.operator || '>',
        value: filter.value ?? 0,
      };
    }
  });
}, { deep: true });
</script>
