<template>
  <div class="flex flex-col gap-4">
    <!-- Pathway Table -->
    <div
      class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
      style="height: 450px"
    >
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h3 class="font-semibold text-gray-900">
            Pathway Table
            <span
              v-if="pathwayResults"
              class="text-sm font-normal text-gray-600"
            >
              ({{ significantPathwayCount }} significant)
            </span>
          </h3>
          <p v-if="pathwayEnrichmentInfo" class="text-xs text-gray-500 mt-1">
            {{ pathwayEnrichmentInfo.genesUsed }} genes |
            {{ pathwayEnrichmentInfo.direction }} |
            {{ pathwayEnrichmentInfo.database }}
          </p>
        </div>
        <button
          v-if="pathwayResults && pathwayResults.length > 0"
          :disabled="!pathwayResults || pathwayResults.length === 0"
          @click="downloadPathwayTableCSV"
          class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download pathway table to local CSV file"
        >
          📥 CSV
        </button>
      </div>
      <div class="flex-1 overflow-auto">
        <table v-if="pathwayResults" class="w-full text-xs">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-2 py-2 text-left font-semibold text-gray-700">
                Direction
              </th>
              <th class="px-2 py-2 text-left font-semibold text-gray-700">
                Pathway
              </th>
              <th class="px-2 py-2 text-left font-semibold text-gray-700">
                FDR
              </th>
              <th class="px-2 py-2 text-left font-semibold text-gray-700">
                Score
              </th>
              <th class="px-2 py-2 text-left font-semibold text-gray-700">
                Genes
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(term, idx) in pathwayResults.slice(0, 100)"
              :key="idx"
            >
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-2 py-1.5">
                  <span
                    v-if="term.direction === 'up'"
                    class="text-red-600 font-bold"
                    title="Upregulated"
                  >
                    ↑
                  </span>
                  <span
                    v-else-if="term.direction === 'down'"
                    class="text-blue-600 font-bold"
                    title="Downregulated"
                  >
                    ↓
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td
                  class="px-2 py-1.5 font-medium max-w-xs truncate"
                  :title="term.term"
                >
                  {{ term.term }}
                </td>
                <td class="px-2 py-1.5">
                  {{ term.fdr.toExponential(2) }}
                </td>
                <td class="px-2 py-1.5">
                  {{ term.combinedScore?.toFixed(1) || "N/A" }}
                </td>
                <td class="px-2 py-1.5">
                  <button
                    @click="togglePathwayGenes(idx)"
                    class="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>{{ term.genes.split(",").length }}</span>
                    <span>{{ expandedPathwayIndex === idx ? "▼" : "▶" }}</span>
                  </button>
                </td>
              </tr>
              <tr
                v-if="expandedPathwayIndex === idx"
                class="bg-gray-50 border-b border-gray-200"
              >
                <td colspan="5" class="px-2 py-2">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 flex flex-wrap gap-1">
                      <span
                        v-for="(gene, geneIdx) in term.genes
                          .split(',')
                          .filter((g) => g.trim())
                          .slice(0, 30)"
                        :key="geneIdx"
                        class="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {{ gene.trim() }}
                      </span>
                      <span
                        v-if="
                          term.genes.split(',').filter((g) => g.trim()).length >
                          30
                        "
                        class="px-1.5 py-0.5 text-gray-500 text-xs"
                      >
                        +{{
                          term.genes.split(",").filter((g) => g.trim()).length -
                          30
                        }}
                        more
                      </span>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                      <button
                        @click="copyGenes(term.genes)"
                        class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                      >
                        <AppIcon name="clipboard" size="xs" /> Copy Genes
                      </button>
                      <button
                        @click="$emit('savePathwayGenesToCart', term)"
                        class="px-2 py-1 border border-green-600 text-green-600 rounded text-xs hover:bg-green-50 flex items-center gap-1"
                      >
                        <AppIcon name="save" size="xs" /> Save to Cart
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div
          v-else
          class="h-full flex items-center justify-center text-gray-400"
        >
          Run enrichment analysis to see table
        </div>
      </div>
    </div>

    <!-- Pathway Bar Plots - Split by Direction -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Upregulated Pathways -->
      <div
        class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
        style="height: 450px"
      >
        <div class="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <span class="text-red-500">↑</span>
            Upregulated Pathways
            <span v-if="upregulatedPathways.length > 0" class="text-sm font-normal text-gray-500">
              ({{ upregulatedPathways.length }})
            </span>
          </h3>
          <button
            v-if="upregulatedPathways.length > 0"
            @click="downloadPNG('up')"
            class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Download upregulated pathways plot as PNG"
          >
            PNG
          </button>
        </div>
        <div class="flex-1 min-h-0">
          <v-chart
            v-if="upregulatedPathways.length > 0"
            ref="upChartRef"
            :option="upPathwayBarOption"
            :autoresize="true"
            class="w-full h-full"
          />
          <div
            v-else
            class="h-full flex items-center justify-center text-gray-400 text-sm"
          >
            <div class="text-center">
              <span class="text-2xl block mb-2">↑</span>
              No significant upregulated pathways
            </div>
          </div>
        </div>
      </div>

      <!-- Downregulated Pathways -->
      <div
        class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
        style="height: 450px"
      >
        <div class="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <span class="text-blue-500">↓</span>
            Downregulated Pathways
            <span v-if="downregulatedPathways.length > 0" class="text-sm font-normal text-gray-500">
              ({{ downregulatedPathways.length }})
            </span>
          </h3>
          <button
            v-if="downregulatedPathways.length > 0"
            @click="downloadPNG('down')"
            class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Download downregulated pathways plot as PNG"
          >
            PNG
          </button>
        </div>
        <div class="flex-1 min-h-0">
          <v-chart
            v-if="downregulatedPathways.length > 0"
            ref="downChartRef"
            :option="downPathwayBarOption"
            :autoresize="true"
            class="w-full h-full"
          />
          <div
            v-else
            class="h-full flex items-center justify-center text-gray-400 text-sm"
          >
            <div class="text-center">
              <span class="text-2xl block mb-2">↓</span>
              No significant downregulated pathways
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import VChart from "vue-echarts";
import AppIcon from "@/components/icons/AppIcon.vue";

