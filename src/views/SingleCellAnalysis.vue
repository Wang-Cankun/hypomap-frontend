<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <SingleCellViewHeader
      :is-atlas-mode="isAtlasMode"
      :dataset-id="datasetId"
      :available-datasets="availableDatasets"
      :metadata="metadata"
      :page-title="pageTitle"
      :back-link="backLink"
      :back-link-text="backLinkText"
      @update:datasetId="handleDatasetChange"
    />

    <!-- Main Content -->
    <div class="flex h-[calc(100vh-80px)]">
      <!-- Left Sidebar - Functions -->
      <aside class="w-72 bg-white border-r border-gray-200 overflow-y-auto">
        <ToolSelector
          :tools="tools"
          :active-tool="activeTool"
          @update:activeTool="activeTool = $event"
        >
          <DatasetInfoSidebar
            :is-atlas-mode="isAtlasMode"
            :metadata="metadata"
          />
        </ToolSelector>
      </aside>

      <!-- Center - Visualization Area -->
      <main class="flex-1 overflow-hidden flex flex-col">
        <!-- Tool Content -->
        <div class="flex-1 overflow-auto p-3">
          <!-- Cell Type Visualization (UMAP) -->
          <div v-if="activeTool === 'umap'" class="h-full">
            <UMAPVisualization
              :umap-data="umapData"
              :cell-metadata="cellMetadata"
              :cell-types="cellTypes"
              v-model:selected-cell-types="selectedCellTypes"
              :cell-type-counts="cellTypeCounts"
              v-model:color-palette="colorPalette"
              v-model:point-size="pointSize"
              :loading="loading"
              :error="error"
              title="Cell Type UMAP"
            />
          </div>

          <!-- Gene Expression -->
          <div
            v-if="activeTool === 'gene-expression'"
            class="h-full flex flex-col"
          >
            <div class="mb-4">
              <h2 class="text-xl font-bold text-gray-900 mb-3">
                Gene Expression Analysis
              </h2>
              <!-- Tabs -->
              <div class="flex gap-2 border-b border-gray-200 mb-4">
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
                  Gene Module Score
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
                  Heatmap/Dotplot
                </button>
              </div>
            </div>

            <!-- Single Gene Tab -->
            <div
              v-if="geneExpressionTab === 'single'"
              class="flex-1 flex gap-4"
            >
              <!-- Settings Column -->
              <div
                class="w-72 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
              >
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  <AppIcon name="palette" size="md" /> Visualization
                </h3>

                <GeneSearchAutocomplete
                  v-model="selectedGene"
                  :dataset-id="datasetId"
                  label="Gene"
                  :show-example="true"
                  @select="selectSingleGene"
                  @load-example="loadSingleGeneExample"
                />

                <ColorPaletteSelector
                  v-model="geneExpressionPalette"
                  type="expression"
                  label="Color Scale (Feature Plot)"
                />

                <PointSizeSlider v-model="pointSize" />
              </div>

              <!-- Visualization Area -->
              <div class="flex-1 flex flex-col">
                <div
                  class="flex-1 grid grid-cols-2 gap-4"
                  v-if="selectedGeneTrimmed"
                >
                  <div
                    class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
                  >
                    <GeneFeaturePlot
                      :coordinates="umapData?.coordinates || []"
                      :expression="selectedGeneExpression"
                      :cell-types="cellMetadata?.cell_type || []"
                      :selected-cell-types="selectedCellTypes"
                      :gene-name="selectedGeneTrimmed"
                      :color-palette="geneExpressionPalette"
                      :point-size="pointSize"
                      :use-log="true"
                      :title="`${selectedGeneTrimmed} Feature Plot`"
                      empty-message="Select a gene to visualize expression"
                    />
                  </div>
                  <div
                    class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
                  >
                    <ExpressionBoxplot
                      :values="selectedGeneExpression"
                      :cell-types="cellTypes"
                      :cell-type-metadata="cellMetadata?.cell_type || []"
                      :selected-cell-types="selectedCellTypes"
                      :all-cell-types="cellTypes"
                      :color-palette="colorPalette"
                      :title="`${selectedGeneTrimmed} Expression by Cell Type`"
                      :use-log="true"
                      :show-median-label="true"
                      empty-message="Select a gene to view expression"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="flex-1 bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div
                    class="h-full flex items-center justify-center text-gray-400"
                  >
                    <div class="text-center">
                      <AppIcon name="dna" size="xl" class="mx-auto mb-2" />
                      <p>Add genes to visualize expression patterns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Co-expression Tab -->
            <div
              v-if="geneExpressionTab === 'coexpression'"
              class="flex-1 flex gap-4"
            >
              <!-- Settings Column -->
              <div
                class="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto"
              >
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  <AppIcon name="palette" size="md" /> Visualization
                </h3>

                <!-- Gene Expression -->
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-3">
                    <button
                      @click="loadCoexpressionExample"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Load Example
                    </button>
                  </div>
                  <div class="space-y-3">
                    <div class="relative">
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Gene 1:</label
                      >
                      <input
                        v-model="coexpressionSettings.gene1"
                        @input="onCoexpressionGeneInput('gene1')"
                        @focus="showCoexpressionGeneSuggestions.gene1 = true"
                        @blur="hideCoexpressionGeneSuggestions('gene1')"
                        type="text"
                        placeholder="e.g., NRGN"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div
                        v-if="
                          showCoexpressionGeneSuggestions.gene1 &&
                          coexpressionGeneSuggestions.gene1.length > 0
                        "
                        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
                      >
                        <button
                          v-for="gene in coexpressionGeneSuggestions.gene1"
                          :key="gene.symbol"
                          @mousedown.prevent="
                            selectCoexpressionGene('gene1', gene.symbol)
                          "
                          class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          {{ gene.symbol }}
                        </button>
                      </div>
                    </div>
                    <div class="relative">
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Gene 2:</label
                      >
                      <input
                        v-model="coexpressionSettings.gene2"
                        @input="onCoexpressionGeneInput('gene2')"
                        @focus="showCoexpressionGeneSuggestions.gene2 = true"
                        @blur="hideCoexpressionGeneSuggestions('gene2')"
                        type="text"
                        placeholder="e.g., GAD1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div
                        v-if="
                          showCoexpressionGeneSuggestions.gene2 &&
                          coexpressionGeneSuggestions.gene2.length > 0
                        "
                        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
                      >
                        <button
                          v-for="gene in coexpressionGeneSuggestions.gene2"
                          :key="gene.symbol"
                          @mousedown.prevent="
                            selectCoexpressionGene('gene2', gene.symbol)
                          "
                          class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          {{ gene.symbol }}
                        </button>
                      </div>
                    </div>
                    <button
                      @click="loadCoexpressionData"
                      :disabled="
                        !coexpressionSettings.gene1 ||
                        !coexpressionSettings.gene2 ||
                        loadingCoexpression
                      "
                      class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {{
                        loadingCoexpression
                          ? "Loading..."
                          : "Plot Co-expression"
                      }}
                    </button>
                  </div>
                </div>

                <!-- Point Size -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Point Size: {{ pointSize }}
                  </label>
                  <input
                    v-model.number="pointSize"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    class="w-full"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <!-- Center: Visualization -->
              <div
                class="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
              >
                <div
                  v-if="loadingCoexpression"
                  class="h-full flex items-center justify-center"
                >
                  <div class="text-center">
                    <div
                      class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
                    ></div>
                    <p class="mt-4 text-gray-600">
                      Loading co-expression data...
                    </p>
                  </div>
                </div>
                <div
                  v-else-if="coexpressionError"
                  class="h-full flex items-center justify-center"
                >
                  <div class="text-center text-red-600">
                    <AppIcon name="warning" size="xl" class="mx-auto mb-2" />
                    <p>{{ coexpressionError }}</p>
                  </div>
                </div>
                <div v-else-if="coexpressionData" class="flex-1">
                  <div class="w-full h-full" style="aspect-ratio: 1 / 1">
                    <v-chart
                      ref="coexpressionChart"
                      :option="coexpressionOption"
                      :autoresize="true"
                      class="w-full h-full"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="h-full flex items-center justify-center text-gray-400"
                >
                  <div class="text-center">
                    <AppIcon name="dna" size="xl" class="mx-auto mb-2" />
                    <p>Select two genes to visualize co-expression</p>
                  </div>
                </div>
              </div>

              <!-- Right: Info Panel (Hideable) -->
              <div
                v-if="showCoexpressionInfo"
                class="w-96 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto transition-all"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    <AppIcon name="help" size="md" /> Cell Numbers
                  </h3>
                  <button
                    @click="showCoexpressionInfo = false"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div v-if="coexpressionStats" class="space-y-4">
                  <!-- Color Legend -->
                  <div class="mb-4 pb-4 border-b border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">
                      Color Palette
                    </h4>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div
                        class="p-2 rounded border border-gray-200"
                        style="background-color: #9b59b6"
                      >
                        <div class="text-white font-medium mb-1">Both High</div>
                        <div class="text-white/80">
                          {{ coexpressionSettings.gene1 }} &
                          {{ coexpressionSettings.gene2 }}
                        </div>
                      </div>
                      <div
                        class="p-2 rounded border border-gray-200"
                        style="background-color: #3498db"
                      >
                        <div class="text-white font-medium mb-1">
                          {{ coexpressionSettings.gene1 }} High
                        </div>
                        <div class="text-white/80">Only Gene 1</div>
                      </div>
                      <div
                        class="p-2 rounded border border-gray-200"
                        style="background-color: #e74c3c"
                      >
                        <div class="text-white font-medium mb-1">
                          {{ coexpressionSettings.gene2 }} High
                        </div>
                        <div class="text-white/80">Only Gene 2</div>
                      </div>
                      <div
                        class="p-2 rounded border border-gray-200"
                        style="background-color: #e0e0e0"
                      >
                        <div class="text-gray-700 font-medium mb-1">
                          Both Low
                        </div>
                        <div class="text-gray-600">Neither expressed</div>
                      </div>
                    </div>
                  </div>
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          class="px-3 py-2 text-left font-semibold text-gray-700"
                        >
                          Expression > 0
                        </th>
                        <th
                          class="px-3 py-2 text-left font-semibold text-gray-700"
                        >
                          nCells
                        </th>
                        <th
                          class="px-3 py-2 text-left font-semibold text-gray-700"
                        >
                          Percent
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr>
                        <td class="px-3 py-2 font-medium text-gray-900">
                          Both
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.both.nCells }}
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.both.percent.toFixed(2) }}%
                        </td>
                      </tr>
                      <tr>
                        <td class="px-3 py-2 font-medium text-gray-900">
                          {{ coexpressionSettings.gene1 }}
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.gene1.nCells }}
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.gene1.percent.toFixed(2) }}%
                        </td>
                      </tr>
                      <tr>
                        <td class="px-3 py-2 font-medium text-gray-900">
                          {{ coexpressionSettings.gene2 }}
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.gene2.nCells }}
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.gene2.percent.toFixed(2) }}%
                        </td>
                      </tr>
                      <tr>
                        <td class="px-3 py-2 font-medium text-gray-900">
                          None
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.none.nCells }}
                        </td>
                        <td class="px-3 py-2 text-gray-700">
                          {{ coexpressionStats.none.percent.toFixed(2) }}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center text-gray-400 text-sm py-8">
                  Statistics will appear here after plotting
                </div>
              </div>
              <!-- Toggle button when info panel is hidden -->
              <div v-else class="flex items-start pt-4">
                <button
                  @click="showCoexpressionInfo = true"
                  class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  title="Show Info Panel"
                >
                  <AppIcon name="help" size="sm" />
                </button>
              </div>
            </div>

            <!-- Module Score Tab -->
            <div
              v-if="geneExpressionTab === 'module'"
              class="flex-1 flex gap-4"
            >
              <!-- Settings Column -->
              <div
                class="w-72 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
              >
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  <AppIcon name="palette" size="md" /> Visualization
                </h3>

                <!-- Custom Title -->
                <div class="mb-6 flex-shrink-0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Custom Title
                  </label>
                  <input
                    v-model="moduleScoreSettings.title"
                    type="text"
                    placeholder="e.g., Synaptic Maintenance Score"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Displayed on module score plots and saved gene sets.
                  </p>
                </div>

                <!-- Gene List Input -->
                <div class="mb-6 flex-shrink-0">
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Gene List
                    </label>
                    <button
                      @click="loadExampleGeneList"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Load Example
                    </button>
                  </div>
                  <textarea
                    v-model="moduleScoreSettings.geneList"
                    placeholder="Enter genes separated by comma or space&#10;e.g., APOE, GAD1, GFAP, PECAM1&#10;or paste multiple genes"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="6"
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    Separate genes by comma or space
                  </p>
                  <button
                    @click="saveModuleGeneListToCart"
                    class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Save gene list to cart
                  </button>
                </div>

                <!-- Info about scoring method -->
                <div class="mb-6 flex-shrink-0 bg-blue-50 rounded-lg p-3">
                  <p class="text-xs text-gray-700">
                    <strong>Scoring Method:</strong> Seurat-style module scoring
                    (scanpy.tl.score_genes)
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    Scores are relative to reference genes and can be negative
                    (below reference) or positive (above reference).
                  </p>
                </div>

                <!-- Calculate Button -->
                <div class="mb-6 flex-shrink-0">
                  <button
                    @click="calculateModuleScore"
                    :disabled="
                      loadingModuleScore || !moduleScoreSettings.geneList.trim()
                    "
                    class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {{
                      loadingModuleScore
                        ? "Calculating..."
                        : "Calculate Module Score"
                    }}
                  </button>
                  <div
                    v-if="moduleScoreError"
                    class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded"
                  >
                    {{ moduleScoreError }}
                  </div>
                </div>

                <!-- Stats Display -->
                <div
                  v-if="moduleScoreData && moduleScoreData.stats"
                  class="mb-6 flex-shrink-0 bg-gray-50 rounded-lg p-3"
                >
                  <h4 class="text-sm font-semibold text-gray-700 mb-2">
                    Statistics
                  </h4>
                  <dl class="space-y-1 text-xs">
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Method:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.method || "scanpy_score_genes" }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Mean:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.stats.mean.toFixed(3) }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Median:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.stats.median.toFixed(3) }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Min:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.stats.min.toFixed(3) }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Max:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.stats.max.toFixed(3) }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Std Dev:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.stats.std.toFixed(3) }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Genes Used:</dt>
                      <dd class="font-medium text-gray-900">
                        {{ moduleScoreData.n_genes_used }} /
                        {{
                          moduleScoreData.genes_used.length +
                          (moduleScoreData.genes_not_found?.length || 0)
                        }}
                      </dd>
                    </div>
                  </dl>
                  <div class="mt-2 text-xs text-gray-500 italic">
                    Note: Scores can be negative (below reference level)
                  </div>
                  <div
                    v-if="moduleScoreData.genes_not_found?.length > 0"
                    class="mt-2 text-xs text-red-600"
                  >
                    Not found: {{ moduleScoreData.genes_not_found.join(", ") }}
                  </div>
                </div>

                <ColorPaletteSelector
                  v-model="geneExpressionPalette"
                  type="expression"
                  label="Color Scale (Feature Plot)"
                />

                <PointSizeSlider v-model="pointSize" />
              </div>

              <!-- Visualization Area -->
              <div class="flex-1 flex flex-col min-h-0">
                <div
                  v-if="moduleScoreExpression.length"
                  class="flex-1 grid grid-cols-2 gap-4 min-h-0"
                  style="max-height: 600px"
                >
                  <!-- UMAP Feature Plot -->
                  <div
                    class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-0"
                  >
                    <GeneFeaturePlot
                      :coordinates="umapData?.coordinates || []"
                      :expression="moduleScoreExpression"
                      :cell-types="cellMetadata?.cell_type || []"
                      :selected-cell-types="selectedCellTypes"
                      :gene-name="moduleScoreTitle"
                      :color-palette="geneExpressionPalette"
                      :point-size="pointSize"
                      :use-log="false"
                      :title="`Module Score on UMAP (${moduleScoreTitle})`"
                      empty-message="Calculate a module score to visualize results"
                    />
                  </div>

                  <!-- Box Plot -->
                  <div
                    class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-0"
                  >
                    <ExpressionBoxplot
                      :values="moduleScoreExpression"
                      :cell-types="cellTypes"
                      :cell-type-metadata="cellMetadata?.cell_type || []"
                      :selected-cell-types="selectedCellTypes"
                      :all-cell-types="cellTypes"
                      :color-palette="colorPalette"
                      :title="`Module Score by Cell Type (${moduleScoreTitle})`"
                      :use-log="false"
                      :show-median-label="true"
                      empty-message="Calculate a module score to visualize results"
                    />
                  </div>
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
                      <p>Enter genes and calculate module score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Heatmap/Dotplot Tab -->
            <div
              v-if="geneExpressionTab === 'heatmap'"
              class="flex-1 flex gap-4"
            >
              <!-- Settings Column -->
              <div
                class="w-72 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden"
              >
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  <AppIcon name="palette" size="md" /> Visualization
                </h3>

                <!-- Gene List Input -->
                <div class="mb-6 flex-shrink-0">
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Gene List
                    </label>
                    <button
                      @click="loadExampleGeneList"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Load Example
                    </button>
                  </div>
                  <textarea
                    v-model="heatmapSettings.geneList"
                    placeholder="Enter genes separated by comma or space&#10;e.g., APOE, GAD1, GFAP, PECAM1&#10;or paste multiple genes"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="6"
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    Separate genes by comma or space
                  </p>
                  <button
                    @click="saveHeatmapGeneListToCart"
                    class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Save gene list to cart
                  </button>
                </div>

                <!-- Visualization Type Selection -->
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

                <!-- Clustering and Scaling Options -->
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
                        Cluster columns (cell types)
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

                <!-- Plot Height -->
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

                <!-- Calculate Button -->
                <div class="mb-6 flex-shrink-0">
                  <button
                    @click="generateHeatmapData"
                    :disabled="
                      loadingHeatmap || !heatmapSettings.geneList.trim()
                    "
                    class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
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

                <!-- Info about visualization -->
                <div class="mb-6 flex-shrink-0 bg-blue-50 rounded-lg p-3">
                  <p class="text-xs text-gray-700">
                    <strong>Heatmap:</strong> Shows average expression of genes
                    across cell types as a color matrix.
                  </p>
                  <p class="text-xs text-gray-700 mt-2">
                    <strong>Dotplot:</strong> Shows expression level (color) and
                    percentage of cells expressing (size) for each gene-cell
                    type combination.
                  </p>
                </div>
              </div>

              <!-- Visualization Area -->
              <div class="flex-1 flex flex-col min-h-0">
                <div
                  v-if="heatmapData"
                  class="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-0 overflow-hidden"
                  :style="{
                    maxHeight: heatmapPlotHeight.maxContainer + 'px',
                  }"
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
                    :data="heatmapData.data || []"
                    :genes="heatmapData.genes || []"
                    :cell-types="heatmapData.cell_types || []"
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

          <!-- DEG & Pathway Analysis (Combined) -->
          <div v-if="activeTool === 'deg-pathway'" class="h-full flex flex-col">
            <DegPathwayPanel
              :dataset-id="datasetId"
              :api-base-url="API_BASE_URL"
              :available-datasets="availableDatasets"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
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
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
} from "echarts/components";
import {
  UMAPVisualization,
  GeneSearchAutocomplete,
  ColorPaletteSelector,
  PointSizeSlider,
  GeneFeaturePlot,
  ExpressionBoxplot,
  HeatmapDotplot,
} from "@/components/single-cell";
import DegPathwayPanel from "@/components/single-cell/DegPathwayPanel.vue";
import {
  SingleCellViewHeader,
  DatasetInfoSidebar,
  ToolSelector,
} from "@/components/single-cell";
import { useSingleCellViewState } from "@/composables/useSingleCellViewState";
import { useDatasetMetadata } from "@/composables/useDatasetMetadata";
import { useGeneExpressionAnalysis } from "@/composables/useGeneExpressionAnalysis";
import { useColorPalettes } from "@/composables/useColorPalettes";
import { useGeneCart } from "@/composables/useGeneCart";
import AnalysisToolIcons from "@/components/single-cell/icons/AnalysisToolIcons.vue";
import AppIcon from "@/components/icons/AppIcon.vue";

