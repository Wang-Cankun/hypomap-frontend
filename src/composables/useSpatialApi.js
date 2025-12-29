/**
 * Composable for Spatial Transcriptomics API calls
 * Provides reusable API functions for spatial data analysis
 */

import { ref } from "vue";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9120/hypomap-backend/api/v1";

export function useSpatialApi() {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch spatial information about a dataset from spatial-datasets endpoint
   */
  const fetchSpatialInfo = async (datasetId) => {
    try {
      loading.value = true;
      // First try to get dataset info from spatial-datasets endpoint
      const datasetResponse = await fetch(
        `${API_BASE_URL}/spatial-datasets/?limit=1000&skip=0`
      );
      if (!datasetResponse.ok)
        throw new Error("Failed to fetch spatial datasets");
      const datasets = await datasetResponse.json();

      // Find the specific dataset
      const dataset = Array.isArray(datasets)
        ? datasets.find((d) => d.dataset_id === datasetId || d.id === datasetId)
        : null;

      // Also fetch spatial papers for additional context
      const papersResponse = await fetch(
        `${API_BASE_URL}/spatial-papers/?limit=1000&skip=0`
      );
      const papers = papersResponse.ok ? await papersResponse.json() : [];

      // Also fetch h5ad spatial info for feature flags
      let h5adSpatialInfo = null;
      try {
        const h5adResponse = await fetch(
          `${API_BASE_URL}/h5ad/${datasetId}/spatial/info`
        );
        if (h5adResponse.ok) {
          h5adSpatialInfo = await h5adResponse.json();
        }
      } catch (err) {
        console.warn("Could not fetch h5ad spatial info:", err);
      }

      // Combine information
      return {
        dataset,
        papers: Array.isArray(papers) ? papers : [],
        ...h5adSpatialInfo, // Include feature flags from h5ad endpoint
      };
    } catch (err) {
      console.error("Error fetching spatial info:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch spatial coordinates (x, y) for all spots/cells
   */
  const fetchSpatialCoordinates = async (datasetId) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/spatial/coordinates`
      );
      if (!response.ok) throw new Error("Failed to fetch spatial coordinates");
      return await response.json();
    } catch (err) {
      console.error("Error fetching spatial coordinates:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch combined spatial plot data (coordinates + gene expression + metadata)
   */
  const fetchSpatialPlotData = async (datasetId, options = {}) => {
    try {
      loading.value = true;
      const params = new URLSearchParams();
      if (options.sampleKey) params.append("sample_key", options.sampleKey);
      if (options.imageKey) params.append("image_key", options.imageKey);
      if (options.genes) params.append("genes", options.genes);
      if (options.metadata) params.append("metadata", options.metadata);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/h5ad/${datasetId}/spatial/plot-data${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch spatial plot data");
      return await response.json();
    } catch (err) {
      console.error("Error fetching spatial plot data:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch spatial plot data with image background (recommended for visualization)
   */
  const fetchSpatialPlotDataWithImage = async (datasetId, options = {}) => {
    try {
      loading.value = true;
      const params = new URLSearchParams();
      if (options.sampleKey) params.append("sample_key", options.sampleKey);
      if (options.imageKey)
        params.append("image_key", options.imageKey || "hires");
      if (options.genes) params.append("genes", options.genes);
      if (options.metadata) params.append("metadata", options.metadata);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/h5ad/${datasetId}/spatial/plot-data-with-image${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Failed to fetch spatial plot data with image");
      return await response.json();
    } catch (err) {
      console.error("Error fetching spatial plot data with image:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch transformed spatial coordinates for image overlays
   */
  const fetchSpatialCoordinatesTransformed = async (
    datasetId,
    options = {}
  ) => {
    try {
      loading.value = true;
      const params = new URLSearchParams();
      if (options.sampleKey) params.append("sample_key", options.sampleKey);
      if (options.imageKey)
        params.append("image_key", options.imageKey || "hires");
      const queryString = params.toString();
      const url = `${API_BASE_URL}/h5ad/${datasetId}/spatial/coordinates/transformed${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Failed to fetch transformed spatial coordinates");
      return await response.json();
    } catch (err) {
      console.error("Error fetching transformed spatial coordinates:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch spatial image info
   */
  const fetchSpatialImageInfo = async (datasetId, sampleKey = null) => {
    try {
      loading.value = true;
      const url = sampleKey
        ? `${API_BASE_URL}/h5ad/${datasetId}/spatial/image/info?sample_key=${sampleKey}`
        : `${API_BASE_URL}/h5ad/${datasetId}/spatial/image/info`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch spatial image info");
      return await response.json();
    } catch (err) {
      console.error("Error fetching spatial image info:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch embedding data (UMAP, tSNE, PCA) for dimension reduction visualization
   */
  const fetchEmbedding = async (datasetId, embeddingType = "umap") => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/embedding/${embeddingType}`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch ${embeddingType} embedding`);
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${embeddingType} embedding:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch analysis features for a dataset
   */
  const fetchAnalysisFeatures = async (datasetId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/analysis-features/${datasetId}`
      );
      if (!response.ok) throw new Error("Failed to fetch analysis features");
      return await response.json();
    } catch (err) {
      console.error("Error fetching analysis features:", err);
      throw err;
    }
  };

  /**
   * Fetch list of datasets with their analysis features
   */
  const fetchAnalysisFeaturesList = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.datasetType)
        params.append("dataset_type", filters.datasetType);
      if (filters.hasSpatial !== undefined)
        params.append("has_spatial", filters.hasSpatial);
      if (filters.hasSvg !== undefined)
        params.append("has_svg", filters.hasSvg);
      if (filters.hasDeconvolution !== undefined)
        params.append("has_deconvolution", filters.hasDeconvolution);
      if (filters.hasCcc !== undefined)
        params.append("has_ccc", filters.hasCcc);
      const queryString = params.toString();
      const url = `${API_BASE_URL}/h5ad/analysis-features${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Failed to fetch analysis features list");
      return await response.json();
    } catch (err) {
      console.error("Error fetching analysis features list:", err);
      throw err;
    }
  };

  /**
   * Fetch top N spatially variable genes (SVG)
   */
  const fetchTopSVG = async (datasetId, n = 50) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/svg/top?n=${n}`
      );
      if (!response.ok) throw new Error("Failed to fetch top SVG");
      return await response.json();
    } catch (err) {
      console.error("Error fetching top SVG:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch SVG list with optional filters
   */
  const fetchSVGList = async (datasetId, options = {}) => {
    try {
      loading.value = true;
      const params = new URLSearchParams();
      if (options.topN) params.append("top_n", options.topN);
      if (options.minScore !== undefined)
        params.append("min_score", options.minScore);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/h5ad/${datasetId}/svg/list${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch SVG list");
      return await response.json();
    } catch (err) {
      console.error("Error fetching SVG list:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch SVG statistics for a specific gene
   */
  const fetchSVGForGene = async (datasetId, gene) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/svg/${gene}`
      );
      if (!response.ok) throw new Error(`Failed to fetch SVG for gene ${gene}`);
      return await response.json();
    } catch (err) {
      console.error(`Error fetching SVG for gene ${gene}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch precomputed DEG groups
   */
  const fetchPrecomputedDEGGroups = async (datasetId) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/deg/precomputed/groups`
      );
      if (!response.ok)
        throw new Error("Failed to fetch precomputed DEG groups");
      return await response.json();
    } catch (err) {
      console.error("Error fetching precomputed DEG groups:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch precomputed DEG results
   */
  const fetchPrecomputedDEG = async (datasetId, group = null) => {
    try {
      loading.value = true;
      const url = group
        ? `${API_BASE_URL}/h5ad/${datasetId}/deg/precomputed?group=${group}`
        : `${API_BASE_URL}/h5ad/${datasetId}/deg/precomputed`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch precomputed DEG");
      return await response.json();
    } catch (err) {
      console.error("Error fetching precomputed DEG:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch deconvolution predictions (Visium only)
   */
  const fetchDeconvolutionPredictions = async (datasetId) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/deconvolution/predictions`
      );
      if (!response.ok)
        throw new Error("Failed to fetch deconvolution predictions");
      return await response.json();
    } catch (err) {
      console.error("Error fetching deconvolution predictions:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch deconvolution plot data (Visium only)
   */
  const fetchDeconvolutionPlotData = async (datasetId) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/deconvolution/plot-data`
      );
      if (!response.ok)
        throw new Error("Failed to fetch deconvolution plot data");
      return await response.json();
    } catch (err) {
      console.error("Error fetching deconvolution plot data:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch cell-cell communication interactions (Xenium only)
   */
  const fetchCCCInteractions = async (datasetId) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/ccc/interactions`
      );
      if (!response.ok) throw new Error("Failed to fetch CCC interactions");
      return await response.json();
    } catch (err) {
      console.error("Error fetching CCC interactions:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch CCC network (Xenium only)
   */
  const fetchCCCNetwork = async (datasetId) => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/ccc/network`
      );
      if (!response.ok) throw new Error("Failed to fetch CCC network");
      return await response.json();
    } catch (err) {
      console.error("Error fetching CCC network:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch dataset information (general h5ad info)
   */
  const fetchDatasetInfo = async (datasetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/h5ad/${datasetId}/info`);
      if (!response.ok) throw new Error("Failed to fetch dataset info");
      return await response.json();
    } catch (err) {
      console.error("Error fetching dataset info:", err);
      throw err;
    }
  };

  /**
   * Search genes with autocomplete
   */
  const searchGenes = async (datasetId, query, limit = 20) => {
    if (!query || query.length < 2) return [];
    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/genes/search?q=${query}&limit=${limit}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error("Error searching genes:", err);
      return [];
    }
  };

  /**
   * Fetch gene expression for a specific gene
   */
  const fetchGeneExpression = async (datasetId, gene) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/expression/${gene}`
      );
      if (!response.ok) throw new Error(`Gene ${gene} not found`);
      return await response.json();
    } catch (err) {
      console.error(`Error fetching gene ${gene}:`, err);
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchSpatialInfo,
    fetchSpatialCoordinates,
    fetchSpatialCoordinatesTransformed,
    fetchSpatialPlotData,
    fetchSpatialPlotDataWithImage,
    fetchSpatialImageInfo,
    fetchEmbedding,
    fetchAnalysisFeatures,
    fetchAnalysisFeaturesList,
    fetchTopSVG,
    fetchSVGList,
    fetchSVGForGene,
    fetchPrecomputedDEGGroups,
    fetchPrecomputedDEG,
    fetchDeconvolutionPredictions,
    fetchDeconvolutionPlotData,
    fetchCCCInteractions,
    fetchCCCNetwork,
    fetchDatasetInfo,
    searchGenes,
    fetchGeneExpression,
    API_BASE_URL,
  };
}