const props = defineProps({
  pathwayResults: {
    type: Array,
    default: null,
  },
  pathwayEnrichmentInfo: {
    type: Object,
    default: null,
  },
  pathwayParams: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["savePathwayGenesToCart"]);

const expandedPathwayIndex = ref(null);

const significantPathwayCount = computed(() => {
  if (!props.pathwayResults) return 0;
  return props.pathwayResults.filter((t) => t.fdr < 0.05).length;
});

// Split pathways by direction
const upregulatedPathways = computed(() => {
  if (!props.pathwayResults?.length) return [];
  const topN = Math.floor((props.pathwayParams.topPathways || 20) / 2) || 10;
  return props.pathwayResults
    .filter((t) => t.fdr < 0.05 && t.direction === 'up')
    .slice(0, topN);
});

const downregulatedPathways = computed(() => {
  if (!props.pathwayResults?.length) return [];
  const topN = Math.floor((props.pathwayParams.topPathways || 20) / 2) || 10;
  return props.pathwayResults
    .filter((t) => t.fdr < 0.05 && t.direction === 'down')
    .slice(0, topN);
});

// Helper to create bar chart option for a direction
const createPathwayBarOption = (pathways, color) => {
  if (!pathways.length) return {};
  
  // Reverse so highest significance is at top
  const data = [...pathways].reverse();

  // Truncate pathway names for display
  const truncateName = (name, maxLen = 35) => {
    return name.length > maxLen ? name.substring(0, maxLen) + "..." : name;
  };

  const yAxisData = data.map((t) => truncateName(t.term));
  const barData = data.map((t) => ({
    value: -Math.log10(t.fdr),
    itemStyle: { color },
  }));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      confine: true,
      formatter: (params) => {
        const idx = params[0].dataIndex;
        const term = data[idx];
        return `<b style="word-wrap: break-word; max-width: 250px; display: inline-block;">${term.term}</b><br/>-log10(FDR): ${params[0].value.toFixed(2)}<br/>Genes: ${term.genes.split(",").length}`;
      },
    },
    grid: { left: 160, right: 20, top: 10, bottom: 40 },
    xAxis: {
      type: "value",
      name: "-log10(FDR)",
      nameLocation: "middle",
      nameGap: 25,
    },
    yAxis: {
      type: "category",
      data: yAxisData,
      axisLabel: {
        fontSize: 10,
        width: 150,
        overflow: "truncate",
      },
    },
    series: [
      {
        type: "bar",
        data: barData,
        barWidth: "60%",
      },
    ],
  };
};

const upPathwayBarOption = computed(() => {
  return createPathwayBarOption(upregulatedPathways.value, '#e74c3c'); // Red for upregulated
});

const downPathwayBarOption = computed(() => {
  return createPathwayBarOption(downregulatedPathways.value, '#3498db'); // Blue for downregulated
});

const togglePathwayGenes = (idx) => {
  expandedPathwayIndex.value = expandedPathwayIndex.value === idx ? null : idx;
};

const upChartRef = ref(null);
const downChartRef = ref(null);

const downloadPNG = (direction) => {
  const chartRef = direction === 'up' ? upChartRef : downChartRef;
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
      const dirLabel = direction === 'up' ? 'upregulated' : 'downregulated';
      const filename = `pathway_${dirLabel}_${Date.now()}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download plot:", err);
    alert("Download functionality not available");
  }
};

// Download function for pathway table

const downloadPathwayTableCSV = () => {
  if (!props.pathwayResults || props.pathwayResults.length === 0) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = [
      "direction",
      "pathway",
      "fdr",
      "combined_score",
      "gene_count",
      "genes",
    ];
    rows.push(headers.join(","));

    // Helper function to escape CSV values
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

    props.pathwayResults.forEach((term) => {
      const row = [
        escapeCSVValue(term.direction || ""),
        escapeCSVValue(term.term || ""),
        escapeCSVValue(term.fdr || ""),
        escapeCSVValue(term.combinedScore || term.combined_score || ""),
        escapeCSVValue(term.genes?.split(",").length || 0),
        escapeCSVValue(term.genes || ""),
      ];
      rows.push(row.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `pathway_table_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

const copyGenes = async (genesString) => {
  const genes = genesString
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g);
  const genesText = genes.join("\n");
  try {
    await navigator.clipboard.writeText(genesText);
    alert(`Copied ${genes.length} genes to clipboard!`);
  } catch (err) {
    console.error("Failed to copy genes:", err);
    alert("Failed to copy genes. Please try again.");
  }
};
</script>