// Props for Atlas mode
const props = defineProps({
  defaultDatasetId: {
    type: String,
    default: null,
  },
  isAtlasMode: {
    type: Boolean,
    default: false,
  },
});

// Register ECharts components
use([
  CanvasRenderer,
  ScatterChart,
  BarChart,
  BoxplotChart,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
]);

const route = useRoute();
const initialDatasetId =
  props.defaultDatasetId || route.params.id || "AD093044";

// Reactive reference for atlas mode
const isAtlasMode = computed(() => props.isAtlasMode);

// Computed properties for Atlas vs Analysis mode
const pageTitle = computed(() =>
  isAtlasMode.value ? "Human Atlas" : "Single-Cell Analysis:"
);
const backLink = computed(() => (isAtlasMode.value ? "/" : "/datasets"));
const backLinkText = computed(() =>
  isAtlasMode.value ? "← Back to Home" : "← Back to Datasets"
);

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9120/hypomap-backend/api/v1";

// Use composables for state management
const viewState = useSingleCellViewState(initialDatasetId);
const {
  activeTool,
  loading,
  error,
  datasetId,
  availableDatasets,
  umapData,
  cellMetadata,
  availableGenes,
  cellTypes,
  selectedCellTypes,
  cellTypeFilterExpanded,
  cellTypeCounts,
  pointSize,
  colorPalette,
  geneExpressionPalette,
  updateUMAPData,
} = viewState;

