/**
 * Composable for Gene Expression Analysis
 * Handles gene expression, co-expression, module scores, and heatmap/dotplot analysis
 */

import { ref, computed } from "vue";
import { useColorPalettes } from "./useColorPalettes";
import { useGeneCart } from "./useGeneCart";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9120/hypomap-backend/api/v1";

export function useGeneExpressionAnalysis(datasetId, umapData, selectedCellTypes = null, cellMetadata = null, filteredCellIndices = null) {
  const { getBivariateColor, hexToRgb, rgbToHex } = useColorPalettes();
  const { addItem: addCartItem, cartItems } = useGeneCart();

  // Gene search autocomplete
  const geneSuggestions = ref([]);
  const showGeneSuggestions = ref(false);
  let geneSearchTimeout = null;

  // Gene Expression state
  const geneInput = ref("");
  const selectedGenes = ref([]); // Keep for backward compatibility
  const selectedGene = ref(""); // Single gene for single gene tab
  const geneExpressionTab = ref("single"); // 'single', 'coexpression', 'module', or 'heatmap'

  // Co-expression state
  const coexpressionSettings = ref({
    xAxis: "UMAP1",
    yAxis: "UMAP2",
    gene1: "",
    gene2: "",
    exportHeight: 8,
    exportWidth: 10,
  });
  const coexpressionData = ref(null);
  const loadingCoexpression = ref(false);
  const coexpressionError = ref(null);
  const coexpressionStats = ref(null);
  const coexpressionGeneSuggestions = ref({
    gene1: [],
    gene2: [],
  });
  const showCoexpressionGeneSuggestions = ref({
    gene1: false,
    gene2: false,
  });
  const coexpressionChart = ref(null);
  const showCoexpressionInfo = ref(true);

  // Module Score state
  const moduleScoreSettings = ref({
    geneList: "",
    title: "",
  });
  const moduleScoreData = ref(null);
  const loadingModuleScore = ref(false);
  const moduleScoreError = ref(null);

  // Heatmap/Dotplot state
  const heatmapSettings = ref({
    geneList: "",
    plotType: "heatmap", // 'heatmap' or 'dotplot'
    scaleExpression: true,
    clusterRows: false,
    clusterColumns: false,
    transpose: false,
    colorPalette: "diverging_blue_yellow_red",
    plotHeight: "medium",
  });
  const heatmapData = ref(null);
  const loadingHeatmap = ref(false);
  const heatmapError = ref(null);

  // Gene expression data cache
  const geneExpressionCache = ref({});

  // Computed properties
  const selectedGeneTrimmed = computed(() =>
    selectedGene.value ? selectedGene.value.trim() : ""
  );

  const selectedGeneExpression = computed(() => {
    if (!selectedGeneTrimmed.value) return [];
    return (
      geneExpressionCache.value[selectedGeneTrimmed.value]?.expression || []
    );
  });

  const moduleScoreExpression = computed(
    () => moduleScoreData.value?.module_score || []
  );

  const moduleScoreTitle = computed(() => {
    if (moduleScoreSettings.value.title?.trim()) {
      return moduleScoreSettings.value.title.trim();
    }
    if (
      moduleScoreData.value?.genes_used &&
      moduleScoreData.value.genes_used.length > 0
    ) {
      return moduleScoreData.value.genes_used.join(", ");
    }
    return "Module Score";
  });

  /**
   * Fetch gene expression data
   */
  const fetchGeneExpression = async (gene) => {
    if (geneExpressionCache.value[gene]) {
      return geneExpressionCache.value[gene];
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId.value}/expression/${gene}`
      );
      if (!response.ok) throw new Error(`Gene ${gene} not found`);
      const data = await response.json();

      // Cache the result
      geneExpressionCache.value[gene] = data;
      return data;
    } catch (err) {
      console.error(`Error fetching gene ${gene}:`, err);
      throw err;
    }
  };

  /**
   * Search genes with autocomplete
   */
  const searchGenes = async (query) => {
    if (!query || query.length < 2) return [];

    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId.value}/genes/search?q=${query}&limit=20`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error("Error searching genes:", err);
      return [];
    }
  };

  /**
   * Parse gene input string into array
   */
  const parseGeneInput = (input) => {
    if (!input) return [];
    const list = Array.isArray(input)
      ? input
      : String(input)
          .split(/[,\s]+/)
          .filter((gene) => gene && gene.length > 0);
    return [
      ...new Set(
        list
          .map((gene) => gene.trim().toUpperCase())
          .filter((gene) => gene.length > 0)
      ),
    ];
  };

  /**
   * Save gene set to cart
   */
  const saveGeneSetToCart = (label, genes, source) => {
    const normalized = parseGeneInput(genes);
    if (!normalized.length) {
      alert("No genes available to save to the cart.");
      return false;
    }
    addCartItem({
      label: label?.trim() || `Gene Set ${cartItems.value.length + 1}`,
      genes: normalized,
      source,
    });
    return true;
  };

  /**
   * Gene autocomplete handlers
   */
  const onGeneInput = async () => {
    if (geneSearchTimeout) clearTimeout(geneSearchTimeout);

    geneSearchTimeout = setTimeout(async () => {
      const query = geneInput.value.trim();
      if (query.length >= 2) {
        geneSuggestions.value = await searchGenes(query);
      } else {
        geneSuggestions.value = [];
      }
    }, 300);
  };

  const selectGene = (geneSymbol) => {
    geneInput.value = geneSymbol;
    showGeneSuggestions.value = false;
    addGene();
  };

  const hideGeneSuggestions = () => {
    setTimeout(() => {
      showGeneSuggestions.value = false;
    }, 200);
  };

  /**
   * Add gene to selected list
   */
  const addGene = async () => {
    const gene = geneInput.value.trim().toUpperCase();
    if (!gene || selectedGenes.value.includes(gene)) return;

    try {
      await fetchGeneExpression(gene);
      selectedGenes.value.push(gene);
      geneInput.value = "";
      geneSuggestions.value = [];
    } catch (err) {
      alert(`Gene "${gene}" not found in dataset`);
    }
  };

  const removeGene = (gene) => {
    selectedGenes.value = selectedGenes.value.filter((g) => g !== gene);
  };

  /**
   * Single gene selection
   */
  const selectSingleGene = async (geneSymbol) => {
    const gene =
      typeof geneSymbol === "string"
        ? geneSymbol.trim()
        : geneSymbol.symbol?.trim();
    if (!gene) return;

    try {
      await fetchGeneExpression(gene);
      selectedGene.value = gene;
    } catch (err) {
      console.error(`Gene "${gene}" not found in dataset:`, err);
      alert(`Gene "${gene}" not found in dataset`);
    }
  };

  /**
   * Co-expression functions
   */
  const onCoexpressionGeneInput = async (geneField) => {
    const query = coexpressionSettings.value[geneField];
    if (!query || query.length < 2) {
      coexpressionGeneSuggestions.value[geneField] = [];
      return;
    }
    const suggestions = await searchGenes(query);
    coexpressionGeneSuggestions.value[geneField] = suggestions;
  };

  const selectCoexpressionGene = (geneField, geneSymbol) => {
    coexpressionSettings.value[geneField] = geneSymbol.toUpperCase();
    showCoexpressionGeneSuggestions.value[geneField] = false;
    coexpressionGeneSuggestions.value[geneField] = [];
  };

  const hideCoexpressionGeneSuggestions = (geneField) => {
    setTimeout(() => {
      showCoexpressionGeneSuggestions.value[geneField] = false;
    }, 200);
  };

  const loadCoexpressionData = async () => {
    if (
      !coexpressionSettings.value.gene1 ||
      !coexpressionSettings.value.gene2
    ) {
      return;
    }

    loadingCoexpression.value = true;
    coexpressionError.value = null;
    coexpressionData.value = null;
    coexpressionStats.value = null;

    try {
      // Fetch expression data for both genes
      const [gene1Data, gene2Data] = await Promise.all([
        fetchGeneExpression(coexpressionSettings.value.gene1),
        fetchGeneExpression(coexpressionSettings.value.gene2),
      ]);

      if (
        !gene1Data ||
        !gene1Data.expression ||
        !gene2Data ||
        !gene2Data.expression
      ) {
        throw new Error("Failed to fetch gene expression data");
      }

      if (!umapData.value || !umapData.value.coordinates) {
        throw new Error("UMAP data not available");
      }

      // Prepare co-expression data
      const expr1 = gene1Data.expression;
      const expr2 = gene2Data.expression;
      const coordinates = umapData.value.coordinates;
      const allCellsCount = coordinates.length;

      // Get filter indices - prefer advanced filter, fallback to cell type filter
      const advancedFilterIndices = filteredCellIndices?.value;
      const hasAdvancedFilter = advancedFilterIndices && advancedFilterIndices.length > 0 && advancedFilterIndices.length < allCellsCount;
      
      // Legacy cell type filter
      const cellTypeArray = cellMetadata?.value?.cell_type || [];
      const selectedTypes = selectedCellTypes?.value || [];
      const hasCellTypeFilter = !hasAdvancedFilter && selectedTypes.length > 0 && cellTypeArray.length > 0;

      // Calculate statistics
      let bothCount = 0;
      let gene1OnlyCount = 0;
      let gene2OnlyCount = 0;
      let noneCount = 0;
      let includedCells = 0;

      const scatterData = [];
      
      // Determine which indices to iterate
      const indicesToUse = hasAdvancedFilter 
        ? advancedFilterIndices 
        : Array.from({ length: allCellsCount }, (_, i) => i);
      
      for (const i of indicesToUse) {
        // Skip if using legacy cell type filter and cell doesn't match
        if (hasCellTypeFilter) {
          const cellType = cellTypeArray[i];
          if (!selectedTypes.includes(cellType)) {
            continue;
          }
        }

        includedCells++;
        const e1 = expr1[i] || 0;
        const e2 = expr2[i] || 0;
        const hasE1 = e1 > 0;
        const hasE2 = e2 > 0;

        if (hasE1 && hasE2) {
          bothCount++;
        } else if (hasE1) {
          gene1OnlyCount++;
        } else if (hasE2) {
          gene2OnlyCount++;
        } else {
          noneCount++;
        }

        // Get coordinates based on selected axes
        const xIdx = coexpressionSettings.value.xAxis === "UMAP1" ? 0 : 1;
        const yIdx = coexpressionSettings.value.yAxis === "UMAP1" ? 0 : 1;
        const x = coordinates[i][xIdx];
        const y = coordinates[i][yIdx];

        scatterData.push({
          value: [x, y, e1, e2],
          expr1: e1,
          expr2: e2,
          category:
            hasE1 && hasE2
              ? "both"
              : hasE1
              ? "gene1"
              : hasE2
              ? "gene2"
              : "none",
        });
      }

      const totalCells = includedCells;

      // Calculate statistics
      coexpressionStats.value = {
        both: {
          nCells: bothCount,
          percent: (bothCount / totalCells) * 100,
        },
        gene1: {
          nCells: gene1OnlyCount,
          percent: (gene1OnlyCount / totalCells) * 100,
        },
        gene2: {
          nCells: gene2OnlyCount,
          percent: (gene2OnlyCount / totalCells) * 100,
        },
        none: {
          nCells: noneCount,
          percent: (noneCount / totalCells) * 100,
        },
      };

      coexpressionData.value = {
        scatterData,
        gene1: coexpressionSettings.value.gene1,
        gene2: coexpressionSettings.value.gene2,
      };

      loadingCoexpression.value = false;
    } catch (err) {
      console.error("Error loading co-expression data:", err);
      coexpressionError.value =
        err.message || "Failed to load co-expression data";
      loadingCoexpression.value = false;
    }
  };

  /**
   * Module Score functions
   */
  const calculateModuleScore = async () => {
    if (!moduleScoreSettings.value.geneList.trim()) {
      moduleScoreError.value = "Please enter at least one gene";
      return;
    }

    const geneList = parseGeneInput(moduleScoreSettings.value.geneList);

    if (geneList.length === 0) {
      moduleScoreError.value = "Please enter at least one gene";
      return;
    }

    loadingModuleScore.value = true;
    moduleScoreError.value = null;

    const payload = {
      gene_list: geneList,
      use_raw: false,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId.value}/module-score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      moduleScoreData.value = data;
    } catch (err) {
      console.error("Error calculating module score:", err);
      moduleScoreError.value =
        err.message || "Failed to calculate module score";
    } finally {
      loadingModuleScore.value = false;
    }
  };

  const saveModuleGeneListToCart = () => {
    const genes = parseGeneInput(moduleScoreSettings.value.geneList);
    if (!genes.length) {
      alert("Add genes to the module score list before saving.");
      return;
    }
    const title =
      moduleScoreSettings.value.title?.trim() ||
      moduleScoreData.value?.genes_used?.join(", ") ||
      "Module Score Gene List";
    saveGeneSetToCart(title, genes, "module-score");
  };

  /**
   * Heatmap/Dotplot functions
   */
  const generateHeatmapData = async () => {
    if (!heatmapSettings.value.geneList.trim()) {
      heatmapError.value = "Please enter at least one gene";
      return;
    }

    const geneList = parseGeneInput(heatmapSettings.value.geneList);

    if (geneList.length === 0) {
      heatmapError.value = "Please enter at least one gene";
      return;
    }

    loadingHeatmap.value = true;
    heatmapError.value = null;

    const payload = {
      gene_list: geneList,
      plot_type: heatmapSettings.value.plotType,
      scale_expression: heatmapSettings.value.scaleExpression,
      cluster_rows: heatmapSettings.value.clusterRows,
      cluster_columns: heatmapSettings.value.clusterColumns,
    };

    // Add advanced filter indices if available (preferred over cell_types)
    const advancedFilterIndices = filteredCellIndices?.value;
    if (advancedFilterIndices && advancedFilterIndices.length > 0) {
      payload.cell_indices = advancedFilterIndices;
    } else if (selectedCellTypes?.value && selectedCellTypes.value.length > 0) {
      // Fallback to cell_types filter
      payload.cell_types = selectedCellTypes.value;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId.value}/heatmap`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Determine which cell types to show based on filters
      let cellTypesToShow = null;
      
      // Advanced filter takes precedence - get unique cell types from filtered cells
      const advancedFilterIndices = filteredCellIndices?.value;
      if (advancedFilterIndices && advancedFilterIndices.length > 0 && cellMetadata?.value?.cell_type) {
        const cellTypeArray = cellMetadata.value.cell_type;
        const filteredCellTypesSet = new Set();
        advancedFilterIndices.forEach(idx => {
          const ct = cellTypeArray[idx];
          if (ct) filteredCellTypesSet.add(ct);
        });
        cellTypesToShow = [...filteredCellTypesSet];
      } else {
        // Fall back to selectedCellTypes filter
        const selectedTypes = selectedCellTypes?.value || [];
        if (selectedTypes.length > 0) {
          cellTypesToShow = selectedTypes;
        }
      }
      
      // Filter heatmap data by cell types if needed
      if (cellTypesToShow && cellTypesToShow.length > 0 && data.cell_types && data.data) {
        // Find indices of cell types to show
        const selectedIndices = [];
        const filteredCellTypes = [];
        data.cell_types.forEach((ct, idx) => {
          if (cellTypesToShow.includes(ct)) {
            selectedIndices.push(idx);
            filteredCellTypes.push(ct);
          }
        });
        
        // Filter data matrix - each row is a gene, each column is a cell type
        const filteredData = data.data.map(geneRow => {
          if (Array.isArray(geneRow)) {
            return selectedIndices.map(idx => geneRow[idx]);
          }
          return geneRow;
        });
        
        // Also filter percent_expressed if present (for dotplot)
        let filteredPercentExpressed = data.percent_expressed;
        if (data.percent_expressed && Array.isArray(data.percent_expressed)) {
          filteredPercentExpressed = data.percent_expressed.map(geneRow => {
            if (Array.isArray(geneRow)) {
              return selectedIndices.map(idx => geneRow[idx]);
            }
            return geneRow;
          });
        }
        
        heatmapData.value = {
          ...data,
          cell_types: filteredCellTypes,
          data: filteredData,
          percent_expressed: filteredPercentExpressed,
        };
      } else {
        heatmapData.value = data;
      }
    } catch (err) {
      console.error("Error generating heatmap:", err);
      heatmapError.value = err.message || "Failed to generate heatmap";
    } finally {
      loadingHeatmap.value = false;
    }
  };

  const saveHeatmapGeneListToCart = () => {
    const genes = parseGeneInput(heatmapSettings.value.geneList);
    if (!genes.length) {
      alert("Add genes to the heatmap/dotplot list before saving.");
      return;
    }
    saveGeneSetToCart("Heatmap Gene List", genes, "heatmap");
  };

  const loadExampleGeneList = () => {
    // Updated with genes more commonly found in brain datasets
    const exampleGenes = "APOE, TREM2, GAD1, GAD2, PECAM1, CD3E, GFAP, OLIG1";
    if (geneExpressionTab.value === "module") {
      moduleScoreSettings.value.geneList = exampleGenes;
    } else if (geneExpressionTab.value === "heatmap") {
      heatmapSettings.value.geneList = exampleGenes;
    }
  };

  /**
   * Clear gene expression cache
   */
  const clearGeneExpressionCache = () => {
    geneExpressionCache.value = {};
  };

  return {
    // State
    geneSuggestions,
    showGeneSuggestions,
    geneInput,
    selectedGenes,
    selectedGene,
    geneExpressionTab,
    coexpressionSettings,
    coexpressionData,
    loadingCoexpression,
    coexpressionError,
    coexpressionStats,
    coexpressionGeneSuggestions,
    showCoexpressionGeneSuggestions,
    coexpressionChart,
    showCoexpressionInfo,
    moduleScoreSettings,
    moduleScoreData,
    loadingModuleScore,
    moduleScoreError,
    heatmapSettings,
    heatmapData,
    loadingHeatmap,
    heatmapError,
    geneExpressionCache,

    // Computed
    selectedGeneTrimmed,
    selectedGeneExpression,
    moduleScoreExpression,
    moduleScoreTitle,

    // Methods
    fetchGeneExpression,
    searchGenes,
    parseGeneInput,
    saveGeneSetToCart,
    onGeneInput,
    selectGene,
    hideGeneSuggestions,
    addGene,
    removeGene,
    selectSingleGene,
    onCoexpressionGeneInput,
    selectCoexpressionGene,
    hideCoexpressionGeneSuggestions,
    loadCoexpressionData,
    calculateModuleScore,
    saveModuleGeneListToCart,
    generateHeatmapData,
    saveHeatmapGeneListToCart,
    loadExampleGeneList,
    clearGeneExpressionCache,
  };
}
