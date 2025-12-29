/**
 * Composable for Dataset Metadata Management
 * Handles dataset info fetching, metadata management, and dataset switching
 */

import { ref } from "vue";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9120/hypomap-backend/api/v1";

export function useDatasetMetadata(datasetId, error) {
  const datasetInfo = ref(null);
  const metadata = ref({
    cells: 0,
    genes: 0,
    tissue: "Loading...",
    disease: "AD",
    species: "Human",
    method: "Single-nucleus RNA sequencing",
    protocol: "10x Genomics",
    pmid: "N/A",
    doi: null,
    paper_title: "N/A",
  });
  const availableDatasets = ref([]);

  /**
   * Fetch dataset information from API
   * @param {Function} onCategoricalMetadata - Optional callback for Atlas-specific categorical metadata handling
   */
  const fetchDatasetInfo = async (onCategoricalMetadata = null) => {
    try {
      // Fetch h5ad info for cells/genes count
      const h5adResponse = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId.value}/info`
      );
      if (!h5adResponse.ok) throw new Error("Failed to fetch h5ad info");
      const h5adData = await h5adResponse.json();
      datasetInfo.value = h5adData;

      // Handle categorical metadata if callback provided (Atlas-specific)
      if (onCategoricalMetadata && h5adData.categorical_metadata) {
        onCategoricalMetadata(h5adData.categorical_metadata);
      }

      // Fetch comprehensive dataset metadata from datasets API
      let datasetMeta = null;
      try {
        // Try path parameter first
        let datasetsResponse = await fetch(
          `${API_BASE_URL.replace("/h5ad", "")}/datasets/${datasetId.value}`
        );
        if (!datasetsResponse.ok) {
          // Fallback to query parameter
          datasetsResponse = await fetch(
            `${API_BASE_URL.replace("/h5ad", "")}/datasets/?dataset_id=${
              datasetId.value
            }`
          );
          if (datasetsResponse.ok) {
            const datasets = await datasetsResponse.json();
            datasetMeta =
              Array.isArray(datasets) && datasets.length > 0
                ? datasets[0]
                : null;
          }
        } else {
          datasetMeta = await datasetsResponse.json();
        }
      } catch (metaErr) {
        console.warn("Could not fetch dataset metadata:", metaErr);
      }

      // Also try to get paper info based on pubmed_id from dataset
      let paperInfo = null;
      if (datasetMeta && datasetMeta.pubmed_id) {
        try {
          const papersResponse = await fetch(
            `${API_BASE_URL.replace("/h5ad", "")}/papers/?pubmed_id=${
              datasetMeta.pubmed_id
            }`
          );
          if (papersResponse.ok) {
            const papers = await papersResponse.json();
            // Find paper by matching pubmed_id
            paperInfo =
              Array.isArray(papers) && papers.length > 0
                ? papers.find(
                    (p) => String(p.pubmed_id) === String(datasetMeta.pubmed_id)
                  ) || papers[0]
                : null;
          }
        } catch (paperErr) {
          console.warn("Could not fetch paper info:", paperErr);
        }
      }

      // Update metadata with comprehensive info
      // Check age from multiple sources and field names
      const ageValue =
        datasetMeta?.age ||
        datasetMeta?.chronological_age ||
        datasetMeta?.age_range ||
        paperInfo?.age ||
        paperInfo?.chronological_age ||
        paperInfo?.age_range ||
        null;

      metadata.value = {
        cells: h5adData.n_cells || 0,
        genes: h5adData.n_genes || 0,
        tissue: datasetMeta?.brain_region || datasetMeta?.tissue || "N/A",
        disease: datasetMeta?.disease || "N/A",
        species: datasetMeta?.species || "Human",
        method:
          datasetMeta?.methodology ||
          datasetMeta?.method ||
          "Single-nucleus RNA sequencing",
        protocol:
          datasetMeta?.protocol || datasetMeta?.methodology || "10x Genomics",
        age: ageValue || null,
        sex: datasetMeta?.sex || "N/A",
        status: datasetMeta?.status || "N/A",
        publicDatasetId: datasetMeta?.public_dataset_id || null,
        model: datasetMeta?.model || null, // APOE genotype
        control: datasetMeta?.control || null,
        stage: datasetMeta?.stage || null,
        treatment: datasetMeta?.treatment || null,
        pmid: String(datasetMeta?.pubmed_id || paperInfo?.pubmed_id || "N/A"),
        doi: paperInfo?.doi || datasetMeta?.doi || null,
        paper_title: paperInfo?.title || "N/A",
        embeddings: h5adData.embeddings || [],
      };

      return h5adData;
    } catch (err) {
      console.error("Error fetching dataset info:", err);
      if (error) {
        error.value = err.message;
      }
      throw err;
    }
  };

  /**
   * Fetch available datasets
   */
  const fetchAvailableDatasets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/h5ad/datasets`);
      if (!response.ok) throw new Error("Failed to fetch datasets");
      availableDatasets.value = await response.json();
      return availableDatasets.value;
    } catch (err) {
      console.error("Error fetching datasets:", err);
      if (error) {
        error.value = err.message;
      }
      return [];
    }
  };

  /**
   * Switch to a different dataset
   * @param {Function} onSwitch - Callback to execute after switching (e.g., reload UMAP data)
   */
  const switchDataset = async (newDatasetId, onSwitch = null) => {
    datasetId.value = newDatasetId;
    // Clear previous data
    datasetInfo.value = null;
    metadata.value = {
      cells: 0,
      genes: 0,
      tissue: "Loading...",
      disease: "AD",
      species: "Human",
      method: "Single-nucleus RNA sequencing",
      protocol: "10x Genomics",
      pmid: "N/A",
      doi: null,
      paper_title: "N/A",
    };

    // Reload data
    await fetchDatasetInfo();
    if (onSwitch) {
      await onSwitch();
    }
  };

  return {
    datasetInfo,
    metadata,
    availableDatasets,
    fetchDatasetInfo,
    fetchAvailableDatasets,
    switchDataset,
  };
}
