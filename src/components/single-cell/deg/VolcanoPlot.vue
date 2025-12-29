<template>
  <div
    class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
    style="height: 450px"
  >
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <h3 class="font-semibold text-gray-900">Volcano Plot</h3>
      <button
        v-if="degResults"
        :disabled="!degResults"
        @click="downloadPNG"
        class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download volcano plot as PNG image to local file"
      >
        📥 PNG
      </button>
    </div>
    <div class="flex-1 min-h-0">
      <v-chart
        v-if="degResults"
        ref="chartRef"
        :option="volcanoOption"
        :autoresize="true"
        class="w-full h-full"
      />
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        Run DEG analysis to see results
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import VChart from "vue-echarts";

const props = defineProps({
  degResults: {
    type: Object,
    default: null,
  },
  degParams: {
    type: Object,
    required: true,
  },
});

const volcanoOption = computed(() => {
  if (!props.degResults?.genes) return {};
  const upregulated = [];
  const downregulated = [];
  const notSig = [];

  props.degResults.genes.forEach((gene) => {
    const x = gene.logFC;
    const adjPval = gene.adjPvalue || gene.pvalue;
    const y = adjPval > 0 ? -Math.log10(adjPval) : 0;
    const point = [x, y, gene.gene];

    if (
      Math.abs(x) >= props.degParams.minLogFC &&
      adjPval <= props.degParams.maxPvalue
    ) {
      if (x > 0) upregulated.push(point);
      else downregulated.push(point);
    } else {
      notSig.push(point);
    }
  });

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.value[2]}<br/>Log2FC: ${params.value[0].toFixed(
          2
        )}<br/>-log10(p): ${params.value[1].toFixed(2)}`,
    },
    legend: { data: ["Up", "Down", "NS"], bottom: 0 },
    grid: { left: 50, right: 20, top: 20, bottom: 60 },
    xAxis: { name: "Log2FC", nameLocation: "middle", nameGap: 30 },
    yAxis: { name: "-log10(p)", nameLocation: "middle", nameGap: 35 },
    series: [
      {
        name: "Up",
        type: "scatter",
        data: upregulated,
        symbolSize: 5,
        itemStyle: { color: "#e74c3c" },
      },
      {
        name: "Down",
        type: "scatter",
        data: downregulated,
        symbolSize: 5,
        itemStyle: { color: "#3498db" },
      },
      {
        name: "NS",
        type: "scatter",
        data: notSig,
        symbolSize: 3,
        itemStyle: { color: "#95a5a6", opacity: 0.5 },
      },
    ],
  };
});

const chartRef = ref(null);

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
      const filename = `volcano_plot_${Date.now()}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download plot:", err);
    alert("Download functionality not available");
  }
};
</script>
