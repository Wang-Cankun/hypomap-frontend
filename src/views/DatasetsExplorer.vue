<template>
  <div
    class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 p-4"
  >
    <!-- Glossary Modal -->
    <div
      v-if="showGlossary"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="showGlossary = false"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-secondary-50"
        >
          <h3 class="text-2xl font-bold text-secondary-900 flex items-center">
            <svg
              class="w-6 h-6 mr-3 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Terms and Column Explanations
          </h3>
          <button
            @click="showGlossary = false"
            class="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 transition-all duration-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              class="bg-gradient-to-br from-white to-secondary-50 border border-secondary-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <span class="text-2xl mr-2">🆔</span>
                Dataset ID
              </div>
              <div class="text-secondary-700 leading-relaxed">
                Stable identifier for a dataset in ssKIND (e.g., AD001,
                ST024001). Use this to reference or share a specific dataset.
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-red-50 border border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <span class="text-2xl mr-2">🧠</span>
                Disease
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-red-700">Disease abbreviations:</strong
                ><br />
                • <strong class="text-red-600">AD</strong> - Alzheimer's
                Disease: Neurodegenerative disorder characterized by amyloid
                plaques and tau tangles<br />
                • <strong class="text-red-600">PD</strong> - Parkinson's
                Disease: Movement disorder caused by dopaminergic neuron loss<br />
                • <strong class="text-red-600">ALS</strong> - Amyotrophic
                Lateral Sclerosis: Motor neuron disease affecting voluntary
                muscle control<br />
                • <strong class="text-red-600">HD</strong> - Huntington's
                Disease: Genetic disorder causing progressive brain cell
                death<br />
                • <strong class="text-red-600">MS</strong> - Multiple Sclerosis:
                Autoimmune disease affecting myelin sheath<br />
                • <strong class="text-red-600">FTD</strong> - Frontotemporal
                Dementia: Progressive brain disorder affecting personality and
                behavior
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-green-50 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <span class="text-2xl mr-2">🐭</span>
                Species
              </div>
              <div class="text-secondary-700 leading-relaxed">
                Source organism of the sample (e.g., human, mouse). Mixed values
                may indicate multi-species studies.
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <span class="text-2xl mr-2">🧩</span>
                Tissue / Brain Region
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-purple-700"
                  >Brain region abbreviations:</strong
                ><br />
                • <strong class="text-purple-600">DLPFC</strong> - Dorsolateral
                Prefrontal Cortex: Executive function and working memory<br />
                • <strong class="text-purple-600">Hippocampus</strong> - Memory
                formation and spatial navigation<br />
                • <strong class="text-purple-600">SN</strong> - Substantia
                Nigra: Dopamine production, affected in Parkinson's<br />
                • <strong class="text-purple-600">STN</strong> - Subthalamic
                Nucleus: Motor control regulation<br />
                • <strong class="text-purple-600">GPi/GPe</strong> - Globus
                Pallidus (internal/external): Motor pathway regulation<br />
                • <strong class="text-purple-600">ST</strong> - Striatum: Reward
                processing and motor control<br />
                • <strong class="text-purple-600">ACC</strong> - Anterior
                Cingulate Cortex: Emotion and decision-making
              </div>
            </div>
            <div
              v-if="dataType === 'single-cell'"
              class="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <AppIcon name="flask" size="lg" class="mr-2 text-blue-600" />
                Protocol
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-blue-700"
                  >Single-cell sequencing protocols:</strong
                ><br />
                • <strong class="text-blue-600">10x Genomics</strong> -
                Droplet-based scRNA-seq with high throughput (10,000+ cells)<br />
                • <strong class="text-blue-600">Smart-seq2</strong> -
                Full-length transcript sequencing with high sensitivity<br />
                • <strong class="text-blue-600">Drop-seq</strong> - Microfluidic
                droplet-based method for cell barcoding<br />
                • <strong class="text-blue-600">CEL-seq2</strong> - 3' end
                sequencing with unique molecular identifiers (UMIs)<br />
                • <strong class="text-blue-600">SCRB-seq</strong> - Single-cell
                RNA barcoding and sequencing<br />
                • <strong class="text-blue-600">inDrop</strong> - Indexing
                droplets for single-cell RNA sequencing
              </div>
            </div>
            <div
              v-else
              class="bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <AppIcon name="spatial" size="lg" class="mr-2 text-indigo-600" />
                Methodology
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-indigo-700"
                  >Spatial transcriptomics technologies:</strong
                ><br />
                • <strong class="text-indigo-600">10x Visium</strong> -
                Spatially resolved gene expression (55μm spots)<br />
                • <strong class="text-indigo-600">MERFISH</strong> - Multiplexed
                Error-Robust FISH for high-resolution imaging<br />
                • <strong class="text-indigo-600">Xenium</strong> - In situ gene
                expression with subcellular resolution<br />
                • <strong class="text-indigo-600">CosMx</strong> - CosMx Spatial
                Molecular Imager for tissue analysis<br />
                • <strong class="text-indigo-600">Slide-seq</strong> -
                Single-cell resolution spatial transcriptomics<br />
                • <strong class="text-indigo-600">ST</strong> - Spatial
                Transcriptomics: Early spatial gene expression method
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <span class="text-2xl mr-2">🔢</span>
                Cells / Spots
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-orange-700">Cell count metrics:</strong
                ><br />
                • <strong class="text-orange-600">Single-cell:</strong> Number
                of individual cells profiled (typically 1,000-100,000+ cells)<br />
                • <strong class="text-orange-600">Spatial:</strong> Number of
                tissue spots/segments analyzed (typically 1,000-10,000+
                spots)<br />
                • <strong class="text-orange-600">Resolution:</strong> Higher
                cell counts enable better statistical power and rare cell type
                detection<br />
                • <strong class="text-orange-600">Quality:</strong> Cell counts
                may vary based on tissue size, cell density, and sequencing
                depth
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-pink-50 border border-pink-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <AppIcon name="cell" size="lg" class="mr-2 text-pink-600" />
                Status
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-pink-700">Sample status categories:</strong
                ><br />
                •
                <strong class="text-pink-600">Healthy/Control:</strong>
                Non-diseased control samples for comparison<br />
                • <strong class="text-pink-600">Disease:</strong> Pathological
                samples from affected individuals<br />
                • <strong class="text-pink-600">Model:</strong> Animal models
                (e.g., transgenic mice, induced models)<br />
                • <strong class="text-pink-600">Treatment:</strong> Samples from
                therapeutic intervention studies<br />
                • <strong class="text-pink-600">Progression:</strong> Disease
                stage indicators (early, moderate, severe)<br />
                • <strong class="text-pink-600">Post-mortem:</strong> Brain
                tissue from deceased donors (post-mortem interval important)
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-teal-50 border border-teal-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <span class="text-2xl mr-2">📅</span>
                Age / Stage
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-teal-700"
                  >Temporal and developmental information:</strong
                ><br />
                •
                <strong class="text-teal-600">Chronological Age:</strong> Actual
                age in years (human) or weeks/months (animal models)<br />
                •
                <strong class="text-teal-600">Developmental Stage:</strong>
                Embryonic (E), Postnatal (P), Adult stages<br />
                • <strong class="text-teal-600">Disease Stage:</strong> Clinical
                progression (Braak stages for AD, Hoehn & Yahr for PD)<br />
                •
                <strong class="text-teal-600">Time Points:</strong> Longitudinal
                study time points (baseline, follow-up)<br />
                •
                <strong class="text-teal-600"
                  >Post-mortem Interval (PMI):</strong
                >
                Time between death and tissue collection (affects RNA quality)
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-cyan-50 border border-cyan-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <AppIcon name="microscope" size="lg" class="mr-2 text-cyan-600" />
                PubMed
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-cyan-700">Publication references:</strong
                ><br />
                • <strong class="text-cyan-600">PMID:</strong> PubMed Identifier
                - unique number for each publication<br />
                • <strong class="text-cyan-600">Primary Source:</strong> First
                author's publication describing the dataset<br />
                • <strong class="text-cyan-600">Multiple IDs:</strong> Some
                datasets span multiple publications<br />
                • <strong class="text-cyan-600">Open Access:</strong> Many
                papers are freely available through PubMed Central<br />
                • <strong class="text-cyan-600">Citation:</strong> Use PMIDs for
                proper academic citation and reference management
              </div>
            </div>
            <div
              class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                class="text-lg font-bold text-secondary-900 mb-3 flex items-center"
              >
                <AppIcon name="datasets" size="lg" class="mr-2 text-gray-600" />
                Public ID
              </div>
              <div class="text-secondary-700 leading-relaxed">
                <strong class="text-gray-700"
                  >Public database accessions:</strong
                ><br />
                • <strong class="text-gray-600">GEO</strong> - Gene Expression
                Omnibus: NCBI's repository for gene expression data<br />
                • <strong class="text-gray-600">SRA</strong> - Sequence Read
                Archive: Raw sequencing data storage<br />
                • <strong class="text-gray-600">GSE</strong> - GEO Series:
                Complete study with multiple samples<br />
                • <strong class="text-gray-600">GSM</strong> - GEO Sample:
                Individual sample within a series<br />
                • <strong class="text-gray-600">GPL</strong> - GEO Platform:
                Technology/methodology used<br />
                • <strong class="text-gray-600">Data Access:</strong> Use these
                IDs to download raw FASTQ files or processed matrices
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="max-w-none mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 px-6"
    >
      <aside
        class="bg-white/95 backdrop-blur-sm border border-secondary-200 rounded-2xl p-4 shadow-lg sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto"
      >
        <!-- Data Type Switcher -->
        <div class="bg-secondary-100 p-1 rounded-xl mb-4 flex gap-1">
          <button
            :class="[
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2',
              dataType === 'single-cell'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-secondary-600 hover:text-primary-600 hover:bg-white/50',
            ]"
            @click="switchDataType('single-cell')"
          >
            <AppIcon name="dna" size="md" />
            Single Cell
          </button>
          <button
            :class="[
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2',
              dataType === 'spatial'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-secondary-600 hover:text-primary-600 hover:bg-white/50',
            ]"
            @click="switchDataType('spatial')"
          >
            <AppIcon name="spatial" size="md" />
            Spatial
          </button>
        </div>

        <div
          class="flex justify-between items-center mb-4 pb-3 border-b border-secondary-200"
        >
          <h2 class="text-xl font-bold text-secondary-900 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              ></path>
            </svg>
            Filters
          </h2>
          <div class="flex gap-2">
            <button
              @click="toggleAllSections"
              class="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              {{ allCollapsed ? "Show all" : "Hide all" }}
            </button>
            <button
              @click="handleClearAll"
              class="px-3 py-1.5 text-xs font-medium text-secondary-600 bg-secondary-50 border border-secondary-200 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              Clear all
            </button>
          </div>
        </div>

        <div
          v-if="hasActiveNavigation"
          class="bg-gradient-to-r from-accent-100 to-accent-200 border border-accent-300 rounded-xl p-4 mb-6 flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <AppIcon name="search" size="lg" class="text-accent-700" />
            <span class="text-accent-800 font-medium">{{
              navigationMessage
            }}</span>
          </div>
          <button
            @click="resetNavigation"
            class="px-3 py-1.5 bg-accent-500 text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-accent-600 transition-colors duration-200"
          >
            ✕ Reset
          </button>
        </div>

        <div class="mb-4">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search datasets..."
            @input="handleSearch"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 focus:bg-white"
          />
        </div>

        <div class="mb-4">
          <div class="text-sm font-semibold text-secondary-700 mb-2">
            Date range
          </div>
          <div class="flex items-center gap-3">
            <input
              type="date"
              v-model="startDate"
              @change="handleDateChange"
              class="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <span class="text-secondary-500">-</span>
            <input
              type="date"
              v-model="endDate"
              @change="handleDateChange"
              class="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div class="mb-2 pb-2 border-b border-secondary-200">
          <div class="flex justify-between items-center mb-0.5">
            <button
              @click="toggleCollapse('species')"
              class="flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="text-xs">{{ collapsed.species ? "▶" : "▼" }}</span>
              Species
            </button>
            <button
              v-if="
                !collapsed.species &&
                speciesWithCounts.length > defaultVisibleCount
              "
              @click="toggleExpand('species')"
              class="px-2 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded hover:bg-secondary-200 transition-colors duration-200"
            >
              {{ expanded.species ? "Less" : "More" }}
            </button>
          </div>
          <ul v-show="!collapsed.species" class="space-y-0">
            <li v-for="opt in speciesVisible" :key="opt.value">
              <label
                class="flex items-center justify-between gap-2 p-1 border border-secondary-200 rounded-md bg-secondary-50 hover:bg-white hover:border-primary-300 transition-all duration-200 cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': opt.count === 0 }"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isSelected('species', opt.value)"
                    :disabled="opt.count === 0"
                    @change="toggleSelect('species', opt.value, opt.count)"
                    class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-secondary-700">{{
                    opt.value
                  }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-200 rounded-full"
                  >{{ opt.count }}</span
                >
              </label>
            </li>
          </ul>
        </div>

        <div class="mb-2 pb-2 border-b border-secondary-200">
          <div class="flex justify-between items-center mb-0.5">
            <button
              @click="toggleCollapse('disease')"
              class="flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="text-xs">{{ collapsed.disease ? "▶" : "▼" }}</span>
              Disease
            </button>
            <button
              v-if="
                !collapsed.disease &&
                diseasesWithCounts.length > defaultVisibleCount
              "
              @click="toggleExpand('disease')"
              class="px-2 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded hover:bg-secondary-200 transition-colors duration-200"
            >
              {{ expanded.disease ? "Less" : "More" }}
            </button>
          </div>
          <ul v-show="!collapsed.disease" class="space-y-0">
            <li v-for="opt in diseasesVisible" :key="opt.value">
              <label
                class="flex items-center justify-between gap-2 p-1 border border-secondary-200 rounded-md bg-secondary-50 hover:bg-white hover:border-primary-300 transition-all duration-200 cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': opt.count === 0 }"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isSelected('disease', opt.value)"
                    :disabled="opt.count === 0"
                    @change="toggleSelect('disease', opt.value, opt.count)"
                    class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-secondary-700">{{
                    opt.value
                  }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-200 rounded-full"
                  >{{ opt.count }}</span
                >
              </label>
            </li>
          </ul>
        </div>

        <div class="mb-2 pb-2 border-b border-secondary-200">
          <div class="flex justify-between items-center mb-0.5">
            <button
              @click="toggleCollapse('sex')"
              class="flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="text-xs">{{ collapsed.sex ? "▶" : "▼" }}</span>
              Sex
            </button>
            <button
              v-if="
                !collapsed.sex && sexWithCounts.length > defaultVisibleCount
              "
              @click="toggleExpand('sex')"
              class="px-2 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded hover:bg-secondary-200 transition-colors duration-200"
            >
              {{ expanded.sex ? "Less" : "More" }}
            </button>
          </div>
          <ul v-show="!collapsed.sex" class="space-y-0">
            <li v-for="opt in sexVisible" :key="opt.value">
              <label
                class="flex items-center justify-between gap-2 p-1 border border-secondary-200 rounded-md bg-secondary-50 hover:bg-white hover:border-primary-300 transition-all duration-200 cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': opt.count === 0 }"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isSelected('sex', opt.value)"
                    :disabled="opt.count === 0"
                    @change="toggleSelect('sex', opt.value, opt.count)"
                    class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-secondary-700">{{
                    opt.value
                  }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-200 rounded-full"
                  >{{ opt.count }}</span
                >
              </label>
            </li>
          </ul>
        </div>

        <div class="mb-2 pb-2 border-b border-secondary-200">
          <div class="flex justify-between items-center mb-0.5">
            <button
              @click="toggleCollapse('status')"
              class="flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="text-xs">{{ collapsed.status ? "▶" : "▼" }}</span>
              Status
            </button>
            <button
              v-if="
                !collapsed.status &&
                statusWithCounts.length > defaultVisibleCount
              "
              @click="toggleExpand('status')"
              class="px-2 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded hover:bg-secondary-200 transition-colors duration-200"
            >
              {{ expanded.status ? "Less" : "More" }}
            </button>
          </div>
          <ul v-show="!collapsed.status" class="space-y-0">
            <li v-for="opt in statusVisible" :key="opt.value">
              <label
                class="flex items-center justify-between gap-2 p-1 border border-secondary-200 rounded-md bg-secondary-50 hover:bg-white hover:border-primary-300 transition-all duration-200 cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': opt.count === 0 }"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isSelected('status', opt.value)"
                    :disabled="opt.count === 0"
                    @change="toggleSelect('status', opt.value, opt.count)"
                    class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-secondary-700">{{
                    opt.value
                  }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-200 rounded-full"
                  >{{ opt.count }}</span
                >
              </label>
            </li>
          </ul>
        </div>

        <div class="mb-2 pb-2 border-b border-secondary-200">
          <div class="flex justify-between items-center mb-0.5">
            <button
              @click="toggleCollapse('data_type')"
              class="flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="text-xs">{{ collapsed.data_type ? "▶" : "▼" }}</span>
              Protocol
            </button>
            <button
              v-if="
                !collapsed.data_type &&
                technologyWithCounts.length > defaultVisibleCount
              "
              @click="toggleExpand('data_type')"
              class="px-2 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded hover:bg-secondary-200 transition-colors duration-200"
            >
              {{ expanded.data_type ? "Less" : "More" }}
            </button>
          </div>
          <ul v-show="!collapsed.data_type" class="space-y-0">
            <li v-for="opt in technologyVisible" :key="opt.value">
              <label
                class="flex items-center justify-between gap-2 p-1 border border-secondary-200 rounded-md bg-secondary-50 hover:bg-white hover:border-primary-300 transition-all duration-200 cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': opt.count === 0 }"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isSelectedTechnology(opt.value)"
                    :disabled="opt.count === 0"
                    @change="toggleSelectTechnology(opt.value, opt.count)"
                    class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-secondary-700">{{
                    opt.value
                  }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-200 rounded-full"
                  >{{ opt.count }}</span
                >
              </label>
            </li>
          </ul>
        </div>

        <div class="mb-2 pb-2 border-b border-secondary-200">
          <div class="flex justify-between items-center mb-0.5">
            <button
              @click="toggleCollapse('brain_region')"
              class="flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="text-xs">{{
                collapsed.brain_region ? "▶" : "▼"
              }}</span>
              Tissues
            </button>
            <button
              v-if="
                !collapsed.brain_region &&
                regionsWithCounts.length > defaultVisibleCount
              "
              @click="toggleExpand('brain_region')"
              class="px-2 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded hover:bg-secondary-200 transition-colors duration-200"
            >
              {{ expanded.brain_region ? "Less" : "More" }}
            </button>
          </div>
          <ul v-show="!collapsed.brain_region" class="space-y-0">
            <li v-for="opt in regionsVisible" :key="opt.value">
              <label
                class="flex items-center justify-between gap-2 p-1 border border-secondary-200 rounded-md bg-secondary-50 hover:bg-white hover:border-primary-300 transition-all duration-200 cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': opt.count === 0 }"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isSelected('brain_region', opt.value)"
                    :disabled="opt.count === 0"
                    @change="toggleSelect('brain_region', opt.value, opt.count)"
                    class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-secondary-700">{{
                    opt.value
                  }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-200 rounded-full"
                  >{{ opt.count }}</span
                >
              </label>
            </li>
          </ul>
        </div>
      </aside>

      <main
        class="bg-white/95 backdrop-blur-sm border border-secondary-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div
          class="p-6 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-secondary-50"
        >
          <div
            class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"
          >
            <div class="flex flex-col gap-3">
              <!-- Tab buttons hidden since only one content type -->
              <div class="text-sm text-secondary-600">
                <span>
                  Showing {{ totalResults }} of {{ currentDatasets.length }}
                </span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button
                @click="showGlossary = true"
                title="Explain columns and terms"
                class="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors duration-200 flex items-center gap-1"
              >
                <AppIcon name="help" size="sm" /> Terms
              </button>
              <button
                @click="downloadFilteredDatasetsCSV"
                title="Download current filtered datasets table as CSV"
                class="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors duration-200 flex items-center gap-1"
              >
                <AppIcon name="download" size="sm" /> Download Current Datasets Table
              </button>
              <select
                v-model="sortKey"
                class="px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="created_at">Sort: Date</option>
                <option value="species">Sort: Species</option>
                <option value="n_cells">Sort: Cells</option>
                <option value="dataset_id">Sort: Dataset ID</option>
              </select>
              <button
                @click="toggleSortDir"
                class="px-3 py-2 text-sm font-medium text-secondary-600 bg-secondary-100 border border-secondary-200 rounded-lg hover:bg-secondary-200 transition-colors duration-200"
              >
                {{ sortDirection === "asc" ? "▲" : "▼" }}
              </button>
              <div
                class="flex border border-secondary-200 rounded-lg overflow-hidden"
              >
                <button
                  :class="[
                    'px-3 py-2 text-sm font-medium transition-all duration-200',
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
                  ]"
                  @click="viewMode = 'list'"
                >
                  List
                </button>
                <button
                  :class="[
                    'px-3 py-2 text-sm font-medium transition-all duration-200',
                    viewMode === 'table'
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
                  ]"
                  @click="viewMode = 'table'"
                >
                  Table
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-secondary-600">Rows per page</span>
                <select
                  v-model.number="rowsPerPage"
                  @change="currentPage = 1"
                  class="px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <LoadingSpinner v-if="currentLoading" message="Loading data..." />
        <ErrorMessage
          v-else-if="currentError"
          :error="currentError"
          :retry="loadData"
        />

        <div v-else>
          <!-- Datasets Tab Content -->
          <div v-if="activeTab === 'datasets'">
            <div v-if="viewMode === 'list'">
              <div
                v-if="paginatedResults.length === 0"
                class="flex flex-col items-center justify-center py-12 px-6 text-center"
              >
                <AppIcon name="search" size="xl" class="mb-4 mx-auto text-secondary-400" style="width: 4rem; height: 4rem;" />
                <h3 class="text-lg font-semibold text-secondary-700 mb-2">
                  No datasets found
                </h3>
                <p class="text-secondary-500">
                  No datasets match your current filters. Try adjusting your
                  search criteria.
                </p>
              </div>
              <ul class="grid gap-2 p-4">
                <li
                  v-for="d in paginatedResults"
                  :key="d.id"
                  :data-dataset-id="d.dataset_id || d.id"
                  class="bg-white border border-secondary-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div
                    class="bg-gradient-to-r from-primary-50 to-secondary-50 p-3 border-b border-secondary-200"
                  >
                    <div
                      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="text-lg font-bold text-primary-700 bg-white px-3 py-1 rounded-lg border border-primary-200"
                        >
                          {{ d.dataset_id }}
                        </div>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-if="d.species"
                          class="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full"
                        >
                          {{ d.species }}
                        </span>
                        <span
                          v-if="d.disease"
                          class="px-2 py-1 text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200 rounded-full"
                        >
                          {{ d.disease }}
                        </span>
                        <span
                          v-if="d.sex"
                          class="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full"
                        >
                          {{ d.sex }}
                        </span>
                        <span
                          v-if="d.status"
                          class="px-2 py-1 text-xs font-medium rounded-full border"
                          :class="{
                            'bg-teal-100 text-teal-700 border-teal-200':
                              (d.status || '').toLowerCase() === 'published' ||
                              (d.status || '').toLowerCase() === 'healthy',
                            'bg-yellow-100 text-yellow-700 border-yellow-200':
                              (d.status || '').toLowerCase() === 'pending',
                            'bg-slate-100 text-slate-700 border-slate-200':
                              !d.status ||
                              (d.status || '').toLowerCase() === 'n/a',
                            'bg-orange-100 text-orange-700 border-orange-200':
                              (d.status || '').toLowerCase() === 'disease',
                          }"
                        >
                          {{ d.status }}
                        </span>
                        <span
                          v-if="d.protocol"
                          class="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-full"
                        >
                          {{ d.protocol }}
                        </span>
                        <span
                          v-if="d.brain_region"
                          class="px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200 rounded-full"
                        >
                          {{ d.brain_region }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="space-y-1">
                      <div
                        class="text-sm font-semibold text-secondary-700 border-b border-secondary-200 pb-1 mb-2"
                      >
                        Dataset Details
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Species:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.species || "N/A"
                          }}</span>
                        </div>
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Disease:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.disease || "N/A"
                          }}</span>
                        </div>
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Sex:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.sex || "N/A"
                          }}</span>
                        </div>
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Status:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.status || "N/A"
                          }}</span>
                        </div>
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Protocol:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.protocol || "N/A"
                          }}</span>
                        </div>
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Tissue:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.brain_region || "N/A"
                          }}</span>
                        </div>
                        <div v-if="d.age" class="flex items-center py-0.5">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Age:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.age
                          }}</span>
                        </div>
                        <div v-if="d.stage" class="flex items-center py-0.5">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Stage:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.stage
                          }}</span>
                        </div>
                        <div class="flex items-center py-0">
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Cells:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.n_cells?.toLocaleString() || "N/A"
                          }}</span>
                        </div>
                        <div
                          v-if="d.methodology"
                          class="flex items-center py-0.5"
                        >
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Method:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.methodology
                          }}</span>
                        </div>
                        <div
                          v-if="d.treatment"
                          class="flex items-center py-0.5"
                        >
                          <span
                            class="text-sm font-medium text-secondary-600 w-20"
                            >Treatment:</span
                          >
                          <span class="text-sm text-secondary-800">{{
                            d.treatment
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <!-- Paper content displayed inline in card -->
                    <div
                      v-if="getRelatedPaper(d)"
                      class="mt-3 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/50 rounded-lg"
                    >
                      <div class="space-y-4">
                        <div>
                          <button
                            @click="togglePaperInCard(d.dataset_id || d.id)"
                            class="flex items-center gap-2 text-left w-full hover:text-primary-600 transition-colors duration-200"
                          >
                            <span class="text-xs text-secondary-600">
                              {{ expandedPaperInCard[d.dataset_id || d.id] ? "▼" : "▶" }}
                            </span>
                            <h4
                              class="text-lg font-semibold text-secondary-900"
                            >
                              {{ getRelatedPaper(d).title || "Untitled Paper" }}
                            </h4>
                          </button>
                        </div>
                        <div
                          v-if="expandedPaperInCard[d.dataset_id || d.id]"
                          class="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div
                            v-if="
                              extractYear(getRelatedPaper(d).date_published)
                            "
                            class="flex items-center"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Published:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              extractYear(getRelatedPaper(d).date_published)
                            }}</span>
                          </div>
                          <div
                            v-if="getRelatedPaper(d).species"
                            class="flex items-center"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Species:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              getRelatedPaper(d).species
                            }}</span>
                          </div>
                          <div
                            v-if="getRelatedPaper(d).disease"
                            class="flex items-center"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Disease:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              getRelatedPaper(d).disease
                            }}</span>
                          </div>
                          <div
                            v-if="getRelatedPaper(d).brain_region"
                            class="flex items-center"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Brain Region:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              getRelatedPaper(d).brain_region
                            }}</span>
                          </div>
                          <div
                            v-if="getRelatedPaper(d).methodology"
                            class="flex items-center"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Methodology:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              getRelatedPaper(d).methodology
                            }}</span>
                          </div>
                          <div
                            v-if="getRelatedPaper(d).pubmed_id || getRelatedPaper(d).pmid"
                            class="flex items-center"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >PubMed ID:</span
                            >
                            <a
                              :href="pubmedUrl(getRelatedPaper(d).pubmed_id || getRelatedPaper(d).pmid)"
                              target="_blank"
                              class="text-sm text-primary-600 hover:text-primary-800"
                            >
                              {{ getRelatedPaper(d).pubmed_id || getRelatedPaper(d).pmid }}
                            </a>
                          </div>
                        </div>
                        <div
                          v-if="
                            expandedPaperInCard[d.dataset_id || d.id] &&
                            getRelatedPaper(d).abstract
                          "
                          class="mt-4"
                        >
                          <h5
                            class="text-sm font-semibold text-secondary-700 mb-2"
                          >
                            Abstract
                          </h5>
                          <p class="text-sm text-secondary-700 leading-relaxed">
                            {{ getRelatedPaper(d).abstract }}
                          </p>
                        </div>
                        <div
                          v-if="
                            expandedPaperInCard[d.dataset_id || d.id] &&
                            getRelatedPaper(d).citation
                          "
                          class="mt-4"
                        >
                          <h5
                            class="text-sm font-semibold text-secondary-700 mb-2"
                          >
                            Citation
                          </h5>
                          <p class="text-sm text-secondary-700 leading-relaxed">
                            {{ getRelatedPaper(d).citation }}
                          </p>
                        </div>
                        <div
                          v-if="
                            expandedPaperInCard[d.dataset_id || d.id] &&
                            getRelatedDatasets(getRelatedPaper(d)).length > 0
                          "
                          class="mt-4 pt-4 border-t border-blue-200"
                        >
                          <h5
                            class="text-sm font-semibold text-secondary-700 mb-3"
                          >
                            Related Datasets ({{
                              getRelatedDatasets(getRelatedPaper(d)).length
                            }})
                          </h5>
                          <div class="flex flex-wrap gap-2">
                            <button
                              v-for="relatedDataset in getRelatedDatasets(
                                getRelatedPaper(d)
                              )"
                              :key="
                                relatedDataset.dataset_id || relatedDataset.id
                              "
                              @click="viewRelatedDataset(relatedDataset)"
                              class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full hover:bg-blue-200 transition-colors duration-200"
                            >
                              {{ relatedDataset.dataset_id }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-secondary-50 px-2 py-2 border-t border-secondary-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div class="flex flex-wrap items-center gap-2">
                        <template v-if="d.public_dataset_id">
                          <a
                            v-for="(publicId, index) in d.public_dataset_id
                              .split(';')
                              .map((id) => id.trim())
                              .filter((id) => id)"
                            :key="index"
                            :href="externalDatasetUrl(publicId)"
                            target="_blank"
                            class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-secondary-700 bg-secondary-200 border border-secondary-300 rounded-full hover:bg-secondary-300 transition-colors duration-200 h-6"
                          >
                            Public ID: {{ publicId }}
                          </a>
                        </template>
                        <template v-if="getRelatedPaper(d)">
                          <button
                            @click="togglePaperInCard(d.dataset_id || d.id || d.data_id)"
                            class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-full hover:bg-blue-200 transition-colors duration-200 h-6"
                          >
                            <AppIcon name="document" size="xs" class="mr-1" />
                            {{
                              expandedPaperInCard[d.dataset_id || d.id || d.data_id]
                                ? "Hide"
                                : "View"
                            }}
                            Paper
                          </button>
                        </template>
                        <button
                          v-if="d.dataset_id"
                          @click="navigateToAnalysis(d.dataset_id)"
                          class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded-full hover:bg-green-200 transition-colors duration-200 h-6"
                        >
                          <AppIcon name="microscope" size="xs" class="mr-1" />
                          Analyze
                        </button>
                        <button
                          @click="downloadDatasetH5AD(d)"
                          class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 border border-primary-300 rounded-full hover:bg-primary-200 transition-colors duration-200 h-6"
                        >
                          <span class="mr-1">📥</span>
                          Download
                        </button>
                      </div>
                      <div class="text-xs text-secondary-500">
                        {{ formatDate(d.created_at) }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div v-else class="overflow-x-auto">
              <table
                class="w-full border-collapse bg-white rounded-lg shadow-sm border border-secondary-200"
              >
                <thead>
                  <tr class="bg-gradient-to-r from-secondary-50 to-primary-50">
                    <th
                      @click="setSort('dataset_id')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Dataset ID</div>
                    </th>
                    <th
                      @click="setSort('disease')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Disease</div>
                    </th>
                    <th
                      @click="setSort('species')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Species</div>
                    </th>
                    <th
                      @click="setSort('brain_region')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Tissue</div>
                    </th>
                    <th
                      @click="setSort('protocol')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Protocol</div>
                    </th>
                    <th
                      @click="setSort('methodology')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Methodology</div>
                    </th>
                    <th
                      @click="setSort('n_cells')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Cells</div>
                    </th>
                    <th
                      @click="setSort('status')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Status</div>
                    </th>
                    <th
                      @click="setSort('age')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Age</div>
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">PubMed</div>
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-2">Public ID</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="d in paginatedResults"
                    :key="d.id"
                    class="border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-200"
                  >
                    <td
                      class="px-3 py-2 text-sm text-secondary-900 font-medium"
                    >
                      {{ d.dataset_id }}
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      <span
                        v-if="d.disease"
                        class="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-full"
                      >
                        {{ d.disease }}
                      </span>
                      <span v-else class="text-secondary-400">N/A</span>
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ d.species }}
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ d.brain_region }}
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      <span
                        class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full"
                      >
                        {{ d.protocol || "N/A" }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ d.methodology || "N/A" }}
                    </td>
                    <td
                      class="px-3 py-2 text-sm text-secondary-800 text-center"
                    >
                      <span class="font-semibold">{{
                        d.n_cells?.toLocaleString() || "N/A"
                      }}</span>
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="{
                          'text-green-700 bg-green-100 border border-green-200':
                            (d.status || '').toLowerCase() === 'healthy',
                          'text-red-700 bg-red-100 border border-red-200':
                            (d.status || '').toLowerCase() === 'disease',
                          'text-gray-700 bg-gray-100 border border-gray-200':
                            !d.status ||
                            (d.status || '').toLowerCase() === 'n/a',
                        }"
                        >{{ d.status || "N/A" }}</span
                      >
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ d.age || "N/A" }}
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <a
                        v-if="d.pubmed_id"
                        :href="pubmedUrl(d.pubmed_id)"
                        target="_blank"
                        class="text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
                        title="View on PubMed"
                      >
                        {{ d.pubmed_id }}
                      </a>
                      <span v-else class="text-secondary-400">N/A</span>
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <template v-if="d.public_dataset_id">
                        <a
                          v-for="(publicId, index) in d.public_dataset_id
                            .split(';')
                            .map((id) => id.trim())
                            .filter((id) => id)"
                          :key="index"
                          :href="externalDatasetUrl(publicId)"
                          target="_blank"
                          class="text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200 block mb-1"
                        >
                          {{ publicId }}
                        </a>
                      </template>
                      <span v-else class="text-secondary-400">N/A</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="flex items-center justify-between px-4 py-3 bg-white border-t border-secondary-200"
              v-if="totalResults > 0"
            >
              <div class="flex items-center text-sm text-secondary-700">
                <span class="font-medium">
                  {{ (currentPage - 1) * rowsPerPage + 1 }}-
                  {{ Math.min(currentPage * rowsPerPage, totalResults) }}
                  of {{ totalResults }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                  class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  :disabled="currentPage * rowsPerPage >= totalResults"
                  @click="currentPage++"
                  class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Papers Tab Content (hidden, functionality moved to inline card view) -->
          <div v-else-if="false && activeTab === 'papers'">
            <div v-if="viewMode === 'list'">
              <div v-if="paginatedPapers.length === 0" class="empty">
                No papers match your filters.
              </div>
              <ul class="grid gap-4 p-4">
                <li
                  v-for="p in paginatedPapers"
                  :key="p.id"
                  class="bg-white border border-secondary-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div
                    class="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 border-b border-secondary-200"
                  >
                    <div
                      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2">
                          <AppIcon name="document" size="lg" class="text-secondary-600" />
                          <h3
                            class="text-lg font-bold text-secondary-900 line-clamp-2"
                          >
                            {{ p.title || "Untitled Paper" }}
                          </h3>
                        </div>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 border border-primary-200 rounded-full"
                        >
                          {{ p.species || "N/A" }}
                        </span>
                        <span
                          class="px-3 py-1 text-xs font-medium text-secondary-700 bg-secondary-200 border border-secondary-300 rounded-full"
                        >
                          {{ p.disease || "N/A" }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <div
                          class="text-sm font-semibold text-secondary-700 border-b border-secondary-200 pb-1"
                        >
                          Paper Info
                        </div>
                        <div class="space-y-0.5">
                          <div
                            v-if="extractYear(p.date_published)"
                            class="flex items-center py-0"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Published:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              extractYear(p.date_published)
                            }}</span>
                          </div>
                          <div v-if="p.species" class="flex items-center py-0">
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Species:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.species
                            }}</span>
                          </div>
                          <div v-if="p.disease" class="flex items-center py-0">
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Disease:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.disease
                            }}</span>
                          </div>
                          <div
                            v-if="p.brain_region"
                            class="flex items-center py-0"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Brain Region:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.brain_region
                            }}</span>
                          </div>
                          <div
                            v-if="p.n_samples"
                            class="flex items-center py-0"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Samples:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.n_samples
                            }}</span>
                          </div>
                          <div v-if="p.journal" class="flex items-center py-0">
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Journal:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.journal
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="space-y-1">
                        <div
                          class="text-sm font-semibold text-secondary-700 border-b border-secondary-200 pb-1"
                        >
                          Methodology
                        </div>
                        <div class="space-y-0.5">
                          <div
                            v-if="p.library_prep_protocol"
                            class="flex items-center py-0"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Library Prep:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.library_prep_protocol
                            }}</span>
                          </div>
                          <div v-if="p.protocol" class="flex items-center py-0">
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Protocol:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.protocol
                            }}</span>
                          </div>
                          <div
                            v-if="p.methodology"
                            class="flex items-center py-0"
                          >
                            <span
                              class="text-sm font-medium text-secondary-600 w-24"
                              >Method:</span
                            >
                            <span class="text-sm text-secondary-800">{{
                              p.methodology
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="getRelatedDatasets(p).length > 0"
                      class="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/50 rounded-lg"
                    >
                      <div
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2"
                      >
                        <div
                          class="flex items-center gap-2 text-blue-800 font-semibold"
                        >
                          <AppIcon name="datasets" size="md" />
                          Related Datasets ({{ getRelatedDatasets(p).length }})
                        </div>
                        <button
                          @click="viewAllRelatedDatasets(p)"
                          class="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        >
                          View All
                        </button>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="dataset in getRelatedDatasets(p)"
                          :key="dataset.id"
                          @click="viewDatasetDetails(dataset)"
                          class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full hover:bg-blue-200 transition-colors duration-200"
                        >
                          {{ dataset.dataset_id }}
                        </button>
                      </div>
                    </div>
                    <div
                      v-if="p.abstract"
                      class="mt-4 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 rounded-lg"
                    >
                      <div
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2"
                      >
                        <div
                          class="flex items-center gap-2 text-green-800 font-semibold"
                        >
                          <AppIcon name="edit" size="md" />
                          Abstract
                        </div>
                        <button
                          v-if="p.abstract && p.abstract.length > 200"
                          @click="toggleAbstract(p.id)"
                          class="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
                        >
                          {{
                            expandedAbstracts[p.id] ? "Show Less" : "Show More"
                          }}
                        </button>
                      </div>
                      <div
                        v-if="expandedAbstracts[p.id] && p.author"
                        class="mb-2"
                      >
                        <span class="text-sm font-medium text-green-700"
                          >Authors:</span
                        >
                        <span class="text-sm text-green-800">{{
                          p.author
                        }}</span>
                      </div>
                      <p class="text-sm text-green-800 line-clamp-4">
                        {{
                          expandedAbstracts[p.id]
                            ? p.abstract
                            : truncateText(p.abstract, 400)
                        }}
                      </p>
                    </div>
                    <div
                      class="bg-secondary-50 px-4 py-2 border-t border-secondary-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div class="flex flex-wrap gap-2">
                        <a
                          v-if="p.pubmed_id || p.pmid"
                          :href="pubmedUrl(p.pubmed_id || p.pmid)"
                          target="_blank"
                          class="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 border border-primary-200 rounded-full hover:bg-primary-200 transition-colors duration-200"
                        >
                          PMID: {{ p.pubmed_id || p.pmid }}
                        </a>
                        <a
                          v-if="p.doi"
                          :href="`https://doi.org/${p.doi}`"
                          target="_blank"
                          class="inline-flex items-center px-3 py-1 text-xs font-medium text-secondary-700 bg-secondary-200 border border-secondary-300 rounded-full hover:bg-secondary-300 transition-colors duration-200"
                        >
                          DOI: {{ p.doi }}
                        </a>
                      </div>
                      <div class="text-xs text-secondary-500">
                        <div v-if="p.publish_date">
                          Published: {{ p.publish_date }}
                        </div>
                        <div>Added: {{ formatDate(p.created_at) }}</div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div v-else class="overflow-x-auto">
              <table
                class="w-full border-collapse bg-white rounded-lg shadow-sm border border-secondary-200"
              >
                <thead>
                  <tr class="bg-gradient-to-r from-secondary-50 to-primary-50">
                    <th
                      @click="setSort('title')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      Title
                    </th>
                    <th
                      @click="setSort('species')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      Species
                    </th>
                    <th
                      @click="setSort('disease')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      Disease
                    </th>
                    <th
                      @click="setSort('brain_region')"
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors duration-200"
                    >
                      Brain Region
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200"
                    >
                      PubMed
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-semibold text-secondary-800 border-b border-secondary-200"
                    >
                      DOI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="p in paginatedPapers"
                    :key="p.id"
                    class="border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-200"
                  >
                    <td
                      class="px-3 py-2 text-sm text-secondary-900 font-medium"
                    >
                      {{ p.title || "Untitled" }}
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ p.species || "N/A" }}
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ p.disease || "N/A" }}
                    </td>
                    <td class="px-3 py-2 text-sm text-secondary-700">
                      {{ p.brain_region || "N/A" }}
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <a
                        v-if="p.pubmed_id || p.pmid"
                        :href="pubmedUrl(p.pubmed_id || p.pmid)"
                        target="_blank"
                        class="text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
                        title="View on PubMed"
                      >
                        {{ p.pubmed_id || p.pmid }}
                      </a>
                      <span v-else class="text-secondary-400">N/A</span>
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <a
                        v-if="p.doi"
                        :href="`https://doi.org/${p.doi}`"
                        target="_blank"
                        class="text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
                        title="Open DOI"
                      >
                        {{ p.doi }}
                      </a>
                      <span v-else class="text-secondary-400">N/A</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="flex items-center justify-between px-4 py-3 bg-white border-t border-secondary-200"
              v-if="totalPaperResults > 0"
            >
              <div class="flex items-center text-sm text-secondary-700">
                <span class="font-medium">
                  {{ (currentPage - 1) * rowsPerPage + 1 }}-
                  {{ Math.min(currentPage * rowsPerPage, totalPaperResults) }}
                  of {{ totalPaperResults }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                  class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  :disabled="currentPage * rowsPerPage >= totalPaperResults"
                  @click="currentPage++"
                  class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDatasets } from "@/composables/useDatasets";
