<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <!-- Header with Download Buttons -->
    <div
      v-if="chartData && chartData.length > 0 && showDownloadButtons"
      class="flex items-center justify-end mb-2 flex-shrink-0"
    >
      <DownloadButtons
        :disabled="!chartData || chartData.length === 0"
        @download-png="downloadPNG"
        @download-csv="downloadCSV"
        png-title="Download plot as PNG image"
        csv-title="Download data as CSV"
      />
    </div>

    <!-- Chart Container -->
    <div class="flex-1 min-h-0">
      <div
        v-if="chartData && chartData.length > 0"
        class="w-full h-full"
        style="aspect-ratio: 1 / 1"
      >
        <v-chart
          ref="chartRef"
          :option="chartOption"
          :autoresize="true"
          class="w-full h-full"
        />
      </div>
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        <div class="text-center">
          <AppIcon name="dna" size="xl" class="mx-auto mb-2" />
          <p>{{ emptyMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import VChart from "vue-echarts";
import AppIcon from "@/components/icons/AppIcon.vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  VisualMapComponent,
} from "echarts/components";
import { geneExpressionPalettes } from "@/composables/useColorPalettes";
import DownloadButtons from "./DownloadButtons.vue";

// Register ECharts components
use([
  CanvasRenderer,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  VisualMapComponent,
]);

const props = defineProps({
  coordinates: {
    type: Array,
    default: () => [],
  },
  expression: {
    type: Array,
    default: () => [],
  },
  cellTypes: {
    type: Array,
    default: () => [],
  },
  selectedCellTypes: {
    type: Array,
    default: () => [],
  },
  filteredCellIndices: {
    type: Array,
    default: null, // null means use all cells (or selectedCellTypes filter)
  },
  geneName: {
    type: String,
    default: "",
  },
  colorPalette: {
    type: String,
    default: "reds",
  },
  pointSize: {
    type: Number,
    default: 3,
  },
  useLog: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "",
  },
  emptyMessage: {
    type: String,
    default: "Select a gene to visualize expression",
  },
  xAxisName: {
    type: String,
    default: "UMAP1",
  },
  yAxisName: {
    type: String,
    default: "UMAP2",
  },
  showDownloadButtons: {
    type: Boolean,
    default: true,
  },
});

const chartRef = ref(null);

// Prepare chart data with optional cell type filtering and log transformation
const chartData = computed(() => {
  if (!props.coordinates?.length || !props.expression?.length) {
    return [];
  }

  const scatterData = [];
  
  // Use advanced filter if provided, otherwise fall back to cell type filter
  const hasAdvancedFilter = props.filteredCellIndices && props.filteredCellIndices.length > 0;
  const filterIndicesSet = hasAdvancedFilter ? new Set(props.filteredCellIndices) : null;

  props.coordinates.forEach((coord, idx) => {
    // Advanced filter takes precedence
    if (hasAdvancedFilter) {
      if (!filterIndicesSet.has(idx)) {
        return;
      }
    } else if (props.cellTypes.length > 0 && props.selectedCellTypes.length > 0) {
      // Fall back to cell type filter
      const cellType = props.cellTypes[idx];
      if (!props.selectedCellTypes.includes(cellType)) {
        return;
      }
    }

    const expr = props.expression[idx] || 0;
    const transformedExpr = props.useLog && expr > 0 ? Math.log1p(expr) : expr;
    scatterData.push([...coord, transformedExpr]);
  });

  return scatterData;
});

// Calculate min/max for color scale (loop-based to avoid stack overflow with large arrays)
const valueRange = computed(() => {
  if (!chartData.value.length) return { min: 0, max: 1 };

  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < chartData.value.length; i++) {
    const val = chartData.value[i][2];
    if (val < min) min = val;
    if (val > max) max = val;
  }

  return {
    min: min === Infinity ? 0 : min,
    max: max > min ? max : min + 0.1,
  };
});

// Chart option
const chartOption = computed(() => {
  const displayTitle =
    props.title ||
    (props.geneName
      ? `${props.geneName} Expression${props.useLog ? " (log scale)" : ""}`
      : "Expression");

  return {
    title: {
      text: displayTitle,
      left: "center",
      textStyle: { fontSize: 14, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (!params.value || !Array.isArray(params.value)) {
          return "";
        }
        const x = params.value[0];
        const y = params.value[1];
        const expr = params.value[2] ?? 0;
        const origExpr = props.useLog ? Math.expm1(expr) : expr;
        let tooltip = `${props.xAxisName}: ${x?.toFixed?.(2) ?? x}<br/>${
          props.yAxisName
        }: ${y?.toFixed?.(2) ?? y}`;
        if (props.useLog) {
          tooltip += `<br/>log(Expr+1): ${
            expr?.toFixed?.(3) ?? expr
          }<br/>Expression: ${origExpr?.toFixed?.(3) ?? origExpr}`;
        } else {
          tooltip += `<br/>Expression: ${expr?.toFixed?.(3) ?? expr}`;
        }
        return tooltip;
      },
    },
    visualMap: {
      type: "continuous",
      show: true,
      min: valueRange.value.min,
      max: valueRange.value.max,
      dimension: 2,
      inRange: {
        color:
          geneExpressionPalettes[props.colorPalette] ||
          geneExpressionPalettes.reds,
      },
      outOfRange: {
        color: (geneExpressionPalettes[props.colorPalette] ||
          geneExpressionPalettes.reds)[0],
      },
      text: ["High", "Low"],
      calculable: true,
      right: 10,
      top: "center",
      textStyle: { fontSize: 10 },
      orient: "vertical",
      itemWidth: 20,
      itemHeight: 140,
      seriesIndex: 0,
    },
    grid: {
      left: 60,
      right: 100,
      top: 60,
      bottom: 60,
    },
    xAxis: {
      name: props.xAxisName,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      scale: true,
    },
    yAxis: {
      name: props.yAxisName,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      scale: true,
    },
    dataZoom: [{ type: "inside" }],
    series: [
      {
        type: "scatter",
        data: chartData.value,
        symbolSize: props.pointSize,
        // Note: Don't use large: true with visualMap - it breaks color mapping
        progressive: 20000,
        progressiveThreshold: 50000,
        emphasis: {
          disabled: chartData.value.length > 50000,
          itemStyle: { opacity: 1 },
        },
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
      // Use simpler filename for module scores (gene lists with commas)
      const baseName =
        props.geneName && props.geneName.includes(",")
          ? "module_score"
          : props.geneName || "expression";
      const filename = `${baseName}_${props.xAxisName}_${
        props.yAxisName
      }_${Date.now()}.png`;
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
  if (!props.coordinates?.length || !props.expression?.length) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = [
      "cell_index",
      props.xAxisName,
      props.yAxisName,
      "expression",
    ];
    if (props.cellTypes?.length > 0) {
      headers.push("cell_type");
    }
    rows.push(headers.join(","));

    props.coordinates.forEach((coord, idx) => {
      const expr = props.expression[idx] || 0;
      const row = [idx, coord[0], coord[1], expr];
      if (props.cellTypes?.length > idx) {
        row.push(props.cellTypes[idx] || "");
      }
      rows.push(row.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    // Use simpler filename for module scores (gene lists with commas)
    const baseName =
      props.geneName && props.geneName.includes(",")
        ? "module_score"
        : props.geneName || "expression";
    const filename = `${baseName}_data_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

// Expose chart ref for parent access
defineExpose({
  getChart: () => chartRef.value,
  downloadPNG,
  downloadCSV,
});
</script>
