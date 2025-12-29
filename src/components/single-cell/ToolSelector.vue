<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Analysis Tools</h2>
    <nav class="space-y-1">
      <button
        v-for="tool in tools"
        :key="tool.id"
        @click="selectTool(tool.id)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
          activeTool === tool.id
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-700 hover:bg-gray-50',
        ]"
      >
        <component
          v-if="typeof tool.icon === 'object'"
          :is="tool.icon"
          :name="tool.iconName"
          class="flex-shrink-0"
        />
        <span v-else class="text-xl">{{ tool.icon }}</span>
        <span>{{ tool.name }}</span>
      </button>
    </nav>
    <slot />
  </div>
</template>

<script setup>
import AnalysisToolIcons from "./icons/AnalysisToolIcons.vue";

const props = defineProps({
  tools: {
    type: Array,
    required: true,
  },
  activeTool: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:activeTool"]);

const selectTool = (toolId) => {
  emit("update:activeTool", toolId);
};
</script>
