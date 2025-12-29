<template>
  <!-- Heroicons -->
  <MagnifyingGlassIcon v-if="name === 'search'" :class="iconClass" />
  <PlusIcon v-else-if="name === 'plus'" :class="iconClass" />
  <MinusIcon v-else-if="name === 'minus'" :class="iconClass" />
  <ArrowPathIcon v-else-if="name === 'refresh'" :class="iconClass" />
  <ExclamationTriangleIcon v-else-if="name === 'warning'" :class="iconClass" />
  <ChartBarIcon v-else-if="name === 'chart'" :class="iconClass" />
  <ClipboardDocumentIcon v-else-if="name === 'clipboard'" :class="iconClass" />
  <ArrowDownTrayIcon v-else-if="name === 'download'" :class="iconClass" />
  <DocumentTextIcon v-else-if="name === 'document'" :class="iconClass" />
  <LinkIcon v-else-if="name === 'link'" :class="iconClass" />
  <QuestionMarkCircleIcon v-else-if="name === 'help'" :class="iconClass" />
  <SwatchIcon v-else-if="name === 'palette'" :class="iconClass" />
  <PhotoIcon v-else-if="name === 'image'" :class="iconClass" />
  <MapPinIcon v-else-if="name === 'pin'" :class="iconClass" />
  <PencilSquareIcon v-else-if="name === 'edit'" :class="iconClass" />
  <BeakerIcon v-else-if="name === 'beaker'" :class="iconClass" />
  <EyeDropperIcon v-else-if="name === 'eyedropper'" :class="iconClass" />
  <TableCellsIcon v-else-if="name === 'table'" :class="iconClass" />
  <AdjustmentsHorizontalIcon v-else-if="name === 'adjustments'" :class="iconClass" />
  <SparklesIcon v-else-if="name === 'sparkles'" :class="iconClass" />
  <CubeTransparentIcon v-else-if="name === 'cube'" :class="iconClass" />
  <CircleStackIcon v-else-if="name === 'stack'" :class="iconClass" />
  <ArrowsPointingOutIcon v-else-if="name === 'expand'" :class="iconClass" />

  <!-- Custom Scientific Icons -->
  <!-- DNA Helix Icon -->
  <svg
    v-else-if="name === 'dna'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4 4c0 0 2 2 8 2s8-2 8-2M4 8c0 0 2 2 8 2s8-2 8-2M4 12c0 0 2 2 8 2s8-2 8-2M4 16c0 0 2 2 8 2s8-2 8-2M4 20c0 0 2 2 8 2s8-2 8-2M6 4v16M18 4v16"
    />
  </svg>

  <!-- Microscope Icon -->
  <svg
    v-else-if="name === 'microscope'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 3h6M12 3v4M9 7h6M10 7l-1 6M14 7l1 6M8 13h8M9 13l-2 8M15 13l2 8M6 21h12"
    />
    <circle cx="12" cy="10" r="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- Flask/Beaker Scientific Icon -->
  <svg
    v-else-if="name === 'flask'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 3h6M9 3v5l-5 9a2 2 0 002 2h12a2 2 0 002-2l-5-9V3M9 3h6M8 14h8"
    />
  </svg>

  <!-- Cell/Biology Icon -->
  <svg
    v-else-if="name === 'cell'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="12" cy="12" r="4" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>

  <!-- Scatter Plot Icon -->
  <svg
    v-else-if="name === 'scatter'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V3M3 21h18" />
    <circle cx="7" cy="14" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" />
    <circle cx="11" cy="6" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="18" cy="5" r="1.5" fill="currentColor" />
    <circle cx="8" cy="17" r="1.5" fill="currentColor" />
  </svg>

  <!-- Spatial/Map Grid Icon -->
  <svg
    v-else-if="name === 'spatial'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18" cy="6" r="1" fill="currentColor" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
  </svg>

  <!-- Save/Cart Icon -->
  <svg
    v-else-if="name === 'save'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
    />
    <path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
  </svg>

  <!-- Datasets Icon -->
  <svg
    v-else-if="name === 'datasets'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <ellipse cx="12" cy="6" rx="8" ry="3" stroke-linecap="round" stroke-linejoin="round" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
  </svg>

  <!-- Analysis Icon -->
  <svg
    v-else-if="name === 'analysis'"
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M7 14l4-4 4 4 5-6" />
  </svg>

  <!-- Fallback -->
  <svg
    v-else
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="1.5"
  >
    <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
  PhotoIcon,
  MapPinIcon,
  PencilSquareIcon,
  BeakerIcon,
  EyeDropperIcon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  CubeTransparentIcon,
  CircleStackIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
});

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const iconClass = sizeClasses[props.size];
</script>
