<template>
  <div class="mb-6 flex-shrink-0">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option v-for="(colors, name) in palettes" :key="name" :value="name">
        {{ formatPaletteName(name) }}
      </option>
    </select>
    <!-- Color Preview -->
    <div class="flex gap-0.5 mt-2">
      <div
        v-for="(color, idx) in currentPalette"
        :key="idx"
        :style="{ backgroundColor: color }"
        class="h-4 flex-1 rounded-sm"
        :title="color"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  cellTypeColorPalettes, 
  geneExpressionPalettes, 
  heatmapColorPalettes 
} from '@/composables/useColorPalettes';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'default',
  },
  type: {
    type: String,
    default: 'cellType', // 'cellType', 'expression', 'heatmap'
    validator: (value) => ['cellType', 'expression', 'heatmap'].includes(value),
  },
  label: {
    type: String,
    default: 'Color Palette',
  },
});

defineEmits(['update:modelValue']);

const palettes = computed(() => {
  switch (props.type) {
    case 'expression':
      return geneExpressionPalettes;
    case 'heatmap':
      return heatmapColorPalettes;
    case 'cellType':
    default:
      return cellTypeColorPalettes;
  }
});

const currentPalette = computed(() => {
  return palettes.value[props.modelValue] || Object.values(palettes.value)[0];
});

const formatPaletteName = (name) => {
  const nameMap = {
    default: 'Default (Bright)',
    pastel: 'Pastel',
    vibrant: 'Vibrant',
    colorblind: 'Colorblind Friendly',
    warm: 'Warm',
    cool: 'Cool',
    reds: 'Reds (Gray to Red)',
    blues: 'Blues (White to Blue)',
    greens: 'Greens (White to Green)',
    purples: 'Purples (White to Purple)',
    oranges: 'Oranges (White to Orange)',
    viridis: 'Viridis (Rainbow)',
    diverging_blue_red: 'Diverging (Blue-White-Red)',
    diverging_blue_yellow_red: 'Diverging (Blue-White-Yellow-Red)',
  };
  return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
};
</script>