const datasetMetadata = useDatasetMetadata(datasetId, error);
const {
  datasetInfo,
  metadata,
  fetchDatasetInfo: fetchDatasetInfoComposable,
  fetchAvailableDatasets: fetchAvailableDatasetsComposable,
  switchDataset: switchDatasetComposable,
} = datasetMetadata;

const geneExpression = useGeneExpressionAnalysis(datasetId, umapData, selectedCellTypes, cellMetadata);
const {
  geneInput,
  selectedGenes,
  selectedGene,
  geneExpressionTab,
  coexpressionSettings,
  coexpressionData,
  loadingCoexpression,
  coexpressionError,
  coexpressionStats,
  coexpressionGeneSuggestions,
  showCoexpressionGeneSuggestions,
  coexpressionChart,
  showCoexpressionInfo,
  moduleScoreSettings,
  moduleScoreData,
  loadingModuleScore,
  moduleScoreError,
  heatmapSettings,
  heatmapData,
  loadingHeatmap,
  heatmapError,
  selectedGeneTrimmed,
  selectedGeneExpression,
  moduleScoreExpression,
  moduleScoreTitle,
  fetchGeneExpression,
  searchGenes,
  parseGeneInput,
  saveGeneSetToCart,
  onGeneInput,
  selectGene,
  hideGeneSuggestions,
  addGene,
  removeGene,
  selectSingleGene,
  onCoexpressionGeneInput,
  selectCoexpressionGene,
  hideCoexpressionGeneSuggestions,
  loadCoexpressionData,
  calculateModuleScore,
  saveModuleGeneListToCart,
  generateHeatmapData,
  saveHeatmapGeneListToCart,
  loadExampleGeneList,
  clearGeneExpressionCache,
} = geneExpression;

