<template>
  <div
    class="p-3 bg-white rounded border space-y-3"
    :class="groupColor === 'blue' ? 'border-blue-200' : 'border-green-200'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span
          class="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
          :class="groupColor === 'blue' ? 'bg-blue-600' : 'bg-green-600'"
        >
          {{ groupId }}
        </span>
        <label
          class="block text-sm font-semibold"
          :class="groupColor === 'blue' ? 'text-blue-700' : 'text-green-700'"
        >
          Group {{ groupId }}
        </label>
        <span
          v-if="totalSelectedCount > 0"
          class="text-xs px-2 py-0.5 rounded-full"
          :class="
            groupColor === 'blue'
              ? 'text-blue-600 bg-blue-100'
              : 'text-green-600 bg-green-100'
          "
        >
          {{ totalSelectedCount }} values selected
        </span>
      </div>
      <button
        type="button"
        @click="addFilter"
        class="px-2 py-1 text-xs border rounded hover:bg-gray-50"
        :class="
          groupColor === 'blue'
            ? 'border-blue-200 text-blue-600'
            : 'border-green-200 text-green-600'
        "
      >
        + Add Filter
      </button>
    </div>

    <!-- Filter conditions -->
    <div class="space-y-2">
      <div
        v-for="(filter, index) in localFilters"
        :key="filter.id"
        class="flex gap-2 items-start p-2 bg-gray-50 rounded"
      >
        <!-- Metadata column selector -->
        <div class="flex-1 min-w-0">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Metadata
          </label>
          <select
            v-model="filter.column"
            @change="onColumnChange(index)"
            class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select metadata...</option>
            <option v-for="meta in availableMetadata" :key="meta" :value="meta">
              {{ formatLabel(meta) }}
            </option>
          </select>
        </div>

        <!-- Values multi-select -->
        <div class="flex-1 min-w-0">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Values ({{ filter.selectedValues.length }} selected)
          </label>
          <div
            class="max-h-32 overflow-y-auto border border-gray-300 rounded bg-white"
          >
            <div
              v-if="loading && !getValuesForColumn(filter.column).length"
              class="p-2 text-xs text-gray-500 text-center"
            >
              Loading...
            </div>
            <div
              v-else-if="!filter.column"
              class="p-2 text-xs text-gray-400 text-center"
            >
              Select metadata first
            </div>
            <div
              v-else-if="getValuesForColumn(filter.column).length === 0"
              class="p-2 text-xs text-gray-400 text-center"
            >
              No values available
            </div>
            <template v-else>
              <label
                v-for="value in getValuesForColumn(filter.column)"
                :key="value"
                class="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-50"
                :class="{
                  'bg-blue-50':
                    filter.selectedValues.includes(value) &&
                    groupColor === 'blue',
                  'bg-green-50':
                    filter.selectedValues.includes(value) &&
                    groupColor === 'green',
                  'opacity-40 cursor-not-allowed': isValueInOtherGroup(
                    filter.column,
                    value
                  ),
                }"
              >
                <input
                  type="checkbox"
                  :value="value"
                  v-model="filter.selectedValues"
                  :disabled="isValueInOtherGroup(filter.column, value)"
                  class="rounded text-sm"
                  :class="
                    groupColor === 'blue' ? 'text-blue-600' : 'text-green-600'
                  "
                />
                <span class="truncate">{{ value }}</span>
              </label>
            </template>
          </div>
        </div>

        <!-- Remove button -->
        <button
          type="button"
          @click="removeFilter(index)"
          class="mt-5 p-1 text-gray-400 hover:text-red-500"
          title="Remove filter"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="localFilters.length === 0"
        class="text-center py-4 text-sm text-gray-500"
      >
        Click "Add Filter" to define cell selection criteria
      </div>
    </div>

    <!-- Quick actions -->
    <div v-if="localFilters.length > 0" class="flex gap-2 text-xs">
      <button
        type="button"
        @click="selectAllInFilters"
        class="px-2 py-1 border rounded hover:bg-gray-50"
        :class="
          groupColor === 'blue'
            ? 'border-blue-200 text-blue-600'
            : 'border-green-200 text-green-600'
        "
      >
        Select All
      </button>
      <button
        type="button"
        @click="clearAllFilters"
        class="px-2 py-1 border rounded hover:bg-gray-50"
        :class="
          groupColor === 'blue'
            ? 'border-blue-200 text-blue-600'
            : 'border-green-200 text-green-600'
        "
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  groupId: {
    type: String,
    required: true,
  },
  groupColor: {
    type: String,
    default: "blue", // 'blue' or 'green'
  },
  filters: {
    type: Array,
    default: () => [],
  },
  availableMetadata: {
    type: Array,
    default: () => [],
  },
  metadataValues: {
    type: Object,
    default: () => ({}),
  },
  otherGroupFilters: {
    type: Array,
    default: () => [],
  },
  exclusiveColumns: {
    // Columns where overlap between groups is NOT allowed
    // Default to empty - allow same cell types in both groups (e.g., Astrocytes in condition A vs condition B)
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:filters", "fetchValues"]);

// Local state - copy of filters with reactive updates
const localFilters = ref([]);
let nextFilterId = 1;

// Initialize local filters from props
watch(
  () => props.filters,
  (newFilters) => {
    if (JSON.stringify(newFilters) !== JSON.stringify(localFilters.value)) {
      localFilters.value = newFilters.map((f) => ({
        ...f,
        id: f.id || nextFilterId++,
      }));
    }
  },
  { immediate: true, deep: true }
);

// Emit changes back to parent
watch(
  localFilters,
  (newVal) => {
    emit("update:filters", newVal);
  },
  { deep: true }
);

// Format metadata label
const formatLabel = (key) => {
  if (!key) return "";
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Get total selected count across all filters
const totalSelectedCount = computed(() => {
  return localFilters.value.reduce(
    (sum, f) => sum + f.selectedValues.length,
    0
  );
});

// Get values for a specific metadata column
const getValuesForColumn = (column) => {
  if (!column) return [];
  const values = props.metadataValues[column];
  if (Array.isArray(values)) {
    // If it's an array of values (unique values)
    return values;
  }
  if (values && typeof values === "object") {
    // If it's an object with value -> count mapping
    return Object.keys(values);
  }
  return [];
};

// Check if a value is selected in the other group (only for exclusive columns like cell_type)
const isValueInOtherGroup = (column, value) => {
  // Only check for overlap in exclusive columns (e.g., cell_type)
  // Other columns like sex, brain_region, etc. CAN overlap between groups
  if (!props.exclusiveColumns.includes(column)) {
    return false;
  }
  return props.otherGroupFilters.some(
    (f) => f.column === column && f.selectedValues.includes(value)
  );
};

// Add a new filter
const addFilter = () => {
  localFilters.value.push({
    id: nextFilterId++,
    column: "",
    selectedValues: [],
  });
};

// Remove a filter
const removeFilter = (index) => {
  localFilters.value.splice(index, 1);
};

// Handle column change - fetch values if needed
const onColumnChange = (index) => {
  const filter = localFilters.value[index];
  filter.selectedValues = []; // Reset selections when column changes

  if (filter.column && !props.metadataValues[filter.column]) {
    emit("fetchValues", filter.column);
  }
};

// Select all values in all filters (excluding other group's selections for exclusive columns only)
const selectAllInFilters = () => {
  localFilters.value.forEach((filter) => {
    if (filter.column) {
      const allValues = getValuesForColumn(filter.column);
      // Only exclude values in other group for exclusive columns (like cell_type)
      if (props.exclusiveColumns.includes(filter.column)) {
        filter.selectedValues = allValues.filter(
          (v) => !isValueInOtherGroup(filter.column, v)
        );
      } else {
        // For non-exclusive columns (sex, brain_region, etc.), select all
        filter.selectedValues = [...allValues];
      }
    }
  });
};

// Clear all selections
const clearAllFilters = () => {
  localFilters.value.forEach((filter) => {
    filter.selectedValues = [];
  });
};

// Initialize with one filter if empty
watch(
  () => props.availableMetadata,
  (metadata) => {
    if (metadata.length > 0 && localFilters.value.length === 0) {
      addFilter();
    }
  },
  { immediate: true }
);
</script>
