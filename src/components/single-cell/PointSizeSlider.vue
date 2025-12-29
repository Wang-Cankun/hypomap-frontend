<template>
  <div class="mb-6 flex-shrink-0">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Point Size: {{ modelValue }}
    </label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="w-full"
    />
    <div class="flex justify-between text-xs text-gray-500 mt-1">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 3,
  },
  min: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    default: 10,
  },
  step: {
    type: Number,
    default: 1,
  },
});

defineEmits(['update:modelValue']);
</script>

