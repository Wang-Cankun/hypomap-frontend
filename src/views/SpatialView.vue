<template>
  <div class="spatial">
    <div class="controls">
      <div class="dataset-selector">
        <select v-model="selectedDataset" @change="handleDatasetChange">
          <option value="">Select Dataset</option>
          <option value="dataset1">Human Brain Spatial Atlas</option>
          <option value="dataset2">Mouse Brain Spatial Atlas</option>
          <option value="dataset3">Rat Brain Spatial Atlas</option>
        </select>
      </div>
      <div class="view-controls">
        <button 
          v-for="view in viewOptions" 
          :key="view.id"
          :class="{ active: selectedView === view.id }"
          @click="selectView(view.id)"
        >
          {{ view.name }}
        </button>
      </div>
    </div>

    <div class="visualization-container">
      <div class="main-view">
        <div class="spatial-plot">
          <div class="plot-placeholder">
            <h3>Spatial Visualization</h3>
            <p>Interactive spatial visualization will be displayed here</p>
          </div>
        </div>
        <div class="plot-controls">
          <div class="control-group">
            <label>Zoom Level</label>
            <input 
              type="range" 
              v-model="zoomLevel" 
              min="1" 
              max="10" 
              step="0.1"
            >
          </div>
          <div class="control-group">
            <label>Opacity</label>
            <input 
              type="range" 
              v-model="opacity" 
              min="0" 
              max="1" 
              step="0.1"
            >
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="panel-section">
          <h3>Gene Expression</h3>
          <div class="gene-search">
            <input 
              type="text" 
              v-model="geneQuery" 
              placeholder="Search for a gene..."
              @input="handleGeneSearch"
            >
          </div>
          <div class="gene-list">
            <div 
              v-for="gene in selectedGenes" 
              :key="gene.id"
              class="gene-item"
            >
              <span class="gene-name">{{ gene.name }}</span>
              <button @click="removeGene(gene)" class="remove-btn">&times;</button>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>Cell Types</h3>
          <div class="cell-type-list">
            <div 
              v-for="cellType in cellTypes" 
              :key="cellType.id"
              class="cell-type-item"
            >
              <input 
                type="checkbox" 
                :id="cellType.id"
                v-model="cellType.selected"
                @change="handleCellTypeChange"
              >
              <label :for="cellType.id">{{ cellType.name }}</label>
              <span class="cell-count">({{ cellType.count }})</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Total Spots</span>
              <span class="stat-value">{{ totalSpots.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Expressed Genes</span>
              <span class="stat-value">{{ expressedGenes.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cell Types</span>
              <span class="stat-value">{{ cellTypes.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analysis-panel">
      <h3>Analysis Tools</h3>
      <div class="tool-grid">
        <div class="tool-card">
          <h4>Differential Expression</h4>
          <p>Compare gene expression between regions</p>
          <button @click="startAnalysis('differential')">Run Analysis</button>
        </div>
        <div class="tool-card">
          <h4>Cell Type Proportions</h4>
          <p>Analyze cell type distribution</p>
          <button @click="startAnalysis('proportions')">Run Analysis</button>
        </div>
        <div class="tool-card">
          <h4>Spatial Clustering</h4>
          <p>Identify spatial patterns</p>
          <button @click="startAnalysis('clustering')">Run Analysis</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedDataset = ref('')
const selectedView = ref('spatial')
const zoomLevel = ref(1)
const opacity = ref(1)
const geneQuery = ref('')
const selectedGenes = ref([])
const totalSpots = ref(10000)
const expressedGenes = ref(20000)

const viewOptions = [
  { id: 'spatial', name: 'Spatial View' },
  { id: 'heatmap', name: 'Heatmap' },
  { id: 'violin', name: 'Violin Plot' }
]

const cellTypes = ref([
  { id: 'neurons', name: 'Neurons', count: 5000, selected: true },
  { id: 'glia', name: 'Glia', count: 3000, selected: true },
  { id: 'endothelial', name: 'Endothelial', count: 1000, selected: true },
  { id: 'immune', name: 'Immune Cells', count: 1000, selected: true }
])

const handleDatasetChange = () => {
  // Implement dataset change logic
  console.log('Selected dataset:', selectedDataset.value)
}

const selectView = (viewId) => {
  selectedView.value = viewId
}

const handleGeneSearch = () => {
  // Implement gene search logic
  console.log('Searching for gene:', geneQuery.value)
}

const removeGene = (gene) => {
  selectedGenes.value = selectedGenes.value.filter(g => g.id !== gene.id)
}

const handleCellTypeChange = () => {
  // Implement cell type change logic
  console.log('Cell types changed:', cellTypes.value)
}

const startAnalysis = (type) => {
  // Implement analysis logic
  console.log('Starting analysis:', type)
}
</script>

<style scoped>
.spatial {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dataset-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 200px;
}

.view-controls {
  display: flex;
  gap: 1rem;
}

.view-controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.view-controls button.active {
  background: #42b983;
  color: white;
}

.visualization-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.main-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.spatial-plot {
  height: 600px;
  position: relative;
}

.plot-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.plot-controls {
  padding: 1rem;
  border-top: 1px solid #eee;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.control-group input[type="range"] {
  width: 100%;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.panel-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.gene-search input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.gene-list {
  max-height: 200px;
  overflow-y: auto;
}

.gene-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.remove-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
}

.cell-type-list {
  max-height: 200px;
  overflow-y: auto;
}

.cell-type-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.cell-type-item label {
  margin-left: 0.5rem;
  flex-grow: 1;
}

.cell-count {
  color: #666;
  font-size: 0.875rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.analysis-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.tool-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.tool-card h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.tool-card p {
  color: #666;
  margin-bottom: 1rem;
}

.tool-card button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tool-card button:hover {
  background: #3aa876;
}
</style> 