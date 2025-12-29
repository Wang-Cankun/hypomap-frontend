<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9120/hypomap-backend/api/v1';

// Upload state
const currentStep = ref(1);
const isUploading = ref(false);
const uploadProgress = ref(0);
const error = ref(null);

// File references
const h5adFile = ref(null);
const regulonFiles = ref([]);
const cellchatFile = ref(null);

// Dataset info
const datasetId = ref('');
const datasetInfo = ref(null);

const steps = [
  { id: 1, name: 'H5AD File', description: 'Upload your main dataset' },
  { id: 2, name: 'Regulon Data', description: 'Optional TF-target networks' },
  { id: 3, name: 'CellChat Data', description: 'Optional cell-cell communication' },
  { id: 4, name: 'Review', description: 'Review and start analysis' }
];

const canProceed = computed(() => {
  if (currentStep.value === 1) return h5adFile.value !== null;
  if (currentStep.value === 4) return datasetId.value !== '';
  return true;
});

// File handlers
const onH5adSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.h5ad')) {
    h5adFile.value = file;
    datasetId.value = file.name.replace('.h5ad', '');
    error.value = null;
  } else {
    error.value = 'Please select a valid .h5ad file';
  }
};

const onRegulonSelect = (event) => {
  regulonFiles.value = Array.from(event.target.files).filter(f => f.name.endsWith('.csv'));
};

const onCellchatSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.csv')) {
    cellchatFile.value = file;
  }
};

