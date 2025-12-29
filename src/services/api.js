// API service for ssKIND backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://0.0.0.0:8000/sskind-backend/api/v1";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Get all datasets with pagination support
  async getDatasets(limit = 10000, skip = 0) {
    return this.request(`/datasets/?limit=${limit}&skip=${skip}`);
  }

  // Get all datasets by fetching in batches (to handle large datasets)
  async getAllDatasets() {
    const batchSize = 1000;
    let allDatasets = [];
    let skip = 0;
    let hasMore = true;
    let consecutiveErrors = 0;
    const maxErrors = 3;

    while (hasMore && consecutiveErrors < maxErrors) {
      try {
        const batch = await this.request(
          `/datasets/?limit=${batchSize}&skip=${skip}`
        );

        if (Array.isArray(batch)) {
          allDatasets = allDatasets.concat(batch);
          consecutiveErrors = 0; // Reset error counter on success

          // If we got fewer records than requested, we've reached the end
          if (batch.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
          }
        } else {
          // If the response is not an array, assume it's a single page
          allDatasets = batch;
          hasMore = false;
        }
      } catch (error) {
        console.error(`Failed to fetch batch starting at ${skip}:`, error);
        consecutiveErrors++;

        // If we get a 400 or 422 error, the backend might not support pagination
        // Try the simple endpoint as fallback
        if (error.message.includes("400") || error.message.includes("422")) {
          console.log(
            "Backend might not support pagination, trying simple endpoint..."
          );
          try {
            const fallbackData = await this.request("/datasets/");
            if (Array.isArray(fallbackData)) {
              allDatasets = fallbackData;
            }
            hasMore = false;
            break;
          } catch (fallbackError) {
            console.error("Fallback request also failed:", fallbackError);
            hasMore = false;
          }
        }
      }
    }

    if (consecutiveErrors >= maxErrors) {
      console.warn("Too many consecutive errors, stopping batch fetch");
    }

    return allDatasets;
  }

  // Get dataset by ID
  async getDataset(id) {
    return this.request(`/datasets/${id}/`);
  }

  // Search datasets with filters and pagination
  async searchDatasets(filters = {}, limit = 1000, skip = 0) {
    const params = new URLSearchParams();

    // Add pagination parameters
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = `/datasets/?${queryString}`;

    return this.request(endpoint);
  }

  // Get dataset statistics
  async getDatasetStats() {
    try {
      return await this.request("/datasets/stats/");
    } catch (error) {
      console.warn("Stats endpoint not available, returning null");
      return null;
    }
  }

  // Get unique values for filters
  async getFilterOptions() {
    try {
      return await this.request("/datasets/filter-options/");
    } catch (error) {
      console.warn("Filter options endpoint not available, returning null");
      return null;
    }
  }

  // Get total count of datasets
  async getDatasetCount() {
    try {
      const response = await this.request("/datasets/count/");
      return response.total || 0;
    } catch (error) {
      console.warn("Count endpoint not available, returning null");
      return null;
    }
  }

  // Papers API methods
  async getPapers(limit = 1000, skip = 0) {
    return this.request(`/papers/?limit=${limit}&skip=${skip}`);
  }

  async getAllPapers() {
    const batchSize = 1000;
    let allPapers = [];
    let skip = 0;
    let hasMore = true;
    let consecutiveErrors = 0;
    const maxErrors = 3;

    while (hasMore && consecutiveErrors < maxErrors) {
      try {
        const batch = await this.request(
          `/papers/?limit=${batchSize}&skip=${skip}`
        );

        if (Array.isArray(batch)) {
          allPapers = allPapers.concat(batch);
          consecutiveErrors = 0;

          if (batch.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
          }
        } else {
          allPapers = batch;
          hasMore = false;
        }
      } catch (error) {
        console.error(
          `Failed to fetch papers batch starting at ${skip}:`,
          error
        );
        consecutiveErrors++;

        if (error.message.includes("400") || error.message.includes("422")) {
          try {
            const fallbackData = await this.request("/papers/");
            if (Array.isArray(fallbackData)) {
              allPapers = fallbackData;
            }
            hasMore = false;
            break;
          } catch (fallbackError) {
            console.error(
              "Fallback papers request also failed:",
              fallbackError
            );
            hasMore = false;
          }
        }
      }
    }

    return allPapers;
  }

  async getPaper(id) {
    return this.request(`/papers/${id}/`);
  }

  async searchPapersByDisease(disease) {
    return this.request(
      `/papers/search/disease/${encodeURIComponent(disease)}`
    );
  }

  async searchPapersBySpecies(species) {
    return this.request(
      `/papers/search/species/${encodeURIComponent(species)}`
    );
  }

  async searchPapersByBrainRegion(brainRegion) {
    return this.request(
      `/papers/search/brain-region/${encodeURIComponent(brainRegion)}`
    );
  }

  // Spatial Datasets API methods
  async getSpatialDatasets(limit = 1000, skip = 0) {
    return this.request(`/spatial-datasets/?limit=${limit}&skip=${skip}`);
  }

  async getAllSpatialDatasets() {
    const batchSize = 1000;
    let allDatasets = [];
    let skip = 0;
    let hasMore = true;
    let consecutiveErrors = 0;
    const maxErrors = 3;

    while (hasMore && consecutiveErrors < maxErrors) {
      try {
        const batch = await this.request(
          `/spatial-datasets/?limit=${batchSize}&skip=${skip}`
        );

        if (Array.isArray(batch)) {
          allDatasets = allDatasets.concat(batch);
          consecutiveErrors = 0;

          if (batch.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
          }
        } else {
          allDatasets = batch;
          hasMore = false;
        }
      } catch (error) {
        console.error(
          `Failed to fetch spatial batch starting at ${skip}:`,
          error
        );
        consecutiveErrors++;

        if (error.message.includes("400") || error.message.includes("422")) {
          try {
            const fallbackData = await this.request("/spatial-datasets/");
            if (Array.isArray(fallbackData)) {
              allDatasets = fallbackData;
            }
            hasMore = false;
            break;
          } catch (fallbackError) {
            console.error(
              "Fallback spatial request also failed:",
              fallbackError
            );
            hasMore = false;
          }
        }
      }
    }

    return allDatasets;
  }

  async getSpatialDataset(id) {
    return this.request(`/spatial-datasets/${id}/`);
  }

  async getSpatialDatasetStats() {
    try {
      return await this.request("/spatial-datasets/stats/");
    } catch (error) {
      console.warn("Spatial stats endpoint not available, returning null");
      return null;
    }
  }

  async searchSpatialDatasetsByDisease(disease) {
    return this.request(
      `/spatial-datasets/search/disease/${encodeURIComponent(disease)}`
    );
  }

  async searchSpatialDatasetsBySpecies(species) {
    return this.request(
      `/spatial-datasets/search/species/${encodeURIComponent(species)}`
    );
  }

  async searchSpatialDatasetsByMethodology(methodology) {
    return this.request(
      `/spatial-datasets/search/methodology/${encodeURIComponent(methodology)}`
    );
  }

  // Spatial Papers API methods
  async getSpatialPapers(limit = 1000, skip = 0) {
    return this.request(`/spatial-papers/?limit=${limit}&skip=${skip}`);
  }

  async getAllSpatialPapers() {
    const batchSize = 1000;
    let allPapers = [];
    let skip = 0;
    let hasMore = true;
    let consecutiveErrors = 0;
    const maxErrors = 3;

    while (hasMore && consecutiveErrors < maxErrors) {
      try {
        const batch = await this.request(
          `/spatial-papers/?limit=${batchSize}&skip=${skip}`
        );

        if (Array.isArray(batch)) {
          allPapers = allPapers.concat(batch);
          consecutiveErrors = 0;

          if (batch.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
          }
        } else {
          allPapers = batch;
          hasMore = false;
        }
      } catch (error) {
        console.error(
          `Failed to fetch spatial papers batch starting at ${skip}:`,
          error
        );
        consecutiveErrors++;

        if (error.message.includes("400") || error.message.includes("422")) {
          try {
            const fallbackData = await this.request("/spatial-papers/");
            if (Array.isArray(fallbackData)) {
              allPapers = fallbackData;
            }
            hasMore = false;
            break;
          } catch (fallbackError) {
            console.error(
              "Fallback spatial papers request also failed:",
              fallbackError
            );
            hasMore = false;
          }
        }
      }
    }

    return allPapers;
  }

  async getSpatialPaper(id) {
    return this.request(`/spatial-papers/${id}/`);
  }

  async getSpatialPaperStats() {
    try {
      return await this.request("/spatial-papers/stats/");
    } catch (error) {
      console.warn(
        "Spatial paper stats endpoint not available, returning null"
      );
      return null;
    }
  }

  async searchSpatialPapersByDisease(disease) {
    return this.request(
      `/spatial-papers/search/disease/${encodeURIComponent(disease)}`
    );
  }

  async searchSpatialPapersBySpecies(species) {
    return this.request(
      `/spatial-papers/search/species/${encodeURIComponent(species)}`
    );
  }

  async searchSpatialPapersByMethodology(methodology) {
    return this.request(
      `/spatial-papers/search/methodology/${encodeURIComponent(methodology)}`
    );
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
