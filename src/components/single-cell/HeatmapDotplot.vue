<template>
  <div
    class="flex-1 min-h-0 overflow-hidden flex flex-col"
    :style="containerStyle"
  >
    <!-- Header with Download Buttons -->
    <div
      v-if="hasData"
      class="flex items-center justify-between mb-2 flex-shrink-0"
    >
      <h3 v-if="showTitle" class="text-sm font-semibold text-gray-700">
        {{
          plotType === "heatmap"
            ? "Gene Expression Heatmap"
            : "Gene Expression Dotplot"
        }}
      </h3>
      <span v-else></span>
      <DownloadButtons
        :disabled="!hasData"
        @download-png="downloadPNG"
        @download-csv="downloadCSV"
        png-title="Download plot as PNG image"
        csv-title="Download data as CSV"
      />
    </div>

    <!-- Chart Container -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <!-- Heatmap Chart -->
      <v-chart
        v-if="
          plotType === 'heatmap' &&
          heatmapOption &&
          Object.keys(heatmapOption).length > 0
        "
        ref="heatmapChart"
        :option="heatmapOption"
        :autoresize="true"
        style="width: 100%; height: 100%"
      />
      <!-- Dotplot Chart -->
      <v-chart
        v-else-if="
          plotType === 'dotplot' &&
          dotplotOption &&
          Object.keys(dotplotOption).length > 0
        "
        ref="dotplotChart"
        :option="dotplotOption"
        :autoresize="true"
        style="width: 100%; height: 100%"
      />
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        <div class="text-center">
          <AppIcon name="chart" size="xl" class="mx-auto mb-2" />
          <p>{{ emptyMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import VChart from "vue-echarts";
import AppIcon from "@/components/icons/AppIcon.vue";
import { heatmapColorPalettes } from "@/composables/useColorPalettes";
import DownloadButtons from "./DownloadButtons.vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  genes: {
    type: Array,
    default: () => [],
  },
  cellTypes: {
    type: Array,
    default: () => [],
  },
  plotType: {
    type: String,
    default: "heatmap", // 'heatmap' or 'dotplot'
  },
  colorPalette: {
    type: String,
    default: "diverging_blue_yellow_red",
  },
  transpose: {
    type: Boolean,
    default: false,
  },
  plotHeight: {
    type: String,
    default: "medium", // 'small', 'medium', 'large', 'xlarge'
  },
  emptyMessage: {
    type: String,
    default: "No data to display",
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
});

// Height settings based on plotHeight prop
const heightSettings = computed(() => {
  const heights = {
    small: { min: 300, max: 400 },
    medium: { min: 400, max: 550 },
    large: { min: 500, max: 700 },
    xlarge: { min: 600, max: 900 },
  };
  return heights[props.plotHeight] || heights.medium;
});

const containerStyle = computed(() => ({
  minHeight: heightSettings.value.min + "px",
  maxHeight: heightSettings.value.max + "px",
}));

const heatmapChart = ref(null);
const dotplotChart = ref(null);

const hasData = computed(() => {
  return (
    props.data?.length > 0 &&
    props.genes?.length > 0 &&
    props.cellTypes?.length > 0
  );
});

