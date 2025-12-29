<template>
  <div class="h-full flex gap-4">
    <!-- Settings Column -->
    <div
      class="w-72 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
    >
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AppIcon name="chart" size="md" /> Composition
      </h3>

      <!-- X-axis metadata selector -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cell information to plot (X-axis)
        </label>
        <select
          v-model="xAxisColumn"
          :disabled="loading"
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
      </div>

      <!-- Grouping/color metadata selector -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cell information to group / colour by
        </label>
        <select
          v-model="groupByColumn"
          :disabled="loading"
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
      </div>

      <!-- Plot value selector -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Plot value
        </label>
        <div class="flex gap-2">
          <button
            @click="plotValue = 'proportion'"
            :class="[
              'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              plotValue === 'proportion'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
          >
            Proportion
          </button>
          <button
            @click="plotValue = 'cellNumbers'"
            :class="[
              'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              plotValue === 'cellNumbers'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
          >
            Cell Numbers
          </button>
        </div>
      </div>

      <!-- Flip X/Y toggle -->
      <div class="mb-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="flipXY"
            class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span class="text-sm text-gray-700">Flip X/Y</span>
        </label>
      </div>

      <!-- Color Palette Selector -->
      <ColorPaletteSelector
        v-model="colorPalette"
        type="cellType"
        label="Color Palette"
      />

      <!-- Generate button -->
      <div class="mt-4">
        <button
          @click="generatePlot"
          :disabled="loading || !xAxisColumn || !groupByColumn"
          class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ loading ? "Generating..." : "Generate Plot" }}
        </button>
      </div>

      <!-- Info -->
      <div class="mt-4 bg-blue-50 rounded-lg p-3">
        <p class="text-xs text-gray-700">
          Visualise the composition of single cells based on one discrete cell
          information across another discrete cell information.
        </p>
        <p class="text-xs text-gray-600 mt-1">
          <strong>Examples:</strong> library or cell cycle composition across
          clusters.
        </p>
      </div>
    </div>

    <!-- Visualization Area -->
    <div
      class="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
    >
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 class="text-sm font-semibold text-gray-700">
          {{ plotTitle }}
        </h3>
        <DownloadButtons
          :disabled="!hasData"
          @download-png="downloadPlot"
          @download-csv="downloadCSV"
          png-title="Download composition plot as PNG image"
          csv-title="Download composition data as CSV"
        />
      </div>

      <div class="flex-1 min-h-0">
        <div v-if="loading" class="h-full flex items-center justify-center">
          <div class="text-center">
            <div
              class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
            ></div>
            <p class="mt-4 text-gray-600">Generating composition plot...</p>
          </div>
        </div>
        <div
          v-else-if="error"
          class="h-full flex items-center justify-center text-red-600"
        >
          <div class="text-center">
            <AppIcon name="warning" size="xl" class="mx-auto mb-2" />
            <p>{{ error }}</p>
          </div>
        </div>
        <div v-else-if="hasData" class="w-full h-full">
          <v-chart
            ref="compositionChart"
            :option="chartOption"
            :autoresize="true"
            class="w-full h-full"
          />
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center text-gray-400"
        >
          <div class="text-center">
            <AppIcon name="chart" size="xl" class="mx-auto mb-2" />
            <p>Select metadata columns and click "Generate Plot"</p>
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
import { cellTypeColorPalettes } from "@/composables/useColorPalettes";
import DownloadButtons from "./DownloadButtons.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

const props = defineProps({
  availableMetadataColumns: {
    type: Array,
    default: () => [],
  },
  cellMetadata: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  filteredCellIndices: {
    type: Array,
    default: null, // null means use all cells
  },
});

const emit = defineEmits(["fetchMetadata"]);

// Local state
const xAxisColumn = ref("");
const groupByColumn = ref("");
const plotValue = ref("proportion");
const flipXY = ref(false);
const colorPalette = ref("default");
const compositionData = ref(null);
const error = ref(null);
const compositionChart = ref(null);

