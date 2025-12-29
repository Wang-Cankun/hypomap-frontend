<template>
  <div class="h-full flex gap-4 overflow-hidden">
    <!-- Sidebar: Controls & Cell Type List -->
    <div
      class="w-72 bg-white rounded-xl border border-gray-200 flex flex-col p-4 space-y-4"
    >
      <!-- Cell Type Selection -->
      <div class="flex-1 flex flex-col min-h-0">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Cell Types</h3>
        <div class="relative mb-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search cell types..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          <div v-if="loading" class="flex justify-center p-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"
            ></div>
          </div>
          <div v-else-if="error" class="text-red-500 text-sm p-4 text-center">
            {{ error }}
          </div>
          <div v-else class="divide-y divide-gray-100">
            <button
              v-for="cellType in filteredCellTypes"
              :key="cellType"
              @click="selectedCellType = cellType"
              :class="[
                'w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between hover:bg-gray-50',
                selectedCellType === cellType
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700',
              ]"
            >
              <span class="truncate" :title="cellType">{{ cellType }}</span>
            </button>
            <div
              v-if="!loading && filteredCellTypes.length === 0"
              class="text-gray-500 text-sm p-4 text-center"
            >
              No cell types found
            </div>
          </div>
        </div>
      </div>

      <!-- Visualization Controls -->
      <div class="border-t border-gray-200 pt-4 space-y-4">
        <ColorPaletteSelector
          v-model="colorPalette"
          type="expression"
          label="Color Scale"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Point Size: {{ pointSize }}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            v-model.number="pointSize"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Plots & Table -->
    <div class="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-2">
      <!-- Row 1: Plots -->
      <div class="flex-none flex flex-col gap-4 min-h-[600px]">
        <div
          v-if="loading"
          class="flex-1 flex items-center justify-center text-gray-500"
        >
          Loading deconvolution data...
        </div>
        <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
          <!-- Spatial Plot -->
          <div
            class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          >
            <div class="mb-3">
              <h3 class="text-lg font-semibold text-gray-900">
                Spatial Distribution
              </h3>
            </div>
            <GeneFeaturePlot
              :coordinates="spatialCoords"
              :expression="selectedCellTypeProbabilities"
              :gene-name="selectedCellType"
              :color-palette="colorPalette"
              :point-size="pointSize"
              :use-log="false"
              title=" "
              empty-message="Select a cell type to visualize"
              x-axis-name="Spatial X"
              y-axis-name="Spatial Y"
            />
          </div>

          <!-- UMAP Plot -->
          <div
            class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          >
            <div class="mb-3">
              <h3 class="text-lg font-semibold text-gray-900">
                UMAP Projection
              </h3>
            </div>
            <GeneFeaturePlot
              :coordinates="umapCoords"
              :expression="umapProbabilities"
              :gene-name="selectedCellType"
              :color-palette="colorPalette"
              :point-size="pointSize"
              :use-log="false"
              title=" "
              :empty-message="umapError || 'Select a cell type to visualize'"
              x-axis-name="UMAP1"
              y-axis-name="UMAP2"
            />
          </div>
        </div>
      </div>

      <!-- Row 2: Summary Table Section -->
      <div
        v-if="deconvolutionData"
        class="h-[500px] flex-none bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden"
      >
        <!-- Header & Global Stats -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            <span
              class="underline decoration-dotted cursor-help"
              :title="'Tangram was used to select the single-cell dataset with the most similar biological characteristics for annotation. When available, single-cell data and annotations from the same publication were preferentially used. The cell_type annotation was chosen as the compositional label for downstream deconvolution results.'"
            >
              Cell Type Composition
            </span>
          </h3>
          <div class="flex items-center gap-4">
            <div class="flex-1 flex h-6 rounded-full overflow-hidden">
              <div
                v-for="ct in topAverageCellTypes"
                :key="ct.name"
                class="h-full flex items-center justify-center text-[10px] font-medium text-white transition-all hover:opacity-90"
                :style="{
                  width: `${ct.percentage}%`,
                  backgroundColor: ct.color,
                }"
                :title="`${ct.name}: ${ct.percentage}%`"
              >
                <span v-if="ct.percentage > 5" class="truncate px-1">{{
                  ct.name
                }}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
            <div
              v-for="ct in topAverageCellTypes"
              :key="ct.name"
              class="flex items-center gap-1"
            >
              <span
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: ct.color }"
              ></span>
              <span class="font-medium">{{ ct.name }}</span>
              <span>{{ ct.percentage }}%</span>
            </div>
          </div>
        </div>

        <!-- Detailed Table -->
        <div class="flex-1 overflow-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Spot ID
                </th>
                <th
                  v-if="hasAnnotations"
                  scope="col"
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Annotation
                  <select
                    v-model="selectedAnnotationFilter"
                    class="ml-1 text-xs border-gray-300 rounded"
                  >
                    <option value="">All</option>
                    <option
                      v-for="opt in annotationOptions"
                      :key="opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                </th>
                <th
                  v-for="ct in topCellTypesForTable"
                  :key="ct"
                  scope="col"
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ ct }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
                >
                  Composition
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="row in paginatedTableData"
                :key="row.id"
                class="hover:bg-gray-50"
              >
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900"
                >
                  {{ row.id }}
                </td>
                <td
                  v-if="hasAnnotations"
                  class="px-4 py-2 whitespace-nowrap text-xs text-gray-500"
                >
                  {{ row.annotation }}
                </td>
                <td
                  v-for="ct in topCellTypesForTable"
                  :key="ct"
                  class="px-4 py-2 whitespace-nowrap text-xs text-gray-500"
                >
                  {{ (row.proportions[ct] * 100).toFixed(1) }}%
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <div
                    class="flex h-4 w-full rounded overflow-hidden bg-gray-100"
                  >
                    <div
                      v-for="seg in row.compositionSegments"
                      :key="seg.name"
                      class="h-full"
                      :style="{
                        width: `${seg.width}%`,
                        backgroundColor: seg.color,
                      }"
                      :title="`${seg.name}: ${seg.width.toFixed(1)}%`"
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="border-t border-gray-200 px-4 py-2 flex items-center justify-between bg-white"
        >
          <div class="text-xs text-gray-700">
            Showing
            <span class="font-medium">{{ paginationStart + 1 }}</span> to
            <span class="font-medium">{{
              Math.min(paginationEnd, filteredTableData.length)
            }}</span>
            of
            <span class="font-medium">{{ filteredTableData.length }}</span>
            results
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSpatialApi } from "@/composables/useSpatialApi";
import {
  cellTypeColorPalettes,
  humanAtlasCellTypeColors,
} from "@/composables/useColorPalettes";
import GeneFeaturePlot from "./GeneFeaturePlot.vue";
import ColorPaletteSelector from "./ColorPaletteSelector.vue";

