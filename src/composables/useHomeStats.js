import { ref, computed, onMounted } from "vue";
import { useDatasets } from "./useDatasets";

export function useHomeStats() {
  const { datasets, loadDatasets } = useDatasets();

  const stats = ref({
    totalDatasets: 0,
    totalCells: 0,
    uniqueSpecies: 0,
    uniqueStudies: 0,
  });

  const loading = ref(false);

  // Computed statistics from datasets
  const computedStats = computed(() => {
    if (!datasets.value.length) return stats.value;

    const totalCells = datasets.value.reduce((sum, dataset) => {
      return sum + (dataset.n_cells || 0);
    }, 0);

    const uniqueSpecies = new Set(
      datasets.value.map((d) => d.species).filter(Boolean)
    ).size;
    const uniqueStudies = new Set(
      datasets.value.map((d) => d.pubmed_id).filter(Boolean)
    ).size;

    return {
      totalDatasets: datasets.value.length,
      totalCells,
      uniqueSpecies,
      uniqueStudies,
    };
  });

  // Load statistics
  const loadStats = async () => {
    loading.value = true;
    try {
      await loadDatasets();
      stats.value = computedStats.value;
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      loading.value = false;
    }
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toString();
  };

  // Get chart data for different categories
  const getChartData = (type) => {
    if (!datasets.value.length) return [];

    switch (type) {
      case "species":
        const speciesCount = {};
        datasets.value.forEach((dataset) => {
          if (dataset.species) {
            speciesCount[dataset.species] =
              (speciesCount[dataset.species] || 0) + 1;
          }
        });
        return Object.entries(speciesCount).map(([species, count]) => ({
          label: species,
          value: count,
          color: getColorForSpecies(species),
        }));

      case "disease":
        const diseaseCount = {};
        datasets.value.forEach((dataset) => {
          if (dataset.disease) {
            diseaseCount[dataset.disease] =
              (diseaseCount[dataset.disease] || 0) + 1;
          }
        });
        return Object.entries(diseaseCount).map(([disease, count]) => ({
          label: disease,
          value: count,
          color: getColorForDisease(disease),
        }));

      case "brain_region":
        const regionCount = {};
        datasets.value.forEach((dataset) => {
          if (dataset.brain_region) {
            regionCount[dataset.brain_region] =
              (regionCount[dataset.brain_region] || 0) + 1;
          }
        });
        return Object.entries(regionCount).map(([region, count]) => ({
          label: region,
          value: count,
          color: getColorForRegion(region),
        }));

      default:
        return [];
    }
  };

  // Color functions for charts
  const getColorForSpecies = (species) => {
    const colors = {
      Human: "#4CAF50",
      Mouse: "#FFC107",
      Rat: "#FF5722",
      Drosophila: "#607D8B",
      Zebrafish: "#00BCD4",
    };
    return colors[species] || "#999999";
  };

  const getColorForDisease = (disease) => {
    const colors = {
      AD: "#f44336",
      PD: "#2196F3",
      ALS: "#FF9800",
      HD: "#9C27B0",
      NA: "#4CAF50",
    };
    return colors[disease] || "#999999";
  };

  const getColorForRegion = (region) => {
    const colors = {
      "Prefrontal cortex": "#42b983",
      Hippocampus: "#2196F3",
      Cerebellum: "#FFC107",
      "Entorhinal Cortex": "#FF5722",
      "Spinal cord": "#9C27B0",
    };
    return colors[region] || "#999999";
  };

  return {
    stats: computedStats,
    loading,
    loadStats,
    formatNumber,
    getChartData,
  };
}
