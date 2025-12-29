<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <!-- Header with Download Buttons -->
    <div
      v-if="
        boxData &&
        boxData.data &&
        boxData.data.length > 0 &&
        showDownloadButtons
      "
      class="flex items-center justify-end mb-2 flex-shrink-0"
    >
      <DownloadButtons
        :disabled="!boxData || !boxData.data || boxData.data.length === 0"
        @download-png="downloadPNG"
        @download-csv="downloadCSV"
        png-title="Download boxplot as PNG image"
        csv-title="Download boxplot data as CSV"
      />
    </div>

    <!-- Chart Container -->
    <div class="flex-1 min-h-0">
      <v-chart
        v-if="boxData && boxData.data && boxData.data.length > 0"
        ref="chartRef"
        :option="chartOption"
        :autoresize="true"
        class="w-full h-full"
      />
      <div
        v-else
        class="h-full min-h-[160px] flex items-center justify-center text-gray-400"
      >
        <div class="text-center">
          <AppIcon name="chart" size="xl" class="mx-auto mb-2" />
          <p>{{ emptyMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BoxplotChart } from "echarts/charts";
import {
  TooltipComponent,
  TitleComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import {
  cellTypeColorPalettes,
  humanAtlasCellTypeColors,
} from "@/composables/useColorPalettes";
import DownloadButtons from "./DownloadButtons.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

// Register required ECharts pieces locally for boxplot + title/tooltip support.
use([
  CanvasRenderer,
  BoxplotChart,
  TooltipComponent,
  TitleComponent,
  GridComponent,
]);

const props = defineProps({
  values: {
    type: Array,
    default: () => [],
  },
  cellTypes: {
    type: Array,
    default: () => [],
  },
  cellTypeMetadata: {
    type: Array,
    default: () => [],
  },
  selectedCellTypes: {
    type: Array,
    default: () => [],
  },
  allCellTypes: {
    type: Array,
    default: () => [],
  },
  filteredCellIndices: {
    type: Array,
    default: null, // null means use all cells (or selectedCellTypes filter)
  },
  colorPalette: {
    type: String,
    default: "default",
  },
  title: {
    type: String,
    default: "Expression by Cell Type",
  },
  yAxisLabel: {
    type: String,
    default: "log(1 + Expression)",
  },
  useLog: {
    type: Boolean,
    default: true,
  },
  showMedianLabel: {
    type: Boolean,
    default: true,
  },
  emptyMessage: {
    type: String,
    default: "No data to display",
  },
  showDownloadButtons: {
    type: Boolean,
    default: true,
  },
});

const chartRef = ref(null);

// Compute box plot data
const boxData = computed(() => {
  if (!props.values?.length || !props.cellTypeMetadata?.length) {
    return [];
  }

  const paletteColors =
    cellTypeColorPalettes[props.colorPalette] || cellTypeColorPalettes.default;

  // Determine which indices to use - advanced filter takes precedence
  const hasAdvancedFilter = props.filteredCellIndices && props.filteredCellIndices.length > 0;
  const indicesToUse = hasAdvancedFilter 
    ? new Set(props.filteredCellIndices)
    : null;

  // Determine which cell types to show based on filters
  let cellTypesToShow;
  if (hasAdvancedFilter) {
    // Get unique cell types from filtered indices
    const filteredCellTypes = new Set();
    props.filteredCellIndices.forEach(idx => {
      const ct = props.cellTypeMetadata[idx];
      if (ct) filteredCellTypes.add(ct);
    });
    cellTypesToShow = props.cellTypes.filter(ct => filteredCellTypes.has(ct));
  } else if (props.selectedCellTypes.length > 0) {
    cellTypesToShow = props.cellTypes.filter((ct) => props.selectedCellTypes.includes(ct));
  } else {
    cellTypesToShow = props.cellTypes;
  }

  const data = [];
  const categories = [];
  const colors = [];

  cellTypesToShow.forEach((cellType) => {
    const expressionVals = [];

    props.cellTypeMetadata.forEach((ct, idx) => {
      // Skip if not in filtered indices (when advanced filter is active)
      if (indicesToUse && !indicesToUse.has(idx)) {
        return;
      }
      
      if (ct === cellType) {
        const raw = props.values[idx];
        if (raw === null || raw === undefined || Number.isNaN(raw)) {
          return;
        }
        const val = props.useLog && raw > 0 ? Math.log1p(raw) : raw;
        expressionVals.push(val);
      }
    });

    if (expressionVals.length > 0) {
      expressionVals.sort((a, b) => a - b);

      const q1 = expressionVals[Math.floor(expressionVals.length * 0.25)];
      const median = expressionVals[Math.floor(expressionVals.length * 0.5)];
      const q3 = expressionVals[Math.floor(expressionVals.length * 0.75)];
      const min = expressionVals[0];
      const max = expressionVals[expressionVals.length - 1];

      data.push([min, q1, median, q3, max]);
      categories.push(cellType);

      // First check if it's a known human atlas cell type
      if (humanAtlasCellTypeColors[cellType]) {
        colors.push(humanAtlasCellTypeColors[cellType]);
      } else {
        // Use original index in allCellTypes for color consistency
        const originalIdx = props.allCellTypes.indexOf(cellType);
        colors.push(
          paletteColors[
            (originalIdx >= 0 ? originalIdx : categories.length - 1) %
              paletteColors.length
          ]
        );
      }
    }
  });

  return { data, categories, colors };
});

const chartOption = computed(() => {
  if (!boxData.value.data?.length) {
    return {};
  }

  const { data, categories, colors } = boxData.value;

  return {
    title: {
      text: props.title,
      left: "center",
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.componentSubType === "boxplot") {
          const [min, q1, median, q3, max] = params.value;
          return `${params.name}<br/>
            Max: ${max.toFixed(3)}<br/>
            Q3: ${q3.toFixed(3)}<br/>
            Median: ${median.toFixed(3)}<br/>
            Q1: ${q1.toFixed(3)}<br/>
            Min: ${min.toFixed(3)}`;
        }
        return params.value;
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 60,
      bottom: 100,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      name: props.yAxisLabel,
      nameLocation: "middle",
      nameGap: 50,
    },
    series: [
      {
        name: "boxplot",
        type: "boxplot",
        data: data.map((box, idx) => ({
          value: box,
          itemStyle: {
            color: colors[idx],
            borderColor: colors[idx],
            borderWidth: 2,
          },
        })),
        boxWidth: ["40%", "60%"],
        itemStyle: {
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
          },
        },
        ...(props.showMedianLabel && {
          markLine: {
            silent: true,
            lineStyle: {
              color: "#000",
              width: 2,
              type: "solid",
            },
            label: {
              show: true,
              position: "insideEndTop",
              formatter: (params) => params.value.toFixed(3),
              fontSize: 10,
              color: "#000",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: [2, 4],
              borderRadius: 2,
            },
            data: categories.map((cat, idx) => ({
              name: cat,
              xAxis: idx,
              yAxis: data[idx][2], // median value
            })),
          },
        }),
      },
    ],
  };
});