const { getBivariateColor, hexToRgb, rgbToHex } = useColorPalettes();

// Tools
const tools = [
  { id: "umap", name: "Cell Types", icon: AnalysisToolIcons, iconName: "cell-labels" },
  { id: "gene-expression", name: "Gene Expression", icon: AnalysisToolIcons, iconName: "gene-expression" },
  { id: "deg-pathway", name: "DEG & Pathway", icon: AnalysisToolIcons, iconName: "deg-pathway" },
];

// Additional state not in composables
const showInfoSidebar = ref(true);
const showDatasetInfo = ref(true);

// API Functions
const fetchDatasetInfo = async () => {
  try {
    return await fetchDatasetInfoComposable();
  } catch (err) {
    console.error("Error fetching dataset info:", err);
    error.value = err.message;
  }
};

const fetchUMAPData = async () => {
  try {
    loading.value = true;
    const response = await fetch(
      `${API_BASE_URL}/h5ad/${datasetId.value}/plot-data?embedding=umap&metadata=cell_type`
    );
    if (!response.ok) throw new Error("Failed to fetch UMAP data");
    const data = await response.json();

    // Use composable helper to update UMAP data and extract cell types
    updateUMAPData(data, "cell_type");

    loading.value = false;
    return data;
  } catch (err) {
    console.error("Error fetching UMAP data:", err);
    error.value = err.message;
    loading.value = false;
  }
};

