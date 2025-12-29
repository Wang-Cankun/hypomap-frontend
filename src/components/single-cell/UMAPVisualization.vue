<template>
  <div class="h-full flex gap-4">
    <!-- Settings Column -->
    <div
      v-if="showSettings"
      class="w-72 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
    >
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AppIcon name="palette" size="md" /> Visualization
      </h3>

      <!-- Metadata Column Selector (Atlas mode) -->
      <div v-if="showMetadataSelector" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Color by
        </label>
        <select
          :value="selectedMetadataColumn"
          @change="$emit('update:selectedMetadataColumn', $event.target.value)"
          :disabled="isLoadingMetadata"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option
            v-for="meta in availableMetadataColumns"
            :key="meta"
            :value="meta"
          >
            {{ formatMetadataLabel(meta) }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          {{ availableMetadataColumns.length }} metadata columns available
        </p>
      </div>

      <!-- Color Palette -->
      <ColorPaletteSelector
        v-model="localColorPalette"
        type="cellType"
        label="Color Palette (Cell Types)"
      />

      <!-- Point Size -->
      <PointSizeSlider v-model="localPointSize" />

      <!-- Cell Count Stats (hidden when using external filter panel) -->
      <div v-if="!hideFilterControls" class="mb-2">
        <p class="text-xs text-gray-600">
          Showing: {{ filteredCellCount.toLocaleString() }} /
          {{ totalCellCount.toLocaleString() }} cells
        </p>
      </div>

      <!-- Cell Types / Metadata Values (hidden when using external filter panel) -->
      <CellTypeSelector
        v-if="!hideFilterControls"
        v-model="localSelectedCellTypes"
        :cell-types="cellTypes"
        :cell-type-counts="cellTypeCounts"
        :color-palette="localColorPalette"
        :label="metadataSelectorLabel"
      />
    </div>

    <!-- Visualization Area -->
    <div
      class="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden"
    >
      <div class="flex-1 flex flex-row gap-4 min-h-0 overflow-hidden p-4">
        <!-- UMAP Chart -->
        <div class="flex-1 min-h-0 flex flex-col" style="min-height: 500px">
          <!-- UMAP Title (Row 1: Centered) -->
          <div class="flex justify-center mb-2 flex-shrink-0">
            <h3 class="text-sm font-semibold text-gray-700">
              {{ props.title }}
            </h3>
          </div>
          <!-- UMAP Download Actions (Row 2: Right-aligned) -->
          <div class="flex justify-end mb-2 flex-shrink-0">
            <div class="flex gap-2">
              <DownloadButtons
                :disabled="!umapData"
                @download-png="downloadPlot"
                @download-csv="downloadCSV"
                png-title="Download UMAP plot as PNG image"
                csv-title="Download embedding data as CSV"
              />
              <button
                @click="resetView"
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                title="Reset zoom and pan to default view"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset View
              </button>
            </div>
          </div>
          <!-- UMAP Chart Content -->
          <div class="flex-1 min-h-0">
            <div v-if="loading" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div
                  class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
                ></div>
                <p class="mt-4 text-gray-600">Loading UMAP data...</p>
              </div>
            </div>
            <div
              v-else-if="error"
              class="h-full flex items-center justify-center"
            >
              <div class="text-center text-red-600">
                <AppIcon name="warning" size="xl" class="mx-auto mb-2" />
                <p>Error: {{ error }}</p>
              </div>
            </div>
            <div
              v-else-if="umapData"
              class="w-full h-full"
              style="aspect-ratio: 1 / 1"
            >
              <v-chart
                ref="umapChart"
                :option="umapOption"
                :autoresize="true"
                class="w-full h-full"
              />
            </div>
            <div
              v-else
              class="h-full flex items-center justify-center text-gray-400"
            >
              <p>No data available</p>
            </div>
          </div>
        </div>

        <!-- Stats with Interactive Barplots -->
        <div
          v-if="umapData && showStats"
          class="w-[480px] flex-shrink-0 overflow-hidden flex flex-col"
          style="min-height: 500px"
        >
          <!-- Proportions Title (Row 1: Centered) -->
          <div class="flex justify-center mb-2 flex-shrink-0">
            <h3 class="text-sm font-semibold text-gray-700">
              Cell Type Proportions
            </h3>
          </div>
          <!-- Proportions Download Actions (Row 2: Right-aligned) -->
          <div class="flex justify-end mb-2 flex-shrink-0">
            <DownloadButtons
              :disabled="!hasProportionData"
              @download-png="downloadProportionPNG"
              @download-csv="downloadProportionCSV"
              png-title="Download cell type proportions plot as PNG image"
              csv-title="Download cell type proportions data as CSV"
            />
          </div>
          <div class="flex-1 min-h-0">
            <v-chart
              ref="proportionChartRef"
              :option="cellTypeProportionOption"
              :autoresize="true"
              class="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import VChart from "vue-echarts";
import ColorPaletteSelector from "./ColorPaletteSelector.vue";
import PointSizeSlider from "./PointSizeSlider.vue";
import CellTypeSelector from "./CellTypeSelector.vue";
import DownloadButtons from "./DownloadButtons.vue";
import AppIcon from "@/components/icons/AppIcon.vue";
import {
  cellTypeColorPalettes,
  humanAtlasCellTypeColors,
} from "@/composables/useColorPalettes";

const props = defineProps({
  umapData: {
    type: Object,
    default: null,
  },
  cellMetadata: {
    type: Object,
    default: null,
  },
  cellTypes: {
    type: Array,
    default: () => [],
  },
  selectedCellTypes: {
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
  pointSize: {
    type: Number,
    default: 3,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  showSettings: {
    type: Boolean,
    default: true,
  },
  showStats: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "UMAP Plot",
  },
  // Atlas mode: Metadata column selector
  showMetadataSelector: {
    type: Boolean,
    default: false,
  },
  availableMetadataColumns: {
    type: Array,
    default: () => [],
  },
  selectedMetadataColumn: {
    type: String,
    default: "cell_type",
  },
  isLoadingMetadata: {
    type: Boolean,
    default: false,
  },
  // Advanced filtering: indices of cells that pass the filter
  filteredCellIndices: {
    type: Array,
    default: null, // null means no filter applied (show all)
  },
  // Whether to show excluded cells as grayed out
  showExcludedCells: {
    type: Boolean,
    default: true,
  },
  // Hide the cell count stats and cell type selector when using external filter panel
  hideFilterControls: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:colorPalette",
  "update:pointSize",
  "update:selectedCellTypes",
  "update:selectedMetadataColumn",
]);

// Format metadata label for display (e.g., 'cell_type' -> 'Cell Type')
const formatMetadataLabel = (key) => {
  if (!key) return "";
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Computed: Label for the cell type/metadata selector
const metadataSelectorLabel = computed(() => {
  if (props.showMetadataSelector && props.selectedMetadataColumn) {
    return formatMetadataLabel(props.selectedMetadataColumn);
  }
  return "Cell Types";
});

const umapChart = ref(null);
const proportionChartRef = ref(null);

// Check if proportion data is available
const hasProportionData = computed(() => {
  return (
    props.cellTypes &&
    props.cellTypes.length > 0 &&
    props.cellTypeCounts &&
    Object.keys(props.cellTypeCounts).length > 0
  );
});

// Local state that syncs with props
const localColorPalette = computed({
  get: () => props.colorPalette,
  set: (val) => emit("update:colorPalette", val),
});

const localPointSize = computed({
  get: () => props.pointSize,
  set: (val) => emit("update:pointSize", val),
});

const localSelectedCellTypes = computed({
  get: () => props.selectedCellTypes,
  set: (val) => emit("update:selectedCellTypes", val),
});

// Get the current metadata values array (dynamically based on selected column)
const getCurrentMetadataValues = () => {
  if (!props.cellMetadata) return null;

  // If in atlas mode with custom metadata column, use that
  if (props.showMetadataSelector && props.selectedMetadataColumn) {
    return props.cellMetadata[props.selectedMetadataColumn];
  }

  // Default to cell_type
  return props.cellMetadata.cell_type;
};

// Get unique values from current metadata column for color assignment
const getCurrentMetadataUniqueValues = () => {
  const metadataValues = getCurrentMetadataValues();
  if (!metadataValues) return [];
  return [...new Set(metadataValues)].sort();
};

// Helper function to get color for a cell type/category
const getCellTypeColor = (cellType) => {
  // First check if it's a known human atlas cell type
  if (humanAtlasCellTypeColors[cellType]) {
    return humanAtlasCellTypeColors[cellType];
  }

  // Fallback to palette-based coloring
  const paletteColors =
    cellTypeColorPalettes[localColorPalette.value] ||
    cellTypeColorPalettes.default;

  // Use current metadata unique values for index (handles Pred Label, etc.)
  const uniqueValues = getCurrentMetadataUniqueValues();
  if (uniqueValues.length === 0) return "#A5A5A5";

  const index = uniqueValues.indexOf(cellType);
  if (index === -1) return "#A5A5A5";
  return paletteColors[index % paletteColors.length];
};

// Check if a cell is included in the filter
const isCellFiltered = (idx) => {
  // If no filter provided, all cells are included
  if (!props.filteredCellIndices) return true;
  return props.filteredCellIndices.includes(idx);
};

// Generate UMAP data for chart with filtering support
const generateUMAPData = () => {
  if (!props.umapData || !props.cellMetadata) return [];

  const metadataValues = getCurrentMetadataValues();
  if (!metadataValues) return [];

  const paletteColors =
    cellTypeColorPalettes[localColorPalette.value] ||
    cellTypeColorPalettes.default;

  const hasAdvancedFilter = props.filteredCellIndices !== null;
  const filteredSet = hasAdvancedFilter ? new Set(props.filteredCellIndices) : null;

  // Get unique values from current metadata for filtering
  const currentUniqueValues = getCurrentMetadataUniqueValues();
  // Check if we're using a custom metadata column (not default cell_type)
  const isCustomMetadata = props.showMetadataSelector && props.selectedMetadataColumn &&
    props.selectedMetadataColumn !== 'cell_type';

  // Group cells by type/category, separating filtered and excluded
  const cellsByType = {};
  const excludedCells = []; // For grayed-out excluded cells

  metadataValues.forEach((type, idx) => {
    const coord = props.umapData.coordinates[idx];
    // For custom metadata columns, include all values; otherwise use selectedCellTypes filter
    const isSelected = isCustomMetadata
      ? currentUniqueValues.includes(type)
      : localSelectedCellTypes.value.includes(type);
    const isFiltered = !filteredSet || filteredSet.has(idx);

    if (isSelected && isFiltered) {
      // Cell passes all filters - show in color
      if (!cellsByType[type]) cellsByType[type] = [];
      cellsByType[type].push(coord);
    } else if (props.showExcludedCells && isSelected && !isFiltered) {
      // Cell is selected by type but excluded by advanced filter - gray out
      excludedCells.push(coord);
    }
  });

  // Create series for each cell type with colors
  const series = Object.entries(cellsByType)
    .sort(([a], [b]) => {
      // Use current metadata unique values for sorting
      const sortValues = isCustomMetadata ? currentUniqueValues : props.cellTypes;
      const idxA = sortValues.indexOf(a);
      const idxB = sortValues.indexOf(b);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    })
    .map(([cellType, points]) => {
      const color = getCellTypeColor(cellType);

      return {
        name: cellType,
        type: "scatter",
        data: points,
        symbolSize: localPointSize.value,
        itemStyle: {
          color,
          opacity: 0.7,
        },
        large: true,
        largeThreshold: 2000,
      };
    });

  // Add excluded cells as a grayed-out series (rendered first, behind colored cells)
  if (excludedCells.length > 0) {
    series.unshift({
      name: "Excluded by filter",
      type: "scatter",
      data: excludedCells,
      symbolSize: localPointSize.value * 0.8,
      itemStyle: {
        color: "#d1d5db",
        opacity: 0.25,
      },
      large: true,
      largeThreshold: 2000,
      // Don't show in legend
      legendHoverLink: false,
    });
  }

  return series;
};

// Computed cell counts for display
const totalCellCount = computed(() => {
  return props.umapData?.coordinates?.length || 0;
});

const filteredCellCount = computed(() => {
  const metadataValues = getCurrentMetadataValues();
  if (!metadataValues) return 0;

  // Check if using custom metadata column
  const isCustomMetadata = props.showMetadataSelector && props.selectedMetadataColumn &&
    props.selectedMetadataColumn !== 'cell_type';

  // For custom metadata, show all cells; otherwise filter by selectedCellTypes
  if (isCustomMetadata) {
    return totalCellCount.value;
  }

  if (localSelectedCellTypes.value.length === 0) {
    return totalCellCount.value;
  }
  return metadataValues.filter((ct) =>
    localSelectedCellTypes.value.includes(ct)
  ).length;
});

// UMAP Chart Option
const umapOption = computed(() => {
  // Check if using custom metadata column
  const isCustomMetadata = props.showMetadataSelector && props.selectedMetadataColumn &&
    props.selectedMetadataColumn !== 'cell_type';
  // Use appropriate legend data based on metadata column
  const legendData = isCustomMetadata
    ? getCurrentMetadataUniqueValues()
    : localSelectedCellTypes.value;

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.seriesName}<br/>UMAP1: ${params.value[0].toFixed(
          2
        )}<br/>UMAP2: ${params.value[1].toFixed(2)}`,
    },
    legend: {
      data: legendData,
      bottom: 10,
      type: "scroll",
    },
    grid: {
      left: 80,
      right: 80,
      top: 20,
      bottom: 80,
    },
    xAxis: {
      name: "UMAP1",
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      scale: true,
    },
    yAxis: {
      name: "UMAP2",
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      scale: true,
    },
    dataZoom: [{ type: "inside" }],
    series: generateUMAPData(),
  };
});

// Cell Type Proportion Bar Chart Option
const cellTypeProportionOption = computed(() => {
  if (
    !props.cellTypes ||
    props.cellTypes.length === 0 ||
    !props.cellTypeCounts
  ) {
    return {
      title: {
        text: "No data available",
        left: "center",
        top: "center",
        textStyle: { color: "#999", fontSize: 14 },
      },
    };
  }

  // Filter cell types based on selection
  const cellTypesToShow =
    localSelectedCellTypes.value.length === 0
      ? props.cellTypes
      : props.cellTypes.filter((ct) =>
          localSelectedCellTypes.value.includes(ct)
        );

  if (cellTypesToShow.length === 0) {
    return {
      title: {
        text: "No cell types selected",
        left: "center",
        top: "center",
        textStyle: { color: "#999", fontSize: 14 },
      },
    };
  }

  const totalSelectedCells = cellTypesToShow.reduce(
    (sum, cellType) => sum + (props.cellTypeCounts[cellType] || 0),
    0
  );

  if (totalSelectedCells === 0) {
    return {
      title: {
        text: "No data available",
        left: "center",
        top: "center",
        textStyle: { color: "#999", fontSize: 14 },
      },
    };
  }

  const data = cellTypesToShow.map((cellType) => {
    const count = props.cellTypeCounts[cellType] || 0;
    const percentage =
      totalSelectedCells > 0 ? (count / totalSelectedCells) * 100 : 0;
    return {
      value: count,
      percentage: percentage.toFixed(1),
      name: cellType,
      itemStyle: {
        color: getCellTypeColor(cellType),
      },
    };
  });

  data.sort((a, b) => b.value - a.value);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const param = params[0];
        return `${param.name}<br/>${
          param.seriesName
        }: ${param.value.toLocaleString()} cells (${param.data.percentage}%)`;
      },
    },
    grid: {
      left: "15%",
      right: "10%",
      top: "10%",
      bottom: "15%",
    },
    xAxis: {
      type: "value",
      name: "Cell Count",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        formatter: (value) => {
          if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
          return value.toString();
        },
      },
    },
    yAxis: {
      type: "category",
      data: data.map((d) => d.name),
      axisLabel: {
        interval: 0,
        fontSize: 10,
        formatter: (value) => {
          return value.length > 20 ? value.substring(0, 20) + "..." : value;
        },
      },
    },
    series: [
      {
        name: "Cell Count",
        type: "bar",
        data: data,
        label: {
          show: true,
          position: "right",
          formatter: (params) => `${params.data.percentage}%`,
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});

const downloadPlot = () => {
  if (!umapChart.value) return;

  try {
    const chartInstance =
      umapChart.value.getEchartsInstance?.() || umapChart.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = "umap_plot.png";
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download plot:", err);
    alert("Download functionality not available");
  }
};

const downloadCSV = () => {
  if (!props.umapData || !props.cellMetadata) {
    alert("No data available for download");
    return;
  }

  try {
    // Get the current metadata column (color by label)
    const metadataColumn =
      props.showMetadataSelector && props.selectedMetadataColumn
        ? props.selectedMetadataColumn
        : "cell_type";

    const metadataValues = props.cellMetadata[metadataColumn];
    if (!metadataValues) {
      alert(`Metadata column "${metadataColumn}" not found`);
      return;
    }

    // Get cell IDs
    const cellIds = props.umapData.cell_ids || [];
    const coordinates = props.umapData.coordinates || [];

    // Validate data lengths match
    if (
      coordinates.length !== metadataValues.length ||
      (cellIds.length > 0 && cellIds.length !== coordinates.length)
    ) {
      console.warn("Data length mismatch, using indices as cell names");
    }

    // Format metadata column name for CSV header
    const metadataColumnLabel = formatMetadataLabel(metadataColumn);

    // Create CSV header
    const headers = ["cell_name", "umap1", "umap2", metadataColumnLabel];

    // Create CSV rows
    const rows = coordinates.map((coord, idx) => {
      const cellName = cellIds[idx] || `cell_${idx}`;
      const umap1 = coord[0]?.toFixed(6) || "";
      const umap2 = coord[1]?.toFixed(6) || "";
      const metadataValue = metadataValues[idx] || "";

      return [cellName, umap1, umap2, metadataValue];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `umap_embedding_${metadataColumn}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

const resetView = () => {
  if (umapChart.value) {
    try {
      const chartInstance =
        umapChart.value.getEchartsInstance?.() || umapChart.value.chart;
      if (chartInstance) {
        chartInstance.dispatchAction({
          type: "dataZoom",
          start: 0,
          end: 100,
        });
        chartInstance.dispatchAction({
          type: "brush",
          areas: [],
        });
      }
    } catch (err) {
      console.warn("Could not reset chart view:", err);
    }
  }
};

// Download functions for cell type proportions
const downloadProportionPNG = () => {
  if (!proportionChartRef.value) return;

  try {
    const chartInstance =
      proportionChartRef.value.getEchartsInstance?.() ||
      proportionChartRef.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      const filename = `cell_type_proportions_${Date.now()}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download proportion plot:", err);
    alert("Download functionality not available");
  }
};

const downloadProportionCSV = () => {
  if (!hasProportionData.value) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = ["cell_type", "count", "percentage"];
    rows.push(headers.join(","));

    // Filter cell types based on selection
    const cellTypesToShow =
      localSelectedCellTypes.value.length === 0
        ? props.cellTypes
        : props.cellTypes.filter((ct) =>
            localSelectedCellTypes.value.includes(ct)
          );

    const totalSelectedCells = cellTypesToShow.reduce(
      (sum, cellType) => sum + (props.cellTypeCounts[cellType] || 0),
      0
    );

    cellTypesToShow.forEach((cellType) => {
      const count = props.cellTypeCounts[cellType] || 0;
      const percentage =
        totalSelectedCells > 0
          ? ((count / totalSelectedCells) * 100).toFixed(2)
          : "0.00";
      rows.push([cellType, count, percentage].join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `cell_type_proportions_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

// Expose methods for parent component
defineExpose({
  downloadPlot,
  downloadCSV,
  resetView,
});
</script>
