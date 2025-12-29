<template>
  <div class="flex-1 flex flex-col min-h-0">
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
        <AppIcon name="microscope" size="sm" /> {{ label }}
      </h4>
      <div class="flex gap-1">
        <button
          @click="selectAll"
          class="px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded"
        >
          All
        </button>
        <button
          @click="selectNone"
          class="px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded"
        >
          None
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto space-y-2 min-h-0">
      <label
        v-for="cellType in cellTypes"
        :key="cellType"
        class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
      >
        <input
          type="checkbox"
          :value="cellType"
          :checked="modelValue.includes(cellType)"
          @change="toggleCellType(cellType)"
          class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
        />
        <span
          class="w-3 h-3 rounded-full flex-shrink-0"
          :style="{ backgroundColor: getCellTypeColor(cellType) }"
        ></span>
        <span class="text-sm text-gray-700 flex-1">{{ cellType }}</span>
        <span class="text-xs text-gray-500">
          ({{ cellTypeCounts[cellType]?.toLocaleString() || 0 }})
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  cellTypeColorPalettes,
  humanAtlasCellTypeColors,
} from "@/composables/useColorPalettes";
import AppIcon from "@/components/icons/AppIcon.vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  cellTypes: {
    type: Array,
    default: () => [],
  },
  cellTypeCounts: {
    type: Object,
    default: () => ({}),
  },
  colorPalette: {
    type: String,
    default: "default",
  },
  label: {
    type: String,
    default: "Cell Types",
  },
});

const emit = defineEmits(["update:modelValue"]);

const getCellTypeColor = (cellType) => {
  // First check if it's a known human atlas cell type
  if (humanAtlasCellTypeColors[cellType]) {
    return humanAtlasCellTypeColors[cellType];
  }
  
  // Fallback to palette-based coloring
  const paletteColors =
    cellTypeColorPalettes[props.colorPalette] || cellTypeColorPalettes.default;
  const index = props.cellTypes.indexOf(cellType);
  if (index === -1) return "#A5A5A5";
  return paletteColors[index % paletteColors.length];
};

const toggleCellType = (cellType) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(cellType);
  if (index === -1) {
    newValue.push(cellType);
  } else {
    newValue.splice(index, 1);
  }
  emit("update:modelValue", newValue);
};

const selectAll = () => {
  emit("update:modelValue", [...props.cellTypes]);
};

const selectNone = () => {
  emit("update:modelValue", []);
};
</script>
