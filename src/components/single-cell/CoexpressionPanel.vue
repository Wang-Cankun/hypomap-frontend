<template>
  <div class="flex-1 flex gap-4">
    <!-- Settings -->
    <div class="w-72 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div class="flex items-center justify-between">
        <button
          @click="loadExample"
          class="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          Load Example
        </button>
        <span class="text-[11px] text-gray-500">Co-expression</span>
      </div>

      <div class="space-y-3">
        <div class="relative">
          <label class="block text-xs font-medium text-gray-600 mb-1"
            >Gene 1</label
          >
          <input
            v-model="gene1"
            @input="onGeneInput('gene1')"
            @focus="showSuggestions.gene1 = true"
            @blur="hideSuggestions('gene1')"
            type="text"
            placeholder="e.g., NRGN"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div
            v-if="showSuggestions.gene1 && suggestions.gene1.length"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
          >
            <button
              v-for="g in suggestions.gene1"
              :key="g.symbol || g"
              @mousedown.prevent="selectGene('gene1', g.symbol || g)"
              class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
            >
              {{ g.symbol || g }}
            </button>
          </div>
        </div>

        <div class="relative">
          <label class="block text-xs font-medium text-gray-600 mb-1"
            >Gene 2</label
          >
          <input
            v-model="gene2"
            @input="onGeneInput('gene2')"
            @focus="showSuggestions.gene2 = true"
            @blur="hideSuggestions('gene2')"
            type="text"
            placeholder="e.g., GAD1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div
            v-if="showSuggestions.gene2 && suggestions.gene2.length"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
          >
            <button
              v-for="g in suggestions.gene2"
              :key="g.symbol || g"
              @mousedown.prevent="selectGene('gene2', g.symbol || g)"
              class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
            >
              {{ g.symbol || g }}
            </button>
          </div>
        </div>

        <button
          @click="loadCoexpression"
          :disabled="!gene1 || !gene2 || loading"
          class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {{ loading ? "Loading..." : "Plot Co-expression" }}
        </button>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Point Size: {{ localPointSize }}
        </label>
        <input
          v-model.number="localPointSize"
          type="range"
          min="1"
          max="10"
          step="1"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      <div v-if="error" class="text-xs text-red-600">
        {{ error }}
      </div>
    </div>

    <!-- Chart -->
    <div
      class="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
    >
      <!-- Header with Download Buttons -->
      <div
        v-if="coexpressionOption && !loading && !error"
        class="flex items-center justify-end mb-2 flex-shrink-0"
      >
        <DownloadButtons
          :disabled="!coexpressionOption"
          @download-png="downloadPNG"
          @download-csv="downloadCSV"
          png-title="Download co-expression plot as PNG image"
          csv-title="Download co-expression data as CSV"
        />
      </div>

      <div
        v-if="loading"
        class="h-full flex items-center justify-center text-gray-500"
      >
        <div class="text-center">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
          ></div>
          <p class="mt-4 text-gray-600">Loading co-expression data...</p>
        </div>
      </div>
      <div v-else-if="error" class="h-full flex items-center justify-center">
        <div class="text-center text-red-600">
          <AppIcon name="warning" size="xl" class="mx-auto mb-2" />
          <p>{{ error }}</p>
        </div>
      </div>
      <div v-else-if="coexpressionOption" class="flex-1">
        <div class="w-full h-full" style="aspect-ratio: 1 / 1">
          <v-chart
            ref="chartRef"
            :option="coexpressionOption"
            :autoresize="true"
            class="w-full h-full"
          />
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center text-gray-400">
        <div class="text-center">
          <AppIcon name="dna" size="xl" class="mx-auto mb-2" />
          <p>Select two genes to visualize co-expression</p>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div
      v-if="showInfo && stats"
      class="w-80 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AppIcon name="help" size="md" /> Cell Numbers
        </h3>
        <button
          @click="showInfo = false"
          class="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs mb-4">
        <div
          class="p-2 rounded border border-gray-200"
          style="background: #9b59b6"
        >
          <div class="text-white font-medium mb-1">Both High</div>
          <div class="text-white/80">
            {{ plottedGene1 || "Gene 1" }} & {{ plottedGene2 || "Gene 2" }}
          </div>
        </div>
        <div
          class="p-2 rounded border border-gray-200"
          style="background: #3498db"
        >
          <div class="text-white font-medium mb-1">
            {{ plottedGene1 || "Gene 1" }} High
          </div>
          <div class="text-white/80">Only Gene 1</div>
        </div>
        <div
          class="p-2 rounded border border-gray-200"
          style="background: #e74c3c"
        >
          <div class="text-white font-medium mb-1">
            {{ plottedGene2 || "Gene 2" }} High
          </div>
          <div class="text-white/80">Only Gene 2</div>
        </div>
        <div
          class="p-2 rounded border border-gray-200"
          style="background: #e0e0e0"
        >
          <div class="text-gray-700 font-medium mb-1">Both Low</div>
          <div class="text-gray-600">Neither expressed</div>
        </div>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left font-semibold text-gray-700">
              Expr > 0
            </th>
            <th class="px-3 py-2 text-left font-semibold text-gray-700">
              nCells
            </th>
            <th class="px-3 py-2 text-left font-semibold text-gray-700">
              Percent
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr>
            <td class="px-3 py-2 font-medium text-gray-900">Both</td>
            <td class="px-3 py-2 text-gray-700">{{ stats.both.nCells }}</td>
            <td class="px-3 py-2 text-gray-700">
              {{ stats.both.percent.toFixed(2) }}%
            </td>
          </tr>
          <tr>
            <td class="px-3 py-2 font-medium text-gray-900">
              {{ plottedGene1 || "Gene 1" }}
            </td>
            <td class="px-3 py-2 text-gray-700">{{ stats.gene1.nCells }}</td>
            <td class="px-3 py-2 text-gray-700">
              {{ stats.gene1.percent.toFixed(2) }}%
            </td>
          </tr>
          <tr>
            <td class="px-3 py-2 font-medium text-gray-900">
              {{ plottedGene2 || "Gene 2" }}
            </td>
            <td class="px-3 py-2 text-gray-700">{{ stats.gene2.nCells }}</td>
            <td class="px-3 py-2 text-gray-700">
              {{ stats.gene2.percent.toFixed(2) }}%
            </td>
          </tr>
          <tr>
            <td class="px-3 py-2 font-medium text-gray-900">None</td>
            <td class="px-3 py-2 text-gray-700">{{ stats.none.nCells }}</td>
            <td class="px-3 py-2 text-gray-700">
              {{ stats.none.percent.toFixed(2) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="flex items-start pt-4">
      <button
        @click="showInfo = true"
        class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        title="Show Info Panel"
      >
        <AppIcon name="help" size="sm" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ScatterChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import DownloadButtons from "./DownloadButtons.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

use([
  CanvasRenderer,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
]);

const props = defineProps({
  datasetId: { type: String, required: true },
  coordinates: { type: Array, default: () => [] },
  cellTypes: { type: Array, default: () => [] }, // Cell type for each coordinate
  selectedCellTypes: { type: Array, default: () => [] }, // Selected cell types to show
  apiBaseUrl: {
    type: String,
    default:
      import.meta.env.VITE_API_URL ||
      "http://localhost:9117/sskind-backend/api/v1",
  },
  fetchExpression: { type: Function, default: null },
  searchGenes: { type: Function, default: null },
  defaultGene1: { type: String, default: "" }, // optional prefill
  defaultGene2: { type: String, default: "" },
  exampleGene1: { type: String, default: "" },
  exampleGene2: { type: String, default: "" },
  xAxisName: { type: String, default: "UMAP1" },
  yAxisName: { type: String, default: "UMAP2" },
  pointSize: { type: Number, default: 3 },
});

const emits = defineEmits(["update:pointSize"]);

// start empty by default; parents can prefill via defaultGene props if desired
const gene1 = ref(props.defaultGene1 || "");
const gene2 = ref(props.defaultGene2 || "");
const plottedGene1 = ref("");
const plottedGene2 = ref("");
const suggestions = ref({ gene1: [], gene2: [] });
const showSuggestions = ref({ gene1: false, gene2: false });
const loading = ref(false);
const error = ref(null);
const expr1 = ref([]);
const expr2 = ref([]);
const showInfo = ref(true);
const localPointSize = ref(props.pointSize);
const chartRef = ref(null);

watch(
  () => props.pointSize,
  (v) => {
    if (v !== localPointSize.value) localPointSize.value = v;
  }
);

watch(localPointSize, (v) => emits("update:pointSize", v));

const stats = computed(() => {
  if (
    !plottedGene1.value ||
    !plottedGene2.value ||
    !expr1.value.length ||
    !expr2.value.length
  )
    return null;

  const coords = props.coordinates || [];
  const cellTypes = props.cellTypes || [];
  const selectedTypes = props.selectedCellTypes || [];
  const hasFilter = selectedTypes.length > 0 && cellTypes.length === coords.length;

  let both = 0;
  let g1 = 0;
  let g2 = 0;
  let includedCount = 0;

  const maxLen = Math.min(expr1.value.length, expr2.value.length, coords.length);
  for (let i = 0; i < maxLen; i += 1) {
    // Skip if filter is active and cell type not selected
    if (hasFilter && !selectedTypes.includes(cellTypes[i])) {
      continue;
    }
    includedCount++;
    const a = expr1.value[i] > 0;
    const b = expr2.value[i] > 0;
    if (a && b) both += 1;
    else if (a) g1 += 1;
    else if (b) g2 += 1;
  }

  const total = includedCount;
  if (!total) return null;

  const none = total - both - g1 - g2;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  return {
    both: { nCells: both, percent: pct(both) },
    gene1: { nCells: g1, percent: pct(g1) },
    gene2: { nCells: g2, percent: pct(g2) },
    none: { nCells: none, percent: pct(none) },
    total,
  };
});

const getDefaultExpressionFetcher = () => async (gene) => {
  const res = await fetch(
    `${props.apiBaseUrl}/h5ad/${props.datasetId}/expression/${gene}`
  );
  if (!res.ok) throw new Error(`Gene ${gene} not found`);
  const data = await res.json();
  return data.expression || data;
};

const fetcher = computed(
  () => props.fetchExpression || getDefaultExpressionFetcher()
);

const searcher = computed(() => {
  if (props.searchGenes) return props.searchGenes;
  return async (query) => {
    if (!props.datasetId || !query || query.length < 2) return [];
    const res = await fetch(
      `${props.apiBaseUrl}/h5ad/${props.datasetId}/genes/search?q=${query}&limit=20`
    );
    if (!res.ok) return [];
    return res.json();
  };
});

const onGeneInput = (field) => {
  const val = field === "gene1" ? gene1.value : gene2.value;
  if (!val || val.length < 2) {
    suggestions.value[field] = [];
    return;
  }
  searcher
    .value(val)
    .then((list) => {
      suggestions.value[field] = Array.isArray(list) ? list : [];
    })
    .catch(() => {
      suggestions.value[field] = [];
    });
};

const hideSuggestions = (field) => {
  setTimeout(() => (showSuggestions.value[field] = false), 120);
};

const selectGene = (field, val) => {
  if (field === "gene1") gene1.value = val;
  else gene2.value = val;
  showSuggestions.value[field] = false;
};

const loadExample = () => {
  gene1.value =
    props.exampleGene1 || props.defaultGene1 || (props.datasetId ? "NRGN" : "");
  gene2.value =
    props.exampleGene2 || props.defaultGene2 || (props.datasetId ? "GAD1" : "");
  // Do not auto-plot; let the user click "Plot Co-expression" explicitly.
};

const loadCoexpression = async () => {
  if (!props.datasetId || !gene1.value || !gene2.value) {
    error.value = !props.datasetId
      ? "Dataset not ready yet. Please try again."
      : "Enter two genes to plot.";
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const [e1, e2] = await Promise.all([
      fetcher.value(gene1.value.trim()),
      fetcher.value(gene2.value.trim()),
    ]);
    expr1.value = Array.isArray(e1) ? e1 : e1.expression || [];
    expr2.value = Array.isArray(e2) ? e2 : e2.expression || [];
    plottedGene1.value = gene1.value.trim();
    plottedGene2.value = gene2.value.trim();
  } catch (err) {
    error.value = err?.message || "Failed to load co-expression data";
    expr1.value = [];
    expr2.value = [];
    plottedGene1.value = "";
    plottedGene2.value = "";
  } finally {
    loading.value = false;
  }
};

const coexpressionOption = computed(() => {
  const coords = props.coordinates || [];
  if (
    !coords.length ||
    !plottedGene1.value ||
    !plottedGene2.value ||
    !expr1.value.length ||
    !expr2.value.length
  )
    return null;

  // Filter by selected cell types if provided
  const cellTypes = props.cellTypes || [];
  const selectedTypes = props.selectedCellTypes || [];
  const hasFilter = selectedTypes.length > 0 && cellTypes.length === coords.length;

  // Build filtered data
  const filteredData = [];
  let max1 = 0.0001;
  let max2 = 0.0001;

  coords.forEach((c, idx) => {
    // Skip if filter is active and cell type not selected
    if (hasFilter && !selectedTypes.includes(cellTypes[idx])) {
      return;
    }
    const e1 = expr1.value[idx] || 0;
    const e2 = expr2.value[idx] || 0;
    max1 = Math.max(max1, e1);
    max2 = Math.max(max2, e2);
    filteredData.push({ coord: c, e1, e2, idx });
  });

  const data = filteredData.map(({ coord, e1, e2 }) => ({
    value: coord,
    itemStyle: {
      color: getBivariateColor(e1, e2, max1, max2),
      opacity: e1 === 0 && e2 === 0 ? 0.35 : 0.85,
    },
  }));

  return {
    title: {
      text: `Co-expression: ${plottedGene1.value || "Gene1"} vs ${
        plottedGene2.value || "Gene2"
      }`,
      left: "center",
      textStyle: { fontSize: 14, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const [x, y] = p.value || [];
        const idx = p.dataIndex;
        const a = expr1.value[idx] || 0;
        const b = expr2.value[idx] || 0;
        return `${props.xAxisName}: ${x?.toFixed?.(2) ?? x}<br/>${
          props.yAxisName
        }: ${y?.toFixed?.(2) ?? y}<br/>${
          plottedGene1.value || "Gene1"
        }: ${a.toFixed(3)}<br/>${plottedGene2.value || "Gene2"}: ${b.toFixed(
          3
        )}`;
      },
    },
    grid: { left: 20, right: 20, top: 50, bottom: 30 },
    xAxis: { type: "value", show: false, scale: true, name: props.xAxisName },
    yAxis: {
      type: "value",
      show: false,
      scale: true,
      inverse: true,
      name: props.yAxisName,
    },
    dataZoom: [{ type: "inside" }],
    series: [
      {
        type: "scatter",
        data,
        symbolSize: localPointSize.value,
        large: true,
        largeThreshold: 4000,
      },
    ],
  };
});

const getBivariateColor = (
  a,
  b,
  max1,
  max2,
  threshold1 = 0,
  threshold2 = 0
) => {
  const norm1 = max1 > 0 ? Math.min(a / max1, 1) : 0;
  const norm2 = max2 > 0 ? Math.min(b / max2, 1) : 0;
  const thresh1 = threshold1 > 0 ? threshold1 / Math.max(max1, 1) : 0.1;
  const thresh2 = threshold2 > 0 ? threshold2 / Math.max(max2, 1) : 0.1;

  const c00 = hexToRgb("#e0e0e0");
  const c01 = hexToRgb("#e74c3c");
  const c10 = hexToRgb("#3498db");
  const c11 = hexToRgb("#9b59b6");

  const c0 = mix(c00, c10, norm1);
  const c1 = mix(c01, c11, norm1);
  const final = mix(c0, c1, norm2);

  if (norm1 < thresh1 && norm2 < thresh2) return rgbToHex(c00);
  return rgbToHex(final);
};

const mix = (c1, c2, t) => ({
  r: Math.round(c1.r * (1 - t) + c2.r * t),
  g: Math.round(c1.g * (1 - t) + c2.g * t),
  b: Math.round(c1.b * (1 - t) + c2.b * t),
});

const hexToRgb = (hex) => {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res
    ? {
        r: parseInt(res[1], 16),
        g: parseInt(res[2], 16),
        b: parseInt(res[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((x) => {
      const h = x.toString(16);
      return h.length === 1 ? `0${h}` : h;
    })
    .join("")}`;

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
      const filename = `coexpression_${plottedGene1.value}_${
        plottedGene2.value
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
  if (
    !props.coordinates?.length ||
    !expr1.value.length ||
    !expr2.value.length
  ) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = [
      "cell_index",
      props.xAxisName,
      props.yAxisName,
      plottedGene1.value || "gene1",
      plottedGene2.value || "gene2",
    ];
    rows.push(headers.join(","));

    const minLen = Math.min(
      props.coordinates.length,
      expr1.value.length,
      expr2.value.length
    );

    for (let i = 0; i < minLen; i++) {
      const coord = props.coordinates[i];
      const row = [i, coord[0], coord[1], expr1.value[i], expr2.value[i]];
      rows.push(row.join(","));
    }

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `coexpression_${plottedGene1.value}_${
      plottedGene2.value
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
</script>
