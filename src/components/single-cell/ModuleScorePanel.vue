<template>
  <div class="flex-1 flex gap-4">
    <!-- Settings -->
    <div class="w-72 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">🎯 Module Score</h3>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Custom Title
        </label>
        <input
          v-model="title"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., Synaptic Maintenance"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Gene List (comma or space separated)
        </label>
        <textarea
          v-model="geneList"
          rows="5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="APOE, GAD1, GFAP, PECAM1"
        ></textarea>
        <div
          class="mt-2 flex items-center gap-2 text-xs text-primary-600 font-medium"
        >
          <button type="button" class="hover:underline" @click="loadExample">
            Load Example
          </button>
          <span class="text-gray-300">•</span>
          <button
            v-if="emitSave"
            type="button"
            class="hover:underline"
            @click="saveGeneList"
          >
            Save gene list to cart
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Separate genes by comma or space
        </p>
      </div>
      <div class="bg-blue-50 rounded-lg p-3 text-xs text-gray-700 space-y-1">
        <p>
          <strong>Scoring Method:</strong> Seurat-style module scoring
          (scanpy.tl.score_genes)
        </p>
        <p>
          Scores are relative to reference genes and can be negative (below
          reference) or positive (above reference).
        </p>
      </div>
      <button
        class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-60"
        :disabled="loading || !geneList.trim()"
        @click="calculate"
      >
        {{ loading ? "Calculating..." : "Calculate Score" }}
      </button>
      <div v-if="error" class="text-xs text-red-600">
        {{ error }}
      </div>
      <div
        v-if="statsDisplay"
        class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-200"
      >
        <h4 class="text-sm font-semibold text-gray-700 mb-2">Statistics</h4>
        <dl class="space-y-1 text-xs">
          <div class="flex justify-between">
            <dt class="text-gray-600">Method:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.method || "scanpy_score_genes" }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Mean:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.mean?.toFixed(3) }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Median:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.median?.toFixed(3) }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Min:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.min?.toFixed(3) }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Max:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.max?.toFixed(3) }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Std Dev:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.std?.toFixed(3) }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Genes Used:</dt>
            <dd class="font-medium text-gray-900">
              {{ statsDisplay.n_genes_used }} /
              {{
                (statsDisplay.genes_used?.length || 0) +
                (statsDisplay.genes_not_found?.length || 0)
              }}
            </dd>
          </div>
        </dl>
        <div class="mt-2 text-xs text-gray-500 italic">
          Note: Scores can be negative (below reference level)
        </div>
        <div
          v-if="statsDisplay.genes_not_found?.length"
          class="mt-2 text-xs text-red-600"
        >
          Not found: {{ statsDisplay.genes_not_found.join(", ") }}
        </div>
      </div>
      <div class="border-t border-gray-200 pt-3 space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Color Scale (Feature Plot)
          </label>
          <ColorPaletteSelector
            v-model="localColorPaletteFeature"
            type="expression"
            label=""
          />
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
      </div>
    </div>

    <!-- Plots -->
    <div class="flex-1 flex flex-col gap-4 overflow-auto min-h-0">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-[360px]"
        >
          <GeneFeaturePlot
            :coordinates="coordinates"
            :expression="moduleScoreExpression"
            :cell-types="cellTypeMetadata"
            :selected-cell-types="[]"
            :gene-name="titleToUse"
            :color-palette="localColorPaletteFeature"
            :point-size="localPointSize"
            :use-log="false"
            :title="primaryTitle"
            empty-message="Calculate a module score to visualize results"
            :x-axis-name="primaryXAxisName"
            :y-axis-name="primaryYAxisName"
          />
        </div>
        <div
          v-if="secondaryCoordinates && secondaryCoordinates.length"
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-[360px]"
        >
          <GeneFeaturePlot
            :coordinates="secondaryCoordinates"
            :expression="moduleScoreExpression"
            :cell-types="cellTypeMetadata"
            :selected-cell-types="[]"
            :gene-name="titleToUse"
            :color-palette="localColorPaletteFeature"
            :point-size="localPointSize"
            :use-log="false"
            :title="secondaryTitleComputed"
            empty-message="Calculate a module score to visualize results"
            :x-axis-name="secondaryXAxisName"
            :y-axis-name="secondaryYAxisName"
          />
        </div>
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-[360px]"
        >
          <ExpressionBoxplot
            :values="moduleScoreExpression"
            :cell-types="allCellTypes"
            :cell-type-metadata="cellTypeMetadata"
            :selected-cell-types="[]"
            :all-cell-types="allCellTypes"
            :color-palette="colorPaletteBox"
            :use-log="false"
            :show-median-label="true"
            :title="`Module Score by Cell Type (${titleToUse})`"
            empty-message="Calculate a module score to visualize results"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { GeneFeaturePlot } from "@/components/single-cell";
import ExpressionBoxplot from "@/components/single-cell/ExpressionBoxplot.vue";
import ColorPaletteSelector from "@/components/single-cell/ColorPaletteSelector.vue";

