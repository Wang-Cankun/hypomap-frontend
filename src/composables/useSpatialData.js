import { ref, computed } from "vue";
import apiService from "@/services/api";

export function useSpatialData() {
  const spatialDatasets = ref([]);
  const spatialPapers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({
    species: "",
    disease: "",
    brain_region: "",
    methodology: "",
  });

  // Computed properties for filter options - Datasets
  const datasetSpeciesOptions = computed(() => {
    const species = [
      ...new Set(spatialDatasets.value.map((d) => d.species).filter(Boolean)),
    ];
    return species.sort();
  });

  const datasetDiseaseOptions = computed(() => {
    const diseases = [
      ...new Set(spatialDatasets.value.map((d) => d.disease).filter(Boolean)),
    ];
    return diseases.sort();
  });

  const datasetBrainRegionOptions = computed(() => {
    const regions = [
      ...new Set(
        spatialDatasets.value.map((d) => d.brain_region).filter(Boolean)
      ),
    ];
    return regions.sort();
  });

  const datasetMethodologyOptions = computed(() => {
    const methodologies = [
      ...new Set(
        spatialDatasets.value.map((d) => d.methodology).filter(Boolean)
      ),
    ];
    return methodologies.sort();
  });

  // Computed properties for filter options - Papers
  const paperSpeciesOptions = computed(() => {
    const species = [
      ...new Set(spatialPapers.value.map((p) => p.species).filter(Boolean)),
    ];
    return species.sort();
  });

  const paperDiseaseOptions = computed(() => {
    const diseases = [
      ...new Set(spatialPapers.value.map((p) => p.disease).filter(Boolean)),
    ];
    return diseases.sort();
  });

  const paperBrainRegionOptions = computed(() => {
    const regions = [
      ...new Set(
        spatialPapers.value.map((p) => p.brain_region).filter(Boolean)
      ),
    ];
    return regions.sort();
  });

  const paperMethodologyOptions = computed(() => {
    const methodologies = [
      ...new Set(spatialPapers.value.map((p) => p.methodology).filter(Boolean)),
    ];
    return methodologies.sort();
  });

  // Filtered datasets based on current filters
  const filteredSpatialDatasets = computed(() => {
    return spatialDatasets.value.filter((dataset) => {
      return Object.entries(filters.value).every(([key, value]) => {
        if (!value) return true;
        return dataset[key]?.toLowerCase().includes(value.toLowerCase());
      });
    });
  });

  // Filtered papers based on current filters
  const filteredSpatialPapers = computed(() => {
    return spatialPapers.value.filter((paper) => {
      return Object.entries(filters.value).every(([key, value]) => {
        if (!value) return true;
        return paper[key]?.toLowerCase().includes(value.toLowerCase());
      });
    });
  });

  // Load all spatial datasets
  const loadSpatialDatasets = async () => {
    loading.value = true;
    error.value = null;

    try {
      const data = await apiService.getAllSpatialDatasets();
      spatialDatasets.value = data;
      console.log(`Loaded ${data.length} spatial datasets from API`);
    } catch (err) {
      error.value = err.message;
      console.error("Failed to load spatial datasets:", err);
    } finally {
      loading.value = false;
    }
  };

  // Load all spatial papers
  const loadSpatialPapers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const data = await apiService.getAllSpatialPapers();
      spatialPapers.value = data;
      console.log(`Loaded ${data.length} spatial papers from API`);
    } catch (err) {
      error.value = err.message;
      console.error("Failed to load spatial papers:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get spatial dataset by ID
  const getSpatialDatasetById = async (id) => {
    try {
      return await apiService.getSpatialDataset(id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Get spatial paper by ID
  const getSpatialPaperById = async (id) => {
    try {
      return await apiService.getSpatialPaper(id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Get dataset statistics
  const getSpatialDatasetStats = async () => {
    try {
      return await apiService.getSpatialDatasetStats();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Get paper statistics
  const getSpatialPaperStats = async () => {
    try {
      return await apiService.getSpatialPaperStats();
    } catch (err) {
      error.value = err.message;
      throw err;
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
      brain_region: "",
      methodology: "",
    };
  };

  return {
    // State
    spatialDatasets,
    spatialPapers,
    loading,
    error,
    filters,

    // Computed - Datasets
    filteredSpatialDatasets,
    datasetSpeciesOptions,
    datasetDiseaseOptions,
    datasetBrainRegionOptions,
    datasetMethodologyOptions,

    // Computed - Papers
    filteredSpatialPapers,
    paperSpeciesOptions,
    paperDiseaseOptions,
    paperBrainRegionOptions,
    paperMethodologyOptions,

    // Methods
    loadSpatialDatasets,
    loadSpatialPapers,
    getSpatialDatasetById,
    getSpatialPaperById,
    getSpatialDatasetStats,
    getSpatialPaperStats,
    updateFilters,
    clearFilters,
  };
}
