<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="mb-4 flex-shrink-0">
      <h2 class="text-xl font-bold text-gray-900 mb-3">
        Differential Expression & Pathway Enrichment
      </h2>
      <div
        v-if="errorMessage"
        class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>
    </div>

    <!-- DEG Content -->
    <div class="flex-1 flex flex-col overflow-auto">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- DEG Setup Panel -->
        <DEGSetupPanel
          :group1-filters="groupAFilters"
          :group2-filters="groupBFilters"
          :available-metadata-columns="availableMetadataColumns"
          :categorical-metadata="categoricalMetadata"
          :loading-metadata-values="loadingMetadataValues"
          :cell-count-preview="cellCountPreview"
          :loading-preview="loadingPreview"
          :cell-count-warning="cellCountWarning"
          :deg-params="degParams"
          :is-running-d-e-g="isRunningDEG"
          :can-run-d-e-g="canRunDEG"
          @update:group1Filters="groupAFilters = $event"
          @update:group2Filters="groupBFilters = $event"
          @update:degParams="degParams = $event"
          @fetch-metadata-values="fetchMetadataValues"
          @run-d-e-g="runDEG"
        />

        <!-- Pathway Enrichment Panel -->
        <PathwayEnrichmentPanel
          :pathway-params="pathwayParams"
          :available-pathway-databases="availablePathwayDatabases"
          :deg-results="degResults"
          :is-running-pathway="isRunningPathway"
          :pathway-results="pathwayResults"
          :pathway-enrichment-info="pathwayEnrichmentInfo"
          :auto-detected-species="detectedSpecies"
          @update:pathwayParams="pathwayParams = $event"
          @run-pathway-enrichment="runPathwayEnrichment"
          @save-pathway-genes-to-cart="savePathwayGenesToCart"
        />
      </div>

      <!-- Results Display -->
      <div class="grid grid-cols-2 gap-4">
        <!-- DEG Results -->
        <div class="flex flex-col gap-4">
          <!-- DEG Table -->
          <DEGResultsTable
            :deg-results="degResults"
            :is-running-d-e-g="isRunningDEG"
            :search-query="degTableSearch"
            :sort-column="degSortColumn"
            :sort-direction="degSortDirection"
            :deg-params="degParams"
            @update:searchQuery="degTableSearch = $event"
            @update:sortColumn="degSortColumn = $event"
            @update:sortDirection="degSortDirection = $event"
            @saveGenesToCart="saveDEGGenesToCart"
          />

          <!-- Volcano Plot -->
          <VolcanoPlot :deg-results="degResults" :deg-params="degParams" />
        </div>

        <!-- Pathway Results -->
        <PathwayResultsDisplay
          v-if="pathwayResults"
          :pathway-results="pathwayResults"
          :pathway-enrichment-info="pathwayEnrichmentInfo"
          :pathway-params="pathwayParams"
          @save-pathway-genes-to-cart="savePathwayGenesToCart"
        />
        <div v-else class="flex items-center justify-center text-gray-400">
          Run pathway enrichment to see results
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import DEGSetupPanel from "./deg/DEGSetupPanel.vue";
import DEGResultsTable from "./deg/DEGResultsTable.vue";
import VolcanoPlot from "./deg/VolcanoPlot.vue";
import PathwayEnrichmentPanel from "./deg/PathwayEnrichmentPanel.vue";
import PathwayResultsDisplay from "./deg/PathwayResultsDisplay.vue";
import { useGeneCart } from "@/composables/useGeneCart";