const props = defineProps({
  datasetId: {
    type: String,
    required: true,
  },
  annotations: {
    type: Object,
    default: () => ({}),
  },
});

const { fetchDeconvolutionPlotData, fetchEmbedding } = useSpatialApi();

// State
const loading = ref(false);
const error = ref(null);
const deconvolutionData = ref(null);
const umapData = ref(null);
const selectedCellType = ref(null);
const searchQuery = ref("");
const pointSize = ref(3);
const colorPalette = ref("reds");
const umapError = ref(null);

// Table State
const currentPage = ref(1);
const itemsPerPage = 20;
const selectedAnnotationFilter = ref("");
const annotationKey = ref(null);

// Use centralized color palettes
const cellTypeColors = cellTypeColorPalettes.default;

const getCellTypeColor = (cellType, index) => {
  // First check if it's a known human atlas cell type
  if (typeof cellType === 'string' && humanAtlasCellTypeColors[cellType]) {
    return humanAtlasCellTypeColors[cellType];
  }
  // Fallback to palette-based coloring
  return cellTypeColors[index % cellTypeColors.length];
};

// Computed Properties
const cellTypes = computed(() => {
  if (!deconvolutionData.value?.metadata) return [];
  return Object.keys(deconvolutionData.value.metadata).sort();
});

const filteredCellTypes = computed(() => {
  if (!searchQuery.value) return cellTypes.value;
  const query = searchQuery.value.toLowerCase();
  return cellTypes.value.filter((ct) => ct.toLowerCase().includes(query));
});

const spatialCoords = computed(() => {
  return deconvolutionData.value?.coordinates || [];
});

const umapCoords = computed(() => {
  return umapData.value?.coordinates || [];
});

const selectedCellTypeProbabilities = computed(() => {
  if (!deconvolutionData.value || !selectedCellType.value) return [];
  return deconvolutionData.value.metadata[selectedCellType.value] || [];
});

const umapProbabilities = computed(() => {
  if (
    !umapData.value?.coordinates ||
    !deconvolutionData.value?.cell_ids ||
    !selectedCellType.value
  )
    return [];

  const spatialProbs = deconvolutionData.value.metadata[selectedCellType.value];
  if (!spatialProbs) return [];

  // Create map of cell_id -> probability
  const probMap = new Map();
  deconvolutionData.value.cell_ids.forEach((id, idx) => {
    probMap.set(id, spatialProbs[idx]);
  });

  // Map to UMAP cell_ids
  // If UMAP has cell_ids, use them. Otherwise assume alignment if lengths match (fallback)
  if (umapData.value.cell_ids) {
    return umapData.value.cell_ids.map((id) => probMap.get(id) ?? 0);
  } else if (umapData.value.coordinates?.length === spatialProbs.length) {
    console.warn(
      "UMAP data missing cell_ids, assuming 1:1 alignment with spatial data"
    );
    return spatialProbs;
  }

  return [];
});

// Summary Table Computed Properties
const hasAnnotations = computed(() => {
  return props.annotations && Object.keys(props.annotations).length > 0;
});

const annotationOptions = computed(() => {
  if (!hasAnnotations.value || !annotationKey.value) return [];
  const vals = props.annotations[annotationKey.value] || [];
  return [...new Set(vals)].sort();
});

