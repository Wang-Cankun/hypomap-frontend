<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <header
      class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm"
    >
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <router-link
              to="/"
              class="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </router-link>
            <div class="h-6 w-px bg-gray-300"></div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-gray-900">
                {{ pageTitle }}
              </h1>
              <span
                class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
              >
                {{ datasetInfo.n_cells?.toLocaleString() || 0 }} spots •
                {{ datasetInfo.n_genes?.toLocaleString() || 0 }} genes
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <span
              v-if="
                spatialMetadata.species && spatialMetadata.species !== 'N/A'
              "
              class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
            >
              {{ spatialMetadata.species }}
            </span>
            <span
              v-if="
                spatialMetadata.disease && spatialMetadata.disease !== 'N/A'
              "
              class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium"
            >
              {{ spatialMetadata.disease }}
            </span>
            <span
              v-if="spatialMetadata.sex && spatialMetadata.sex !== 'N/A'"
              class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
            >
              {{ spatialMetadata.sex }}
            </span>
            <span
              v-if="spatialMetadata.status && spatialMetadata.status !== 'N/A'"
              class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
            >
              {{ spatialMetadata.status }}
            </span>
            <span
              v-if="
                spatialMetadata.protocol && spatialMetadata.protocol !== 'N/A'
              "
              class="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium"
            >
              {{ spatialMetadata.protocol }}
            </span>
            <span
              v-if="spatialMetadata.tissue && spatialMetadata.tissue !== 'N/A'"
              class="px-3 py-1 bg-pink-100 text-rose-700 rounded-full text-sm font-medium"
            >
              {{ spatialMetadata.tissue }}
            </span>
            <span
              v-if="datasetTypeLabel"
              class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
            >
              {{ datasetTypeLabel }}
            </span>
            <span
              v-if="spatialInfo?.has_deconvolution"
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              Deconvolution
            </span>
            <span
              v-if="spatialInfo?.has_ccc"
              class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
            >
              Cell-Cell Communication
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center h-[calc(100vh-80px)]"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading spatial data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || apiError"
      class="flex items-center justify-center h-[calc(100vh-80px)]"
    >
      <div
        class="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md"
      >
        <p class="text-red-800 font-semibold mb-2">Error loading data</p>
        <p class="text-red-600 text-sm">{{ error || apiError }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex h-[calc(100vh-80px)]">
      <!-- Left Sidebar - Analysis Tools -->
      <aside class="w-72 bg-white border-r border-gray-200 overflow-y-auto">
        <div class="p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Analysis Tools
          </h2>
          <nav class="space-y-1">
            <button
              v-for="tool in availableTools"
              :key="tool.id"
              @click="activeTool = tool.id"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                activeTool === tool.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50',
              ]"
            >
              <component
                v-if="typeof tool.icon === 'object'"
                :is="tool.icon"
                :name="tool.iconName"
                class="flex-shrink-0"
              />
              <span v-else class="text-xl">{{ tool.icon }}</span>
              <span>{{ tool.name }}</span>
            </button>
          </nav>

          <!-- Dataset Info -->
          <div
            class="mt-6 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-3"
          >
            <h3
              class="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between cursor-pointer"
              @click="showDatasetInfo = !showDatasetInfo"
            >
              <span>Dataset Information</span>
              <button
                class="text-gray-400 hover:text-gray-600 transition-transform"
                :class="{ 'rotate-180': !showDatasetInfo }"
              >
                ▼
              </button>
            </h3>
            <div v-show="showDatasetInfo">
              <dl class="grid grid-cols-2 gap-x-3 gap-y-2">
                <div>
                  <dt class="text-xs text-gray-500">Dataset ID</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ datasetId }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Type</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{
                      spatialInfo?.dataset_type ||
                      spatialInfo?.dataset?.methodology ||
                      "Unknown"
                    }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Spots</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.spots?.toLocaleString?.() || 0 }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Genes</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.genes?.toLocaleString?.() || 0 }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Species</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.species || "N/A" }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Tissue</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.tissue || "N/A" }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Disease</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.disease || "N/A" }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Sex</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.sex || "N/A" }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Age</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{
                      spatialMetadata.age &&
                      spatialMetadata.age !== "N/A" &&
                      spatialMetadata.age !== "no data available"
                        ? spatialMetadata.age
                        : "no data available"
                    }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">Protocol</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.protocol || "N/A" }}
                  </dd>
                </div>
                <div v-if="spatialMetadata.publicDatasetId">
                  <dt class="text-xs text-gray-500">Public Dataset ID</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.publicDatasetId }}
                  </dd>
                </div>
                <div v-if="spatialMetadata.slideId">
                  <dt class="text-xs text-gray-500">Slide ID</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.slideId }}
                  </dd>
                </div>
                <div
                  v-if="
                    spatialMetadata.status && spatialMetadata.status !== 'N/A'
                  "
                >
                  <dt class="text-xs text-gray-500">Status</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ spatialMetadata.status }}
                  </dd>
                </div>
              </dl>
              <div
                v-if="
                  (spatialMetadata.doi ||
                    (spatialMetadata.pmid && spatialMetadata.pmid !== 'N/A')) &&
                  spatialMetadata.paper_title &&
                  spatialMetadata.paper_title !== 'N/A'
                "
                class="mt-3 pt-3 border-t border-gray-200"
              >
                <dt class="text-xs text-gray-500 mb-1">Related Paper</dt>
                <dd
                  class="text-xs font-medium text-gray-900 mb-2 leading-relaxed"
                >
                  {{ spatialMetadata.paper_title }}
                </dd>
                <div class="flex flex-col gap-2">
                  <a
                    v-if="spatialMetadata.doi"
                    :href="`https://doi.org/${spatialMetadata.doi}`"
                    target="_blank"
                    class="flex items-start text-xs text-primary-600 hover:text-primary-700 font-medium break-words"
                  >
                    <AppIcon name="document" size="xs" class="mr-1 flex-shrink-0" />
                    <span class="break-all">
                      DOI: {{ spatialMetadata.doi }}
                    </span>
                  </a>
                  <a
                    v-if="
                      spatialMetadata.pmid && spatialMetadata.pmid !== 'N/A'
                    "
                    :href="`https://pubmed.ncbi.nlm.nih.gov/${spatialMetadata.pmid}`"
                    target="_blank"
                    class="flex items-start text-xs text-primary-600 hover:text-primary-700 font-medium break-words"
                  >
                    <AppIcon name="link" size="xs" class="mr-1 flex-shrink-0" />
                    <span>PubMed: {{ spatialMetadata.pmid }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto p-6">
        <!-- Spatial Plots -->
        <div v-if="activeTool === 'spatial'" class="h-full flex flex-col">
          <div class="flex flex-1 gap-4">
            <!-- Visualization Settings -->
            <div
              class="w-80 bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
            >
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AppIcon name="palette" size="md" /> Visualization
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Color By
                  </label>
                  <select
                    v-model="colorBy"
                    @change="updateColorBy"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="" disabled>Select a metadata field</option>
                    <option
                      v-for="opt in availableColorBy"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                </div>

                <ColorPaletteSelector
                  v-model="colorPalette"
                  type="cellType"
                  label="Color Palette (Categories)"
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Point Size: {{ pointSize }}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    v-model.number="pointSize"
                    class="w-full"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">
                      Categories
                    </span>
                    <div
                      class="flex items-center gap-2 text-xs text-primary-600"
                    >
                      <button
                        type="button"
                        class="hover:underline"
                        @click="selectAllCategories"
                        :disabled="!categoryList.length"
                      >
                        All
                      </button>
                      <span class="text-gray-300">•</span>
                      <button
                        type="button"
                        class="hover:underline"
                        @click="clearCategories"
                        :disabled="!categoryList.length"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="categoryList.length"
                    class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100"
                  >
                    <label
                      v-for="cat in categoryList"
                      :key="cat.label"
                      class="flex items-center gap-3 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        class="w-4 h-4 rounded text-primary-600"
                        v-model="selectedCategories"
                        :value="cat.label"
                      />
                      <span
                        class="h-3 w-3 rounded-full border border-gray-200"
                        :style="{ backgroundColor: cat.color }"
                        :title="cat.color"
                      ></span>
                      <span class="flex-1 truncate">{{ cat.label }}</span>
                      <span class="text-xs text-gray-500">
                        ({{ cat.count.toLocaleString() }})
                      </span>
                    </label>
                  </div>
                  <div
                    v-else
                    class="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    No categories available for the selected annotation.
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      v-model="showImageLayer"
                      class="w-4 h-4 text-primary-600 rounded"
                      :disabled="!canShowTissueImage"
                    />
                    Show tissue image overlay (in development)
                  </label>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Image Opacity (in development)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      v-model.number="imageOpacity"
                      class="w-full"
                      :disabled="!showImageLayer"
                    />
                    <div class="text-xs text-gray-500 mt-1">
                      {{ (imageOpacity * 100).toFixed(0) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plots -->
            <div class="flex-1 flex flex-col gap-4">
              <!-- Spatial scatter + tissue image -->
              <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl border border-gray-200 p-6">
                  <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">
                          Spatial Tissue Scatter
                        </h3>
                        <p class="text-sm text-gray-500">
                          Spots are colored by
                          {{
                            colorBy || availableColorBy[0]?.label || "metadata"
                          }}
                          on transformed spatial coordinates.
                        </p>
                      </div>
                      <DownloadButtons
                        :disabled="
                          !spatialPlotDataWithImage && !spatialPlotData
                        "
                        @download-png="downloadSpatialPlot"
                        @download-csv="downloadSpatialCSV"
                        png-title="Download spatial plot as PNG image"
                        csv-title="Download spatial embedding data as CSV"
                      />
                    </div>
                  </div>

                  <div
                    class="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                    :style="spatialContainerStyle"
                  >
                    <v-chart
                      v-if="spatialPlotDataWithImage || spatialPlotData"
                      ref="spatialChart"
                      :option="spatialOption"
                      autoresize
                      :key="spatialChartKey"
                      class="w-full h-full"
                    />
                    <div
                      v-else
                      class="h-full flex items-center justify-center text-gray-400"
                    >
                      <div class="text-center">
                        <AppIcon name="pin" size="xl" class="mx-auto mb-2" />
                        <p>Loading spatial plot...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-xl border border-gray-200 p-6">
                  <div
                    class="flex items-start justify-between gap-4 mb-4"
                    data-testid="tissue-image-header"
                  >
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">
                        Tissue Image
                      </h3>
                      <p class="text-sm text-gray-500">
                        Alignment with scatter may require manual adjustment.
                      </p>
                    </div>
                    <button
                      class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!spatialPlotDataWithImage?.image_url"
                      @click="downloadTissueImage"
                    >
                      📥 Download PNG
                    </button>
                  </div>
                  <div
                    class="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center"
                    :style="spatialContainerStyle"
                  >
                    <img
                      v-if="normalizedImageUrl"
                      :src="normalizedImageUrl"
                      alt="Tissue image"
                      class="w-full h-full object-contain"
                    />
                    <div
                      v-else
                      class="h-full w-full flex items-center justify-center text-gray-400"
                    >
                      <div class="text-center">
                        <AppIcon name="image" size="xl" class="mx-auto mb-2" />
                        <p>Tissue image unavailable</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Annotation overview + UMAP -->
              <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl border border-gray-200 p-4">
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">
                          UMAP (Dimension Reduction)
                        </h3>
                        <p class="text-sm text-gray-500">
                          Spots are colored by
                          {{
                            colorBy || availableColorBy[0]?.label || "metadata"
                          }}
                          on UMAP embedding.
                        </p>
                      </div>
                      <DownloadButtons
                        :disabled="!embeddingData || !spatialPlotData"
                        @download-png="downloadEmbeddingPNG"
                        @download-csv="downloadEmbeddingCSV"
                        png-title="Download UMAP embedding plot as PNG image"
                        csv-title="Download UMAP embedding data as CSV"
                      />
                    </div>
                  </div>
                  <div class="h-[620px]">
                    <v-chart
                      v-if="embeddingData && spatialPlotData"
                      ref="embeddingChartRef"
                      :option="embeddingOption"
                      autoresize
                      :key="embeddingChartKey"
                      class="w-full h-full"
                    />
                    <div
                      v-else
                      class="h-full flex items-center justify-center text-gray-400"
                    >
                      <div class="text-center">
                        <AppIcon name="chart" size="xl" class="mx-auto mb-2" />
                        <p>Loading UMAP embedding...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="categoryList.length"
                  class="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">
                          Annotation Overview
                        </h3>
                        <p class="text-sm text-gray-500">
                          Categories for
                          {{
                            colorBy ||
                            availableColorBy[0]?.label ||
                            "annotation"
                          }}
                          with counts and proportions.
                        </p>
                      </div>
                      <DownloadButtons
                        :disabled="!categoryList.length"
                        @download-png="downloadAnnotationPNG"
                        @download-csv="downloadAnnotationCSV"
                        png-title="Download annotation overview plot as PNG image"
                        csv-title="Download annotation overview data as CSV"
                      />
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ categoryList.length.toLocaleString() }} categories
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto mb-4"
                  >
                    <div
                      v-for="cat in categoryList"
                      :key="`legend-${cat.label}`"
                      class="flex items-center gap-2 text-xs text-gray-700 truncate"
                    >
                      <span
                        class="h-3 w-3 rounded-full border border-gray-200 flex-shrink-0"
                        :style="{ backgroundColor: cat.color }"
                      ></span>
                      <span class="truncate">{{ cat.label }}</span>
                      <span class="text-[10px] text-gray-500">
                        ({{ cat.count.toLocaleString() }})
                      </span>
                    </div>
                  </div>
                  <div class="h-[360px]">
                    <v-chart
                      ref="annotationChartRef"
                      :option="annotationBarOption"
                      autoresize
                      class="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gene Expression (Spatial) -->
        <div v-if="activeTool === 'gene'" class="flex flex-col">
          <div
            class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          >
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    Gene Expression Analysis (Spatial)
                  </h3>
                  <p class="text-sm text-gray-500">
                    Single gene, co-expression, module score, heatmap/dotplot,
                    and SVG using spatial coordinates and UMAP embedding.
                  </p>
                </div>
              </div>
              <!-- Tabs styled like SingleCellAnalysis -->
              <div class="flex gap-2 border-b border-gray-200 mt-3">
                <button
                  @click="geneExpressionTab = 'svg'"
                  :class="[
                    'px-4 py-2 font-medium text-sm transition-colors',
                    geneExpressionTab === 'svg'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900',
                  ]"
                >
                  Spatially Variable Genes
                </button>
                <button
                  @click="geneExpressionTab = 'single'"
                  :class="[
                    'px-4 py-2 font-medium text-sm transition-colors',
                    geneExpressionTab === 'single'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900',
                  ]"
                >
                  Single Gene
                </button>
                <button
                  @click="geneExpressionTab = 'coexpression'"
                  :class="[
                    'px-4 py-2 font-medium text-sm transition-colors',
                    geneExpressionTab === 'coexpression'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900',
                  ]"
                >
                  Co-expression
                </button>
                <button
                  @click="geneExpressionTab = 'module'"
                  :class="[
                    'px-4 py-2 font-medium text-sm transition-colors',
                    geneExpressionTab === 'module'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900',
                  ]"
                >
                  Module Score
                </button>
                <button
                  @click="geneExpressionTab = 'heatmap'"
                  :class="[
                    'px-4 py-2 font-medium text-sm transition-colors',
                    geneExpressionTab === 'heatmap'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900',
                  ]"
                >
                  Heatmap / Dotplot
                </button>
              </div>
            </div>

            <!-- SVG Tab -->
            <div
              v-if="geneExpressionTab === 'svg'"
              class="flex-1 flex flex-col overflow-hidden"
            >
              <SpatiallyVariableGenes
                :dataset-id="datasetIdString"
                @view-gene="visualizeSVGGene"
              />
            </div>

            <!-- Single Gene -->
            <div
              v-else-if="geneExpressionTab === 'single'"
              class="flex-1 flex gap-4 overflow-auto min-h-0"
            >
              <div
                class="w-72 bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4"
              >
                <div class="relative">
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Gene
                    </label>
                    <button
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      @click="loadGeneExpressionData(exampleGene)"
                    >
                      Load Example
                    </button>
                  </div>
                  <input
                    v-model="geneSearchInput"
                    @input="onGeneInput"
                    @focus="showGeneSuggestions = true"
                    @blur="hideGeneSuggestions"
                    type="text"
                    placeholder="Search for a gene..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div
                    v-if="showGeneSuggestions && geneSuggestions.length"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
                  >
                    <button
                      v-for="gene in geneSuggestions"
                      :key="gene.symbol || gene"
                      @mousedown.prevent="
                        selectSuggestedGene(gene.symbol || gene)
                      "
                      class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      {{ gene.symbol || gene }}
                    </button>
                  </div>
                </div>
                <ColorPaletteSelector
                  v-model="geneExpressionPalette"
                  type="expression"
                  label="Color Scale"
                />
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Point Size: {{ pointSize }}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    v-model.number="pointSize"
                    class="w-full"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
                <div
                  v-if="exprStats"
                  class="border border-gray-200 bg-white rounded-lg p-3"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">
                      Expression Stats
                    </span>
                    <span
                      v-if="selectedGene"
                      class="text-xs text-gray-500 truncate max-w-[120px]"
                      :title="selectedGene"
                    >
                      {{ selectedGene }}
                    </span>
                  </div>
                  <dl
                    class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-700"
                  >
                    <div>
                      <dt class="text-gray-500">Min</dt>
                      <dd class="font-semibold text-gray-900">
                        {{ exprStats.min }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-gray-500">Max</dt>
                      <dd class="font-semibold text-gray-900">
                        {{ exprStats.max }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-gray-500">Mean</dt>
                      <dd class="font-semibold text-gray-900">
                        {{ exprStats.mean }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-gray-500">Non-zero %</dt>
                      <dd class="font-semibold text-gray-900">
                        {{ exprStats.nonZeroPct }}%
                      </dd>
                    </div>
                  </dl>
                </div>
                <div v-if="geneExpressionError" class="text-xs text-red-600">
                  {{ geneExpressionError }}
                </div>
              </div>

              <div class="flex-1 flex flex-col gap-4 overflow-auto min-h-0">
                <div
                  v-if="geneExpressionLoading"
                  class="flex-1 flex items-center justify-center text-gray-500"
                >
                  Loading gene expression...
                </div>
                <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div class="bg-white rounded-xl border border-gray-200 p-4">
                    <GeneFeaturePlot
                      :coordinates="geneExpressionSpatialCoords"
                      :expression="geneExpressionValues"
                      :cell-types="geneExpressionCellTypes"
                      :selected-cell-types="[]"
                      :gene-name="selectedGene"
                      :color-palette="geneExpressionPalette"
                      :point-size="pointSize"
                      :use-log="false"
                      title="Spatial Feature Plot"
                      empty-message="Select a gene to visualize expression"
                      x-axis-name="Spatial X"
                      y-axis-name="Spatial Y"
                    />
                  </div>
                  <div class="bg-white rounded-xl border border-gray-200 p-4">
                    <GeneFeaturePlot
                      :coordinates="geneExpressionUMAPCoords"
                      :expression="geneExpressionValues"
                      :cell-types="geneExpressionCellTypes"
                      :selected-cell-types="[]"
                      :gene-name="selectedGene"
                      :color-palette="geneExpressionPalette"
                      :point-size="pointSize"
                      :use-log="false"
                      title="UMAP Feature Plot"
                      empty-message="Select a gene to visualize expression"
                      x-axis-name="UMAP1"
                      y-axis-name="UMAP2"
                    />
                  </div>
                </div>
                <div
                  class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col h-[480px] min-h-0"
                >
                  <ExpressionBoxplot
                    :values="geneExpressionValues"
                    :cell-types="geneExpressionCellTypeList"
                    :cell-type-metadata="geneExpressionCellTypes"
                    :selected-cell-types="selectedExpressionCategories"
                    :all-cell-types="geneExpressionCellTypeList"
                    :color-palette="colorPalette"
                    title="Expression by Category"
                    :use-log="false"
                    :show-median-label="true"
                    empty-message="Select a gene to view expression"
                    :key="boxplotChartKey"
                  />
                </div>
              </div>
            </div>

            <!-- Coexpression -->
            <div
              v-else-if="geneExpressionTab === 'coexpression'"
              class="flex-1 flex"
            >
              <CoexpressionPanel
                :dataset-id="datasetIdString"
                :coordinates="geneExpressionSpatialCoords"
                :api-base-url="API_BASE_URL"
                :fetch-expression="fetchExpressionAligned"
                :search-genes="
                  (q) =>
                    datasetIdString ? searchGenes(datasetIdString, q) : []
                "
                default-gene1=""
                default-gene2=""
                :example-gene1="exampleGene.toLowerCase()"
                example-gene2="gad1"
                x-axis-name="Spatial X"
                y-axis-name="Spatial Y"
                :point-size="pointSize"
                @update:pointSize="(v) => (pointSize = v)"
              />
            </div>

            <!-- Module Score -->
            <div v-else-if="geneExpressionTab === 'module'" class="flex-1 flex">
              <ModuleScorePanel
                :dataset-id="datasetId"
                :api-base-url="API_BASE_URL"
                :coordinates="geneExpressionUMAPCoords"
                :secondary-coordinates="geneExpressionSpatialCoords"
                primary-title="Module Score (UMAP)"
                secondary-title="Module Score (Spatial)"
                primary-x-axis-name="UMAP1"
                primary-y-axis-name="UMAP2"
                secondary-x-axis-name="Spatial X"
                secondary-y-axis-name="Spatial Y"
                :cell-type-metadata="geneExpressionCellTypes"
                :all-cell-types="geneExpressionCellTypeList"
                :color-palette-feature="geneExpressionPalette"
                :color-palette-box="colorPalette"
                :point-size="pointSize"
                :fetch-module-score="fetchModuleScoreAligned"
                @update:pointSize="(v) => (pointSize = v)"
              />
            </div>

            <!-- Heatmap / Dotplot -->
            <div
              v-else-if="geneExpressionTab === 'heatmap'"
              class="flex-1 flex gap-4 overflow-hidden"
            >
              <!-- Settings Column -->
              <div
                class="w-72 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
              >
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AppIcon name="palette" size="md" /> Visualization
                </h3>

                <div class="mb-6 flex-shrink-0">
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Gene List
                    </label>
                    <button
                      @click="loadExampleHeatmapGeneList"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Load Example
                    </button>
                  </div>
                  <textarea
                    v-model="heatmapSettings.geneList"
                    rows="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter genes separated by comma or space&#10;e.g., APOE, GAD1, GFAP, PECAM1&#10;or paste multiple genes"
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    Separate genes by comma or space
                  </p>
                </div>

                <div class="mb-6 flex-shrink-0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Color By
                  </label>
                  <select
                    v-model="heatmapSettings.groupBy"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option
                      v-for="option in availableColorBy"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Annotation used for grouping the heatmap/dotplot.
                  </p>
                </div>

                <div class="mb-6 flex-shrink-0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Visualization Type
                  </label>
                  <select
                    v-model="heatmapSettings.plotType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="heatmap">Heatmap</option>
                    <option value="dotplot">Dotplot</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    {{
                      heatmapSettings.plotType === "heatmap"
                        ? "Color-coded expression matrix"
                        : "Size and color encoded expression"
                    }}
                  </p>
                </div>

                <div class="mb-6 flex-shrink-0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        v-model="heatmapSettings.scaleExpression"
                        class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700">
                        Scale gene expression
                      </span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        v-model="heatmapSettings.clusterRows"
                        class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700">
                        Cluster rows (genes)
                      </span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        v-model="heatmapSettings.clusterColumns"
                        class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700">
                        Cluster columns (annotations)
                      </span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        v-model="heatmapSettings.transpose"
                        class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700">
                        Transpose (flip rows/columns)
                      </span>
                    </label>
                  </div>
                </div>

                <ColorPaletteSelector
                  v-model="heatmapSettings.colorPalette"
                  type="heatmap"
                  label="Color Palette"
                />

                <div class="mb-6 flex-shrink-0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Plot Height
                  </label>
                  <select
                    v-model="heatmapSettings.plotHeight"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="small">Small (400px)</option>
                    <option value="medium">Medium (550px)</option>
                    <option value="large">Large (700px)</option>
                    <option value="xlarge">Extra Large (900px)</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Adjust visualization height
                  </p>
                </div>

                <div class="mb-6 flex-shrink-0">
                  <button
                    class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    :disabled="
                      loadingHeatmap || !heatmapSettings.geneList.trim()
                    "
                    @click="generateHeatmapData"
                  >
                    {{
                      loadingHeatmap
                        ? "Generating..."
                        : `Generate ${
                            heatmapSettings.plotType === "heatmap"
                              ? "Heatmap"
                              : "Dotplot"
                          }`
                    }}
                  </button>
                  <div
                    v-if="heatmapError"
                    class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded"
                  >
                    {{ heatmapError }}
                  </div>
                </div>

                <div class="flex-shrink-0 bg-blue-50 rounded-lg p-3">
                  <p class="text-xs text-gray-700">
                    <strong>Heatmap:</strong> Shows average expression of genes
                    across annotations as a color matrix.
                  </p>
                  <p class="text-xs text-gray-700 mt-2">
                    <strong>Dotplot:</strong> Shows expression level (color) and
                    percentage of cells expressing (size) for each
                    gene-annotation combination.
                  </p>
                </div>
              </div>

              <!-- Visualization Area -->
              <div class="flex-1 flex flex-col min-h-0">
                <div
                  v-if="heatmapData"
                  class="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-0 overflow-hidden"
                  :style="{ maxHeight: heatmapPlotHeight.maxContainer + 'px' }"
                >
                  <h3
                    class="text-sm font-semibold text-gray-700 mb-2 flex-shrink-0"
                  >
                    {{
                      heatmapSettings.plotType === "heatmap"
                        ? "Gene Expression Heatmap"
                        : "Gene Expression Dotplot"
                    }}
                  </h3>
                  <HeatmapDotplot
                    :data="heatmapData?.data || []"
                    :genes="heatmapData?.genes || []"
                    :cell-types="heatmapData?.cell_types || []"
                    :plot-type="heatmapSettings.plotType"
                    :color-palette="heatmapSettings.colorPalette"
                    :transpose="heatmapSettings.transpose"
                    :plot-height="heatmapSettings.plotHeight"
                    :show-title="false"
                    empty-message="Preparing visualization..."
                  />
                </div>
                <div
                  v-else
                  class="flex-1 bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div
                    class="h-full flex items-center justify-center text-gray-400"
                  >
                    <div class="text-center">
                      <AppIcon name="chart" size="xl" class="mx-auto mb-2" />
                      <p>Enter genes and generate visualization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cell-Cell Communication (Xenium only) -->
        <div
          v-if="activeTool === 'ccc' && spatialInfo?.has_ccc"
          class="space-y-4"
        >
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Cell-Cell Communication
            </h3>
            <div v-if="cccData" class="space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-gray-600">
                  Found {{ cccData.interactions?.length || 0 }} interactions
                </p>
                <input
                  v-model="cccFilter"
                  type="text"
                  placeholder="Filter ligand/receptor/cell type..."
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-72"
                />
              </div>
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-3 py-2 text-left font-semibold text-gray-700"
                      >
                        Ligand
                      </th>
                      <th
                        class="px-3 py-2 text-left font-semibold text-gray-700"
                      >
                        Receptor
                      </th>
                      <th
                        class="px-3 py-2 text-left font-semibold text-gray-700"
                      >
                        Pathway
                      </th>
                      <th
                        class="px-3 py-2 text-left font-semibold text-gray-700"
                      >
                        Source
                      </th>
                      <th
                        class="px-3 py-2 text-left font-semibold text-gray-700"
                      >
                        Target
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr
                      v-for="(it, idx) in filteredCccInteractions"
                      :key="idx"
                      class="hover:bg-gray-50"
                    >
                      <td class="px-3 py-2 font-medium text-gray-900">
                        {{ it.ligand || "N/A" }}
                      </td>
                      <td class="px-3 py-2 text-gray-700">
                        {{ it.receptor || "N/A" }}
                      </td>
                      <td class="px-3 py-2 text-gray-700">
                        {{ it.pathway || "N/A" }}
                      </td>
                      <td class="px-3 py-2 text-gray-700">
                        {{ it.source_cell_type || "N/A" }}
                      </td>
                      <td class="px-3 py-2 text-gray-700">
                        {{ it.target_cell_type || "N/A" }}
                      </td>
                    </tr>
                    <tr v-if="filteredCccInteractions.length === 0">
                      <td
                        colspan="5"
                        class="px-3 py-4 text-center text-gray-400"
                      >
                        No interactions match your filter
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="text-xs text-gray-500">
                Data from COMMOT analysis (Xenium).
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-400">
              <p>Loading CCC data...</p>
            </div>
          </div>
        </div>

        <!-- DEG & Pathway -->
        <div v-if="activeTool === 'deg'" class="space-y-4">
          <DegPathwayPanel
            :dataset-id="datasetIdString"
            :api-base-url="API_BASE_URL"
            :available-datasets="degAvailableDatasets"
            :cell-types="degCellTypes"
          />
        </div>
        <!-- Deconvolution Tool -->
        <div v-if="activeTool === 'deconvolution'" class="h-full flex flex-col">
          <DeconvolutionAnalysis
            :dataset-id="datasetIdString"
            :annotations="spatialPlotData?.metadata"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  ScatterChart,
  BarChart,
  BoxplotChart,
  HeatmapChart,
} from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  DataZoomComponent,
  VisualMapComponent,
  GraphicComponent,
} from "echarts/components";
import { useSpatialApi } from "@/composables/useSpatialApi";
import { GeneFeaturePlot } from "@/components/single-cell";
import ExpressionBoxplot from "@/components/single-cell/ExpressionBoxplot.vue";
import HeatmapDotplot from "@/components/single-cell/HeatmapDotplot.vue";
import ColorPaletteSelector from "@/components/single-cell/ColorPaletteSelector.vue";
import CoexpressionPanel from "@/components/single-cell/CoexpressionPanel.vue";
import ModuleScorePanel from "@/components/single-cell/ModuleScorePanel.vue";
import DegPathwayPanel from "@/components/single-cell/DegPathwayPanel.vue";
import SpatiallyVariableGenes from "@/components/single-cell/SpatiallyVariableGenes.vue";
import DeconvolutionAnalysis from "@/components/single-cell/DeconvolutionAnalysis.vue";
import { cellTypeColorPalettes } from "@/composables/useColorPalettes";
import AnalysisToolIcons from "@/components/single-cell/icons/AnalysisToolIcons.vue";
import DownloadButtons from "@/components/single-cell/DownloadButtons.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

use([
  CanvasRenderer,
  ScatterChart,
  BarChart,
  BoxplotChart,
  HeatmapChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  VisualMapComponent,
  GraphicComponent,
]);
const props = defineProps({
  defaultDatasetId: {
    type: String,
    default: "",
  },
  datasetType: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const datasetId = ref(props.defaultDatasetId || route.params.id || "");
const datasetIdString = computed(() => datasetId.value || "");
const showDatasetInfo = ref(true);
const activeTool = ref("spatial");
const selectedGene = ref("");
const pointSize = ref(3);
const colorPalette = ref("default");
const metadataPriority = [
  "cell_type",
  "annotation",
  "seurat_clusters",
  "cluster",
  "clusters",
  "sample",
];
const EMBEDDING_TYPE = "umap";

const {
  loading,
  error: apiError,
  fetchSpatialInfo,
  fetchSpatialPlotData,
  fetchSpatialPlotDataWithImage,
  fetchSpatialImageInfo,
  fetchEmbedding,
  fetchDeconvolutionPlotData,
  fetchCCCInteractions,
  fetchDatasetInfo,
  fetchAnalysisFeatures,
  fetchGeneExpression,
  searchGenes,
  API_BASE_URL,
} = useSpatialApi();

const spatialInfo = ref(null);
const datasetInfo = ref({});
const spatialMetadata = ref({
  species: "N/A",
  spots: 0,
  genes: 0,
  tissue: "N/A",
  disease: "N/A",
  status: "N/A",
  sex: "N/A",
  age: "no data available",
  protocol: "N/A",
  publicDatasetId: null,
  slideId: null,
  pmid: null,
  doi: null,
  paper_title: "N/A",
});
const paperInfo = ref(null);
const datasetTypeLabel = computed(() => {
  const raw =
    spatialInfo.value?.dataset_type || spatialInfo.value?.dataset?.methodology;
  if (!raw) return "";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
});
const spatialPlotData = ref(null);
const spatialPlotDataWithImage = ref(null);
const spatialImageInfo = ref(null);
const spatialChart = ref(null);
const embeddingChartRef = ref(null);
const annotationChartRef = ref(null);
const selectedSampleKey = ref(null);
const selectedImageKey = ref("hires");
const showImageLayer = ref(false);
const imageOpacity = ref(0.8);
const embeddingData = ref(null);
const colorBy = ref(""); // metadata keys
const selectedCategories = ref(null);
const availableColorBy = computed(() => {
  const metaKeys = spatialPlotDataWithImage.value?.metadata
    ? Object.keys(spatialPlotDataWithImage.value.metadata)
    : spatialPlotData.value?.metadata
    ? Object.keys(spatialPlotData.value.metadata)
    : [];
  if (!metaKeys.length && colorBy.value) {
    return [{ value: colorBy.value, label: colorBy.value }];
  }
  return metaKeys.map((k) => ({ value: k, label: k }));
});
const paletteColors = computed(
  () =>
    cellTypeColorPalettes[colorPalette.value] ||
    cellTypeColorPalettes.default ||
    []
);
const degAvailableDatasets = computed(() => [
  {
    dataset_id: datasetIdString.value || "spatial",
    n_cells: spatialMetadata.value.spots || 0,
    metadata: {
      species: spatialMetadata.value.species,
      disease: spatialMetadata.value.disease,
      tissue: spatialMetadata.value.tissue,
      sex: spatialMetadata.value.sex,
      status: spatialMetadata.value.status,
      public_dataset_id: spatialMetadata.value.publicDatasetId,
      stage: spatialMetadata.value.stage,
      treatment: spatialMetadata.value.treatment,
    },
  },
]);
const degCellTypes = computed(() => {
  const metaValues = currentMetaValues.value || [];
  if (!metaValues.length) return [];
  const allowed = normalizedSelectedCategories.value
    ? new Set(normalizedSelectedCategories.value)
    : null;
  const counts = {};
  metaValues.forEach((val) => {
    const key = String(val);
    if (allowed && !allowed.has(key)) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
});
const activeCategorySet = computed(() => {
  if (!normalizedSelectedCategories.value) return null;
  return new Set(normalizedSelectedCategories.value);
});

const hasSampleChoices = computed(() => {
  const samples = spatialImageInfo.value?.samples;
  return samples && Object.keys(samples).length > 1;
});

const hasImageChoices = computed(() => {
  const imgs =
    spatialImageInfo.value?.samples?.[selectedSampleKey.value]?.image_keys;
  return imgs && imgs.length > 1;
});
const spatialChartKey = computed(() =>
  [
    datasetId.value,
    colorBy.value,
    colorPalette.value,
    selectedSampleKey.value,
    selectedImageKey.value,
    selectedGene.value || "no-gene",
    activeCategorySet.value
      ? Array.from(activeCategorySet.value).join("|")
      : "all",
  ].join("__")
);
const boxplotChartKey = computed(() =>
  [
    datasetId.value,
    selectedGene.value || "no-gene",
    colorBy.value,
    selectedSampleKey.value,
    selectedImageKey.value,
    normalizedSelectedCategories.value
      ? normalizedSelectedCategories.value.join("|")
      : "all",
  ].join("__")
);
const embeddingChartKey = computed(() =>
  [
    datasetId.value,
    colorBy.value,
    colorPalette.value,
    "embedding",
    activeCategorySet.value
      ? Array.from(activeCategorySet.value).join("|")
      : "all",
  ].join("__")
);
const deconvolutionData = ref(null);
const cccData = ref(null);
const error = ref(null);
const cccFilter = ref("");
const geneExpressionTab = ref("svg");
const geneExpressionPalette = ref("reds");
const geneExpressionBase = ref(null);
const geneExpressionExpressions = ref({});
const geneExpressionCellIds = ref([]);
const geneExpressionLoading = ref(false);
const geneExpressionError = ref(null);
const geneSearchInput = ref("");
const geneSuggestions = ref([]);
const showGeneSuggestions = ref(false);
let geneSearchTimeout = null;
const exampleGene = computed(() => {
  const species = (spatialMetadata.value?.species || "").toLowerCase();
  return species.includes("mouse") ? "nrgn" : "NRGN";
});
const heatmapSettings = ref({
  geneList: "",
  plotType: "heatmap",
  colorPalette: "diverging_blue_yellow_red",
  transpose: false,
  plotHeight: "medium",
  scaleExpression: true,
  clusterRows: false,
  clusterColumns: false,
  groupBy: "",
});
const heatmapData = ref(null);
const loadingHeatmap = ref(false);
const heatmapError = ref(null);
const heatmapPlotHeight = computed(() => {
  const height = heatmapSettings.value.plotHeight || "medium";
  const heights = {
    small: { min: 300, max: 400, maxContainer: 500 },
    medium: { min: 400, max: 550, maxContainer: 600 },
    large: { min: 500, max: 700, maxContainer: 800 },
    xlarge: { min: 600, max: 900, maxContainer: 1000 },
  };
  return heights[height] || heights.medium;
});

const pageTitle = computed(() => {
  if (props.datasetType === "visium") {
    return "Spatial Visium Demo";
  } else if (props.datasetType === "xenium") {
    return "Xenium Demo";
  }
  return "Spatial Transcriptomics Analysis";
});

const availableTools = computed(() => {
  const tools = [];
  tools.push({
    id: "spatial",
    name: "Spatial Plots",
    icon: AnalysisToolIcons,
    iconName: "spatial-plots",
  });
  tools.push({
    id: "gene",
    name: "Gene Expression",
    icon: AnalysisToolIcons,
    iconName: "gene-expression",
  });
  if (spatialInfo.value?.has_deconvolution) {
    tools.push({
      id: "deconvolution",
      name: "Deconvolution",
      icon: AnalysisToolIcons,
      iconName: "deconvolution",
    });
  }
  if (spatialInfo.value?.has_ccc) {
    tools.push({
      id: "ccc",
      name: "Cell-Cell Communication",
      icon: AnalysisToolIcons,
      iconName: "cell-communication",
    });
  }
  if (spatialInfo.value?.has_precomputed_deg) {
    tools.push({
      id: "deg",
      name: "Differential Expression",
      icon: AnalysisToolIcons,
      iconName: "deg-pathway",
    });
  }
  return tools;
});

const filteredCccInteractions = computed(() => {
  if (!cccData.value?.interactions) return [];
  const term = cccFilter.value.toLowerCase().trim();
  if (!term) return cccData.value.interactions;
  return cccData.value.interactions.filter((item) => {
    const fields = [
      item.ligand,
      item.receptor,
      item.pathway,
      item.source_cell_type,
      item.target_cell_type,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return fields.includes(term);
  });
});

const buildSpatialMetadata = (info) => {
  const datasetMeta = info?.dataset || datasetInfo.value || {};
  const spots =
    datasetInfo.value?.n_cells ??
    datasetMeta.n_cells ??
    datasetMeta.cells ??
    datasetMeta.n_spots ??
    0;
  const genes =
    datasetInfo.value?.n_genes ?? datasetMeta.n_genes ?? datasetMeta.genes ?? 0;

  const papers = Array.isArray(info?.papers) ? info.papers : [];
  const pubmedId = datasetMeta.pubmed_id || datasetMeta.pmid;
  const datasetPaperKey =
    datasetMeta.paper_id || datasetMeta.data_id || datasetMeta.dataset_id;
  const matchedPaper =
    papers.find(
      (p) =>
        (pubmedId && String(p.pubmed_id) === String(pubmedId)) ||
        (datasetPaperKey &&
          (String(p.paper_id) === String(datasetPaperKey) ||
            String(p.data_id) === String(datasetPaperKey)))
    ) ||
    papers[0] ||
    null;

  paperInfo.value = matchedPaper;

  spatialMetadata.value = {
    species: datasetMeta.species || "N/A",
    spots,
    genes,
    tissue: datasetMeta.brain_region || datasetMeta.tissue || "N/A",
    disease: datasetMeta.disease || "N/A",
    status: datasetMeta.status || "N/A",
    sex: datasetMeta.sex || "N/A",
    age:
      datasetMeta.age ||
      datasetMeta.age_range ||
      datasetMeta.chronological_age ||
      "no data available",
    protocol: datasetMeta.protocol || datasetMeta.methodology || "N/A",
    publicDatasetId:
      datasetMeta.public_dataset_id ||
      datasetMeta.public_data_id ||
      datasetMeta.public_id ||
      null,
    slideId: datasetMeta.slide_id || null,
    pmid:
      matchedPaper?.pubmed_id ||
      datasetMeta.pubmed_id ||
      datasetMeta.pmid ||
      null,
    doi: matchedPaper?.doi || datasetMeta.doi || null,
    paper_title: matchedPaper?.title || datasetMeta.paper_title || "N/A",
  };
};

const metaSummary = computed(() => {
  const metaSource = spatialPlotDataWithImage.value?.metadata || {};
  const metaKey =
    (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
    Object.keys(metaSource)[0];
  const meta = metaKey ? metaSource[metaKey] : null;
  if (!meta || !Array.isArray(meta)) return [];
  const counts = {};
  meta.forEach((m) => {
    const key = String(m);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
});
const currentMetaValues = computed(() => {
  const metaSource = spatialPlotDataWithImage.value?.metadata || {};
  const metaKey =
    (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
    Object.keys(metaSource)[0];
  return metaKey ? (metaSource[metaKey] || []).map((v) => String(v)) : [];
});
const normalizedSelectedCategories = computed(() => {
  if (
    selectedCategories.value === null ||
    selectedCategories.value === undefined
  ) {
    return null;
  }
  return selectedCategories.value.map((c) => String(c));
});

const categoryList = computed(() => {
  const colorMap = buildCategoryColors(
    currentMetaValues.value,
    paletteColors.value
  );
  return metaSummary.value.map((item) => ({
    ...item,
    color: colorMap[item.label] || "#888",
  }));
});

const embeddingCounts = computed(() => {
  const total = embeddingData.value?.coordinates?.length || 0;
  const metaSource = spatialPlotData.value?.metadata || {};
  const metaKey =
    (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
    Object.keys(metaSource)[0];
  const meta = metaKey ? metaSource[metaKey] : null;
  const active = activeCategorySet.value;

  if (!meta || !Array.isArray(meta) || !active) {
    return { total, filtered: total };
  }
  const filtered = meta.reduce(
    (cnt, v) => (active.has(String(v)) ? cnt + 1 : cnt),
    0
  );
  return { total, filtered };
});

const filteredAnnotationData = computed(() => {
  const set = activeCategorySet.value;
  if (!categoryList.value.length) return [];
  if (!set) return categoryList.value;
  return categoryList.value.filter((c) => set.has(String(c.label)));
});

const annotationBarOption = computed(() => {
  const dataSource = filteredAnnotationData.value;
  if (!dataSource.length) {
    return {
      title: {
        text: "No categories available",
        left: "center",
        top: "middle",
        textStyle: { color: "#9ca3af", fontSize: 12 },
      },
    };
  }

  const total = dataSource.reduce((sum, c) => sum + c.count, 0);
  if (total === 0) {
    return {
      title: {
        text: "No data available",
        left: "center",
        top: "middle",
        textStyle: { color: "#9ca3af", fontSize: 12 },
      },
    };
  }

  const data = [...dataSource]
    .map((c) => ({
      name: c.label,
      value: c.count,
      percentage: ((c.count / total) * 100).toFixed(1),
      itemStyle: { color: c.color },
    }))
    .sort((a, b) => b.value - a.value);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const p = params[0];
        return `${p.name}<br/>${p.value.toLocaleString()} spots (${
          p.data.percentage
        }%)`;
      },
    },
    grid: { left: "18%", right: "10%", top: "6%", bottom: "10%" },
    xAxis: {
      type: "value",
      name: "Spot Count",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        formatter: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v),
      },
    },
    yAxis: {
      type: "category",
      data: data.map((d) => d.name),
      axisLabel: {
        interval: 0,
        fontSize: 10,
        formatter: (val) => (val.length > 22 ? `${val.slice(0, 22)}...` : val),
      },
    },
    series: [
      {
        type: "bar",
        name: "Spot Count",
        data,
        label: {
          show: true,
          position: "right",
          formatter: (p) => `${p.data.percentage}%`,
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0,0,0,0.2)",
          },
        },
      },
    ],
  };
});

const geneExpressionMetaSource = computed(
  () => geneExpressionBase.value?.metadata || {}
);

const geneExpressionMetaKey = computed(() => {
  const metaSource = geneExpressionMetaSource.value || {};
  const metaKeys = Object.keys(metaSource);
  if (!metaKeys.length) return null;
  if (colorBy.value && metaSource[colorBy.value]) return colorBy.value;
  return metaKeys[0];
});

const geneExpressionCellTypes = computed(() =>
  geneExpressionMetaKey.value
    ? (geneExpressionMetaSource.value?.[geneExpressionMetaKey.value] || []).map(
        (v) => String(v)
      )
    : []
);

const geneExpressionCellTypeList = computed(() =>
  Array.from(new Set(geneExpressionCellTypes.value))
);
const selectedExpressionCategories = computed(
  () => normalizedSelectedCategories.value || []
);

const geneExpressionValues = computed(() =>
  selectedGene.value
    ? geneExpressionExpressions.value[selectedGene.value] || []
    : []
);

const geneExpressionSpatialCoords = computed(
  () => geneExpressionBase.value?.coordinates || []
);

const geneExpressionUMAPCoords = computed(
  () => embeddingData.value?.coordinates || []
);

const exprStats = computed(() => {
  if (!selectedGene.value) return null;
  const vals = (geneExpressionValues.value || []).filter(
    (v) => v !== null && v !== undefined && !Number.isNaN(v)
  );
  if (!vals.length) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const sum = vals.reduce((a, b) => a + b, 0);
  const mean = sum / vals.length;
  const nonZero = vals.filter((v) => v > 0).length;
  const pct = ((nonZero / vals.length) * 100).toFixed(1);
  return {
    min: min.toFixed(3),
    max: max.toFixed(3),
    mean: mean.toFixed(3),
    nonZeroPct: pct,
  };
});

const deconvCanvas = ref(null);
const selectedDeconvCellType = ref(null);

const loadSpatialData = async () => {
  try {
    // Fetch spatial info to determine available features
    const info = await fetchSpatialInfo(datasetId.value);
    spatialInfo.value = info;

    // Use dataset from spatial info or fetch from h5ad
    if (info.dataset) {
      datasetInfo.value = {
        n_cells: info.dataset.n_cells || info.dataset.cells,
        n_genes: info.dataset.n_genes || info.dataset.genes,
        ...info.dataset,
      };
    } else {
      datasetInfo.value = await fetchDatasetInfo(datasetId.value);
    }

    // Enrich dataset + feature flags using analysis-features endpoint
    try {
      const features = await fetchAnalysisFeatures(datasetId.value);
      if (features) {
        datasetInfo.value = {
          ...datasetInfo.value,
          n_cells:
            features.n_cells ?? features.cells ?? datasetInfo.value?.n_cells,
          n_genes:
            features.n_genes ?? features.genes ?? datasetInfo.value?.n_genes,
        };
        spatialInfo.value = {
          ...spatialInfo.value,
          has_svg: spatialInfo.value?.has_svg ?? features.has_svg,
          has_deconvolution:
            spatialInfo.value?.has_deconvolution ?? features.has_deconvolution,
          has_ccc: spatialInfo.value?.has_ccc ?? features.has_ccc,
          has_precomputed_deg:
            spatialInfo.value?.has_precomputed_deg ??
            features.has_precomputed_deg,
          dataset_type:
            spatialInfo.value?.dataset_type ?? features.dataset_type,
        };
      }
    } catch (err) {
      console.warn("Could not load analysis features:", err);
    }

    buildSpatialMetadata(info);

    // Spatial image info (for sample / image keys)
    try {
      spatialImageInfo.value = await fetchSpatialImageInfo(datasetId.value);
      if (spatialImageInfo.value?.samples) {
        const sampleKeys = Object.keys(spatialImageInfo.value.samples);
        selectedSampleKey.value = sampleKeys[0] || null;
        const images =
          spatialImageInfo.value.samples[selectedSampleKey.value]?.image_keys ||
          [];
        selectedImageKey.value = images[0] || "hires";
      }
    } catch (err) {
      console.warn("Could not load spatial image info:", err);
    }

    // Load spatial plot data with image (include metadata for colorBy)
    if (info?.has_spatial_coordinates) {
      try {
        await loadSpatialPlotWithImage();
      } catch (err) {
        console.warn("Could not load spatial plot data with image:", err);
      }
    }

    // Load dimension reduction data
    await loadEmbedding();

    // Load deconvolution data if available (Visium)
    if (info?.has_deconvolution) {
      try {
        deconvolutionData.value = await fetchDeconvolutionPlotData(
          datasetId.value
        );
        if (deconvolutionData.value?.metadata) {
          const cellTypes = Object.keys(deconvolutionData.value.metadata);
          selectedDeconvCellType.value = cellTypes[0] || null;
        }
        // Set canvas size based on coordinates bounding box
        if (
          deconvCanvas.value &&
          deconvolutionData.value?.coordinates?.length
        ) {
          const xs = deconvolutionData.value.coordinates.map((c) => c[0]);
          const ys = deconvolutionData.value.coordinates.map((c) => c[1]);
          const width = Math.ceil(Math.max(...xs) - Math.min(...xs));
          const height = Math.ceil(Math.max(...ys) - Math.min(...ys));
          deconvCanvas.value.width = Math.max(1, width);
          deconvCanvas.value.height = Math.max(1, height);
        }
        await nextTick();
        drawDeconvOverlay();
      } catch (err) {
        console.warn("Could not load deconvolution data:", err);
      }
    }

    // Load CCC data if available (Xenium)
    if (info?.has_ccc) {
      try {
        cccData.value = await fetchCCCInteractions(datasetId.value);
      } catch (err) {
        console.warn("Could not load CCC data:", err);
      }
    }
  } catch (err) {
    console.error("Error loading spatial data:", err);
    error.value = err.message || "Failed to load spatial data";
  } finally {
    if (error.value) {
      setTimeout(() => {
        if (spatialInfo.value) {
          error.value = null;
        }
      }, 5000);
    }
  }
};

const loadEmbedding = async () => {
  try {
    embeddingData.value = await fetchEmbedding(datasetId.value, EMBEDDING_TYPE);
  } catch (err) {
    console.warn(`Could not load ${EMBEDDING_TYPE} embedding:`, err);
  }
};

const updateColorBy = () => {
  if (!availableColorBy.value.length && !colorBy.value) return;
  loadSpatialPlotWithImage(selectedGene.value);
};

const selectAllCategories = () => {
  if (!categoryList.value.length) return;
  selectedCategories.value = categoryList.value.map((c) => c.label);
};

const clearCategories = () => {
  selectedCategories.value = [];
};

const drawSpatialOverlay = () => {
  // Rendering handled by ECharts spatialOption
};

const buildCategoryColors = (values, paletteOverride) => {
  const palette =
    paletteOverride && paletteOverride.length
      ? paletteOverride
      : [
          "#ef4444",
          "#22c55e",
          "#3b82f6",
          "#f59e0b",
          "#a855f7",
          "#06b6d4",
          "#f97316",
          "#10b981",
          "#6366f1",
          "#f43f5e",
          "#84cc16",
          "#0ea5e9",
          "#d946ef",
          "#14b8a6",
          "#8b5cf6",
          "#facc15",
          "#e879f9",
          "#38bdf8",
          "#fb7185",
          "#94a3b8",
        ];
  const map = {};
  if (!values) return map;
  Array.from(new Set(values.map((v) => String(v)))).forEach((c, idx) => {
    map[c] = palette[idx % palette.length];
  });
  return map;
};

const spatialAspectRatio = computed(() => {
  const h = spatialPlotDataWithImage.value?.image_shape?.[0];
  const w = spatialPlotDataWithImage.value?.image_shape?.[1];
  if (h && w && h > 0 && w > 0) {
    return `${w} / ${h}`;
  }
  return "1 / 1";
});

const spatialContainerStyle = computed(() => ({
  aspectRatio: spatialAspectRatio.value,
  width: "100%",
  minHeight: "420px",
}));

/**
 * Normalize image URL to use the correct API base URL
 * Handles relative URLs and localhost URLs from backend
 * Avoids duplication of /hypomap-backend/api/v1 path
 */
const normalizeImageUrl = (url) => {
  if (!url) return url;

  // Extract the API path suffix (everything after /hypomap-backend/api/v1)
  const extractApiPath = (path) => {
    const apiPathMatch = path.match(/\/hypomap-backend\/api\/v1(\/.*)$/);
    if (apiPathMatch) {
      return apiPathMatch[1]; // Return path after /hypomap-backend/api/v1
    }
    // If it doesn't contain the full path, check if it starts with /hypomap-backend
    const backendMatch = path.match(/\/hypomap-backend(\/.*)$/);
    if (backendMatch) {
      return backendMatch[1]; // Return path after /hypomap-backend
    }
    return path; // Return as-is if no match
  };

  // If it's a relative URL (starts with /)
  if (url.startsWith("/")) {
    const apiPath = extractApiPath(url);
    return `${API_BASE_URL}${apiPath}`;
  }

  // If it's already a full URL, check if it's localhost
  try {
    const urlObj = new URL(url);
    // If it's localhost or 127.0.0.1, extract path and rebuild with API_BASE_URL
    if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
      const path = urlObj.pathname + urlObj.search;
      const apiPath = extractApiPath(path);
      return `${API_BASE_URL}${apiPath}`;
    }
    // If it's a valid URL with a different host, return as-is
    return url;
  } catch (e) {
    // If URL parsing fails but contains localhost, try to extract the path
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      const match = url.match(/\/hypomap-backend\/api\/v1(\/.*)$/);
      if (match) {
        return `${API_BASE_URL}${match[1]}`;
      }
      // Fallback: try to match just /hypomap-backend
      const backendMatch = url.match(/\/hypomap-backend(\/.*)$/);
      if (backendMatch) {
        return `${API_BASE_URL}${backendMatch[1]}`;
      }
    }
    // If we can't parse it and it doesn't start with /, assume it's invalid
    // Return null so we can construct it ourselves
    return null;
  }
};

/**
 * Get the normalized image URL for display
 * Constructs URL from API_BASE_URL if backend URL is invalid or points to localhost
 */
const normalizedImageUrl = computed(() => {
  const backendUrl = spatialPlotDataWithImage.value?.image_url;
  if (!backendUrl || !datasetId.value) return null;

  // Normalize the backend URL
  const normalized = normalizeImageUrl(backendUrl);

  // If normalization failed or still points to localhost, construct it ourselves
  if (
    !normalized ||
    normalized.includes("localhost") ||
    normalized.includes("127.0.0.1")
  ) {
    // Extract sample key and image key from backend URL if possible, otherwise use selected values
    let sampleKey = selectedSampleKey.value;
    let imageKey = selectedImageKey.value || "hires";

    // Try to extract from backend URL pattern: .../spatial/image/{sampleKey}/{imageKey}
    if (backendUrl) {
      const match = backendUrl.match(/\/spatial\/image\/([^\/]+)\/([^\/\?]+)/);
      if (match) {
        sampleKey = match[1];
        imageKey = match[2];
      }
    }

    // Fallback to default if still no sample key
    if (!sampleKey) {
      sampleKey = "slice1";
    }

    return `${API_BASE_URL}/h5ad/${datasetId.value}/spatial/image/${sampleKey}/${imageKey}`;
  }

  return normalized;
});

const canShowTissueImage = computed(() => !!normalizedImageUrl.value);

const spatialOption = computed(() => {
  const data = spatialPlotDataWithImage.value || spatialPlotData.value;
  if (!data || !data.coordinates) return {};

  const coords = data.coordinates;
  const metaSource = data.metadata || {};
  const metaKey =
    (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
    Object.keys(metaSource)[0];
  const meta = metaKey ? metaSource[metaKey] : null;
  const catColor = buildCategoryColors(meta, paletteColors.value);

  const scatterData = coords.reduce((acc, c, i) => {
    const categoryRaw = meta && meta[i] !== undefined ? meta[i] : "NA";
    const category = String(categoryRaw);
    if (activeCategorySet.value && !activeCategorySet.value.has(category)) {
      return acc;
    }
    acc.push({
      value: c,
      category,
      itemStyle: { color: catColor[category] || "#888", opacity: 0.85 },
    });
    return acc;
  }, []);

  // Determine bounds
  let minX = 0;
  let maxX = 800;
  let minY = 0;
  let maxY = 800;

  if (data.image_shape && data.image_shape[0] > 0 && data.image_shape[1] > 0) {
    // Use image dimensions if available
    maxX = data.image_shape[1];
    maxY = data.image_shape[0];
  } else if (coords.length > 0) {
    // Calculate from coordinates
    const xs = coords.map((c) => c[0]);
    const ys = coords.map((c) => c[1]);
    minX = Math.min(...xs);
    maxX = Math.max(...xs);
    minY = Math.min(...ys);
    maxY = Math.max(...ys);

    // Add some padding (5%)
    const paddingX = (maxX - minX) * 0.05;
    const paddingY = (maxY - minY) * 0.05;
    minX -= paddingX;
    maxX += paddingX;
    minY -= paddingY;
    maxY += paddingY;
  }

  return {
    tooltip: {
      trigger: "item",
      formatter: (p) => `${metaKey || "category"}: ${p.data.category ?? "NA"}`,
    },
    grid: { left: 10, right: 10, top: 10, bottom: 10, containLabel: false },
    xAxis: { type: "value", min: minX, max: maxX, show: false, scale: true },
    yAxis: {
      type: "value",
      min: minY,
      max: maxY,
      show: false,
      scale: true,
      inverse: true,
    },
    dataZoom: [
      { type: "inside" },
      { type: "slider", xAxisIndex: 0, height: 12 },
      { type: "slider", yAxisIndex: 0, width: 12 },
    ],
    graphic:
      showImageLayer.value && normalizedImageUrl.value
        ? [
            {
              type: "image",
              id: "bg",
              z: -10,
              style: {
                image: normalizedImageUrl.value,
                x: 0,
                y: 0,
                width: data.image_shape?.[1] || maxX,
                height: data.image_shape?.[0] || maxY,
                opacity: imageOpacity.value,
              },
            },
          ]
        : [],
    series: [
      {
        type: "scatter",
        symbolSize: pointSize.value,
        data: scatterData,
        large: true,
        largeThreshold: 4000,
        emphasis: { disabled: true },
      },
    ],
  };
});

const embeddingOption = computed(() => {
  if (!embeddingData.value || !embeddingData.value.coordinates) return {};
  const metaSource = spatialPlotData.value?.metadata || {};
  const metaKey =
    (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
    Object.keys(metaSource)[0];
  const meta = metaKey ? metaSource[metaKey] : null;
  const catColor = buildCategoryColors(meta, paletteColors.value);

  const scatterData = embeddingData.value.coordinates.reduce((acc, c, i) => {
    const categoryRaw = meta && meta[i] !== undefined ? meta[i] : "NA";
    const category = String(categoryRaw);
    if (activeCategorySet.value && !activeCategorySet.value.has(category)) {
      return acc;
    }
    acc.push({
      value: c,
      category,
      itemStyle: { color: catColor[category] || "#888", opacity: 0.85 },
    });
    return acc;
  }, []);

  return {
    title: {
      text: `UMAP (${embeddingCounts.value.filtered.toLocaleString()} / ${embeddingCounts.value.total.toLocaleString()} cells)`,
      left: "center",
      textStyle: { fontSize: 12, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: (p) => `${metaKey || "category"}: ${p.data.category}`,
    },
    grid: { left: 10, right: 10, top: 10, bottom: 10 },
    xAxis: {
      type: "value",
      show: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
      min: (val) => val.min - 0.5,
      max: (val) => val.max + 0.5,
      scale: true,
    },
    yAxis: {
      type: "value",
      show: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
      min: (val) => val.min - 0.5,
      max: (val) => val.max + 0.5,
      scale: true,
    },
    dataZoom: [{ type: "inside" }],
    series: [
      {
        type: "scatter",
        symbolSize: pointSize.value,
        data: scatterData,
        large: true,
        largeThreshold: 4000,
        emphasis: { disabled: true },
      },
    ],
  };
});

const getColorForExpression = (normalizedValue) => {
  // Use red color palette
  const r = Math.min(255, Math.floor(255 * normalizedValue));
  const g = Math.min(255, Math.floor(100 * (1 - normalizedValue)));
  const b = Math.min(255, Math.floor(100 * (1 - normalizedValue)));
  return `rgb(${r}, ${g}, ${b})`;
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;

const getBivariateColor = (
  expr1,
  expr2,
  max1,
  max2,
  threshold1 = 0,
  threshold2 = 0
) => {
  const norm1 = max1 > 0 ? Math.min(expr1 / max1, 1) : 0;
  const norm2 = max2 > 0 ? Math.min(expr2 / max2, 1) : 0;
  const thresh1 = threshold1 > 0 ? threshold1 / Math.max(max1, 1) : 0.1;
  const thresh2 = threshold2 > 0 ? threshold2 / Math.max(max2, 1) : 0.1;

  const c00 = hexToRgb("#e0e0e0");
  const c01 = hexToRgb("#e74c3c");
  const c10 = hexToRgb("#3498db");
  const c11 = hexToRgb("#9b59b6");

  const clampedNorm1 = Math.max(0, Math.min(norm1, 1));
  const clampedNorm2 = Math.max(0, Math.min(norm2, 1));

  const c0 = {
    r: c00.r * (1 - clampedNorm1) + c10.r * clampedNorm1,
    g: c00.g * (1 - clampedNorm1) + c10.g * clampedNorm1,
    b: c00.b * (1 - clampedNorm1) + c10.b * clampedNorm1,
  };
  const c1 = {
    r: c01.r * (1 - clampedNorm1) + c11.r * clampedNorm1,
    g: c01.g * (1 - clampedNorm1) + c11.g * clampedNorm1,
    b: c01.b * (1 - clampedNorm1) + c11.b * clampedNorm1,
  };

  const final = {
    r: Math.round(c0.r * (1 - clampedNorm2) + c1.r * clampedNorm2),
    g: Math.round(c0.g * (1 - clampedNorm2) + c1.g * clampedNorm2),
    b: Math.round(c0.b * (1 - clampedNorm2) + c1.b * clampedNorm2),
  };

  // Optional thresholding for contrast
  if (norm1 < thresh1 && norm2 < thresh2) return rgbToHex(c00.r, c00.g, c00.b);
  return rgbToHex(final.r, final.g, final.b);
};

const buildPngFilename = (...parts) => {
  const base = parts.filter(Boolean).join("_") || "spatial_image";
  return base.toLowerCase().endsWith(".png") ? base : `${base}.png`;
};

const downloadTissueImage = async () => {
  if (!datasetId.value) return;

  // Construct the image URL using API_BASE_URL to ensure correct production URL
  // Pattern: /h5ad/{datasetId}/spatial/image/{sampleKey}/{imageKey}
  const sampleKey = selectedSampleKey.value || "slice1";
  const imageKey = selectedImageKey.value || "hires";
  const imageUrl = `${API_BASE_URL}/h5ad/${datasetId.value}/spatial/image/${sampleKey}/${imageKey}`;

  const filename = buildPngFilename(
    datasetId.value || "spatial",
    sampleKey,
    imageKey
  );

  try {
    // Always fetch the blob so we control the filename (avoid server GUID names)
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.warn("Could not download tissue image:", err);
    // Fallback: open in new tab so the user can still save manually
    window.open(imageUrl, "_blank");
  }
};

const parseGeneInput = (input) => {
  if (!input) return [];
  const list = Array.isArray(input)
    ? input
    : String(input)
        .split(/[,\s]+/)
        .filter((gene) => gene && gene.length > 0);
  return [...new Set(list.map((gene) => gene.trim()).filter(Boolean))];
};

const resolveHeatmapGroupBy = (preferred) => {
  const available = availableColorBy.value.map((o) => o.value);
  if (preferred && available.includes(preferred)) return preferred;
  if (colorBy.value && available.includes(colorBy.value)) return colorBy.value;
  return available[0] || "";
};

const ensureGeneExpressionBase = async () => {
  // If we already have the base data, do nothing
  if (geneExpressionBase.value) return;

  // Check if spatialPlotDataWithImage already has what we need
  if (
    spatialPlotDataWithImage.value &&
    spatialPlotDataWithImage.value.cell_ids &&
    spatialPlotDataWithImage.value.coordinates
  ) {
    geneExpressionBase.value = spatialPlotDataWithImage.value;
    geneExpressionCellIds.value = geneExpressionBase.value.cell_ids;
    return;
  }

  const metadataFields = Array.from(
    new Set(
      [
        resolveHeatmapGroupBy(heatmapSettings.value.groupBy),
        colorBy.value,
        ...metadataPriority,
      ].filter((field) => field !== null && field !== undefined && field !== "")
    )
  );
  const metadataParam = metadataFields.join(",");

  // If we are here, we really need to fetch
  geneExpressionBase.value = await fetchSpatialPlotDataWithImage(
    datasetId.value,
    {
      metadata: metadataParam,
      sampleKey: selectedSampleKey.value || undefined,
      imageKey: selectedImageKey.value || "hires",
    }
  );
  geneExpressionCellIds.value = geneExpressionBase.value?.cell_ids || [];
};

const alignExpressionToBase = (resp) => {
  if (!resp) return [];
  const expr =
    resp.expression || resp.module_score || resp.values || resp?.data || [];
  const respIds = resp.cell_ids || resp.cellIds || [];
  const baseIds = geneExpressionCellIds.value || [];
  if (!Array.isArray(expr)) return [];
  if (!respIds.length || !baseIds.length) return expr;
  const map = new Map();
  respIds.forEach((id, idx) => map.set(String(id), expr[idx]));
  return baseIds.map((id) => map.get(String(id)) ?? 0);
};

// Aligned fetchers for shared components
const fetchExpressionAligned = async (gene) => {
  await ensureGeneExpressionBase();
  const resp = await fetchGeneExpression(datasetId.value, gene);
  return alignExpressionToBase(resp);
};

const fetchModuleScoreAligned = async (genes) => {
  await ensureGeneExpressionBase();
  const response = await fetch(
    `${API_BASE_URL}/h5ad/${datasetId.value}/module-score`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gene_list: genes, use_raw: false }),
    }
  );
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.detail || response.statusText);
  }
  const resp = await response.json();
  return alignExpressionToBase(resp);
};

const loadGeneExpressionData = async (gene) => {
  if (!gene) return;
  const normalizedGene = gene.trim();
  selectedGene.value = normalizedGene;
  geneSearchInput.value = normalizedGene;
  geneExpressionLoading.value = true;
  geneExpressionError.value = null;
  try {
    await ensureGeneExpressionBase();
    const resp = await fetchGeneExpression(datasetId.value, normalizedGene);
    const aligned = alignExpressionToBase(resp);
    geneExpressionExpressions.value = {
      ...geneExpressionExpressions.value,
      [normalizedGene]: aligned,
    };
  } catch (err) {
    console.error("Error loading gene expression:", err);
    geneExpressionError.value =
      err?.message || "Failed to load gene expression data";
  } finally {
    geneExpressionLoading.value = false;
  }
};

const generateHeatmapData = async () => {
  const genes = parseGeneInput(heatmapSettings.value.geneList);
  if (!genes.length) {
    heatmapError.value = "Please enter at least one gene";
    return;
  }
  const groupBy = resolveHeatmapGroupBy(heatmapSettings.value.groupBy);
  if (!groupBy) {
    heatmapError.value =
      "No annotation available to group by. Please select an annotation.";
    return;
  }
  await ensureGeneExpressionBase();
  loadingHeatmap.value = true;
  heatmapError.value = null;
  try {
    const response = await fetch(
      `${API_BASE_URL}/h5ad/${datasetId.value}/heatmap`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gene_list: genes,
          plot_type: heatmapSettings.value.plotType,
          scale_expression: heatmapSettings.value.scaleExpression,
          cluster_rows: heatmapSettings.value.clusterRows,
          cluster_columns: heatmapSettings.value.clusterColumns,
          transpose: heatmapSettings.value.transpose,
          group_by: groupBy,
        }),
      }
    );
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || response.statusText);
    }
    heatmapData.value = await response.json();
  } catch (err) {
    console.error("Error generating heatmap:", err);
    heatmapError.value = err?.message || "Failed to generate heatmap";
  } finally {
    loadingHeatmap.value = false;
  }
};