// fetchGeneExpression and searchGenes are now from useGeneExpressionAnalysis composable

// fetchAvailableDatasets is now from useDatasetMetadata composable
// For SingleCellAnalysis, we need metadata enrichment for the dataset selector
const fetchAvailableDatasets = async () => {
  const datasets = await fetchAvailableDatasetsComposable();

  // Fetch metadata for each dataset (for display in selector)
    const datasetsWithMetadata = await Promise.all(
      datasets.map(async (ds) => {
        try {
          let metaResponse = await fetch(
            `${API_BASE_URL.replace("/h5ad", "")}/datasets/${ds.dataset_id}`
          );
          let metadata = null;

          if (metaResponse.ok) {
            const data = await metaResponse.json();
            metadata = Array.isArray(data) && data.length > 0 ? data[0] : data;
          } else {
            metaResponse = await fetch(
              `${API_BASE_URL.replace("/h5ad", "")}/datasets/?dataset_id=${
                ds.dataset_id
              }`
            );
            if (metaResponse.ok) {
              const data = await metaResponse.json();
            metadata = Array.isArray(data) && data.length > 0 ? data[0] : data;
            }
          }

          if (metadata) {
            return {
              ...ds,
              metadata: {
                disease: metadata.disease,
                species: metadata.species,
                tissue: metadata.brain_region || metadata.tissue,
                sex: metadata.sex,
                status: metadata.status,
                condition: metadata.condition || metadata.status,
                model: metadata.model,
                control: metadata.control,
                stage: metadata.stage,
                treatment: metadata.treatment,
                public_dataset_id: metadata.public_dataset_id,
                brain_region: metadata.brain_region,
              },
            };
          }
        } catch (err) {
          console.warn(`Could not fetch metadata for ${ds.dataset_id}:`, err);
        }
        return ds;
      })
    );

    availableDatasets.value = datasetsWithMetadata;
    return datasetsWithMetadata;
};