// Upload functions
const uploadH5ad = async () => {
  if (!h5adFile.value) return;

  isUploading.value = true;
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('file', h5adFile.value);
  formData.append('dataset_id', datasetId.value);

  try {
    const response = await fetch(`${API_BASE_URL}/upload/h5ad`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');

    const result = await response.json();
    datasetId.value = result.dataset_id;
    uploadProgress.value = 100;

    // Start preprocessing
    await fetch(`${API_BASE_URL}/upload/preprocess/${datasetId.value}`, {
      method: 'POST'
    });

    currentStep.value = 2;
  } catch (err) {
    error.value = err.message;
  } finally {
    isUploading.value = false;
  }
};

const uploadRegulonFiles = async () => {
  if (regulonFiles.value.length === 0) {
    currentStep.value = 3;
    return;
  }

  isUploading.value = true;

  for (const file of regulonFiles.value) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch(`${API_BASE_URL}/upload/regulon/${datasetId.value}`, {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.error('Error uploading regulon file:', err);
    }
  }

  isUploading.value = false;
  currentStep.value = 3;
};

const uploadCellchat = async () => {
  if (!cellchatFile.value) {
    currentStep.value = 4;
    return;
  }

  isUploading.value = true;

  const formData = new FormData();
  formData.append('file', cellchatFile.value);

  try {
    await fetch(`${API_BASE_URL}/upload/cellchat/${datasetId.value}`, {
      method: 'POST',
      body: formData
    });
  } catch (err) {
    console.error('Error uploading CellChat file:', err);
  }

  isUploading.value = false;
  currentStep.value = 4;
};

const goToAnalysis = () => {
  router.push(`/analysis/${datasetId.value}`);
};

const nextStep = () => {
  if (currentStep.value === 1) {
    uploadH5ad();
  } else if (currentStep.value === 2) {
    uploadRegulonFiles();
  } else if (currentStep.value === 3) {
    uploadCellchat();
  } else if (currentStep.value === 4) {
    goToAnalysis();
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};
</script>

<template>
  <div class="upload-view">
    <div class="upload-container">
      <h1 class="upload-title">Upload Dataset</h1>
      <p class="upload-subtitle">Upload your single-cell RNA-seq data for analysis</p>

      <!-- Progress Steps -->
      <div class="steps-container">
        <div
          v-for="step in steps"
          :key="step.id"
          :class="['step', { active: currentStep === step.id, completed: currentStep > step.id }]"
        >
          <div class="step-number">{{ step.id }}</div>
          <div class="step-info">
            <div class="step-name">{{ step.name }}</div>
            <div class="step-desc">{{ step.description }}</div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Step 1: H5AD Upload -->
        <div v-if="currentStep === 1" class="upload-area">
          <div class="dropzone" @click="$refs.h5adInput.click()">
            <input
              ref="h5adInput"
              type="file"
              accept=".h5ad"
              @change="onH5adSelect"
              hidden
            />
            <div class="dropzone-icon">📁</div>
            <p class="dropzone-text">
              {{ h5adFile ? h5adFile.name : 'Click to select .h5ad file' }}
            </p>
            <p class="dropzone-hint">or drag and drop</p>
          </div>

          <div v-if="h5adFile" class="file-info">
            <p><strong>File:</strong> {{ h5adFile.name }}</p>
            <p><strong>Size:</strong> {{ (h5adFile.size / 1024 / 1024).toFixed(2) }} MB</p>
            <div class="dataset-id-input">
              <label>Dataset ID:</label>
              <input v-model="datasetId" type="text" placeholder="Enter dataset ID" />
            </div>
          </div>
        </div>

        <!-- Step 2: Regulon Files -->
        <div v-if="currentStep === 2" class="upload-area">
          <div class="dropzone" @click="$refs.regulonInput.click()">
            <input
              ref="regulonInput"
              type="file"
              accept=".csv"
              multiple
              @change="onRegulonSelect"
              hidden
            />
            <div class="dropzone-icon">🔗</div>
            <p class="dropzone-text">Upload Regulon CSV files (optional)</p>
            <p class="dropzone-hint">TF-target network files per cluster</p>
          </div>

          <div v-if="regulonFiles.length > 0" class="file-list">
            <p><strong>Selected files:</strong></p>
            <ul>
              <li v-for="file in regulonFiles" :key="file.name">{{ file.name }}</li>
            </ul>
          </div>
        </div>

        <!-- Step 3: CellChat -->
        <div v-if="currentStep === 3" class="upload-area">
          <div class="dropzone" @click="$refs.cellchatInput.click()">
            <input
              ref="cellchatInput"
              type="file"
              accept=".csv"
              @change="onCellchatSelect"
              hidden
            />
            <div class="dropzone-icon">💬</div>
            <p class="dropzone-text">Upload CellChat communications.csv (optional)</p>
            <p class="dropzone-hint">Cell-cell communication data</p>
          </div>

          <div v-if="cellchatFile" class="file-info">
            <p><strong>File:</strong> {{ cellchatFile.name }}</p>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="currentStep === 4" class="review-area">
          <h3>Review Your Upload</h3>
          <div class="review-item">
            <span class="review-label">Dataset ID:</span>
            <span class="review-value">{{ datasetId }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">H5AD File:</span>
            <span class="review-value">{{ h5adFile?.name || 'Not uploaded' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Regulon Files:</span>
            <span class="review-value">{{ regulonFiles.length }} files</span>
          </div>
          <div class="review-item">
            <span class="review-label">CellChat:</span>
            <span class="review-value">{{ cellchatFile?.name || 'Not uploaded' }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="nav-buttons">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="btn btn-secondary"
          :disabled="isUploading"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="btn btn-primary"
          :disabled="!canProceed || isUploading"
        >
          {{ isUploading ? 'Uploading...' : currentStep === 4 ? 'Start Analysis' : 'Next' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-view {
  @apply min-h-screen bg-gray-50 py-12;
}

.upload-container {
  @apply max-w-3xl mx-auto px-6;
}

.upload-title {
  @apply text-3xl font-bold text-gray-900 text-center;
}

.upload-subtitle {
  @apply text-gray-600 text-center mt-2 mb-8;
}

.steps-container {
  @apply flex justify-between mb-8;
}

.step {
  @apply flex items-center gap-3 flex-1;
}

.step-number {
  @apply w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold;
}

.step.active .step-number {
  @apply bg-primary-600 text-white;
}

.step.completed .step-number {
  @apply bg-green-500 text-white;
}

.step-info {
  @apply hidden md:block;
}

.step-name {
  @apply font-medium text-gray-900;
}

.step-desc {
  @apply text-sm text-gray-500;
}

.error-message {
  @apply bg-red-50 text-red-700 p-4 rounded-lg mb-6;
}

.step-content {
  @apply bg-white rounded-xl shadow-lg p-8 mb-6;
}

.upload-area {
  @apply space-y-6;
}

.dropzone {
  @apply border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 transition-colors;
}

.dropzone-icon {
  @apply text-5xl mb-4;
}

.dropzone-text {
  @apply text-lg font-medium text-gray-700;
}

.dropzone-hint {
  @apply text-sm text-gray-500 mt-1;
}

.file-info {
  @apply bg-gray-50 rounded-lg p-4;
}

.dataset-id-input {
  @apply mt-4 flex items-center gap-4;
}

.dataset-id-input label {
  @apply font-medium text-gray-700;
}

.dataset-id-input input {
  @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500;
}

.file-list {
  @apply bg-gray-50 rounded-lg p-4;
}

.file-list ul {
  @apply list-disc list-inside mt-2 text-gray-600;
}

.review-area {
  @apply space-y-4;
}

.review-area h3 {
  @apply text-xl font-semibold text-gray-900 mb-6;
}

.review-item {
  @apply flex justify-between py-3 border-b border-gray-100;
}

.review-label {
  @apply font-medium text-gray-600;
}

.review-value {
  @apply text-gray-900;
}

.nav-buttons {
  @apply flex justify-between;
}

.btn {
  @apply px-6 py-3 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}
</style>
