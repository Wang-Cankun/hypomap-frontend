<template>
  <div
    v-if="error"
    class="flex items-start gap-4 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 my-4"
  >
    <div class="flex-shrink-0">
      <AppIcon name="warning" size="lg" class="text-red-500" />
    </div>
    <div class="flex-1">
      <h3 class="text-lg font-semibold mb-2 text-red-800">Error</h3>
      <p class="mb-4 leading-relaxed">{{ error }}</p>
      <button
        v-if="retry"
        @click="retry"
        class="px-4 py-2 bg-red-600 text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-red-700 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup>
import AppIcon from "@/components/icons/AppIcon.vue";

defineProps({
  error: {
    type: String,
    required: true,
  },
  retry: {
    type: Function,
    default: null,
  },
});
</script>

<style scoped>
/* Custom Tailwind Components for ErrorMessage */
</style>
