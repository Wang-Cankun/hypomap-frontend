import { ref, computed } from "vue";
import apiService from "@/services/api";

export function useDatasets() {
  const datasets = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({
    species: "",
    disease: "",
    sex: "",
    brain_region: "",
    status: "",
    data_type: "",
  });

  // Computed properties for filter options
  const speciesOptions = computed(() => {
    const species = [
      ...new Set(datasets.value.map((d) => d.species).filter(Boolean)),
    ];
    return species.sort();
  });

  const diseaseOptions = computed(() => {
    const diseases = [
      ...new Set(datasets.value.map((d) => d.disease).filter(Boolean)),
    ];
    return diseases.sort();
  });

  const sexOptions = computed(() => {
    const sexes = [
      ...new Set(datasets.value.map((d) => d.sex).filter(Boolean)),
    ];
    return sexes.sort();
  });

  const brainRegionOptions = computed(() => {
    const regions = [
      ...new Set(datasets.value.map((d) => d.brain_region).filter(Boolean)),
    ];
    return regions.sort();
  });

  const statusOptions = computed(() => {
    const statuses = [
      ...new Set(datasets.value.map((d) => d.status).filter(Boolean)),
    ];
    return statuses.sort();
  });

  const dataTypeOptions = computed(() => {
    const types = [
      ...new Set(datasets.value.map((d) => d.data_type).filter(Boolean)),
    ];
    return types.sort();
  });

  // Filtered datasets based on current filters
  const filteredDatasets = computed(() => {
    return datasets.value.filter((dataset) => {
      return Object.entries(filters.value).every(([key, value]) => {
        if (!value) return true;
        return dataset[key]?.toLowerCase().includes(value.toLowerCase());
      });
    });
  });

  // Load all datasets using the new getAllDatasets method
  const loadDatasets = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Use getAllDatasets to fetch all datasets in batches
      const data = await apiService.getAllDatasets();
      datasets.value = data;
      console.log(`Loaded ${data.length} datasets from API`);
    } catch (err) {
      error.value = err.message;
      console.error("Failed to load datasets:", err);
    } finally {
      loading.value = false;
    }
  };

  // Search datasets with filters
  const searchDatasets = async (searchFilters = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await apiService.searchDatasets(searchFilters);
      datasets.value = data;
    } catch (err) {
      error.value = err.message;
      console.error("Failed to search datasets:", err);
    } finally {
      loading.value = false;
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  // Clear all filters
  const clearFilters = () => {
    filters.value = {
      species: "",
      disease: "",
      sex: "",
      brain_region: "",
      status: "",
      data_type: "",
    };
  };

  // Get dataset by ID
  const getDatasetById = async (id) => {
    try {
      return await apiService.getDataset(id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Get dataset statistics
  const getStats = async () => {
    try {
      return await apiService.getDatasetStats();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Get total count of datasets
  const getDatasetCount = async () => {
    try {
      return await apiService.getDatasetCount();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  return {
    // State
    datasets,
    loading,
    error,
    filters,

    // Computed
    filteredDatasets,
    speciesOptions,
    diseaseOptions,
    sexOptions,
    brainRegionOptions,
    statusOptions,
    dataTypeOptions,

    // Methods
    loadDatasets,
    searchDatasets,
    updateFilters,
    clearFilters,
    getDatasetById,
    getStats,
    getDatasetCount,
  };
}