import { useSpatialData } from "@/composables/useSpatialData";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import AppIcon from "@/components/icons/AppIcon.vue";
import apiService from "@/services/api.js";

const router = useRouter();

// Single-cell data
const {
  datasets,
  loading,
  error,
  filters,
  speciesOptions,
  diseaseOptions,
  sexOptions,
  brainRegionOptions,
  statusOptions,
  dataTypeOptions,
  filteredDatasets,
  loadDatasets,
  updateFilters,
  clearFilters,
} = useDatasets();

// Spatial data
const {
  spatialDatasets,
  spatialPapers,
  loading: spatialLoading,
  error: spatialError,
  filters: spatialFilters,
  filteredSpatialDatasets,
  filteredSpatialPapers,
  datasetSpeciesOptions: spatialDatasetSpeciesOptions,
  datasetDiseaseOptions: spatialDatasetDiseaseOptions,
  datasetBrainRegionOptions: spatialDatasetBrainRegionOptions,
  datasetMethodologyOptions: spatialDatasetMethodologyOptions,
  paperSpeciesOptions: spatialPaperSpeciesOptions,
  paperDiseaseOptions: spatialPaperDiseaseOptions,
  paperBrainRegionOptions: spatialPaperBrainRegionOptions,
  paperMethodologyOptions: spatialPaperMethodologyOptions,
  loadSpatialDatasets,
  loadSpatialPapers,
  updateFilters: updateSpatialFilters,
  clearFilters: clearSpatialFilters,
} = useSpatialData();