const props = defineProps({
  datasetId: {
    type: String,
    required: true,
  },
  apiBaseUrl: {
    type: String,
    required: true,
  },
  availableMetadataColumns: {
    type: Array,
    default: () => [],
  },
  categoricalMetadata: {
    type: Object,
    default: () => ({}),
  },
  datasetMetadata: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["fetchMetadataValues"]);

// Gene cart
const { addItem: addCartItem } = useGeneCart();

// Error state
const errorMessage = ref(null);

// Group filter state
const groupAFilters = ref([]);
const groupBFilters = ref([]);
const loadingMetadataValues = ref(false);

// DEG parameters
const degParams = ref({
  minLogFC: 0.25,
  maxPvalue: 0.05,
});

// Pathway database options (must be defined before watcher)
const pathwayDatabaseOptions = {
  human: [
    {
      value: "GO_Biological_Process_2023",
      label: "GO Biological Process 2023",
    },
    { value: "KEGG_2021_Human", label: "KEGG Pathways 2021" },
    { value: "Reactome_2022", label: "Reactome 2022" },
    { value: "WikiPathways_2023_Human", label: "WikiPathways 2023" },
  ],
  mouse: [
    {
      value: "GO_Biological_Process_2023",
      label: "GO Biological Process 2023",
    },
    { value: "KEGG_2019_Mouse", label: "KEGG Pathways 2019 (Mouse)" },
    { value: "Reactome_2022", label: "Reactome 2022" },
  ],
};

const pathwaySpeciesOptions = [
  { value: "human", label: "Human" },
  { value: "mouse", label: "Mouse" },
];

// Auto-detect species from dataset metadata
const detectedSpecies = computed(() => {
  const species = props.datasetMetadata?.species || "";
  const speciesLower = species.toLowerCase();
  if (speciesLower.includes("mouse") || speciesLower.includes("mus")) {
    return "mouse";
  }
  // Default to human
  return "human";
});

// Pathway parameters
const pathwayParams = ref({
  topN: 100,
  topPathways: 20,
  direction: "both",
  database: "GO_Biological_Process_2023",
  species: "human", // Will be updated by watcher
});

// Watch for species changes and update pathway params
watch(detectedSpecies, (newSpecies) => {
  if (!newSpecies) return;

  const available = pathwayDatabaseOptions[newSpecies];
  if (available && available.length > 0) {
    pathwayParams.value.species = newSpecies;
    pathwayParams.value.database = available[0].value;
  }
});

// Initialize species on mount (after everything is set up)
nextTick(() => {
  const species = detectedSpecies.value;
  if (species && pathwayDatabaseOptions[species]) {
    const available = pathwayDatabaseOptions[species];
    if (available && available.length > 0) {
      pathwayParams.value.species = species;
      pathwayParams.value.database = available[0].value;
    }
  }
});

const availablePathwayDatabases = computed(
  () =>
    pathwayDatabaseOptions[pathwayParams.value.species] ||
    pathwayDatabaseOptions.human
);

// Results state
const isRunningDEG = ref(false);
const isRunningPathway = ref(false);
const degResults = ref(null);
const pathwayResults = ref(null);
const pathwayEnrichmentInfo = ref(null);
const degTableSearch = ref("");
const degSortColumn = ref("adjPvalue");
const degSortDirection = ref("asc");

// Cell count preview
const cellCountPreview = ref({ group1: 0, group2: 0 });
const cellCountWarning = ref("");
const loadingPreview = ref(false);
let previewDebounceTimer = null;

// Fetch cell count preview from backend
const fetchCellCountPreview = async () => {
  const group1Filters = groupAFilters.value
    .filter((f) => f.column && f.selectedValues.length > 0)
    .map((f) => ({ column: f.column, values: f.selectedValues }));

  const group2Filters = groupBFilters.value
    .filter((f) => f.column && f.selectedValues.length > 0)
    .map((f) => ({ column: f.column, values: f.selectedValues }));

  if (group1Filters.length === 0 && group2Filters.length === 0) {
    cellCountPreview.value = { group1: 0, group2: 0 };
    cellCountWarning.value = "";
    return;
  }

  loadingPreview.value = true;
  try {
    const apiBase = props.apiBaseUrl.replace("/h5ad", "");
    const response = await fetch(`${apiBase}/deg/preview-cell-counts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset_id: props.datasetId,
        group1_filters: group1Filters,
        group2_filters: group2Filters,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      cellCountPreview.value = {
        group1: data.group1_count || 0,
        group2: data.group2_count || 0,
      };
      cellCountWarning.value =
        data.overlap_count > 0
          ? `Warning: ${data.overlap_count} cells overlap between groups`
          : "";
    }
  } catch (err) {
    console.error("Error fetching cell count preview:", err);
  } finally {
    loadingPreview.value = false;
  }
};

// Debounced preview update
const debouncedFetchPreview = () => {
  if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(fetchCellCountPreview, 500);
};

// Watch for filter changes to update preview
watch(
  [groupAFilters, groupBFilters],
  () => {
    debouncedFetchPreview();
  },
  { deep: true }
);

// Check if we can run DEG
const canRunDEG = computed(() => {
  const hasGroupA = groupAFilters.value.some(
    (f) => f.column && f.selectedValues.length > 0
  );
  const hasGroupB = groupBFilters.value.some(
    (f) => f.column && f.selectedValues.length > 0
  );
  return hasGroupA && hasGroupB && props.datasetId;
});

// Fetch metadata values for a column
const fetchMetadataValues = async (column) => {
  if (!column || props.categoricalMetadata[column]) return;
  emit("fetchMetadataValues", column);
};

// Save DEG genes to cart
const saveDEGGenesToCart = (direction = "all") => {
  if (!degResults.value?.genes) {
    alert("Run a DEG analysis before saving genes to the cart.");
    return;
  }

  // Filter genes based on search query
  let genes = degResults.value.genes;
  const search = degTableSearch.value.toLowerCase().trim();
  if (search) {
    genes = genes.filter((g) => g.gene.toLowerCase().includes(search));
  }

  if (direction === "up") {
    genes = genes.filter(
      (g) =>
        Math.abs(g.logFC) >= degParams.value.minLogFC &&
        (g.adjPvalue || g.pvalue) <= degParams.value.maxPvalue &&
        g.logFC > 0
    );
  } else if (direction === "down") {
    genes = genes.filter(
      (g) =>
        Math.abs(g.logFC) >= degParams.value.minLogFC &&
        (g.adjPvalue || g.pvalue) <= degParams.value.maxPvalue &&
        g.logFC < 0
    );
  }

  const geneSymbols = genes.map((gene) => gene.gene);
  if (!geneSymbols.length) {
    alert("No DEG genes available with the current filters.");
    return;
  }

  const label = `DEG: ${
    degResults.value.summary?.comparison_description || "Atlas comparison"
  }`;
  addCartItem({
    label: label.substring(0, 50) + (label.length > 50 ? "..." : ""),
    genes: geneSymbols,
    source: "deg-result",
  });
};

// Run DEG analysis
const runDEG = async () => {
  if (!canRunDEG.value) return;

  isRunningDEG.value = true;
  errorMessage.value = null;

  try {
    // Build filter objects for API
    const group1Filters = groupAFilters.value
      .filter((f) => f.column && f.selectedValues.length > 0)
      .map((f) => ({
        column: f.column,
        values: f.selectedValues,
      }));

    const group2Filters = groupBFilters.value
      .filter((f) => f.column && f.selectedValues.length > 0)
      .map((f) => ({
        column: f.column,
        values: f.selectedValues,
      }));

    const requestBody = {
      dataset_id: props.datasetId,
      group1_filters: group1Filters,
      group2_filters: group2Filters,
      logfc_threshold: degParams.value.minLogFC,
      p_value_threshold: degParams.value.maxPvalue,
      min_pct: 0.1,
    };

    const apiBase = props.apiBaseUrl.replace("/h5ad", "");
    const response = await fetch(`${apiBase}/deg/atlas-compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("DEG response:", data); // Debug log

    if (!data.genes || !Array.isArray(data.genes)) {
      throw new Error("Invalid response: no genes array");
    }

    degResults.value = {
      summary: data.summary,
      group1Description: data.group1_description,
      group2Description: data.group2_description,
      genes: data.genes.map((g) => ({
        gene: g.gene,
        logFC: parseFloat(g.log2_fold_change) || 0,
        meanExprGroup1: g.mean_expr_group1,
        meanExprGroup2: g.mean_expr_group2,
        pctGroup1: g.pct_group1,
        pctGroup2: g.pct_group2,
        pvalue: parseFloat(g.p_value) || 0,
        adjPvalue: parseFloat(g.p_value_adj) || 0,
        significant: g.significant,
      })),
    };

    console.log("Parsed DEG results:", degResults.value); // Debug log
  } catch (err) {
    console.error("DEG analysis error:", err);
    errorMessage.value = err.message;
    degResults.value = null;
  } finally {
    isRunningDEG.value = false;
  }
};

// Helper function to run enrichment for a gene list
const runEnrichrForGenes = async (genes, direction) => {
  const geneListString = genes.join("\n");
  const formData = new FormData();
  formData.append("list", geneListString);
  formData.append("description", `${props.datasetId}_DEG_${direction}`);

  const addListResponse = await fetch(
    "https://maayanlab.cloud/Enrichr/addList",
    { method: "POST", body: formData }
  );

  if (!addListResponse.ok) {
    throw new Error(`Failed to submit ${direction} genes to Enrichr`);
  }

  const addListData = await addListResponse.json();
  const userListId = addListData.userListId;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const enrichResponse = await fetch(
    `https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${pathwayParams.value.database}`
  );

  if (!enrichResponse.ok) {
    throw new Error(`Failed to get ${direction} enrichment results`);
  }

  const enrichData = await enrichResponse.json();
  const results = enrichData[pathwayParams.value.database];

  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results.map((item) => ({
    term: item[1] || "Unknown",
    pvalue: parseFloat(item[2]) || 1.0,
    zscore: parseFloat(item[3]) || 0,
    combinedScore: parseFloat(item[4]) || 0,
    genes: Array.isArray(item[5]) ? item[5].join(",") : item[5] || "",
    fdr: parseFloat(item[6]) || 1.0,
    direction: direction,
  }));
};

// Run pathway enrichment
const runPathwayEnrichment = async () => {
  if (!degResults.value?.genes) return;

  isRunningPathway.value = true;
  errorMessage.value = null;

  try {
    const significantGenes = degResults.value.genes.filter((g) => {
      const passesThreshold = Math.abs(g.logFC) >= degParams.value.minLogFC;
      const passesPvalue =
        (g.adjPvalue || g.pvalue) <= degParams.value.maxPvalue;
      return passesThreshold && passesPvalue;
    });

    let allResults = [];
    let totalGenesUsed = 0;
    let directionLabel = "";

    if (pathwayParams.value.direction === "both") {
      // Run separately for up and down regulated genes
      const upGenes = significantGenes
        .filter((g) => g.logFC > 0)
        .sort((a, b) => (a.adjPvalue || a.pvalue) - (b.adjPvalue || b.pvalue))
        .slice(0, pathwayParams.value.topN)
        .map((g) => g.gene);

      const downGenes = significantGenes
        .filter((g) => g.logFC < 0)
        .sort((a, b) => (a.adjPvalue || a.pvalue) - (b.adjPvalue || b.pvalue))
        .slice(0, pathwayParams.value.topN)
        .map((g) => g.gene);

      if (upGenes.length > 0) {
        const upResults = await runEnrichrForGenes(upGenes, "up");
        allResults.push(...upResults);
      }

      if (downGenes.length > 0) {
        const downResults = await runEnrichrForGenes(downGenes, "down");
        allResults.push(...downResults);
      }

      totalGenesUsed = upGenes.length + downGenes.length;
      directionLabel = `Up (${upGenes.length}) + Down (${downGenes.length})`;
    } else {
      // Single direction
      const filteredGenes = significantGenes
        .filter((g) =>
          pathwayParams.value.direction === "up" ? g.logFC > 0 : g.logFC < 0
        )
        .sort((a, b) => (a.adjPvalue || a.pvalue) - (b.adjPvalue || b.pvalue))
        .slice(0, pathwayParams.value.topN)
        .map((g) => g.gene);

      if (filteredGenes.length === 0) {
        throw new Error("No DEGs match the selected criteria");
      }

      allResults = await runEnrichrForGenes(
        filteredGenes,
        pathwayParams.value.direction
      );
      totalGenesUsed = filteredGenes.length;
      directionLabel =
        pathwayParams.value.direction === "up"
          ? "Upregulated"
          : "Downregulated";
    }

    if (allResults.length === 0) {
      throw new Error("No enrichment results found");
    }

    // Sort by FDR
    pathwayResults.value = allResults.sort((a, b) => a.fdr - b.fdr);

    // Store enrichment info
    pathwayEnrichmentInfo.value = {
      genesUsed: totalGenesUsed,
      direction: directionLabel,
      database: pathwayParams.value.database.replace(/_/g, " "),
    };
  } catch (err) {
    console.error("Pathway enrichment error:", err);
    errorMessage.value = err.message;
    pathwayResults.value = null;
    pathwayEnrichmentInfo.value = null;
  } finally {
    isRunningPathway.value = false;
  }
};

const savePathwayGenesToCart = (term) => {
  if (!term?.genes) {
    alert("No genes available for this pathway.");
    return;
  }
  const genes = term.genes
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
  const dirLabel =
    term.direction === "up" ? "↑" : term.direction === "down" ? "↓" : "";
  const label = `${dirLabel} ${term.term}`.substring(0, 50);
  addCartItem({
    label: label,
    genes: genes,
    source: "pathway",
  });
};

// Watch for dataset changes
watch(
  () => props.datasetId,
  () => {
    degResults.value = null;
    pathwayResults.value = null;
    errorMessage.value = null;
  }
);
</script>
