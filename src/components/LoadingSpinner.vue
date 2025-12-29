<template>
  <div
    class="flex justify-center items-center p-8"
    :class="{ 'fixed inset-0 bg-white/90 z-50': overlay }"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-10 h-10 border-4 border-secondary-200 border-t-primary-500 rounded-full animate-spin"
      ></div>
      <div class="text-secondary-600 text-sm font-medium">
        {{ message || "Loading..." }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: "Loading...",
  },
  overlay: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
/* Custom Tailwind Components for LoadingSpinner */
</style>
