<template>
  <div class="relative">
    <div class="flex items-center justify-between mb-2" v-if="showLabel">
      <label class="block text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <button
        v-if="showExample"
        @click="$emit('load-example')"
        class="text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        Load Example
      </button>
    </div>
    <input
      :value="modelValue"
      @input="onInput"
      @keyup.enter="onEnter"
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
      type="text"
      :placeholder="placeholder"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
    <!-- Autocomplete Dropdown -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
    >
      <button
        v-for="gene in suggestions"
        :key="gene.symbol"
        @mousedown.prevent="selectGene(gene.symbol)"
        class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
      >
        {{ gene.symbol }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSingleCellApi } from '@/composables/useSingleCellApi';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  datasetId: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Search for a gene...',
  },
  label: {
    type: String,
    default: 'Gene',
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  showExample: {
    type: Boolean,
    default: false,
  },
  debounceMs: {
    type: Number,
    default: 300,
  },
});

const emit = defineEmits(['update:modelValue', 'select', 'load-example']);

const { searchGenes } = useSingleCellApi();

const suggestions = ref([]);
const showSuggestions = ref(false);
let searchTimeout = null;

const onInput = async (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);

  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    const query = value.trim();
    if (query.length >= 2) {
      suggestions.value = await searchGenes(props.datasetId, query);
    } else {
      suggestions.value = [];
    }
  }, props.debounceMs);
};

const selectGene = (geneSymbol) => {
  emit('update:modelValue', geneSymbol);
  emit('select', geneSymbol);
  suggestions.value = [];
  showSuggestions.value = false;
};

const onEnter = () => {
  const value = props.modelValue?.trim();
  if (value) {
    emit('select', value);
  }
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// Clear suggestions when dataset changes
watch(() => props.datasetId, () => {
  suggestions.value = [];
});
</script>