// Data type switcher (single-cell or spatial)
const dataType = ref("single-cell");
const showGlossary = ref(false);

// Compute additional filter options from new fields (respect dataType)
const protocolOptions = computed(() => {
  const source = currentDatasets.value;
  const protocols = [...new Set(source.map((d) => d.protocol).filter(Boolean))];
  return protocols.sort();
});

const methodologyOptions = computed(() => {
  const source = currentDatasets.value;
  const methodologies = [
    ...new Set(source.map((d) => d.methodology).filter(Boolean)),
  ];
  return methodologies.sort();
});

const activeTab = ref("datasets");
const viewMode = ref("list");
const searchQuery = ref("");
const startDate = ref("");
const endDate = ref("");
const sortKey = ref("created_at");
const sortDirection = ref("desc");
const rowsPerPage = ref(25);
const currentPage = ref(1);
const expandedPaperInCard = ref({}); // Track which dataset cards have expanded paper view

// Papers data
const papers = ref([]);
const papersLoading = ref(false);
const papersError = ref(null);

// Expanded abstracts tracking
const expandedAbstracts = ref({});

// Navigation state tracking
const navigationState = ref({
  type: null, // 'dataset' or 'paper' or 'datasets'
  targetId: null,
  sourceType: null, // 'paper' or 'dataset'
  sourceTitle: null,
  paperPubmedId: null,
});