const topAverageCellTypes = computed(() => {
  if (!deconvolutionData.value?.metadata) return [];

  const cts = Object.keys(deconvolutionData.value.metadata);
  const sums = cts.map((ct) => {
    const probs = deconvolutionData.value.metadata[ct];
    const sum = probs.reduce((a, b) => a + b, 0);
    return { name: ct, total: sum };
  });

  const totalSum = sums.reduce((a, b) => a + b.total, 0);

  return sums
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item, idx) => ({
      name: item.name,
      percentage: ((item.total / totalSum) * 100).toFixed(1),
      color: getCellTypeColor(idx),
    }));
});

const topCellTypesForTable = computed(() => {
  // Show top 4 cell types in table columns
  return topAverageCellTypes.value.slice(0, 4).map((ct) => ct.name);
});

const fullTableData = computed(() => {
  if (!deconvolutionData.value) return [];

  const ids = deconvolutionData.value.cell_ids || [];
  const meta = deconvolutionData.value.metadata || {};
  const cts = Object.keys(meta);

  // Determine active annotation key (prioritize 'annotation', 'cell_type', etc.)
  let activeKey = null;
  if (props.annotations) {
    const keys = Object.keys(props.annotations);
    activeKey =
      keys.find((k) => k.toLowerCase().includes("annotation")) ||
      keys.find((k) => k.toLowerCase().includes("cluster")) ||
      keys[0];
    annotationKey.value = activeKey;
  }

  const annotations = activeKey ? props.annotations[activeKey] : [];

  return ids.map((id, idx) => {
    const proportions = {};
    const compositionSegments = [];

    cts.forEach((ct, ctIdx) => {
      const val = meta[ct][idx];
      proportions[ct] = val;
      // Use index of cell type in sorted list for consistent coloring
      // We need to find the index of this ct in the topAverageCellTypes to match colors if possible,
      // or just use a consistent hash/index
      const topMatch = topAverageCellTypes.value.findIndex(
        (t) => t.name === ct
      );
      const color =
        topMatch >= 0 ? topAverageCellTypes.value[topMatch].color : "#cccccc";

      if (val > 0.01) {
        // Only show segments > 1%
        compositionSegments.push({
          name: ct,
          width: val * 100,
          color: color, // This might need refinement for non-top types
          raw: val,
        });
      }
    });

    // Sort segments by size for cleaner look
    compositionSegments.sort((a, b) => b.raw - a.raw);

    // Fix colors for segments: Top types get their colors, others get gray or hashed colors
    // Actually, let's assign colors based on the sorted order of all cell types to be consistent
    const allCtsSorted = cts.sort();
    compositionSegments.forEach((seg) => {
      const globalIdx = topAverageCellTypes.value.findIndex(
        (t) => t.name === seg.name
      );
      if (globalIdx !== -1) {
        seg.color = topAverageCellTypes.value[globalIdx].color;
      } else {
        // Fallback color for others
        seg.color = "#e5e7eb";
      }
    });

    return {
      id,
      annotation: annotations[idx] || "N/A",
      proportions,
      compositionSegments,
    };
  });
});

const filteredTableData = computed(() => {
  let data = fullTableData.value;
  if (selectedAnnotationFilter.value) {
    data = data.filter(
      (row) => row.annotation === selectedAnnotationFilter.value
    );
  }
  return data;
});

const totalPages = computed(() =>
  Math.ceil(filteredTableData.value.length / itemsPerPage)
);
const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage);
const paginationEnd = computed(() => paginationStart.value + itemsPerPage);

const paginatedTableData = computed(() => {
  return filteredTableData.value.slice(
    paginationStart.value,
    paginationEnd.value
  );
});

// Watchers
watch(selectedAnnotationFilter, () => {
  currentPage.value = 1;
});

// Methods
const loadData = async () => {
  if (!props.datasetId) return;

  loading.value = true;
  error.value = null;

  try {
    // Fetch both deconvolution data and UMAP embedding
    const [deconv, umap] = await Promise.all([
      fetchDeconvolutionPlotData(props.datasetId),
      fetchEmbedding(props.datasetId, "umap").catch((err) => {
        console.warn("Failed to fetch UMAP for deconvolution view:", err);
        umapError.value = "UMAP embedding not available";
        return { coordinates: [], cell_ids: [] };
      }),
    ]);

    console.log("Deconvolution Data Loaded:", {
      spatial: deconv?.coordinates?.length,
      umap: umap?.coordinates?.length,
      cellTypes: Object.keys(deconv?.metadata || {}).length,
    });

    deconvolutionData.value = deconv;
    umapData.value = umap;

    if (!umap?.coordinates?.length) {
      umapError.value = "No UMAP data found";
    }

    // Select first cell type by default if available and none selected
    if (
      !selectedCellType.value &&
      deconv.metadata &&
      Object.keys(deconv.metadata).length > 0
    ) {
      selectedCellType.value = Object.keys(deconv.metadata)[0];
    }
  } catch (err) {
    console.error("Failed to load deconvolution data:", err);
    error.value = "Failed to load deconvolution data";
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});

watch(
  () => props.datasetId,
  () => {
    loadData();
  }
);
</script>