const downloadPNG = () => {
  const chartRef =
    props.plotType === "heatmap" ? heatmapChart.value : dotplotChart.value;
  if (!chartRef) return;

  try {
    const chartInstance = chartRef.getEchartsInstance?.() || chartRef.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      const filename = `${props.plotType}_${Date.now()}.png`;
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
  if (!hasData.value) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = props.transpose
      ? ["cell_type", "gene", "expression"]
      : ["gene", "cell_type", "expression"];

    // Add percentage column for dotplot
    if (props.plotType === "dotplot") {
      headers.push("percentage");
    }

    rows.push(headers.join(","));

    props.genes.forEach((gene, geneIdx) => {
      if (!props.data[geneIdx] || !Array.isArray(props.data[geneIdx])) return;

      props.cellTypes.forEach((cellType, ctIdx) => {
        const point = props.data[geneIdx][ctIdx];
        let expression, percentage;

        if (typeof point === "object" && point !== null) {
          expression = point.expression;
          percentage = point.percentage;
        } else {
          expression = point;
          percentage = props.plotType === "dotplot" ? 100 : null;
        }

        if (
          expression === null ||
          expression === undefined ||
          isNaN(expression)
        )
          return;

        const row = props.transpose
          ? [cellType, gene, expression]
          : [gene, cellType, expression];

        if (props.plotType === "dotplot" && percentage !== null) {
          row.push(percentage);
        }

        rows.push(row.join(","));
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `${props.plotType}_data_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

// Heatmap Option
const heatmapOption = computed(() => {
  if (!props.data?.length || !props.genes?.length || !props.cellTypes?.length) {
    return {};
  }

  const xAxisLabels = props.transpose ? props.genes : props.cellTypes;
  const yAxisLabels = props.transpose ? props.cellTypes : props.genes;

  // Prepare heatmap data: [xIndex, yIndex, value]
  const heatmapDataArray = [];
  props.genes.forEach((gene, geneIdx) => {
    if (!props.data[geneIdx] || !Array.isArray(props.data[geneIdx])) return;

    props.cellTypes.forEach((cellType, ctIdx) => {
      const value = props.data[geneIdx][ctIdx];
      if (value === null || value === undefined || isNaN(value)) return;

      if (props.transpose) {
        heatmapDataArray.push([geneIdx, ctIdx, Number(value)]);
      } else {
        heatmapDataArray.push([ctIdx, geneIdx, Number(value)]);
      }
    });
  });

  if (heatmapDataArray.length === 0) return {};

  // Find min/max for color scale
  const allValues = props.data.flat().filter((v) => v != null && !isNaN(v));
  if (allValues.length === 0) return {};

  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const colorPalette =
    heatmapColorPalettes[props.colorPalette] || heatmapColorPalettes.reds;

  return {
    tooltip: {
      position: "top",
      formatter: (params) => {
        const xIdx = params.value[0];
        const yIdx = params.value[1];
        const value = params.value[2];
        const xLabel = xAxisLabels[xIdx];
        const yLabel = yAxisLabels[yIdx];
        return `${yLabel}<br/>${xLabel}<br/>Expression: ${value.toFixed(3)}`;
      },
    },
    grid: {
      height: "75%",
      top: "5%",
      left: props.transpose ? "20%" : "15%",
      right: "10%",
    },
    xAxis: {
      type: "category",
      data: xAxisLabels,
      splitArea: { show: true },
      axisLabel: {
        rotate: props.transpose ? 0 : 45,
        interval: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "category",
      data: yAxisLabels,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    visualMap: {
      min: minVal,
      max: maxVal > minVal ? maxVal : minVal + 0.1,
      calculable: true,
      orient: "vertical",
      left: "right",
      top: "center",
      inRange: { color: colorPalette },
      outOfRange: { color: colorPalette[0] || "#ffffff" },
    },
    series: [
      {
        name: "Expression",
        type: "heatmap",
        data: heatmapDataArray,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});

// Dotplot Option
const dotplotOption = computed(() => {
  if (!props.data?.length || !props.genes?.length || !props.cellTypes?.length) {
    return {};
  }

  const xAxisLabels = props.transpose ? props.genes : props.cellTypes;
  const yAxisLabels = props.transpose ? props.cellTypes : props.genes;

  const dotplotDataArray = [];
  const allExpressions = [];
  const allPercentages = [];

  props.genes.forEach((gene, geneIdx) => {
    if (!props.data[geneIdx] || !Array.isArray(props.data[geneIdx])) return;

    props.cellTypes.forEach((cellType, ctIdx) => {
      const point = props.data[geneIdx][ctIdx];

      let expression, percentage;
      if (typeof point === "object" && point !== null) {
        expression = point.expression;
        percentage = point.percentage;
      } else {
        expression = point;
        percentage = 100;
      }

      if (expression === null || expression === undefined || isNaN(expression))
        return;

      const xIdx = xAxisLabels.indexOf(props.transpose ? gene : cellType);
      const yIdx = yAxisLabels.indexOf(props.transpose ? cellType : gene);

      if (xIdx >= 0 && yIdx >= 0) {
        const dataPoint = [xIdx, yIdx, Number(expression), Number(percentage)];
        dataPoint.gene = gene;
        dataPoint.cellType = cellType;
        dotplotDataArray.push(dataPoint);
        allExpressions.push(Number(expression));
        allPercentages.push(Number(percentage));
      }
    });
  });

  if (dotplotDataArray.length === 0) return {};

  const minExpr = Math.min(...allExpressions);
  const maxExpr = Math.max(...allExpressions);
  const minPct = Math.min(...allPercentages);
  const maxPct = Math.max(...allPercentages);

  const colorPalette =
    heatmapColorPalettes[props.colorPalette] || heatmapColorPalettes.reds;

  return {
    tooltip: {
      formatter: (params) => {
        const dataPoint = params.data;
        const [x, y, expr, pct] = dataPoint;
        const gene = dataPoint.gene || yAxisLabels[y];
        const cellType = dataPoint.cellType || xAxisLabels[x];
        return `${gene}<br/>${cellType}<br/>Expression: ${expr.toFixed(
          3
        )}<br/>Percentage: ${pct.toFixed(1)}%`;
      },
    },
    grid: {
      height: "78%",
      top: "5%",
      left: props.transpose ? "18%" : "12%",
      right: "18%",
      bottom: "15%",
    },
    xAxis: {
      type: "category",
      data: xAxisLabels,
      splitLine: {
        show: true,
        lineStyle: { type: "dashed", opacity: 0.3 },
      },
      axisLabel: {
        rotate: props.transpose ? 0 : 45,
        interval: 0,
        fontSize: 9,
        margin: 8,
      },
    },
    yAxis: {
      type: "category",
      data: yAxisLabels,
      splitLine: {
        show: true,
        lineStyle: { type: "dashed", opacity: 0.3 },
      },
      axisLabel: {
        fontSize: 11,
        margin: 6,
      },
    },
    visualMap: [
      {
        type: "continuous",
        min: minExpr,
        max: maxExpr,
        dimension: 2,
        calculable: true,
        orient: "vertical",
        left: "right",
        top: "center",
        inRange: { color: colorPalette },
        text: ["High", "Low"],
        textStyle: { fontSize: 11 },
      },
      {
        type: "continuous",
        min: minPct,
        max: maxPct,
        dimension: 3,
        calculable: true,
        orient: "vertical",
        left: "right",
        top: "60%",
        inRange: { symbolSize: [8, 25] },
        text: ["Large", "Small"],
        textStyle: { fontSize: 11 },
      },
    ],
    series: [
      {
        name: "Expression",
        type: "scatter",
        data: dotplotDataArray,
        symbolSize: (dataPoint) => {
          const percentage = dataPoint[3];
          if (percentage === undefined || isNaN(percentage)) return 8;
          const minSize = 8;
          const maxSize = 25;
          const sizeRange = maxSize - minSize;
          const normalizedPct =
            maxPct > minPct ? (percentage - minPct) / (maxPct - minPct) : 0.5;
          return minSize + normalizedPct * sizeRange;
        },
        itemStyle: { opacity: 0.85 },
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(0, 0, 0, 0.4)",
            borderWidth: 1.5,
            borderColor: "#333",
          },
          scale: true,
        },
      },
    ],
  };
});
</script>