// multi-select filters
const defaultVisibleCount = 5;
const expanded = ref({
  species: true,
  brain_region: true,
  data_type: true,
  disease: true,
  sex: true,
  status: true,
  protocol: true,
  methodology: true,
});
// All filters expanded by default to show all items

const collapsed = ref({
  species: false,
  brain_region: false,
  data_type: false,
  disease: false,
  sex: false,
  status: false,
  protocol: false,
  methodology: false,
});
// Note: All filters are expanded (collapsed: false) by default to show all options
const allCollapsed = computed(() =>
  Object.values(collapsed.value).every((v) => v === true)
);

// Store multi-select selections as arrays; derive from single-value filters initially
const multiFilters = ref({
  species: [],
  brain_region: [],
  data_type: [],
  disease: [],
  sex: [],
  status: [],
  protocol: [],
  methodology: [],
});

const normalizeDate = (d) => (d ? new Date(d).getTime() : null);

const applySearchAndDate = (items) => {
  const q = searchQuery.value.trim().toLowerCase();
  const start = normalizeDate(startDate.value);
  const end = normalizeDate(endDate.value);
  return items.filter((d) => {
    const matchesQuery = q
      ? [
          d.dataset_id,
          d.species,
          d.disease,
          d.brain_region,
          d.pubmed_id,
          d.data_type,
          d.protocol,
          d.methodology,
          // Paper fields
          d.title,
          d.paper_id,
          d.author,
          d.abstract,
          d.citation,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      : true;

    if (!matchesQuery) return false;

    const createdTs = normalizeDate(d.created_at);
    const withinStart = start ? (createdTs ? createdTs >= start : false) : true;
    const withinEnd = end ? (createdTs ? createdTs <= end : false) : true;
    return withinStart && withinEnd;
  });
};

// apply multi-select filters on top of current filtered datasets (single-cell or spatial)
const multiFiltered = computed(() => {
  const mf = multiFilters.value;
  const hasAny = Object.values(mf).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
  let base = currentFilteredDatasets.value;

  // Apply navigation filtering if active
  const nav = navigationState.value;
  if (nav.type === "datasets" && nav.paperPubmedId) {
    // Filter to show only datasets related to the specific paper
    console.log("Filtering datasets for paper pubmed_id:", nav.paperPubmedId);
    base = currentDatasets.value.filter((dataset) => {
      if (!dataset.pubmed_id) return false;
      const datasetPubmedIds = dataset.pubmed_id
        .split(",")
        .map((id) => id.trim());
      const matches = datasetPubmedIds.includes(nav.paperPubmedId);
      if (matches) {
        console.log(
          "Found matching dataset:",
          dataset.dataset_id,
          "with pubmed_ids:",
          datasetPubmedIds
        );
      }
      return matches;
    });
    console.log("Filtered datasets count:", base.length);
  }

  if (!hasAny) return base;
  return base.filter((d) => {
    return Object.entries(mf).every(([key, selected]) => {
      if (!selected || selected.length === 0) return true;
      const v = String(d[key] || "").toLowerCase();
      return selected.some((s) => v.includes(String(s).toLowerCase()));
    });
  });
});

const sortedResults = computed(() => {
  const items = applySearchAndDate(multiFiltered.value).slice();
  const key = sortKey.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;
  items.sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (key === "created_at") {
      const at = normalizeDate(av) || 0;
      const bt = normalizeDate(bv) || 0;
      if (at === bt) return 0;
      return at > bt ? dir : -dir;
    }
    if (key === "n_cells") {
      const ai = typeof av === "number" ? av : parseFloat(av) || 0;
      const bi = typeof bv === "number" ? bv : parseFloat(bv) || 0;
      if (ai === bi) return 0;
      return ai > bi ? dir : -dir;
    }
    const as = String(av || "").toLowerCase();
    const bs = String(bv || "").toLowerCase();
    if (as === bs) return 0;
    return as > bs ? dir : -dir;
  });
  return items;
});

