/**
 * Composable for Single-Cell Analysis API calls
 * Provides reusable API functions for single-cell data analysis
 */

import { ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9117/sskind-backend/api/v1';

export function useSingleCellApi() {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch dataset information
   */
  const fetchDatasetInfo = async (datasetId) => {
    try {
      const h5adResponse = await fetch(`${API_BASE_URL}/h5ad/${datasetId}/info`);
      if (!h5adResponse.ok) throw new Error('Failed to fetch h5ad info');
      return await h5adResponse.json();
    } catch (err) {
      console.error('Error fetching dataset info:', err);
      throw err;
    }
  };

  /**
   * Fetch UMAP plot data
   */
  const fetchUMAPData = async (datasetId, embedding = 'umap', metadata = 'cell_type') => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/h5ad/${datasetId}/plot-data?embedding=${embedding}&metadata=${metadata}`
      );
      if (!response.ok) throw new Error('Failed to fetch UMAP data');
      return await response.json();
    } catch (err) {
      console.error('Error fetching UMAP data:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch gene expression data
   */
  const fetchGeneExpression = async (datasetId, gene) => {
    try {
      const response = await fetch(`${API_BASE_URL}/h5ad/${datasetId}/expression/${gene}`);
      if (!response.ok) throw new Error(`Gene ${gene} not found`);
      return await response.json();
    } catch (err) {
      console.error(`Error fetching gene ${gene}:`, err);
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
      console.error('Error searching genes:', err);
      return [];
    }
  };

  /**
   * Fetch available datasets
   */
  const fetchAvailableDatasets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/h5ad/datasets`);
      if (!response.ok) throw new Error('Failed to fetch datasets');
      return await response.json();
    } catch (err) {
      console.error('Error fetching datasets:', err);
      return [];
    }
  };

  /**
   * Fetch dataset metadata from datasets API
   */
  const fetchDatasetMetadata = async (datasetId) => {
    try {
      let metaResponse = await fetch(
        `${API_BASE_URL.replace('/h5ad', '')}/datasets/${datasetId}`
      );
      if (metaResponse.ok) {
        const data = await metaResponse.json();
        return Array.isArray(data) && data.length > 0 ? data[0] : data;
      }
      // Fallback to query parameter
      metaResponse = await fetch(
        `${API_BASE_URL.replace('/h5ad', '')}/datasets/?dataset_id=${datasetId}`
      );
      if (metaResponse.ok) {
        const data = await metaResponse.json();
        return Array.isArray(data) && data.length > 0 ? data[0] : data;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch dataset metadata:', err);
      return null;
    }
  };

  /**
   * Fetch cell types for a dataset
   */
  const fetchDatasetCellTypes = async (datasetId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL.replace('/h5ad', '')}/deg/cell-types/${datasetId}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.cell_types.map((ct) => ({
        name: ct,
        count: data.counts?.[ct] || 0,
      }));
    } catch (err) {
      console.error(`Error fetching cell types for ${datasetId}:`, err);
      return [];
    }
  };

  /**
   * Calculate module score
   */
  const calculateModuleScore = async (datasetId, geneList, useRaw = false) => {
    const payload = { gene_list: geneList, use_raw: useRaw };
    try {
      const response = await fetch(`${API_BASE_URL}/h5ad/${datasetId}/module-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error calculating module score:', err);
      throw err;
    }
  };

  /**
   * Generate heatmap/dotplot data
   */
  const generateHeatmapData = async (datasetId, options) => {
    const payload = {
      gene_list: options.geneList,
      plot_type: options.plotType,
      scale_expression: options.scaleExpression,
      cluster_rows: options.clusterRows,
      cluster_columns: options.clusterColumns,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/h5ad/${datasetId}/heatmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error generating heatmap:', err);
      throw err;
    }
  };

  /**
   * Run DEG analysis between datasets/cell types
   */
  const runDEGAnalysis = async (params) => {
    const requestBody = {
      dataset_id1: params.datasetId1,
      dataset_id2: params.datasetId2,
      logfc_threshold: params.minLogFC,
      p_value_threshold: params.maxPvalue,
      min_pct: params.minPct || 0.1,
    };

    if (params.cellType1) requestBody.cell_type = params.cellType1;
    if (params.cellType2) requestBody.cell_type2 = params.cellType2;

    try {
      const response = await fetch(
        `${API_BASE_URL.replace('/h5ad', '')}/deg/between-datasets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error running DEG analysis:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchDatasetInfo,
    fetchUMAPData,
    fetchGeneExpression,
    searchGenes,
    fetchAvailableDatasets,
    fetchDatasetMetadata,
    fetchDatasetCellTypes,
    calculateModuleScore,
    generateHeatmapData,
    runDEGAnalysis,
    API_BASE_URL,
  };
}