// parseGeneInput, saveGeneSetToCart, getBivariateColor, hexToRgb, rgbToHex are now from composables

// Co-expression Chart Option
const coexpressionOption = computed(() => {
  if (!coexpressionData.value || !umapData.value) {
    return {};
  }

  const { scatterData, gene1, gene2 } = coexpressionData.value;
  const xAxisName = coexpressionSettings.value.xAxis;
  const yAxisName = coexpressionSettings.value.yAxis;

  // Calculate max expressions and percentiles for normalization
  let maxExpr1 = 0;
  let maxExpr2 = 0;
  const expr1Values = [];
  const expr2Values = [];

  scatterData.forEach((point) => {
    maxExpr1 = Math.max(maxExpr1, point.expr1);
    maxExpr2 = Math.max(maxExpr2, point.expr2);
    expr1Values.push(point.expr1);
    expr2Values.push(point.expr2);
  });

  // Calculate median/percentile thresholds for better color distinction
  expr1Values.sort((a, b) => a - b);
  expr2Values.sort((a, b) => a - b);
  const median1 =
    expr1Values.length > 0
      ? expr1Values[Math.floor(expr1Values.length * 0.5)]
      : 0;
  const median2 =
    expr2Values.length > 0
      ? expr2Values[Math.floor(expr2Values.length * 0.5)]
      : 0;

  // Use max or median, whichever gives better contrast
  const threshold1 = Math.max(maxExpr1 * 0.1, median1 * 0.5);
  const threshold2 = Math.max(maxExpr2 * 0.1, median2 * 0.5);

  // Create data points with colors
  let debugCount = 0;
  const dataPoints = scatterData.map((point) => {
    const [x, y] = point.value;
    const e1 = point.expr1;
    const e2 = point.expr2;
    const color = getBivariateColor(
      e1,
      e2,
      maxExpr1,
      maxExpr2,
      threshold1,
      threshold2
    );
    // Debug: log first few colors to verify
    if (debugCount++ < 5) {
      console.log(
        `Co-expression point ${debugCount}: expr1=${e1.toFixed(
          3
        )}, expr2=${e2.toFixed(3)}, color=${color}, max1=${maxExpr1.toFixed(
          3
        )}, max2=${maxExpr2.toFixed(3)}`
      );
    }
    return {
      value: [x, y],
      itemStyle: {
        color: color,
        opacity: e1 === 0 && e2 === 0 ? 0.3 : 0.8,
      },
      expr1: e1,
      expr2: e2,
    };
  });

  return {
    title: {
      text: `Co-expression: ${gene1} vs ${gene2}`,
      left: "center",
      textStyle: { fontSize: 14, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const point = params.data;
        return `${xAxisName}: ${point.value[0].toFixed(
          2
        )}<br/>${yAxisName}: ${point.value[1].toFixed(
          2
        )}<br/>${gene1}: ${point.expr1.toFixed(
          3
        )}<br/>${gene2}: ${point.expr2.toFixed(3)}`;
      },
    },
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 60,
    },
    xAxis: {
      name: xAxisName,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      scale: true,
    },
    yAxis: {
      name: yAxisName,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      scale: true,
    },
    dataZoom: [{ type: "inside" }],
    series: [
      {
        type: "scatter",
        data: dataPoints,
        symbolSize: pointSize.value,
        itemStyle: {
          // Colors are set per point in dataPoints
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            borderColor: "#333",
            borderWidth: 1,
          },
        },
        // Disable large mode and progressive to allow per-item colors
        large: false,
        progressive: 0,
      },
    ],
    graphic: [
      {
        type: "group",
        right: 20,
        top: 60,
        children: [
          {
            type: "text",
            z: 100,
            left: 0,
            top: 0,
            style: {
              text: "2x2 Color Scale",
              fontSize: 11,
              fontWeight: "bold",
            },
          },
          // 2x2 grid
          {
            type: "rect",
            z: 100,
            left: 0,
            top: 20,
            shape: { width: 30, height: 30 },
            style: { fill: "#e0e0e0" }, // Low-Low (gray)
          },
          {
            type: "rect",
            z: 100,
            left: 32,
            top: 20,
            shape: { width: 30, height: 30 },
            style: { fill: "#e74c3c" }, // Low-High (red - gene2 high)
          },
          {
            type: "rect",
            z: 100,
            left: 0,
            top: 52,
            shape: { width: 30, height: 30 },
            style: { fill: "#3498db" }, // High-Low (blue - gene1 high)
          },
          {
            type: "rect",
            z: 100,
            left: 32,
            top: 52,
            shape: { width: 30, height: 30 },
            style: { fill: "#9b59b6" }, // High-High (purple - both high)
          },
          // Labels
          {
            type: "text",
            z: 100,
            left: 65,
            top: 25,
            style: {
              text: `Low ${gene1}`,
              fontSize: 9,
            },
          },
          {
            type: "text",
            z: 100,
            left: 65,
            top: 57,
            style: {
              text: `High ${gene1}`,
              fontSize: 9,
            },
          },
          {
            type: "text",
            z: 100,
            left: 0,
            top: 90,
            style: {
              text: `Low ${gene2}`,
              fontSize: 9,
            },
          },
          {
            type: "text",
            z: 100,
            left: 32,
            top: 90,
            style: {
              text: `High ${gene2}`,
              fontSize: 9,
            },
          },
        ],
      },
    ],
  };
});