const totalResults = computed(() => sortedResults.value.length);

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return sortedResults.value.slice(start, end);
});

// Papers filtering and pagination (single-cell or spatial)
const filteredPapers = computed(() => {
  const mf = multiFilters.value;
  let filtered = currentPapers.value;

  // Navigation filtering is handled by search query instead of here
  // This keeps the logic simpler and more reliable

  // Apply multi-select filters
  const hasAny = Object.values(mf).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
  if (hasAny) {
    filtered = filtered.filter((p) => {
      return Object.entries(mf).every(([key, selected]) => {
        if (!selected || selected.length === 0) return true;
        const v = String(p[key] || "").toLowerCase();
        return selected.some((s) => v.includes(String(s).toLowerCase()));
      });
    });
  }

  return applySearchAndDate(filtered);
});

const sortedPapers = computed(() => {
  const items = filteredPapers.value.slice();
  const key = sortKey.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;
  items.sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (key === "created_at") {
      const at = normalizeDate(av) || 0;
      const bt = normalizeDate(bv) || 0;
      if (at === bt) return 0;
      return at > bt ? dir : -dir;
    }
    if (key === "year") {
      const ai = typeof av === "number" ? av : parseInt(av) || 0;
      const bi = typeof bv === "number" ? bv : parseInt(bv) || 0;
      if (ai === bi) return 0;
      return ai > bi ? dir : -dir;
    }
    const as = String(av || "").toLowerCase();
    const bs = String(bv || "").toLowerCase();
    if (as === bs) return 0;
    return as > bs ? dir : -dir;
  });
  return items;
});

