<template>
  <div class="functions">
    <h1>Analysis Functions</h1>
    
    <div class="function-categories">
      <!-- Foundation Model Analysis Category (Demo) - moved to top -->
      <div class="category">
        <h2>Foundation Model Analysis <span style="font-size:0.8em;color:#42b983;">(OmiCLIP/Loki)</span></h2>
        <p style="color:#666;margin-bottom:1rem;">
          Demo: Explore OmiCLIP's capabilities to bridge histopathology and spatial transcriptomics.<br>
          <a href="https://www.nature.com/articles/s41592-025-02707-1" target="_blank" style="color:#42b983;">Learn more</a>
        </p>
        <div class="function-grid">
          <div class="function-card">
            <h3>Tissue Alignment</h3>
            <p>Align H&E images with spatial transcriptomics data</p>
            <button @click="startAnalysis('foundation-tissue-alignment')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Cell-Type Decomposition</h3>
            <p>Decompose cell types from H&E images</p>
            <button @click="startAnalysis('foundation-cell-decomposition')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Image–Transcriptomics Retrieval</h3>
            <p>Retrieve transcriptomics from images or vice versa</p>
            <button @click="startAnalysis('foundation-retrieval')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Gene Expression Prediction</h3>
            <p>Predict spatial gene expression from H&E images</p>
            <button @click="startAnalysis('foundation-gene-prediction')">Start Analysis</button>
          </div>
        </div>
      </div>

      <div class="category">
        <h2>Differential Expression Analysis</h2>
        <div class="function-grid">
          <div class="function-card">
            <h3>Cell Type Comparison</h3>
            <p>Compare gene expression between different cell types</p>
            <button @click="startAnalysis('cell-type')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Condition Comparison</h3>
            <p>Compare gene expression between different conditions</p>
            <button @click="startAnalysis('condition')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Time Series Analysis</h3>
            <p>Analyze gene expression changes over time</p>
            <button @click="startAnalysis('time-series')">Start Analysis</button>
          </div>
        </div>
      </div>

      <div class="category">
        <h2>Pathway Analysis</h2>
        <div class="function-grid">
          <div class="function-card">
            <h3>GO Enrichment</h3>
            <p>Gene Ontology enrichment analysis</p>
            <button @click="startAnalysis('go')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>KEGG Pathways</h3>
            <p>KEGG pathway enrichment analysis</p>
            <button @click="startAnalysis('kegg')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Reactome</h3>
            <p>Reactome pathway analysis</p>
            <button @click="startAnalysis('reactome')">Start Analysis</button>
          </div>
        </div>
      </div>

      <div class="category">
        <h2>Cell Type Analysis</h2>
        <div class="function-grid">
          <div class="function-card">
            <h3>Cell Type Classification</h3>
            <p>Classify cells using reference datasets</p>
            <button @click="startAnalysis('classification')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Cell Type Markers</h3>
            <p>Identify cell type-specific markers</p>
            <button @click="startAnalysis('markers')">Start Analysis</button>
          </div>
          <div class="function-card">
            <h3>Cell Type Proportions</h3>
            <p>Analyze cell type proportions across conditions</p>
            <button @click="startAnalysis('proportions')">Start Analysis</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAnalysisModal" class="analysis-modal">
      <div class="modal-content">
        <h2>{{ currentAnalysis.title }}</h2>
        <div class="analysis-form">
          <div class="form-group">
            <label>Select Dataset</label>
            <select v-model="analysisParams.dataset">
              <option value="dataset1">Human Brain Atlas</option>
              <option value="dataset2">Mouse Brain Atlas</option>
              <option value="dataset3">Rat Brain Atlas</option>
            </select>
          </div>
          <div class="form-group">
            <label>Select Cell Types</label>
            <select v-model="analysisParams.cellTypes" multiple>
              <option value="neurons">Neurons</option>
              <option value="glia">Glia</option>
              <option value="endothelial">Endothelial</option>
            </select>
          </div>
          <div class="form-group">
            <label>Parameters</label>
            <div class="parameter-inputs">
              <input 
                type="number" 
                v-model="analysisParams.pValue" 
                placeholder="P-value threshold"
              >
              <input 
                type="number" 
                v-model="analysisParams.foldChange" 
                placeholder="Fold change threshold"
              >
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="runAnalysis" class="primary">Run Analysis</button>
          <button @click="closeModal" class="secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showAnalysisModal = ref(false)
const currentAnalysis = ref({
  type: '',
  title: ''
})
const analysisParams = ref({
  dataset: '',
  cellTypes: [],
  pValue: 0.05,
  foldChange: 1.5
})

const startAnalysis = (type) => {
  currentAnalysis.value = {
    type,
    title: getAnalysisTitle(type)
  }
  showAnalysisModal.value = true
}

const getAnalysisTitle = (type) => {
  const titles = {
    'cell-type': 'Cell Type Comparison Analysis',
    'condition': 'Condition Comparison Analysis',
    'time-series': 'Time Series Analysis',
    'go': 'GO Enrichment Analysis',
    'kegg': 'KEGG Pathway Analysis',
    'reactome': 'Reactome Analysis',
    'classification': 'Cell Type Classification',
    'markers': 'Cell Type Markers Analysis',
    'proportions': 'Cell Type Proportions Analysis',
    'foundation-tissue-alignment': 'Foundation Model: Tissue Alignment (Demo)',
    'foundation-cell-decomposition': 'Foundation Model: Cell-Type Decomposition (Demo)',
    'foundation-retrieval': 'Foundation Model: Image–Transcriptomics Retrieval (Demo)',
    'foundation-gene-prediction': 'Foundation Model: Gene Expression Prediction (Demo)'
  }
  return titles[type] || 'Analysis'
}

const runAnalysis = () => {
  // Implement analysis logic
  console.log('Running analysis:', {
    type: currentAnalysis.value.type,
    params: analysisParams.value
  })
  closeModal()
}

const closeModal = () => {
  showAnalysisModal.value = false
  currentAnalysis.value = { type: '', title: '' }
  analysisParams.value = {
    dataset: '',
    cellTypes: [],
    pValue: 0.05,
    foldChange: 1.5
  }
}
</script>

<style scoped>
.functions {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.category {
  margin-bottom: 3rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.function-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.function-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.function-card p {
  color: #666;
  margin-bottom: 1rem;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background: #3aa876;
}

.analysis-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}

.analysis-form {
  margin: 1.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.parameter-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions button.primary {
  background: #42b983;
}

.modal-actions button.secondary {
  background: #666;
}

.modal-actions button:hover {
  opacity: 0.9;
}
</style> 