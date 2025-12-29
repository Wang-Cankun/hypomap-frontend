<template>
  <div class="bg-gradient-to-r from-primary-50 to-violet-50 rounded-lg p-4 border border-primary-100">
    <!-- Stats Display -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <AppIcon name="chart" size="sm" class="text-primary-600" />
        <span class="text-sm font-medium text-gray-700">Cell Filter Stats</span>
      </div>
      <div v-if="hasActiveFilters" class="flex items-center gap-1">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
          {{ activeFilterCount }} {{ activeFilterCount === 1 ? 'filter' : 'filters' }} active
        </span>
      </div>
    </div>

    <!-- Numbers -->
    <div class="flex items-center gap-3 text-sm">
      <div class="flex items-center gap-1">
        <span class="text-gray-500">Before:</span>
        <span class="font-semibold text-gray-900">{{ formatNumber(totalCells) }}</span>
      </div>
      
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
      
      <div class="flex items-center gap-1">
        <span class="text-gray-500">After:</span>
        <span class="font-semibold" :class="hasActiveFilters ? 'text-primary-600' : 'text-gray-900'">
          {{ formatNumber(filteredCells) }}
        </span>
      </div>
      
      <span 
        class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
        :class="percentageClass"
      >
        {{ percentage }}%
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        class="h-full transition-all duration-300 ease-out rounded-full"
        :class="progressBarClass"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>

    <!-- Quick Info -->
    <div v-if="hasActiveFilters && filteredCells < totalCells" class="mt-2 text-xs text-gray-500">
      {{ formatNumber(totalCells - filteredCells) }} cells excluded by filters
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps({
  totalCells: {
    type: Number,
    default: 0,
  },
  filteredCells: {
    type: Number,
    default: 0,
  },
  activeFilterCount: {
    type: Number,
    default: 0,
  },
});

const hasActiveFilters = computed(() => props.activeFilterCount > 0);

const percentage = computed(() => {
  if (props.totalCells === 0) return 100;
  return ((props.filteredCells / props.totalCells) * 100).toFixed(1);
});

const percentageClass = computed(() => {
  const pct = parseFloat(percentage.value);
  if (pct >= 75) return 'bg-green-100 text-green-700';
  if (pct >= 50) return 'bg-yellow-100 text-yellow-700';
  if (pct >= 25) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
});

const progressBarClass = computed(() => {
  const pct = parseFloat(percentage.value);
  if (pct >= 75) return 'bg-gradient-to-r from-green-400 to-green-500';
  if (pct >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
  if (pct >= 25) return 'bg-gradient-to-r from-orange-400 to-orange-500';
  return 'bg-gradient-to-r from-red-400 to-red-500';
});

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};
</script>