const totalPaperResults = computed(() => sortedPapers.value.length);

const paginatedPapers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return sortedPapers.value.slice(start, end);
});

watch(
  [
    filters,
    searchQuery,
    startDate,
    endDate,
    sortKey,
    sortDirection,
    rowsPerPage,
  ],
  () => {
    currentPage.value = 1;
  }
);

const handleSearch = () => {
  currentPage.value = 1;
};

const handleDateChange = () => {
  currentPage.value = 1;
};

const toggleFilter = (key, value, count) => {
  if (count === 0) return;
  const current = filters.value[key];
  const next = current === value ? "" : value;
  updateFilters({ [key]: next });
};

// Helpers for unified Technology filter
const isSelectedTechnology = (value) => {
  if (dataType.value === "single-cell") {
    return filters.value.protocol === value;
  }
  return spatialFilters.value.methodology === value;
};

const toggleSelectTechnology = (value, count) => {
  if (count === 0) return;
  if (dataType.value === "single-cell") {
    const current = filters.value.protocol;
    const next = current === value ? "" : value;
    updateFilters({ protocol: next });
  } else {
    const current = spatialFilters.value.methodology;
    const next = current === value ? "" : value;
    updateSpatialFilters({ methodology: next });
  }
};

// multi-select helpers
const isSelected = (key, value) => {
  const arr = multiFilters.value[key] || [];
  return arr.includes(value);
};

const toggleSelect = (key, value, count) => {
  if (count === 0) return;
  const arr = multiFilters.value[key] ? [...multiFilters.value[key]] : [];
  const idx = arr.indexOf(value);
  if (idx >= 0) {
    arr.splice(idx, 1);
  } else {
    arr.push(value);
  }
  multiFilters.value = { ...multiFilters.value, [key]: arr };
};

const toggleExpand = (key) => {
  expanded.value = { ...expanded.value, [key]: !expanded.value[key] };
};

const toggleCollapse = (key) => {
  collapsed.value = { ...collapsed.value, [key]: !collapsed.value[key] };
};

const toggleAllSections = () => {
  const next = !allCollapsed.value;
  collapsed.value = {
    species: next,
    brain_region: next,
    data_type: next,
    disease: next,
    sex: next,
    status: next,
    protocol: next,
    methodology: next,
  };
};

const handleClearAll = () => {
  // Clear single-cell filters
  clearFilters();
  // Clear spatial filters
  clearSpatialFilters();
  // Clear multi-select filters
  Object.keys(multiFilters.value).forEach((key) => {
    multiFilters.value[key] = [];
  });
  // Clear search and date filters
  searchQuery.value = "";
  startDate.value = "";
  endDate.value = "";
  currentPage.value = 1;
};

const setSort = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = key === "created_at" ? "desc" : "asc";
  }
};

const toggleSortDir = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString();
};

const pubmedUrl = (pmid) => {
  const first = String(pmid).split(",")[0].trim();
  return `https://pubmed.ncbi.nlm.nih.gov/${first}/`;
};

const firstPubmedId = (pmid) => String(pmid).split(",")[0].trim();

const formatPublicId = (id) => {
  if (!id) return "N/A";
  const ids = String(id)
    .split(";")
    .map((id) => id.trim())
    .filter((id) => id);
  return ids.join(", ");
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Toggle abstract expansion
const toggleAbstract = (paperId) => {
  expandedAbstracts.value[paperId] = !expandedAbstracts.value[paperId];
};

// Toggle paper view inline in card
const togglePaperInCard = (datasetId) => {
  if (expandedPaperInCard.value[datasetId]) {
    expandedPaperInCard.value[datasetId] = false;
  } else {
    expandedPaperInCard.value[datasetId] = true;
  }
};

// View related dataset from paper view
const viewRelatedDataset = (dataset) => {
  // Filter to show this dataset
  searchQuery.value = dataset.dataset_id || "";
  currentPage.value = 1;
  // Scroll to top of results
  setTimeout(() => {
    const targetCard = document.querySelector(
      `[data-dataset-id='${dataset.dataset_id}']`
    );
    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      targetCard.classList.add("ring-2", "ring-primary-500", "ring-offset-2");
      setTimeout(() => {
        targetCard.classList.remove(
          "ring-2",
          "ring-primary-500",
          "ring-offset-2"
        );
      }, 2000);
    }
  }, 300);
};

