<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <AppIcon name="adjustments" size="sm" />
        Category Filters
      </h3>
      <button
        @click="$emit('add')"
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
      <AppIcon name="adjustments" size="lg" class="mx-auto text-gray-400 mb-2" />
      <p class="text-sm text-gray-500">No category filters</p>
      <button
        @click="$emit('add')"
        class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        Add your first filter
      </button>
    </div>

    <!-- Filter List -->
    <div v-else class="space-y-2">
      <div 
        v-for="(filter, index) in filters" 
        :key="filter.id"
        class="bg-white rounded-lg border border-gray-200 p-3 space-y-2"
      >
        <!-- Filter Row -->
        <div class="flex items-start gap-2">
          <!-- Column Select -->
          <div class="flex-1 min-w-0">
            <label class="block text-xs text-gray-500 mb-1">Column</label>
            <select
              :value="filter.column"
              @change="updateFilter(filter.id, { column: $event.target.value, values: [] })"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="col in availableColumns" :key="col" :value="col">
                {{ formatColumnName(col) }}
              </option>
            </select>
          </div>

          <!-- Operator Select -->
          <div class="w-24">
            <label class="block text-xs text-gray-500 mb-1">Match</label>
            <select
              :value="filter.operator"
              @change="updateFilter(filter.id, { operator: $event.target.value })"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="in">is in</option>
              <option value="not_in">is not in</option>
            </select>
          </div>

          <!-- Remove Button -->
          <button
            @click="$emit('remove', filter.id)"
            class="mt-5 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remove filter"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Value Selection -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">
            Values 
            <span class="text-gray-400">
              ({{ filter.values?.length || 0 }} / {{ columnValues[filter.column]?.length || 0 }} selected)
            </span>
          </label>
          
          <!-- Quick Actions -->
          <div class="flex gap-2 mb-2">
            <button
              @click="selectAllValues(filter)"
              class="text-xs text-primary-600 hover:text-primary-700"
            >
              Select All
            </button>
            <span class="text-gray-300">|</span>
            <button
              @click="clearValues(filter)"
              class="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          </div>

          <!-- Value Checkboxes (scrollable) -->
          <div class="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
            <div 
              v-for="value in columnValues[filter.column]" 
              :key="value"
              class="flex items-center gap-2 py-0.5"
            >
              <input
                type="checkbox"
                :id="`${filter.id}-${value}`"
                :checked="filter.values?.includes(value)"
                @change="toggleValue(filter, value)"
                class="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500 flex-shrink-0"
              />
              <label 
                :for="`${filter.id}-${value}`"
                class="flex-1 min-w-0 flex items-center justify-between gap-2 text-sm text-gray-700 cursor-pointer"
                :title="value"
              >
                <span class="truncate">{{ value }}</span>
                <span 
                  v-if="columnValueCounts[filter.column]?.[value]"
                  class="flex-shrink-0 text-xs text-gray-400 tabular-nums"
                >
                  {{ formatCount(columnValueCounts[filter.column][value]) }}
                </span>
              </label>
            </div>
            <div v-if="!columnValues[filter.column]?.length" class="text-sm text-gray-400 text-center py-2">
              No values available
            </div>
          </div>
        </div>

        <!-- Logic Connector (if not last) -->
        <div v-if="index < filters.length - 1" class="flex justify-center pt-2">
          <select
            :value="filter.logic"
            @change="updateFilter(filter.id, { logic: $event.target.value })"
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
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps({
  filters: {
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
});

// Helper to format cell count with thousands separator
const formatCount = (count) => {
  if (count === undefined || count === null) return '';
  return count.toLocaleString();
};

const emit = defineEmits(['add', 'remove', 'update']);

const formatColumnName = (col) => {
  if (!col) return '';
  return col
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

const updateFilter = (filterId, updates) => {
  emit('update', filterId, updates);
};

const toggleValue = (filter, value) => {
  const currentValues = filter.values || [];
  let newValues;
  
  if (currentValues.includes(value)) {
    newValues = currentValues.filter(v => v !== value);
  } else {
    newValues = [...currentValues, value];
  }
  
  emit('update', filter.id, { values: newValues });
};

const selectAllValues = (filter) => {
  const allValues = props.columnValues[filter.column] || [];
  emit('update', filter.id, { values: [...allValues] });
};

const clearValues = (filter) => {
  emit('update', filter.id, { values: [] });
};
</script>