const props = defineProps({
  datasetId: { type: String, required: true },
  apiBaseUrl: {
    type: String,
    default:
      import.meta.env.VITE_API_URL ||
      "http://localhost:9120/hypomap-backend/api/v1",
  },
  coordinates: { type: Array, default: () => [] },
  secondaryCoordinates: { type: Array, default: () => [] },
  primaryTitle: { type: String, default: null },
  secondaryTitle: { type: String, default: null },
  primaryXAxisName: { type: String, default: "UMAP1" },
  primaryYAxisName: { type: String, default: "UMAP2" },
  secondaryXAxisName: { type: String, default: "Spatial X" },
  secondaryYAxisName: { type: String, default: "Spatial Y" },
  cellTypeMetadata: { type: Array, default: () => [] },
  allCellTypes: { type: Array, default: () => [] },
  colorPaletteFeature: { type: String, default: "reds" },
  colorPaletteBox: { type: String, default: "default" },
  pointSize: { type: Number, default: 3 },
  fetchModuleScore: { type: Function, default: null }, // optional aligned fetch
  exampleGeneList: { type: String, default: "APOE, TREM2, GAD1, GAD2, PECAM1, CD3E, GFAP, OLIG1" },
  exampleGeneListMouse: {
    type: String,
    default: "apoe, trem2, gad1, gad2, pecam1, cd3e, gfap, olig1",
  },
  emitSave: { type: Boolean, default: false },
});

const emits = defineEmits(["update:pointSize", "save-gene-list"]);

const geneList = ref("");
const title = ref("");
const loading = ref(false);
const error = ref(null);
const moduleScoreExpression = ref([]);
const moduleScoreMeta = ref(null);
const localPointSize = ref(props.pointSize);
const localColorPaletteFeature = ref(props.colorPaletteFeature);

watch(
  () => props.pointSize,
  (v) => {
    if (v !== localPointSize.value) localPointSize.value = v;
  }
);
watch(localPointSize, (v) => emits("update:pointSize", v));
watch(
  () => props.colorPaletteFeature,
  (v) => {
    if (v !== localColorPaletteFeature.value) {
      localColorPaletteFeature.value = v;
    }
  }
);

const titleToUse = computed(() => {
  if (title.value.trim()) return title.value.trim();
  const genes = parseGeneInput(geneList.value);
  return genes.length ? genes.join(", ") : "Module Score";
});

const secondaryTitleComputed = computed(
  () => props.secondaryTitle || `${titleToUse.value} (Spatial)`
);

const statsDisplay = computed(() => {
  if (!moduleScoreExpression.value.length) return null;
  const metaStats = moduleScoreMeta.value?.stats;
  if (metaStats) {
    return {
      method: moduleScoreMeta.value?.method,
      min: metaStats.min,
      max: metaStats.max,
      mean: metaStats.mean,
      median: metaStats.median,
      std: metaStats.std,
      n_genes_used:
        moduleScoreMeta.value?.n_genes_used ||
        moduleScoreMeta.value?.genes_used?.length ||
        parseGeneInput(geneList.value).length,
      genes_used: moduleScoreMeta.value?.genes_used,
      genes_not_found: moduleScoreMeta.value?.genes_not_found || [],
    };
  }

  // Derive stats from expression when not provided by API
  const vals = moduleScoreExpression.value || [];
  if (!vals.length) return null;
  const sorted = [...vals].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const variance =
    vals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / vals.length;

  const genesUsed = parseGeneInput(geneList.value);

  return {
    method: moduleScoreMeta.value?.method || "scanpy_score_genes",
    min,
    max,
    mean,
    median,
    std: Math.sqrt(variance),
    n_genes_used:
      moduleScoreMeta.value?.n_genes_used ||
      moduleScoreMeta.value?.genes_used?.length ||
      genesUsed.length,
    genes_used: moduleScoreMeta.value?.genes_used || genesUsed,
    genes_not_found: moduleScoreMeta.value?.genes_not_found || [],
  };
});

const defaultFetcher = async (genes) => {
  const response = await fetch(
    `${props.apiBaseUrl}/h5ad/${props.datasetId}/module-score`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gene_list: genes, use_raw: false }),
    }
  );
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || response.statusText);
  }
  const data = await response.json();
  return data.module_score || data;
};

const fetcher = computed(() => props.fetchModuleScore || defaultFetcher);

const calculate = async () => {
  const genes = parseGeneInput(geneList.value);
  if (!genes.length) {
    error.value = "Please enter at least one gene";
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const result = await fetcher.value(genes);
    const expression = Array.isArray(result)
      ? result
      : result.module_score || [];
    moduleScoreExpression.value = expression;
    moduleScoreMeta.value = {
      method: result.method || "scanpy_score_genes",
      stats: result.stats || null,
      genes_used: result.genes_used || genes,
      genes_not_found: result.genes_not_found || [],
      n_genes_used:
        result.n_genes_used ||
        result.genes_used?.length ||
        genes.length ||
        genes.length,
    };
  } catch (err) {
    error.value = err?.message || "Failed to calculate module score";
    moduleScoreExpression.value = [];
    moduleScoreMeta.value = null;
  } finally {
    loading.value = false;
  }
};

const parseGeneInput = (input) => {
  if (!input) return [];
  const list = String(input)
    .split(/[,\s]+/)
    .filter((g) => g && g.length > 0);
  return [...new Set(list.map((g) => g.trim()).filter(Boolean))];
};

const loadExample = () => {
  const fallback = props.exampleGeneList;
  const mouseFallback = props.exampleGeneListMouse;
  geneList.value =
    mouseFallback && isLikelyMouse.value ? mouseFallback : fallback;
};

const isLikelyMouse = computed(() => {
  // Heuristic: if coordinates length matches typical spatial; fall back to gene casing
  // Default to mouse if example genes include lowercase "apoe"
  return (props.exampleGeneListMouse || "").includes("apoe");
});

const saveGeneList = () => {
  if (!props.emitSave) return;
  const genes = parseGeneInput(geneList.value);
  if (!genes.length) return;
  emits("save-gene-list", { genes, title: titleToUse.value });
};
</script>