// Download functions
const downloadFilteredDatasetsCSV = () => {
  // Get all filtered datasets (not just paginated ones)
  const datasetsToExport = sortedResults.value;

  if (datasetsToExport.length === 0) {
    alert("No datasets to download");
    return;
  }

  // Create CSV content
  const headers = [
    "Dataset ID",
    "Species",
    "Tissue",
    "Protocol",
    "Disease",
    "Sex",
    "Status",
    "Age",
    "Stage",
    "Cells",
    "Methodology",
    "Treatment",
    "PubMed ID",
    "Public Dataset ID",
  ];

  const rows = datasetsToExport.map((dataset) => [
    dataset.dataset_id || "",
    dataset.species || "",
    dataset.brain_region || "",
    dataset.protocol || "",
    dataset.disease || "",
    dataset.sex || "",
    dataset.status || "",
    dataset.age || "",
    dataset.stage || "",
    dataset.n_cells || "",
    dataset.methodology || "",
    dataset.treatment || "",
    dataset.pubmed_id || "",
    dataset.public_dataset_id || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `ssKIND_datasets_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadDatasetH5AD = (dataset) => {
  // Construct API URL for h5ad download
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://0.0.0.0:8000/sskind-backend/api/v1";
  const datasetId = dataset.dataset_id || dataset.id;
  const url = `${API_BASE_URL}/datasets/${datasetId}/download/`;

  // Create a temporary link to trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = `${datasetId}.h5ad`;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Navigate to single-cell analysis page
const navigateToAnalysis = (datasetId) => {
  router.push({ name: "SingleCellAnalysis", params: { id: datasetId } });
};

// View dataset details with focused filtering
const viewDatasetDetails = (dataset) => {
  // Set navigation state
  navigationState.value = {
    type: "dataset",
    targetId: dataset.dataset_id,
    sourceType: "paper",
    sourceTitle: dataset.dataset_id,
  };

  // Switch to datasets tab
  activeTab.value = "datasets";

  // Clear all filters and search
  clearFilters();
  Object.keys(multiFilters.value).forEach((key) => {
    multiFilters.value[key] = [];
  });
  searchQuery.value = "";
  startDate.value = "";
  endDate.value = "";

  // Set search to dataset ID to focus on this dataset
  searchQuery.value = dataset.dataset_id;
  currentPage.value = 1;
};

// View all related datasets for a paper
const viewAllRelatedDatasets = (paper) => {
  console.log("Viewing all related datasets for paper:", paper.title);
  const paperPmid = paper.pmid || paper.pubmed_id;
  console.log("Paper pubmed_id/pmid:", paperPmid);

  // Set navigation state
  navigationState.value = {
    type: "datasets",
    targetId: "multiple",
    sourceType: "paper",
    sourceTitle: paper.title,
    paperPubmedId: paperPmid,
  };

  // Switch to datasets tab
  activeTab.value = "datasets";

  // Clear all filters and search
  clearFilters();
  Object.keys(multiFilters.value).forEach((key) => {
    multiFilters.value[key] = [];
  });
  searchQuery.value = "";
  startDate.value = "";
  endDate.value = "";
  currentPage.value = 1;

  console.log("Navigation state for bulk datasets:", navigationState.value);
};

// Navigation state helpers
const hasActiveNavigation = computed(() => navigationState.value.type !== null);

const navigationMessage = computed(() => {
  const nav = navigationState.value;
  if (!nav.type) return "";

  if (nav.type === "dataset") {
    return `Viewing dataset: ${nav.targetId}`;
  } else if (nav.type === "paper") {
    return `Viewing paper: ${nav.targetId}`;
  } else if (nav.type === "datasets") {
    return `Viewing datasets from: ${truncateText(nav.sourceTitle, 80)}`;
  }
  return "";
});

const resetNavigation = () => {
  navigationState.value = {
    type: null,
    targetId: null,
    sourceType: null,
    sourceTitle: null,
    paperPubmedId: null,
  };

  // Clear all filters and search
  clearFilters();
  clearSpatialFilters();
  Object.keys(multiFilters.value).forEach((key) => {
    multiFilters.value[key] = [];
  });
  searchQuery.value = "";
  startDate.value = "";
  endDate.value = "";
  currentPage.value = 1;
};

// Get related paper for a dataset
// - single-cell: match by pubmed_id or public_data_id/public_dataset_id
// - spatial: match by data_id, pmid/pubmed_id, or public_data_id/public_dataset_id (handles URLs)
const normalizeIds = (value) => {
  if (!value) return [];
  return String(value)
    .split(/[;,\s]+/)
    .map((id) => id.trim())
    .filter((id) => id)
    .map((id) => id.toLowerCase());
};

const getRelatedPaper = (dataset) => {
  if (!dataset) return null;
  if (dataType.value === "spatial") {
    const datasetCandidates = [
      dataset.data_id,
      dataset.dataset_id,
      dataset.public_dataset_id,
      dataset.public_data_id,
      dataset.accession,
      dataset.record_id,
    ]
      .flatMap((value) => normalizeIds(value))
      .filter(Boolean);

    // 1) Direct data_id match
    if (datasetCandidates.length > 0) {
      const matchByDataId = currentPapers.value.find((paper) => {
        const paperDataIds = normalizeIds([
          paper.data_id,
          paper.dataset_id,
          paper.record_id,
        ]);
        return paperDataIds.some((paperId) => datasetCandidates.includes(paperId));
      });
      if (matchByDataId) return matchByDataId;
    }

    // 2) Explicit paper reference
    if (dataset.paper_id) {
      const matchByPaperId = currentPapers.value.find(
        (paper) => String(paper.id) === String(dataset.paper_id)
      );
      if (matchByPaperId) return matchByPaperId;
    }

    // 3) Public accession / URL match
    const datasetPublicIds = normalizeIds([
      dataset.public_dataset_id,
      dataset.public_data_id,
      dataset.public_id,
      dataset.accession,
    ]);

    if (datasetPublicIds.length > 0) {
      const matchByPublicId = currentPapers.value.find((paper) => {
        const paperPublicIds = normalizeIds([
          paper.public_data_id,
          paper.public_dataset_id,
          paper.public_id,
        ]);

        return datasetPublicIds.some((datasetId) =>
          paperPublicIds.some(
            (paperId) =>
              datasetId === paperId ||
              datasetId.includes(paperId) ||
              paperId.includes(datasetId)
          )
        );
      });
      if (matchByPublicId) return matchByPublicId;
    }

    // 4) PMID / PubMed match
    const datasetPmids = normalizeIds([dataset.pmid, dataset.pubmed_id]);
    if (datasetPmids.length > 0) {
      const matchByPmid = currentPapers.value.find((paper) => {
        const paperPmids = normalizeIds([paper.pmid, paper.pubmed_id]);
        return datasetPmids.some((pmid) => paperPmids.includes(pmid));
      });
      if (matchByPmid) return matchByPmid;
    }

    // No match found
    return null;
  }

  // single-cell: try multiple matching strategies
  // First, try matching by public_data_id/public_dataset_id
  if (dataset.public_dataset_id) {
    const datasetPublicIds = String(dataset.public_dataset_id)
      .split(";")
      .map((id) => id.trim())
      .filter((id) => id);
    const foundPaperByPublicId = currentPapers.value.find((paper) => {
      if (!paper.public_data_id) return false;
      return datasetPublicIds.includes(String(paper.public_data_id).trim());
    });
    if (foundPaperByPublicId) return foundPaperByPublicId;
  }

  // Second, try matching by pubmed_id
  if (dataset.pubmed_id) {
    const datasetPubmedIds = String(dataset.pubmed_id)
      .split(",")
      .map((id) => id.trim());
    const foundPaper = currentPapers.value.find((paper) =>
      datasetPubmedIds.includes(String(paper.pubmed_id || "").trim())
    );
    if (foundPaper) return foundPaper;
  }

  return null;
};

// Get related datasets for a paper
// - single-cell: match by pubmed_id or public_data_id/public_dataset_id
// - spatial: match by data_id, pmid/pubmed_id, or public_data_id/public_dataset_id (handles URLs)
const getRelatedDatasets = (paper) => {
  if (!paper) return [];
  if (dataType.value === "spatial") {
    const relatedDatasets = [];
    
    // First, try matching by public_data_id/public_dataset_id (handles URLs)
    if (paper.public_data_id) {
      // Paper public_data_id can contain URLs separated by spaces
      const paperPublicIds = String(paper.public_data_id)
        .split(/\s+/)
        .map((id) => id.trim())
        .filter((id) => id);
      const foundByPublicId = currentDatasets.value.filter((dataset) => {
        if (!dataset.public_dataset_id) return false;
        const datasetPublicIds = String(dataset.public_dataset_id)
          .split(/[;\s]+/)
          .map((id) => id.trim())
          .filter((id) => id);
        // Check if any paper ID matches any dataset ID (handles partial URL matches)
        return paperPublicIds.some((paperId) =>
          datasetPublicIds.some((datasetId) => {
            // Exact match
            if (datasetId === paperId) return true;
            // URL match (check if one contains the other)
            if (datasetId.includes(paperId) || paperId.includes(datasetId)) return true;
            return false;
          })
        );
      });
      relatedDatasets.push(...foundByPublicId);
    }
    
    // Second, try matching by pmid/pubmed_id
    const paperPmid = paper.pmid || paper.pubmed_id;
    if (paperPmid) {
      const paperPmidStr = String(paperPmid).trim();
      const foundByPmid = currentDatasets.value.filter((dataset) => {
        const datasetPmid = dataset.pmid || dataset.pubmed_id;
        if (!datasetPmid) return false;
        const datasetPmids = String(datasetPmid)
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
        return datasetPmids.includes(paperPmidStr);
      });
      // Add only if not already in the list (avoid duplicates)
      foundByPmid.forEach((dataset) => {
        if (!relatedDatasets.find((d) => d.id === dataset.id)) {
          relatedDatasets.push(dataset);
        }
      });
    }
    
    // Third, try matching by data_id
    // Check if dataset.data_id or dataset.dataset_id matches paper.data_id
    if (paper.data_id) {
      const foundByDataId = currentDatasets.value.filter((dataset) => {
        const datasetDataId = dataset.data_id || dataset.dataset_id;
        return datasetDataId && String(datasetDataId).trim() === String(paper.data_id).trim();
      });
      // Add only if not already in the list (avoid duplicates)
      foundByDataId.forEach((dataset) => {
        if (!relatedDatasets.find((d) => d.id === dataset.id)) {
          relatedDatasets.push(dataset);
        }
      });
    }
    
    return relatedDatasets;
  }

  // single-cell: try multiple matching strategies
  const relatedDatasets = [];
  
  // First, try matching by public_data_id/public_dataset_id
  if (paper.public_data_id) {
    const paperPublicId = String(paper.public_data_id).trim();
    const foundByPublicId = currentDatasets.value.filter((dataset) => {
      if (!dataset.public_dataset_id) return false;
      const datasetPublicIds = String(dataset.public_dataset_id)
        .split(";")
        .map((id) => id.trim())
        .filter((id) => id);
      return datasetPublicIds.includes(paperPublicId);
    });
    relatedDatasets.push(...foundByPublicId);
  }

  // Second, try matching by pubmed_id
  if (paper.pubmed_id) {
    const paperPubmedId = String(paper.pubmed_id).trim();
    const foundByPubmedId = currentDatasets.value.filter((dataset) => {
      if (!dataset.pubmed_id) return false;
      const datasetPubmedIds = String(dataset.pubmed_id)
        .split(",")
        .map((id) => id.trim());
      return datasetPubmedIds.includes(paperPubmedId);
    });
    // Add only if not already in the list (avoid duplicates)
    foundByPubmedId.forEach((dataset) => {
      if (!relatedDatasets.find((d) => d.id === dataset.id)) {
        relatedDatasets.push(dataset);
      }
    });
  }

  return relatedDatasets;
};

// Extract journal from citation
const extractJournal = (citation) => {
  if (!citation) return "";
  // Try to extract journal name from citation format
  const parts = citation.split(".");
  if (parts.length >= 3) {
    return parts[parts.length - 3].trim();
  }
  return "";
};

// Extract year from date_published
const extractYear = (datePublished) => {
  if (!datePublished) return "";
  // Handle various date formats
  const match = datePublished.match(/\d{4}/);
  return match ? match[0] : "";
};

const externalDatasetUrl = (id) => {
  return `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${encodeURIComponent(
    id
  )}`;
};

// counts helper: counts respecting other filters and search/date
const computeCounts = (category, options) => {
  // Apply all current filters except the category being counted
  const otherFiltersApplied = currentDatasets.value.filter((d) => {
    // apply composable filters except category
    const ok = Object.entries(filters.value).every(([k, v]) => {
      if (k === category) return true;
      if (!v) return true;
      return String(d[k] || "")
        .toLowerCase()
        .includes(String(v).toLowerCase());
    });
    if (!ok) return false;
    // apply search/date constraints too
    const q = searchQuery.value.trim().toLowerCase();
    const matchesQuery = q
      ? [
          d.dataset_id,
          d.species,
          d.disease,
          d.brain_region,
          d.pubmed_id,
          d.data_type,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      : true;
    if (!matchesQuery) return false;
    const createdTs = normalizeDate(d.created_at);
    const start = normalizeDate(startDate.value);
    const end = normalizeDate(endDate.value);
    const withinStart = start ? (createdTs ? createdTs >= start : false) : true;
    const withinEnd = end ? (createdTs ? createdTs <= end : false) : true;
    return withinStart && withinEnd;
  });

  const countsMap = new Map();
  options.forEach((o) => countsMap.set(o, 0));
  otherFiltersApplied.forEach((d) => {
    const v = d[category];
    if (!v) return;
    if (!countsMap.has(v)) countsMap.set(v, 0);
    countsMap.set(v, countsMap.get(v) + 1);
  });
  const results = Array.from(countsMap.entries()).map(([value, count]) => ({
    value,
    count,
  }));
  results.sort(
    (a, b) =>
      b.count - a.count || String(a.value).localeCompare(String(b.value))
  );
  return results;
};

// Option sources reflect current dataType
const speciesWithCounts = computed(() =>
  computeCounts(
    "species",
    dataType.value === "single-cell"
      ? speciesOptions.value
      : spatialDatasetSpeciesOptions.value
  )
);
const regionsWithCounts = computed(() =>
  computeCounts(
    "brain_region",
    dataType.value === "single-cell"
      ? brainRegionOptions.value
      : spatialDatasetBrainRegionOptions.value
  )
);
const typesWithCounts = computed(() =>
  computeCounts(
    "data_type",
    dataType.value === "single-cell" ? dataTypeOptions.value : []
  )
);
const diseasesWithCounts = computed(() =>
  computeCounts(
    "disease",
    dataType.value === "single-cell"
      ? diseaseOptions.value
      : spatialDatasetDiseaseOptions.value
  )
);
const sexWithCounts = computed(() =>
  computeCounts("sex", dataType.value === "single-cell" ? sexOptions.value : [])
);
const statusWithCounts = computed(() =>
  computeCounts(
    "status",
    dataType.value === "single-cell" ? statusOptions.value : []
  )
);
const protocolWithCounts = computed(() =>
  computeCounts("protocol", protocolOptions.value)
);
const methodologyWithCounts = computed(() =>
  computeCounts("methodology", methodologyOptions.value)
);

// Unified Technology (Protocol for single-cell, Methodology for spatial)
const technologyWithCounts = computed(() => {
  return dataType.value === "single-cell"
    ? protocolWithCounts.value
    : methodologyWithCounts.value;
});

// visible slices based on expanded state and defaultVisibleCount
const speciesVisible = computed(() =>
  expanded.value.species
    ? speciesWithCounts.value
    : speciesWithCounts.value.slice(0, defaultVisibleCount)
);
const regionsVisible = computed(() =>
  expanded.value.brain_region
    ? regionsWithCounts.value
    : regionsWithCounts.value.slice(0, defaultVisibleCount)
);
const typesVisible = computed(() =>
  expanded.value.data_type
    ? typesWithCounts.value
    : typesWithCounts.value.slice(0, defaultVisibleCount)
);
const diseasesVisible = computed(() =>
  expanded.value.disease
    ? diseasesWithCounts.value
    : diseasesWithCounts.value.slice(0, defaultVisibleCount)
);
const sexVisible = computed(() =>
  expanded.value.sex
    ? sexWithCounts.value
    : sexWithCounts.value.slice(0, defaultVisibleCount)
);
const statusVisible = computed(() =>
  expanded.value.status
    ? statusWithCounts.value
    : statusWithCounts.value.slice(0, defaultVisibleCount)
);
const protocolVisible = computed(() =>
  expanded.value.protocol
    ? protocolWithCounts.value
    : protocolWithCounts.value.slice(0, defaultVisibleCount)
);
const technologyVisible = computed(() =>
  expanded.value.data_type
    ? technologyWithCounts.value
    : technologyWithCounts.value.slice(0, defaultVisibleCount)
);

// Load papers data
const loadPapers = async () => {
  papersLoading.value = true;
  papersError.value = null;

  try {
    const data = await apiService.getAllPapers();
    papers.value = data;
    console.log(`Loaded ${data.length} papers from API`);
  } catch (err) {
    papersError.value = err.message;
    console.error("Failed to load papers:", err);
  } finally {
    papersLoading.value = false;
  }
};

// Switch between single-cell and spatial data
const switchDataType = async (type) => {
  dataType.value = type;

  if (type === "spatial") {
    if (spatialDatasets.value.length === 0) {
      await loadSpatialDatasets();
    }
    if (spatialPapers.value.length === 0) {
      await loadSpatialPapers();
    }
  }
};

// Computed properties to get current data based on dataType
const currentDatasets = computed(() => {
  return dataType.value === "single-cell"
    ? datasets.value
    : spatialDatasets.value;
});

const currentPapers = computed(() => {
  return dataType.value === "single-cell" ? papers.value : spatialPapers.value;
});

const currentLoading = computed(() => {
  return dataType.value === "single-cell"
    ? loading.value
    : spatialLoading.value;
});

const currentError = computed(() => {
  return dataType.value === "single-cell" ? error.value : spatialError.value;
});

const currentFilteredDatasets = computed(() => {
  return dataType.value === "single-cell"
    ? filteredDatasets.value
    : filteredSpatialDatasets.value;
});

// Combined loading function
const loadData = async () => {
  await Promise.all([loadDatasets(), loadPapers()]);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Custom Tailwind Components for DatasetsExplorer */
</style>