// Gene Expression Chart Option (Box/Violin Plot)
const geneExpressionOption = computed(() => {
  if (
    !cellMetadata.value ||
    !selectedGene.value ||
    selectedGene.value.trim() === ""
  ) {
    return {};
  }

  const gene = selectedGene.value.trim();
  const geneData = geneExpressionCache.value[gene];

  if (!geneData || !geneData.expression) {
    return {};
  }

  // Group expression values by cell type and apply log transformation
  const boxData = [];
  const categories = [];
  const colors = [];

  // Get cell type colors from the selected palette
  const paletteColors = colorPalettes[colorPalette.value];

  // Filter cell types based on selection
  const cellTypesToShow =
    selectedCellTypes.value.length > 0
      ? cellTypes.value.filter((ct) => selectedCellTypes.value.includes(ct))
      : cellTypes.value;

  cellTypesToShow.forEach((cellType, idx) => {
    const expressionVals = [];
    cellMetadata.value.cell_type.forEach((ct, ctIdx) => {
      if (ct === cellType) {
        const expr = geneData.expression[ctIdx];
        // Log1p transformation: log(1 + x)
        expressionVals.push(expr > 0 ? Math.log1p(expr) : 0);
      }
    });

    if (expressionVals.length > 0) {
      // Sort for box plot calculation
      expressionVals.sort((a, b) => a - b);

      // Calculate quartiles
      const q1 = expressionVals[Math.floor(expressionVals.length * 0.25)];
      const median = expressionVals[Math.floor(expressionVals.length * 0.5)];
      const q3 = expressionVals[Math.floor(expressionVals.length * 0.75)];
      const min = expressionVals[0];
      const max = expressionVals[expressionVals.length - 1];

      boxData.push([min, q1, median, q3, max]);
      categories.push(cellType);
      // Use original index for color consistency
      const originalIdx = cellTypes.value.indexOf(cellType);
      colors.push(paletteColors[originalIdx % paletteColors.length]);
    }
  });

  return {
    title: {
      text: `${gene} Expression (log scale)`,
      left: "center",
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.componentSubType === "boxplot") {
          const [min, q1, median, q3, max] = params.value;
          return `${params.name}<br/>
                  Max: ${max.toFixed(3)}<br/>
                  Q3: ${q3.toFixed(3)}<br/>
                  Median: ${median.toFixed(3)}<br/>
                  Q1: ${q1.toFixed(3)}<br/>
                  Min: ${min.toFixed(3)}`;
        }
        return params.value;
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 60,
      bottom: 100,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      name: "log(1 + Expression)",
      nameLocation: "middle",
      nameGap: 50,
    },
    series: [
      {
        name: "boxplot",
        type: "boxplot",
        data: boxData.map((box, idx) => ({
          value: box,
          itemStyle: {
            color: colors[idx],
            borderColor: colors[idx],
            borderWidth: 2,
          },
        })),
        boxWidth: ["40%", "60%"],
        itemStyle: {
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
          },
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: "#000",
            width: 2,
            type: "solid",
          },
          label: {
            show: true,
            position: "insideEndTop",
            formatter: (params) => {
              return params.value.toFixed(3);
            },
            fontSize: 10,
            color: "#000",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: [2, 4],
            borderRadius: 2,
          },
          data: categories.map((cat, idx) => ({
            name: cat,
            xAxis: idx,
            yAxis: boxData[idx][2], // median value
          })),
        },
      },
    ],
  };
});

