<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="font-semibold text-gray-900 mb-3">1. DEG Analysis Setup</h3>
    <p class="text-xs text-gray-600 mb-3">
      Define cell groups by combining multiple metadata filters. Cells matching
      ALL conditions in a group will be compared.
    </p>
    <div class="space-y-3">
      <!-- Group 1 Selection -->
      <GroupFilterBuilder
        group-id="1"
        group-color="blue"
        :filters="group1Filters"
        :available-metadata="availableMetadataColumns"
        :metadata-values="categoricalMetadata"
        :other-group-filters="group2Filters"
        :loading="loadingMetadataValues"
        @update:filters="$emit('update:group1Filters', $event)"
        @fetch-values="$emit('fetchMetadataValues', $event)"
      />

      <!-- Group 2 Selection -->
      <GroupFilterBuilder
        group-id="2"
        group-color="green"
        :filters="group2Filters"
        :available-metadata="availableMetadataColumns"
        :metadata-values="categoricalMetadata"
        :other-group-filters="group1Filters"
        :loading="loadingMetadataValues"
        @update:filters="$emit('update:group2Filters', $event)"
        @fetch-values="$emit('fetchMetadataValues', $event)"
      />

      <!-- Cell count preview -->
      <div
        v-if="
          cellCountPreview.group1 > 0 ||
          cellCountPreview.group2 > 0 ||
          loadingPreview
        "
        class="bg-white rounded-lg p-3 border border-gray-200"
      >
        <h4 class="text-sm font-medium text-gray-700 mb-2">
          Cell Selection Preview
          <span v-if="loadingPreview" class="text-xs text-gray-400 ml-2">
            (updating...)
          </span>
        </h4>
        <div class="flex gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full bg-blue-600"
              aria-hidden="true"
            ></span>
            <span
              >Group 1:
              {{ cellCountPreview.group1.toLocaleString() }} cells</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full bg-green-600"
              aria-hidden="true"
            ></span>
            <span
              >Group 2:
              {{ cellCountPreview.group2.toLocaleString() }} cells</span
            >
          </div>
        </div>
        <div
          v-if="cellCountWarning"
          class="mt-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 flex items-center gap-1"
        >
          <AppIcon name="warning" size="sm" /> {{ cellCountWarning }}
        </div>
      </div>

      <!-- Thresholds -->
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Min |Log2FC|
          </label>
          <input
            :value="degParams.minLogFC"
            @input="
              $emit('update:degParams', {
                ...degParams,
                minLogFC: parseFloat($event.target.value),
              })
            "
            type="number"
            step="0.1"
            class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Max Adjusted P-value
          </label>
          <input
            :value="degParams.maxPvalue"
            @input="
              $emit('update:degParams', {
                ...degParams,
                maxPvalue: parseFloat($event.target.value),
              })
            "
            type="number"
            step="0.01"
            class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>

      <button
        @click="$emit('runDEG')"
        :disabled="isRunningDEG || !canRunDEG"
        class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg
          v-if="isRunningDEG"
          class="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ isRunningDEG ? "Calculating..." : "Run DEG Analysis" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import GroupFilterBuilder from "../GroupFilterBuilder.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

defineProps({
  group1Filters: {
    type: Array,
    required: true,
  },
  group2Filters: {
    type: Array,
    required: true,
  },
  availableMetadataColumns: {
    type: Array,
    required: true,
  },
  categoricalMetadata: {
    type: Object,
    required: true,
  },
  loadingMetadataValues: {
    type: Boolean,
    default: false,
  },
  cellCountPreview: {
    type: Object,
    default: () => ({ group1: 0, group2: 0 }),
  },
  loadingPreview: {
    type: Boolean,
    default: false,
  },
  cellCountWarning: {
    type: String,
    default: null,
  },
  degParams: {
    type: Object,
    required: true,
  },
  isRunningDEG: {
    type: Boolean,
    default: false,
  },
  canRunDEG: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "update:group1Filters",
  "update:group2Filters",
  "update:degParams",
  "fetchMetadataValues",
  "runDEG",
]);
</script>
