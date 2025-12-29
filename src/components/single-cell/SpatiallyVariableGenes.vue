<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          Spatially Variable Genes (
          <span
            class="underline decoration-dotted cursor-help"
            :title="'SpaGFT: Chang, Y., Liu, J., Jiang, Y., Ma, A., Yeo, Y. Y., Guo, Q., ... & Ma, Q. (2024). Graph Fourier transform for spatial omics representation and analyses of complex organs. Nature Communications, 15(1), 7467.'"
          >
            SpaGFT
          </span>
          )
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          Genes with significant spatial expression patterns
        </p>
      </div>
      <span
        class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
      >
        {{ genes.length }} genes
      </span>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"
        ></div>
        <p class="text-gray-500">Loading spatially variable genes...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-600">
        <p>{{ error }}</p>
        <button
          @click="loadData"
          class="mt-2 text-sm text-primary-600 hover:underline"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else-if="genes.length > 0" class="flex-1 flex flex-col min-h-0">
      <!-- Filters -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 flex-shrink-0"
      >
        <div class="flex flex-wrap gap-3">
          <div class="relative">
            <input
              v-model="filterText"
              type="text"
              placeholder="Search gene..."
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              v-model="filterHighVar"
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            Highly variable (SVG score > 0.7)
          </label>
        </div>
        <div class="text-xs text-gray-500">
          Showing {{ filteredGenes.length }} / {{ genes.length }} genes
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200 relative">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                @click="sort('gene')"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
              >
                Gene
                <span v-if="sortColumn === 'gene'">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                @click="sort('gft_score')"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-48"
                :title="'The SVG score quantifies the degree of spatial variability of a gene based on its spectral energy distribution in the graph Fourier domain. After projecting gene expression onto Laplacian eigenmodes derived from the spatial neighborhood graph, the score measures the relative enrichment of low-frequency components, which correspond to smooth and spatially coherent expression patterns. Genes with higher SVG scores exhibit stronger spatial organization rather than random or high-frequency noise.'"
              >
                <span class="underline decoration-dotted">SVG Score</span>
                <span v-if="sortColumn === 'gft_score'">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                @click="sort('pvalue')"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                :title="'The P-value assesses whether the observed frequency-domain signal of a gene is significantly enriched in low-frequency components compared with high-frequency components. It is computed using a nonparametric Mann–Whitney U test that contrasts low-frequency and high-frequency spectral coefficients, providing a statistical measure of whether a gene\'s spatial pattern deviates from randomness.'"
              >
                <span class="underline decoration-dotted">P-value</span>
                <span v-if="sortColumn === 'pvalue'">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                @click="sort('fdr')"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                :title="'The adjusted P-value represents the false discovery rate–corrected significance level obtained by applying the Benjamini–Yekutieli procedure to the raw P-values across all tested genes. This adjustment controls for multiple hypothesis testing under potential dependence among genes, allowing reliable identification of spatially variable genes while limiting false positives.'"
              >
                <span class="underline decoration-dotted">Adj. P-value</span>
                <span v-if="sortColumn === 'fdr'">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="gene in filteredGenes"
              :key="gene.gene"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-900">
                {{ gene.gene }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div
                    class="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden w-24"
                  >
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{
                        width: `${Math.min(
                          ((gene.gft_score || 0) / (maxSVGScore || 1)) * 100,
                          100
                        )}%`,
                      }"
                    ></div>
                  </div>
                  <span
                    class="text-sm text-gray-700 font-medium w-12 text-right"
                  >
                    {{ gene.gft_score?.toFixed(3) || "N/A" }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ gene.pvalue ? gene.pvalue.toExponential(2) : "N/A" }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ gene.fdr ? gene.fdr.toExponential(2) : "N/A" }}
              </td>

              <td class="px-4 py-3">
                <button
                  class="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors flex items-center gap-1"
                  @click="$emit('view-gene', gene.gene)"
                >
                  <span>View expression</span>
                  <span>→</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredGenes.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                No genes match your filters
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Stats -->
      <div
        class="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-6 text-sm flex-shrink-0"
      >
        <div>
          <span class="text-gray-500">Highly Variable:</span>
          <span class="ml-2 font-semibold text-gray-900">
            {{ filteredHighlyVariableCount }}
          </span>
        </div>
        <div>
          <span class="text-gray-500">Avg. SVG Score:</span>
          <span class="ml-2 font-semibold text-gray-900">
            {{ filteredAverageSVGScore.toFixed(3) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-gray-400">
      <p>No spatially variable genes found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSpatialApi } from "@/composables/useSpatialApi";

const props = defineProps({
  datasetId: {
    type: String,
    required: true,
  },
});

defineEmits(["view-gene"]);

const { fetchSVGList } = useSpatialApi();

const genes = ref([]);
const loading = ref(false);
const error = ref(null);

// Filters
const filterText = ref("");
const filterHighVar = ref(false);

// Sorting
const sortColumn = ref("gft_score");
const sortDirection = ref("desc");

const loadData = async () => {
  if (!props.datasetId) return;

  loading.value = true;
  error.value = null;

  try {
    const svgData = await fetchSVGList(props.datasetId);
    genes.value = svgData.genes || [];
  } catch (err) {
    console.error("Failed to load SVG genes:", err);
    error.value = "Failed to load spatially variable genes.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

watch(
  () => props.datasetId,
  () => {
    loadData();
  }
);

const filteredGenes = computed(() => {
  let result = [...genes.value];

  // Text filter
  if (filterText.value) {
    const term = filterText.value.toLowerCase();
    result = result.filter((g) => g.gene.toLowerCase().includes(term));
  }

  // High variance filter
  if (filterHighVar.value) {
    result = result.filter((g) => (g.gft_score || 0) > 0.7);
  }

  // Sorting
  if (sortColumn.value) {
    result.sort((a, b) => {
      const col = sortColumn.value;
      let aVal = a[col] ?? 0;
      let bVal = b[col] ?? 0;

      if (typeof aVal === "string") {
        return sortDirection.value === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  return result;
});

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = column === "gene" ? "asc" : "desc";
  }
};

const filteredHighlyVariableCount = computed(() => {
  return filteredGenes.value.filter((g) => (g.gft_score || 0) > 0.7).length;
});

const filteredAverageSVGScore = computed(() => {
  if (filteredGenes.value.length === 0) return 0;
  const sum = filteredGenes.value.reduce(
    (acc, g) => acc + (g.gft_score || 0),
    0
  );
  return sum / filteredGenes.value.length;
});

const maxSVGScore = computed(() => {
  if (genes.value.length === 0) return 1;
  return Math.max(...genes.value.map((g) => g.gft_score || 0));
});
</script>
