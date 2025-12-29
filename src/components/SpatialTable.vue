<template>
  <div class="spatial-table-container">
    <!-- Tabs for switching between datasets and papers -->
    <div class="subtabs">
      <button
        :class="['subtab', { active: activeTab === 'datasets' }]"
        @click="activeTab = 'datasets'"
      >
<AppIcon name="chart" size="sm" class="inline-block" /> Datasets
      </button>
      <button
        :class="['subtab', { active: activeTab === 'papers' }]"
        @click="activeTab = 'papers'"
      >
<AppIcon name="document" size="sm" class="inline-block" /> Papers
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading spatial data..." />

    <!-- Error State -->
    <ErrorMessage v-if="error" :error="error" :retry="loadData" />

    <!-- Datasets Tab -->
    <div v-if="!loading && !error && activeTab === 'datasets'">
      <div class="table-header">
        <div class="results-info">
          Showing {{ filteredSpatialDatasets.length }} of
          {{ spatialDatasets.length }} datasets
        </div>
        <div class="table-actions">
          <button @click="exportDatasets" class="export-btn">Export CSV</button>
        </div>
      </div>

      <table v-if="filteredSpatialDatasets.length > 0">
        <thead>
          <tr>
            <th @click="sortBy('data_id')" class="sortable">
              Data ID
              <span v-if="sortColumn === 'data_id'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('disease')" class="sortable">
              Disease
              <span v-if="sortColumn === 'disease'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('species')" class="sortable">
              Species
              <span v-if="sortColumn === 'species'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('brain_region')" class="sortable">
              Brain Region
              <span v-if="sortColumn === 'brain_region'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('methodology')" class="sortable">
              Methodology
              <span v-if="sortColumn === 'methodology'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('n_cells')" class="sortable">
              Cells
              <span v-if="sortColumn === 'n_cells'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th>Public ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dataset in paginatedDatasets" :key="dataset.id">
            <td>{{ dataset.data_id }}</td>
            <td>{{ dataset.disease }}</td>
            <td>{{ dataset.species }}</td>
            <td>{{ dataset.brain_region }}</td>
            <td>{{ dataset.methodology }}</td>
            <td>{{ dataset.n_cells?.toLocaleString() || "N/A" }}</td>
            <td>{{ dataset.public_dataset_id }}</td>
            <td>
              <div class="action-buttons">
                <button @click="viewDataset(dataset)" class="view-btn">
                  View
                </button>
                <button @click="downloadDataset(dataset)" class="download-btn">
                  Download
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="no-data">
        <p>No spatial datasets found.</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredSpatialDatasets.length > 0" class="pagination">
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
          {{
            Math.min(currentPage * rowsPerPage, filteredSpatialDatasets.length)
          }}
          of {{ filteredSpatialDatasets.length }}
        </span>
        <button :disabled="currentPage === 1" @click="currentPage--">
          &lt;
        </button>
        <button
          :disabled="
            currentPage * rowsPerPage >= filteredSpatialDatasets.length
          "
          @click="currentPage++"
        >
          &gt;
        </button>
      </div>
    </div>

    <!-- Papers Tab -->
    <div v-if="!loading && !error && activeTab === 'papers'">
      <div class="table-header">
        <div class="results-info">
          Showing {{ filteredSpatialPapers.length }} of
          {{ spatialPapers.length }} papers
        </div>
        <div class="table-actions">
          <button @click="exportPapers" class="export-btn">Export CSV</button>
        </div>
      </div>

      <table v-if="filteredSpatialPapers.length > 0">
        <thead>
          <tr>
            <th @click="sortBy('data_id')" class="sortable">
              Data ID
              <span v-if="sortColumn === 'data_id'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('title')" class="sortable">
              Title
              <span v-if="sortColumn === 'title'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('disease')" class="sortable">
              Disease
              <span v-if="sortColumn === 'disease'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('species')" class="sortable">
              Species
              <span v-if="sortColumn === 'species'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('methodology')" class="sortable">
              Methodology
              <span v-if="sortColumn === 'methodology'" class="sort-arrow">
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th>PubMed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="paper in paginatedPapers" :key="paper.id">
            <td>{{ paper.data_id }}</td>
            <td class="title-cell">{{ paper.title }}</td>
            <td>{{ paper.disease }}</td>
            <td>{{ paper.species }}</td>
            <td>{{ paper.methodology }}</td>
            <td>
              <a
                v-if="paper.pmid"
                :href="`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`"
                target="_blank"
                class="pubmed-icon"
                title="View on PubMed"
              >