// Methods
const updateVisualization = () => {
  // Trigger chart update
};

const handleDatasetChange = async (newDatasetId) => {
  // Clear gene expression cache
  clearGeneExpressionCache();
  selectedGenes.value = [];

  // Switch dataset using composable
  await switchDatasetComposable(newDatasetId, async () => {
  await fetchUMAPData();
  });
};

// Gene autocomplete and gene management functions are now from useGeneExpressionAnalysis composable
// Co-expression functions are now from useGeneExpressionAnalysis composable

// loadExampleGeneList, saveModuleGeneListToCart, saveHeatmapGeneListToCart are now from useGeneExpressionAnalysis composable

const loadSingleGeneExample = async () => {
  const exampleGene = "NRGN";
  selectedGene.value = exampleGene;
  try {
    await fetchGeneExpression(exampleGene);
  } catch (err) {
    console.error(`Gene "${exampleGene}" not found in dataset:`, err);
    alert(`Gene "${exampleGene}" not found in dataset`);
  }
};

const loadCoexpressionExample = () => {
  coexpressionSettings.value.gene1 = "NRGN";
  coexpressionSettings.value.gene2 = "GAD1";
};

// calculateModuleScore is now from useGeneExpressionAnalysis composable

const exportCoexpressionPlot = () => {
  if (!coexpressionChart.value) return;

  const chartInstance = coexpressionChart.value;
  const opts = {
    type: "png",
    pixelRatio: 2,
    backgroundColor: "#fff",
  };

  // Use echarts instance method to export
  if (chartInstance.getEchartsInstance) {
    const echartsInstance = chartInstance.getEchartsInstance();
    const url = echartsInstance.getDataURL(opts);
    const link = document.createElement("a");
    link.download = `coexpression_${coexpressionSettings.value.gene1}_${coexpressionSettings.value.gene2}.png`;
    link.href = url;
    link.click();
  }
};

// generateHeatmapData is now from useGeneExpressionAnalysis composable

// Heatmap plot height settings
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

// Handle gene cart use events from global nav
const handleGeneCartUse = (event) => {
  const { target, genes } = event.detail;
  if (!genes || genes.length === 0) return;

  if (target === "module") {
    moduleScoreSettings.value.geneList = genes.join("\n");
    geneExpressionTab.value = "module";
  } else if (target === "heatmap") {
    heatmapSettings.value.geneList = genes.join("\n");
    geneExpressionTab.value = "heatmap";
  }
};

onMounted(async () => {
  // Load available datasets first
  await fetchAvailableDatasets();

  // Load dataset info and UMAP data for current dataset
  await fetchDatasetInfo();
  await fetchUMAPData();

  // Listen for gene cart use events from global nav
  window.addEventListener("gene-cart-use", handleGeneCartUse);
});

onUnmounted(() => {
  // Clean up event listener
  window.removeEventListener("gene-cart-use", handleGeneCartUse);
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
