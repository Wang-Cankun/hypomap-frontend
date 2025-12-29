<template>
  <div class="data-table">
    <div class="controls">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search datasets..."
          @input="handleSearch"
        />
      </div>
      <div class="filters">
        <select v-model="filters.species" @change="handleFilter">
          <option value="">All Species</option>
          <option
            v-for="species in speciesOptions"
            :key="species"
            :value="species"
          >
            {{ species }}
          </option>
        </select>
        <select v-model="filters.disease" @change="handleFilter">
          <option value="">All Diseases</option>
          <option
            v-for="disease in diseaseOptions"
            :key="disease"
            :value="disease"
          >
            {{ disease }}
          </option>
        </select>
        <select v-model="filters.sex" @change="handleFilter">
          <option value="">All Sexes</option>
          <option v-for="sex in sexOptions" :key="sex" :value="sex">
            {{ sex }}
          </option>
        </select>
        <select v-model="filters.brain_region" @change="handleFilter">
          <option value="">All Regions</option>
          <option
            v-for="region in brainRegionOptions"
            :key="region"
            :value="region"
          >
            {{ region }}
          </option>
        </select>
        <select v-model="filters.status" @change="handleFilter">
          <option value="">All Status</option>
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
        <select v-model="filters.data_type" @change="handleFilter">
          <option value="">All Types</option>
          <option v-for="type in dataTypeOptions" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <button @click="clearFilters" class="clear-filters-btn">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading datasets..." />

    <!-- Error State -->
    <ErrorMessage v-if="error" :error="error" :retry="loadDatasets" />

    <!-- Data Table -->
    <div v-if="!loading && !error" class="table-container">
      <div class="tabs">
        <button
          :class="['tab', { active: selected === 'single' }]"
          @click="selected = 'single'"
        >
          <AppIcon name="dna" size="sm" class="inline-block mr-1" /> scRNA-seq
        </button>
        <button
          :class="['tab', { active: selected === 'spatial' }]"
          @click="selected = 'spatial'"
        >
          <AppIcon name="spatial" size="sm" class="inline-block mr-1" /> Spatial transcriptomics
        </button>
      </div>

      <div v-if="selected === 'single'">
        <div class="table-header">
          <div class="results-info">
            Showing {{ filteredDatasets.length }} of
            {{ datasets.length }} datasets
          </div>
          <div class="table-actions">
            <button @click="exportData" class="export-btn">Export CSV</button>
          </div>
        </div>

        <table v-if="filteredDatasets.length > 0">
          <thead>
            <tr>
              <th @click="sortBy('dataset_id')" class="sortable">
                Dataset ID
                <span v-if="sortColumn === 'dataset_id'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('species')" class="sortable">
                Species
                <span v-if="sortColumn === 'species'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('sex')" class="sortable">
                Sex
                <span v-if="sortColumn === 'sex'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('status')" class="sortable">
                Status
                <span v-if="sortColumn === 'status'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('disease')" class="sortable">
                Disease
                <span v-if="sortColumn === 'disease'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('brain_region')" class="sortable">
                Brain Region
                <span v-if="sortColumn === 'brain_region'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('stage')" class="sortable">
                Stage
                <span v-if="sortColumn === 'stage'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th @click="sortBy('age')" class="sortable">
                Age
                <span v-if="sortColumn === 'age'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th>Public Dataset ID</th>
              <th @click="sortBy('n_cells')" class="sortable">
                Cells
                <span v-if="sortColumn === 'n_cells'" class="sort-arrow">
                  {{ sortDirection === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th>PubMed ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dataset in paginatedDatasets" :key="dataset.id">
              <td>{{ dataset.dataset_id }}</td>
              <td>{{ dataset.species }}</td>
              <td>{{ dataset.sex }}</td>
              <td>
                <span :class="['status-badge', dataset.status.toLowerCase()]">
                  {{ dataset.status }}
                </span>
              </td>
              <td>{{ dataset.disease }}</td>
              <td>{{ dataset.brain_region }}</td>
              <td>{{ dataset.stage }}</td>
              <td>{{ dataset.age }}</td>
              <td>{{ dataset.public_dataset_id }}</td>
              <td>{{ dataset.n_cells?.toLocaleString() || "N/A" }}</td>
              <td>
                <a
                  v-if="dataset.pubmed_id"
                  :href="`https://pubmed.ncbi.nlm.nih.gov/${dataset.pubmed_id
                    .split(',')[0]
                    .trim()}/`"
                  target="_blank"
                  class="publication-link"
                >
                  View Paper
                </a>
                <span v-else>N/A</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewDataset(dataset)" class="view-btn">
                    View
                  </button>
                  <button
                    @click="downloadDataset(dataset)"
                    class="download-btn"
                  >
                    Download
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="no-data">
          <p>No datasets found matching your criteria.</p>
          <button @click="clearFilters" class="clear-filters-btn">
            Clear Filters
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="filteredDatasets.length > 0" class="pagination">
          <span>
            Rows per page:
            <select v-model="rowsPerPage" @change="currentPage = 1">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </span>
          <span>
            {{ (currentPage - 1) * rowsPerPage + 1 }}-
            {{ Math.min(currentPage * rowsPerPage, filteredDatasets.length) }}
            of {{ filteredDatasets.length }}
          </span>
          <button :disabled="currentPage === 1" @click="currentPage--">
            &lt;
          </button>
          <button
            :disabled="currentPage * rowsPerPage >= filteredDatasets.length"
            @click="currentPage++"
          >
            &gt;
          </button>
        </div>
      </div>

      <div v-else>
        <SpatialTable />
      </div>
    </div>

    <!-- Dataset Modal -->
    <div v-if="showDatasetModal" class="dataset-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedDataset.dataset_id }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="dataset-details">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Dataset ID:</span>
              <span class="value">{{ selectedDataset.dataset_id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Species:</span>
              <span class="value">{{ selectedDataset.species }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Sex:</span>
              <span class="value">{{ selectedDataset.sex }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Status:</span>
              <span class="value">
                <span
                  :class="[
                    'status-badge',
                    selectedDataset.status.toLowerCase(),
                  ]"
                >
                  {{ selectedDataset.status }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Disease:</span>
              <span class="value">{{ selectedDataset.disease }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Brain Region:</span>
              <span class="value">{{ selectedDataset.brain_region }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Stage:</span>
              <span class="value">{{ selectedDataset.stage }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Age:</span>
              <span class="value">{{ selectedDataset.age }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Public Dataset ID:</span>
              <span class="value">{{ selectedDataset.public_dataset_id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Cells:</span>
              <span class="value">{{
                selectedDataset.n_cells?.toLocaleString() || "N/A"
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Data Type:</span>
              <span class="value">{{ selectedDataset.data_type }}</span>
            </div>
            <div class="detail-item">
              <span class="label">PubMed ID:</span>
              <span class="value">
                <a
                  v-if="selectedDataset.pubmed_id"
                  :href="`https://pubmed.ncbi.nlm.nih.gov/${selectedDataset.pubmed_id
                    .split(',')[0]
                    .trim()}/`"
                  target="_blank"
                  class="publication-link"
                >
                  {{ selectedDataset.pubmed_id }}
                </a>
                <span v-else>N/A</span>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Created:</span>
              <span class="value">{{
                formatDate(selectedDataset.created_at)
              }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button
            @click="downloadDataset(selectedDataset)"
            class="download-btn"
          >
            Download Dataset
          </button>
          <button @click="closeModal" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDatasets } from "@/composables/useDatasets";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SpatialTable from "@/components/SpatialTable.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

// Use the datasets composable
const {
  datasets,
  loading,
  error,
  filters,
  filteredDatasets,
  speciesOptions,
  diseaseOptions,
  sexOptions,
  brainRegionOptions,
  statusOptions,
  dataTypeOptions,
  loadDatasets,
  updateFilters,
  clearFilters,
} = useDatasets();

// Local state
const searchQuery = ref("");
const sortColumn = ref("");
const sortDirection = ref("asc");
const showDatasetModal = ref(false);
const selectedDataset = ref(null);
const selected = ref("single");
const rowsPerPage = ref(25);
const currentPage = ref(1);

// Computed properties
const paginatedDatasets = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredDatasets.value.slice(start, end);
});

// Methods
const handleSearch = () => {
  // Reset to first page when searching
  currentPage.value = 1;
};

const handleFilter = () => {
  // Reset to first page when filtering
  currentPage.value = 1;
};

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const viewDataset = (dataset) => {
  selectedDataset.value = dataset;
  showDatasetModal.value = true;
};

const downloadDataset = (dataset) => {
  // Implement download functionality
  console.log("Downloading dataset:", dataset.dataset_id);
  // You can implement actual download logic here
  alert(
    `Download functionality for ${dataset.dataset_id} would be implemented here`
  );
};

const closeModal = () => {
  showDatasetModal.value = false;
  selectedDataset.value = null;
};

const exportData = () => {
  // Implement CSV export functionality
  const csvContent = generateCSV(filteredDatasets.value);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sskind_datasets.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

const generateCSV = (data) => {
  const headers = [
    "Dataset ID",
    "Species",
    "Sex",
    "Status",
    "Disease",
    "Brain Region",
    "Stage",
    "Age",
    "Public Dataset ID",
    "Cells",
    "Data Type",
    "PubMed ID",
  ];

  const csvRows = [headers.join(",")];

  data.forEach((dataset) => {
    const row = [
      dataset.dataset_id,
      dataset.species,
      dataset.sex,
      dataset.status,
      dataset.disease,
      dataset.brain_region,
      dataset.stage,
      dataset.age,
      dataset.public_dataset_id,
      dataset.n_cells,
      dataset.data_type,
      dataset.pubmed_id,
    ]
      .map((field) => `"${field || ""}"`)
      .join(",");

    csvRows.push(row);
  });

  return csvRows.join("\n");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

// Load data on component mount
onMounted(() => {
  loadDatasets();
});
</script>

<style scoped>
.data-table {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 120px;
}

.clear-filters-btn {
  background: #666;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.clear-filters-btn:hover {
  background: #555;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.results-info {
  color: #666;
  font-size: 0.8rem;
}

.export-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.export-btn:hover {
  background: #3aa876;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
}

th.sortable {
  position: relative;
}

.sort-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.status-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.healthy {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.disease {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

button {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn {
  background: #42b983;
  color: white;
}

.download-btn {
  background: #666;
  color: white;
}

button:hover {
  opacity: 0.9;
}

.publication-link {
  color: #42b983;
  text-decoration: none;
}

.publication-link:hover {
  text-decoration: underline;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 1rem;
  padding-top: 1rem;
}

.tab {
  background: #f2f2f2;
  color: #333;
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 12px 28px;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, font-weight 0.2s;
  outline: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab.active {
  background: #fff;
  color: #42b983;
  font-weight: bold;
  text-decoration: underline;
  box-shadow: 0 -2px 8px rgba(66, 185, 131, 0.08);
}

.tab:not(.active):hover {
  background: #e0e0e0;
  color: #42b983;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
}

.pagination select {
  margin-left: 0.5rem;
  padding: 0.2rem 0.5rem;
}

.pagination button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dataset-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.modal-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.dataset-details {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item .label {
  font-weight: bold;
  color: #666;
  min-width: 120px;
}

.detail-item .value {
  text-align: right;
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.modal-actions .close-btn {
  background: #666;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
