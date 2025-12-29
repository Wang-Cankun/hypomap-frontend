<template>
  <div class="flex gap-2">
    <button
      @click="$emit('download-png')"
      :disabled="disabled"
      class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      :title="pngTitle || 'Download plot as PNG image'"
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download PNG
    </button>
    <button
      v-if="showCSV"
      @click="$emit('download-csv')"
      :disabled="disabled"
      class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      :title="csvTitle || 'Download data as CSV'"
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download CSV
    </button>
  </div>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  showCSV: {
    type: Boolean,
    default: true,
  },
  pngTitle: {
    type: String,
    default: "",
  },
  csvTitle: {
    type: String,
    default: "",
  },
});

defineEmits(["download-png", "download-csv"]);
</script>