const downloadPNG = () => {
  if (!chartRef.value) return;

  try {
    const chartInstance =
      chartRef.value.getEchartsInstance?.() || chartRef.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      // Simplify filename for module scores (remove gene list in parentheses)
      let titleForFilename = props.title;
      // Remove content in parentheses if it contains commas (gene list)
      titleForFilename = titleForFilename.replace(/\([^)]*,[^)]*\)/g, "");
      // Clean up: trim, replace spaces with underscores, remove multiple underscores
      titleForFilename = titleForFilename
        .trim()
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
      const filename = `boxplot_${titleForFilename}_${Date.now()}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download plot:", err);
    alert("Download functionality not available");
  }
};

const downloadCSV = () => {
  if (
    !boxData.value ||
    !boxData.value.data ||
    boxData.value.data.length === 0
  ) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = ["cell_type", "min", "q1", "median", "q3", "max", "mean"];
    rows.push(headers.join(","));

    boxData.value.categories.forEach((cat, idx) => {
      const dataPoint = boxData.value.data[idx];
      if (dataPoint && Array.isArray(dataPoint) && dataPoint.length >= 5) {
        // Boxplot data: [min, q1, median, q3, max]
        const mean = props.values
          ? props.values
              .filter((_, i) => props.cellTypes?.[i] === cat)
              .reduce((a, b) => a + b, 0) /
            (props.values.filter((_, i) => props.cellTypes?.[i] === cat)
              .length || 1)
          : "";
        const row = [
          cat,
          dataPoint[0],
          dataPoint[1],
          dataPoint[2],
          dataPoint[3],
          dataPoint[4],
          mean ? mean.toFixed(4) : "",
        ];
        rows.push(row.join(","));
      }
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    // Simplify filename for module scores (remove gene list in parentheses)
    let titleForFilename = props.title;
    // Remove content in parentheses if it contains commas (gene list)
    titleForFilename = titleForFilename.replace(/\([^)]*,[^)]*\)/g, "");
    // Clean up: trim, replace spaces with underscores, remove multiple underscores
    titleForFilename = titleForFilename
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    const filename = `boxplot_${titleForFilename}_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

defineExpose({
  getChart: () => chartRef.value,
  downloadPNG,
  downloadCSV,
});
</script>