// Format metadata label for display
const formatMetadataLabel = (key) => {
  if (!key) return "";
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Set default values when metadata columns are available
watch(
  () => props.availableMetadataColumns,
  (columns) => {
    if (columns && columns.length > 0) {
      if (!xAxisColumn.value) {
        xAxisColumn.value = columns.includes("cell_type")
          ? "cell_type"
          : columns[0];
      }
      if (!groupByColumn.value) {
        // Try to find a different column for groupBy
        const differentColumn = columns.find((c) => c !== xAxisColumn.value);
        groupByColumn.value = differentColumn || columns[0];
      }
    }
  },
  { immediate: true }
);

const hasData = computed(() => {
  return compositionData.value && Object.keys(compositionData.value).length > 0;
});

const plotTitle = computed(() => {
  if (!xAxisColumn.value || !groupByColumn.value) {
    return "Composition Analysis";
  }
  const xLabel = formatMetadataLabel(xAxisColumn.value);
  const groupLabel = formatMetadataLabel(groupByColumn.value);
  const valueLabel = plotValue.value === "proportion" ? "Proportion" : "Count";
  const cellCountInfo = compositionData.value?.cellCount 
    ? ` (${compositionData.value.cellCount.toLocaleString()} cells)`
    : '';
  return `${valueLabel} of ${groupLabel} across ${xLabel}${cellCountInfo}`;
});

// Track if we're waiting for metadata to be fetched
const pendingGenerate = ref(false);

// Generate the composition data from metadata
const generatePlot = async () => {
  if (!xAxisColumn.value || !groupByColumn.value) {
    error.value = "Please select both X-axis and Group by columns";
    return;
  }

  error.value = null;

  // Get metadata arrays
  const xData = props.cellMetadata?.[xAxisColumn.value];
  const groupData = props.cellMetadata?.[groupByColumn.value];

  if (!xData || !groupData) {
    // Need to fetch the metadata - mark as pending and emit request
    pendingGenerate.value = true;
    emit("fetchMetadata", [xAxisColumn.value, groupByColumn.value]);
    return;
  }

  pendingGenerate.value = false;

  try {
    // Calculate composition
    const composition = {};
    const xCategories = new Set();
    const groupCategories = new Set();

    // Use filtered indices if provided, otherwise iterate all cells
    const indicesToUse = props.filteredCellIndices || Array.from({ length: xData.length }, (_, i) => i);

    for (const i of indicesToUse) {
      const x = xData[i];
      const g = groupData[i];

      if (x == null || g == null) continue;

      xCategories.add(x);
      groupCategories.add(g);

      if (!composition[x]) {
        composition[x] = {};
      }
      if (!composition[x][g]) {
        composition[x][g] = 0;
      }
      composition[x][g]++;
    }

    compositionData.value = {
      composition,
      xCategories: Array.from(xCategories).sort(),
      groupCategories: Array.from(groupCategories).sort(),
      cellCount: indicesToUse.length,
    };
  } catch (err) {
    console.error("Error generating composition:", err);
    error.value = err.message || "Failed to generate composition";
  }
};

// Watch for cellMetadata changes - if we were waiting for data, retry
watch(
  () => props.cellMetadata,
  () => {
    if (pendingGenerate.value) {
      generatePlot();
    }
  },
  { deep: true }
);

// Chart option
const chartOption = computed(() => {
  if (!compositionData.value) return {};

  const { composition, xCategories, groupCategories } = compositionData.value;
  const paletteColors =
    cellTypeColorPalettes[colorPalette.value] || cellTypeColorPalettes.default;

  // Determine which axis is which based on flipXY
  const categories = flipXY.value ? groupCategories : xCategories;
  const seriesGroups = flipXY.value ? xCategories : groupCategories;

  // Build series data
  const series = seriesGroups.map((group, idx) => {
    const data = categories.map((cat) => {
      let value;
      if (flipXY.value) {
        value = composition[group]?.[cat] || 0;
      } else {
        value = composition[cat]?.[group] || 0;
      }

      if (plotValue.value === "proportion") {
        // Calculate proportion within each category
        let total = 0;
        if (flipXY.value) {
          // Sum all x values for this group category
          Object.keys(composition).forEach((x) => {
            total += composition[x]?.[cat] || 0;
          });
        } else {
          // Sum all group values for this x category
          Object.keys(composition[cat] || {}).forEach((g) => {
            total += composition[cat][g] || 0;
          });
        }
        value = total > 0 ? (value / total) * 100 : 0;
      }

      return value;
    });

    return {
      name: group,
      type: "bar",
      stack: "total",
      emphasis: {
        focus: "series",
      },
      data: data,
      itemStyle: {
        color: paletteColors[idx % paletteColors.length],
      },
    };
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((param) => {
          const value =
            plotValue.value === "proportion"
              ? `${param.value.toFixed(1)}%`
              : param.value.toLocaleString();
          result += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>${param.seriesName}: ${value}<br/>`;
        });
        return result;
      },
    },
    legend: {
      type: "scroll",
      bottom: 10,
      data: seriesGroups,
    },
    grid: {
      left: "10%",
      right: "10%",
      top: "10%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        rotate: categories.length > 10 ? 45 : 0,
        interval: 0,
        fontSize: 10,
        formatter: (value) => {
          return value.length > 15 ? value.substring(0, 15) + "..." : value;
        },
      },
    },
    yAxis: {
      type: "value",
      name: plotValue.value === "proportion" ? "Proportion (%)" : "Cell Count",
      nameLocation: "middle",
      nameGap: 50,
      max: plotValue.value === "proportion" ? 100 : undefined,
      axisLabel: {
        formatter: (value) => {
          if (plotValue.value === "proportion") {
            return `${value}%`;
          }
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
          }
          return value.toString();
        },
      },
    },
    series: series,
  };
});

// Download plot
const downloadPlot = () => {
  if (!compositionChart.value) return;

  try {
    const chartInstance =
      compositionChart.value.getEchartsInstance?.() ||
      compositionChart.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `composition_${xAxisColumn.value}_by_${groupByColumn.value}.png`;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download plot:", err);
    alert("Download functionality not available");
  }
};

// Helper function to properly escape CSV values
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const downloadCSV = () => {
  if (!compositionData.value || !hasData.value) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const xLabel = formatMetadataLabel(xAxisColumn.value);
    const groupLabel = formatMetadataLabel(groupByColumn.value);
    const valueLabel =
      plotValue.value === "proportion" ? "Proportion" : "Count";
    const headers = [
      escapeCSVValue(xLabel),
      escapeCSVValue(groupLabel),
      escapeCSVValue(valueLabel),
    ];
    rows.push(headers.join(","));

    const { composition, xCategories, groupCategories } = compositionData.value;

    // Calculate totals for proportion calculation
    const totals = {};
    if (plotValue.value === "proportion") {
      xCategories.forEach((x) => {
        totals[x] = groupCategories.reduce(
          (sum, g) => sum + (composition[x]?.[g] || 0),
          0
        );
      });
    }

    xCategories.forEach((x) => {
      groupCategories.forEach((g) => {
        const count = composition[x]?.[g] || 0;
        const value =
          plotValue.value === "proportion"
            ? totals[x] > 0
              ? (count / totals[x]).toFixed(4)
              : "0"
            : count;
        rows.push(
          [escapeCSVValue(x), escapeCSVValue(g), escapeCSVValue(value)].join(
            ","
          )
        );
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `composition_${xAxisColumn.value}_by_${
      groupByColumn.value
    }_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

// Expose for parent
defineExpose({
  generatePlot,
  downloadPlot,
});
</script>
