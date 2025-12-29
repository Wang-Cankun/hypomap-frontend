/**
 * Composable for Atlas-Specific Metadata Management
 * Handles metadata column selection, categorical metadata, and composition analysis
 */

import { ref, watch } from "vue";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9117/sskind-backend/api/v1";

export function useAtlasMetadata(datasetId) {
  // Metadata selector for coloring
  const selectedMetadataColumn = ref("cell_type"); // Default to cell_type
  const availableMetadataColumns = ref(["cell_type"]); // Will be populated from API
  const categoricalMetadata = ref({}); // Stores all categorical metadata with unique values
  const isLoadingMetadata = ref(false);

  // Composition analysis state
  const compositionMetadata = ref({});
  const loadingComposition = ref(false);

  /**
   * Initialize categorical metadata from dataset info
   */
  const initializeCategoricalMetadata = (categoricalMetadataData) => {
    if (categoricalMetadataData) {
      categoricalMetadata.value = categoricalMetadataData;
      availableMetadataColumns.value = Object.keys(categoricalMetadataData);

      // Ensure cell_type is selected by default if available
      if (availableMetadataColumns.value.includes("cell_type")) {
        selectedMetadataColumn.value = "cell_type";
      } else if (availableMetadataColumns.value.length > 0) {
        selectedMetadataColumn.value = availableMetadataColumns.value[0];
      }
    }
  };

  /**
   * Fetch unique values for a specific metadata column (for DEG filtering)
   */
  const fetchMetadataColumnValues = async (column) => {
    if (!column || categoricalMetadata.value[column]) return;

    try {
      isLoadingMetadata.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId.value}/metadata-values/${column}`
      );
      if (!response.ok) {
        // Fallback: try to get from plot-data
        const plotResponse = await fetch(
          `${API_BASE_URL}/h5ad/${datasetId.value}/plot-data?embedding=umap&metadata=${column}`
        );
        if (plotResponse.ok) {
          const data = await plotResponse.json();
          if (data.metadata?.[column]) {
            const uniqueValues = [...new Set(data.metadata[column])].sort();
            categoricalMetadata.value = {
              ...categoricalMetadata.value,
              [column]: uniqueValues,
            };
            // Also add to compositionMetadata for composition analysis
            compositionMetadata.value = {
              ...compositionMetadata.value,
              [column]: data.metadata[column],
            };
          }
        }
        return;
      }
      const data = await response.json();
      if (data.values) {
        // Store just the values for backward compatibility
        // The backend returns { column, values, counts }
        categoricalMetadata.value = {
          ...categoricalMetadata.value,
          [column]: data.values,
        };
      }
    } catch (err) {
      console.error(`Error fetching values for ${column}:`, err);
    } finally {
      isLoadingMetadata.value = false;
    }
  };

  /**
   * Fetch metadata for composition analysis
   */
  const fetchCompositionMetadata = async (columns) => {
    if (!columns || columns.length === 0) return;

    loadingComposition.value = true;
    try {
      const columnsToFetch = columns.filter(
        (col) => !compositionMetadata.value[col]
      );

      if (columnsToFetch.length > 0) {
        const response = await fetch(
          `${API_BASE_URL}/h5ad/${
            datasetId.value
          }/plot-data?embedding=umap&metadata=${columnsToFetch.join(",")}`
        );
        if (!response.ok) throw new Error("Failed to fetch metadata");
        const data = await response.json();

        // Merge new metadata with existing
        if (data.metadata) {
          compositionMetadata.value = {
            ...compositionMetadata.value,
            ...data.metadata,
          };
        }
      }
    } catch (err) {
      console.error("Error fetching composition metadata:", err);
    } finally {
      loadingComposition.value = false;
    }
  };

  /**
   * Format metadata label for display (e.g., 'cell_type' -> 'Cell Type')
   */
  const formatMetadataLabel = (key) => {
    if (!key) return "";
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Initialize composition metadata when available columns are loaded
  watch(availableMetadataColumns, async (columns) => {
    if (columns && columns.length >= 2) {
      // Pre-fetch the first two columns for composition
      const initialColumns = columns.slice(0, 2);
      await fetchCompositionMetadata(initialColumns);
    }
  });

  return {
    // State
    selectedMetadataColumn,
    availableMetadataColumns,
    categoricalMetadata,
    isLoadingMetadata,
    compositionMetadata,
    loadingComposition,

    // Methods
    initializeCategoricalMetadata,
    fetchMetadataColumnValues,
    fetchCompositionMetadata,
    formatMetadataLabel,
  };
}