<AppIcon name="microscope" size="md" class="text-primary-600" />
              </a>
              <span v-else>N/A</span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewPaper(paper)" class="view-btn">View</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="no-data">
        <p>No spatial papers found.</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredSpatialPapers.length > 0" class="pagination">
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
          {{
            Math.min(currentPage * rowsPerPage, filteredSpatialPapers.length)
          }}
          of {{ filteredSpatialPapers.length }}
        </span>
        <button :disabled="currentPage === 1" @click="currentPage--">
          &lt;
        </button>
        <button
          :disabled="currentPage * rowsPerPage >= filteredSpatialPapers.length"
          @click="currentPage++"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSpatialData } from "@/composables/useSpatialData";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

const activeTab = ref("datasets");
const sortColumn = ref("");
const sortDirection = ref("asc");
const rowsPerPage = ref(25);
const currentPage = ref(1);

const {
  spatialDatasets,
  spatialPapers,
  loading,
  error,
  filteredSpatialDatasets,
  filteredSpatialPapers,
  loadSpatialDatasets,
  loadSpatialPapers,
} = useSpatialData();

// Computed properties for pagination
const paginatedDatasets = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredSpatialDatasets.value.slice(start, end);
});

const paginatedPapers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredSpatialPapers.value.slice(start, end);
});

// Methods
const loadData = async () => {
  if (activeTab.value === "datasets") {
    await loadSpatialDatasets();
  } else {
    await loadSpatialPapers();
  }
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
  alert(`Viewing spatial dataset: ${dataset.data_id}`);
};

const downloadDataset = (dataset) => {
  alert(`Downloading spatial dataset: ${dataset.data_id}`);
};

const viewPaper = (paper) => {
  alert(`Viewing paper: ${paper.title}`);
};

const exportDatasets = () => {
  const csvContent = generateCSV(filteredSpatialDatasets.value, [
    "data_id",
    "disease",
    "species",
    "brain_region",
    "methodology",
    "n_cells",
    "public_dataset_id",
  ]);
  downloadCSV(csvContent, "spatial_datasets.csv");
};

const exportPapers = () => {
  const csvContent = generateCSV(filteredSpatialPapers.value, [
    "data_id",
    "title",
    "disease",
    "species",
    "methodology",
    "pmid",
  ]);
  downloadCSV(csvContent, "spatial_papers.csv");
};

const generateCSV = (data, fields) => {
  const headers = fields.map(
    (f) => f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ")
  );
  const csvRows = [headers.join(",")];

  data.forEach((item) => {
    const row = fields.map((field) => `"${item[field] || ""}"`).join(",");
    csvRows.push(row);
  });

  return csvRows.join("\n");
};

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Load data on mount
onMounted(async () => {
  await loadSpatialDatasets();
  await loadSpatialPapers();
});
</script>

<style scoped>
.spatial-table-container {
  width: 100%;
}

.subtabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0;
}

.subtab {
  background: #e8e8e8;
  color: #555;
  border: none;
  border-radius: 6px 6px 0 0;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, font-weight 0.2s;
  outline: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtab.active {
  background: #f8f9fa;
  color: #42b983;
  font-weight: bold;
  box-shadow: 0 -2px 8px rgba(66, 185, 131, 0.1);
}

.subtab:not(.active):hover {
  background: #d8d8d8;
  color: #42b983;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px 4px 0 0;
}

.results-info {
  color: #666;
  font-size: 0.9rem;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.export-btn:hover {
  background: #3aa876;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
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
  user-select: none;
}

th.sortable:hover {
  background: #e9ecef;
}

.sort-arrow {
  margin-left: 0.5rem;
  font-size: 0.8rem;
}

.title-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pubmed-icon {
  font-size: 1.2rem;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.pubmed-icon:hover {
  transform: scale(1.2);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

button {
  padding: 0.4rem 0.8rem;
  min-width: 70px;
  font-size: 0.9rem;
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

.no-data {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0 0 4px 4px;
}

.pagination select {
  margin-left: 0.5rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination button {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 1rem;
  min-width: auto;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background: #f8f9fa;
}
</style>
