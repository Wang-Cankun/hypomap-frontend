/**
 * Composable for Single-Cell View State Management
 * Centralizes shared state between AtlasView and SingleCellAnalysis
 */

import { ref, computed } from "vue";

export function useSingleCellViewState(initialDatasetId = null) {
  // Tool management
  const activeTool = ref("umap");

  // Loading and error states
  const loading = ref(false);
  const error = ref(null);

  // Dataset management
  const datasetId = ref(initialDatasetId);
  const availableDatasets = ref([]);

  // UMAP and cell data
  const umapData = ref(null);
  const cellMetadata = ref(null);
  const availableGenes = ref([]);
  const cellTypes = ref([]);
  const selectedCellTypes = ref([]);
  const cellTypeFilterExpanded = ref(true);
  const cellTypeCounts = ref({});

  // Visualization settings
  const pointSize = ref(3);
  const colorPalette = ref("vibrant");
  const geneExpressionPalette = ref("reds");

  // Tool switching
  const setActiveTool = (tool) => {
    activeTool.value = tool;
  };

  // Dataset switching
  const setDatasetId = (id) => {
    datasetId.value = id;
  };

  // Cell type selection
  const setSelectedCellTypes = (types) => {
    selectedCellTypes.value = types;
  };

  // Update UMAP data and extract cell types
  const updateUMAPData = (data, metadataColumn = "cell_type") => {
    umapData.value = data;
    cellMetadata.value = data.metadata;

    // Extract unique values from metadata column and count cells
    const metadataValues =
      data.metadata?.[metadataColumn] || data.metadata?.cell_type;
    if (metadataValues) {
      const uniqueTypes = [...new Set(metadataValues)];
      cellTypes.value = uniqueTypes;
      selectedCellTypes.value = [...uniqueTypes]; // Select all by default

      // Calculate cell counts per type
      const counts = {};
      metadataValues.forEach((type) => {
        counts[type] = (counts[type] || 0) + 1;
      });
      cellTypeCounts.value = counts;
    }
  };

  return {
    // State
    activeTool,
    loading,
    error,
    datasetId,
    availableDatasets,
    umapData,
    cellMetadata,
    availableGenes,
    cellTypes,
    selectedCellTypes,
    cellTypeFilterExpanded,
    cellTypeCounts,
    pointSize,
    colorPalette,
    geneExpressionPalette,

    // Methods
    setActiveTool,
    setDatasetId,
    setSelectedCellTypes,
    updateUMAPData,
  };
}