const onGeneInput = (event) => {
  const value = event.target.value;
  geneSearchInput.value = value;
  if (geneSearchTimeout) clearTimeout(geneSearchTimeout);
  geneSearchTimeout = setTimeout(async () => {
    const query = value.trim();
    if (query.length < 2) {
      geneSuggestions.value = [];
      return;
    }
    try {
      geneSuggestions.value = await searchGenes(datasetId.value, query);
    } catch (err) {
      console.warn("Gene search failed:", err);
      geneSuggestions.value = [];
    }
  }, 300);
};

const selectSuggestedGene = (geneSymbol) => {
  geneSearchInput.value = geneSymbol;
  showGeneSuggestions.value = false;
  loadGeneExpressionData(geneSymbol);
};

const hideGeneSuggestions = () => {
  setTimeout(() => {
    showGeneSuggestions.value = false;
  }, 150);
};

const drawDeconvOverlay = () => {
  if (!deconvCanvas.value || !deconvolutionData.value) return;
  const canvas = deconvCanvas.value;
  const ctx = canvas.getContext("2d");
  const data = deconvolutionData.value;
  if (!data.coordinates || !data.metadata || !selectedDeconvCellType.value)
    return;

  const values = data.metadata[selectedDeconvCellType.value] || [];
  if (!values.length) return;
  const coords = data.coordinates;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal === minVal ? 1 : maxVal - minVal;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  coords.forEach((coord, idx) => {
    const x = coord[0];
    const y = coord[1];
    const val = values[idx] || 0;
    const norm = (val - minVal) / range;
    ctx.fillStyle = getColorForExpression(norm);
    ctx.beginPath();
    ctx.arc(x, y, pointSize.value, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const loadSpatialPlotWithImage = async () => {
  const metadataParam = metadataPriority.join(",");
  const options = {
    sampleKey: selectedSampleKey.value || undefined,
    imageKey: selectedImageKey.value || "hires",
    metadata: metadataParam,
  };

  // Try to load with image first
  try {
    const response = await fetchSpatialPlotDataWithImage(
      datasetId.value,
      options
    );
    spatialPlotDataWithImage.value = response;
  } catch (err) {
    console.warn("Could not load spatial plot data with image:", err);
    spatialPlotDataWithImage.value = null;
  }

  // Always fetch non-image plot data as fallback and for embedding
  try {
    // If we have image data, use its metadata keys to optimize the next fetch
    const metaKeys = spatialPlotDataWithImage.value?.metadata
      ? Object.keys(spatialPlotDataWithImage.value.metadata)
      : [];
    const embeddingMetaParam =
      metaKeys.length > 0 ? metaKeys.join(",") : metadataParam;

    spatialPlotData.value = await fetchSpatialPlotData(datasetId.value, {
      metadata: embeddingMetaParam,
      sampleKey: selectedSampleKey.value || undefined,
      imageKey: selectedImageKey.value || "hires",
    });

    // Update colorBy and categories based on what we have
    const activeData = spatialPlotDataWithImage.value || spatialPlotData.value;
    if (activeData) {
      const activeMetaKeys = activeData.metadata
        ? Object.keys(activeData.metadata)
        : [];
      if (activeMetaKeys.length) {
        const preferredKey =
          metadataPriority.find((k) => activeMetaKeys.includes(k)) ||
          activeMetaKeys[0];
        const metaKeyToUse =
          colorBy.value && activeMetaKeys.includes(colorBy.value)
            ? colorBy.value
            : preferredKey;
        colorBy.value = metaKeyToUse;
        heatmapSettings.value.groupBy = resolveHeatmapGroupBy(metaKeyToUse);
        const metaValues = activeData.metadata[metaKeyToUse] || [];
        selectedCategories.value = Array.from(
          new Set(
            (metaValues || []).filter(
              (v) => v !== null && v !== undefined && v !== ""
            )
          )
        );
      } else if (!colorBy.value) {
        colorBy.value = "cell_type";
        heatmapSettings.value.groupBy = resolveHeatmapGroupBy("cell_type");
        selectedCategories.value = [];
      }
    }

    await nextTick();
    drawSpatialOverlay();
  } catch (err) {
    console.error("Error loading spatial plot data:", err);
  }
};

const visualizeSVGGene = async (gene) => {
  activeTool.value = "gene";
  geneExpressionTab.value = "single";
  await nextTick(); // Wait for tab switch
  loadGeneExpressionData(gene);
};

const loadExampleHeatmapGeneList = () => {
  // Use lowercase to match spatial datasets (e.g., Visium) that expect lowercase genes
  // Updated with genes more commonly found in brain datasets
  heatmapSettings.value.geneList =
    "apoe, trem2, gad1, gad2, pecam1, cd3e, gfap, olig1";
};

const downloadSpatialPlot = () => {
  if (!spatialChart.value) return;

  try {
    const chartInstance =
      spatialChart.value.getEchartsInstance?.() || spatialChart.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = "spatial_tissue_scatter.png";
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download plot:", err);
    alert("Download functionality not available");
  }
};

const downloadSpatialCSV = () => {
  const data = spatialPlotDataWithImage.value || spatialPlotData.value;
  if (!data || !data.coordinates) {
    alert("No data available for download");
    return;
  }

  try {
    // Get the current metadata column (color by label)
    const metaSource = data.metadata || {};
    const metaKey =
      (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
      Object.keys(metaSource)[0] ||
      null;

    const metadataValues = metaKey ? metaSource[metaKey] : null;
    const coordinates = data.coordinates || [];
    const spotIds = data.spot_ids || data.cell_ids || [];

    // Format metadata column name for CSV header
    const formatMetadataLabel = (key) => {
      if (!key) return "";
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    const metadataColumnLabel = metaKey
      ? formatMetadataLabel(metaKey)
      : "metadata";

    // Create CSV header
    const headers = ["spot_name", "spatial_x", "spatial_y"];
    if (metadataColumnLabel) {
      headers.push(metadataColumnLabel);
    }

    // Create CSV rows
    const rows = coordinates.map((coord, idx) => {
      const spotName = spotIds[idx] || `spot_${idx}`;
      const spatialX = coord[0]?.toFixed(6) || "";
      const spatialY = coord[1]?.toFixed(6) || "";
      const metadataValue =
        metadataValues && metadataValues[idx] !== undefined
          ? metadataValues[idx]
          : "";

      return [spotName, spatialX, spatialY, metadataValue];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `spatial_embedding_${metaKey || "data"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

// Download functions for UMAP embedding
const downloadEmbeddingPNG = () => {
  if (!embeddingChartRef.value) return;

  try {
    const chartInstance =
      embeddingChartRef.value.getEchartsInstance?.() ||
      embeddingChartRef.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      const filename = `umap_embedding_${Date.now()}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download embedding plot:", err);
    alert("Download functionality not available");
  }
};

const downloadEmbeddingCSV = () => {
  if (!embeddingData.value || !embeddingData.value.coordinates) {
    alert("No data available for download");
    return;
  }

  try {
    const metaSource = spatialPlotData.value?.metadata || {};
    const metaKey =
      (colorBy.value && metaSource[colorBy.value] ? colorBy.value : null) ||
      Object.keys(metaSource)[0] ||
      null;

    const metadataValues = metaKey ? metaSource[metaKey] : null;
    const coordinates = embeddingData.value.coordinates || [];
    const spotIds =
      spatialPlotData.value?.spot_ids || spatialPlotData.value?.cell_ids || [];

    // Format metadata column name for CSV header
    const formatMetadataLabel = (key) => {
      if (!key) return "";
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    const metadataColumnLabel = metaKey
      ? formatMetadataLabel(metaKey)
      : "metadata";

    const rows = [];
    const headers = ["spot_name", "umap1", "umap2"];
    if (metadataColumnLabel) {
      headers.push(metadataColumnLabel);
    }
    rows.push(headers.join(","));

    coordinates.forEach((coord, idx) => {
      const spotName = spotIds[idx] || `spot_${idx}`;
      const umap1 = coord[0]?.toFixed(6) || "";
      const umap2 = coord[1]?.toFixed(6) || "";
      const metadataValue =
        metadataValues && metadataValues[idx] !== undefined
          ? metadataValues[idx]
          : "";

      const row = [spotName, umap1, umap2];
      if (metadataColumnLabel) {
        row.push(metadataValue);
      }
      rows.push(
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      );
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `umap_embedding_${metaKey || "data"}_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

// Download functions for Annotation Overview
const downloadAnnotationPNG = () => {
  if (!annotationChartRef.value) return;

  try {
    const chartInstance =
      annotationChartRef.value.getEchartsInstance?.() ||
      annotationChartRef.value.chart;
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      const filename = `annotation_overview_${Date.now()}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    }
  } catch (err) {
    console.warn("Could not download annotation plot:", err);
    alert("Download functionality not available");
  }
};

const downloadAnnotationCSV = () => {
  if (!categoryList.value || categoryList.value.length === 0) {
    alert("No data available for download");
    return;
  }

  try {
    const rows = [];
    const headers = ["category", "count", "percentage"];
    rows.push(headers.join(","));

    const dataSource = filteredAnnotationData.value;
    const total = dataSource.reduce((sum, c) => sum + c.count, 0);

    dataSource.forEach((cat) => {
      const percentage =
        total > 0 ? ((cat.count / total) * 100).toFixed(2) : "0.00";
      rows.push(
        [
          `"${String(cat.label).replace(/"/g, '""')}"`,
          cat.count,
          percentage,
        ].join(",")
      );
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `annotation_overview_${Date.now()}.csv`;
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV. Please try again.");
  }
};

onMounted(() => {
  if (datasetId.value) {
    loadSpatialData();
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId && newId !== datasetId.value) {
      datasetId.value = newId;
      geneExpressionBase.value = null;
      geneExpressionExpressions.value = {};
      geneExpressionCellIds.value = [];
      heatmapData.value = null;
      geneSuggestions.value = [];
      geneSearchInput.value = "";
      loadSpatialData();
    }
  }
);

watch([selectedGene, spatialPlotDataWithImage], () => {
  if (selectedGene.value && spatialPlotDataWithImage.value) {
    nextTick(() => {
      drawSpatialOverlay();
    });
  }
});

watch(selectedDeconvCellType, () => {
  nextTick(() => drawDeconvOverlay());
});

watch([selectedSampleKey, selectedImageKey], async () => {
  await loadSpatialPlotWithImage();
});

watch(
  () => availableColorBy.value.map((o) => o.value),
  () => {
    if (
      !heatmapSettings.value.groupBy ||
      !availableColorBy.value.some(
        (o) => o.value === heatmapSettings.value.groupBy
      )
    ) {
      heatmapSettings.value.groupBy = resolveHeatmapGroupBy(
        heatmapSettings.value.groupBy
      );
    }
  }
);

watch(
  () => colorBy.value,
  async (newVal, oldVal) => {
    if (
      !heatmapSettings.value.groupBy ||
      heatmapSettings.value.groupBy === oldVal
    ) {
      heatmapSettings.value.groupBy = resolveHeatmapGroupBy(newVal);
    }
    // Refresh gene expression base when user switches annotation so boxplot uses matching categories
    geneExpressionBase.value = null;
    geneExpressionExpressions.value = {};
    geneExpressionCellIds.value = [];
    if (selectedGene.value) {
      await loadGeneExpressionData(selectedGene.value);
    }
  }
);
</script>
