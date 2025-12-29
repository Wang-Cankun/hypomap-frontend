<template>
  <div class="h-full flex flex-col">
    <div class="mb-4">
      <h2 class="text-xl font-bold text-gray-900 mb-3">
        Differential Expression & Pathway Enrichment
      </h2>
      <div
        v-if="errorMessage"
        class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- DEG Parameters -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-3">
            1. DEG Analysis Setup
          </h3>
          <div class="space-y-3">
            <!-- Group 1 Selection -->
            <div class="p-3 bg-white rounded border border-blue-200 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center"
                    >1</span
                  >
                  <label class="block text-sm font-semibold text-blue-700">
                    Group 1
                  </label>
                  <span
                    v-if="degSelection.groupA.length > 0"
                    class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"
                  >
                    {{ degSelection.groupA.length }} selected
                  </span>
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    @click="selectAllDegGroup('A')"
                    class="px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 text-blue-600"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    @click="clearDegGroup('A')"
                    class="px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 text-blue-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div
                class="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded p-1"
              >
                <label
                  v-for="ct in dataset1CellTypes"
                  :key="`groupA-${ct.name || ct}`"
                  class="flex items-center gap-2 text-sm text-gray-700 px-2 py-1 rounded cursor-pointer"
                  :class="{
                    'bg-blue-100 hover:bg-blue-200':
                      degSelection.groupA.includes(ct.name || ct),
                    'hover:bg-blue-50':
                      !degSelection.groupA.includes(ct.name || ct) &&
                      !degSelection.groupB.includes(ct.name || ct),
                    'opacity-40 cursor-not-allowed bg-green-50':
                      degSelection.groupB.includes(ct.name || ct),
                  }"
                >
                  <input
                    type="checkbox"
                    :value="ct.name || ct"
                    v-model="degSelection.groupA"
                    class="rounded text-blue-600"
                    :disabled="degSelection.groupB.includes(ct.name || ct)"
                  />
                  <span class="flex-1">{{ ct.name || ct }}</span>
                  <span class="text-xs text-gray-500">
                    ({{ ct.count?.toLocaleString() || 0 }} cells)
                  </span>
                </label>
              </div>
            </div>

            <!-- Group 2 Selection -->
            <div class="p-3 bg-white rounded border border-green-200 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    class="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center"
                    >2</span
                  >
                  <label class="block text-sm font-semibold text-green-700">
                    Group 2
                  </label>
                  <span
                    v-if="resolvedDegGroupB.length > 0"
                    class="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full"
                  >
                    {{ resolvedDegGroupB.length }} selected
                  </span>
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    @click="selectRestForGroupB"
                    :disabled="degSelection.groupA.length === 0"
                    class="px-2 py-1 border border-green-200 rounded hover:bg-green-50 text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Select all cell types not in Group 1"
                  >
                    Rest
                  </button>
                  <button
                    type="button"
                    @click="clearDegGroup('B')"
                    class="px-2 py-1 border border-green-200 rounded hover:bg-green-50 text-green-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div
                class="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded p-1"
              >
                <label
                  v-for="ct in dataset1CellTypes"
                  :key="`groupB-${ct.name || ct}`"
                  class="flex items-center gap-2 text-sm text-gray-700 px-2 py-1 rounded cursor-pointer"
                  :class="{
                    'bg-green-100 hover:bg-green-200':
                      degSelection.groupB.includes(ct.name || ct),
                    'hover:bg-green-50':
                      !degSelection.groupB.includes(ct.name || ct) &&
                      !degSelection.groupA.includes(ct.name || ct),
                    'opacity-40 cursor-not-allowed bg-blue-50':
                      degSelection.groupA.includes(ct.name || ct),
                  }"
                >
                  <input
                    type="checkbox"
                    :value="ct.name || ct"
                    v-model="degSelection.groupB"
                    class="rounded text-green-600"
                    :disabled="degSelection.groupA.includes(ct.name || ct)"
                  />
                  <span class="flex-1">{{ ct.name || ct }}</span>
                  <span class="text-xs text-gray-500">
                    ({{ ct.count?.toLocaleString() || 0 }} cells)
                  </span>
                </label>
              </div>
            </div>

            <!-- Thresholds -->
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Min |Log2FC|
                </label>
                <input
                  v-model.number="degParams.minLogFC"
                  type="number"
                  step="0.1"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Max Adjusted P-value
                </label>
                <input
                  v-model.number="degParams.maxPvalue"
                  type="number"
                  step="0.01"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <button
              @click="runDEG"
              :disabled="
                isRunningDEG ||
                !datasetId ||
                degSelection.groupA.length === 0 ||
                resolvedDegGroupB.length === 0
              "
              class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="isRunningDEG"
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{
                isRunningDEG ? "Calculating..." : "Run DEG Analysis"
              }}</span>
            </button>
          </div>
        </div>

        <!-- Pathway Parameters -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-3">
            2. Pathway Enrichment
          </h3>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Species
                </label>
                <select
                  v-model="pathwayParams.species"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option
                    v-for="species in pathwaySpeciesOptions"
                    :key="species.value"
                    :value="species.value"
                  >
                    {{ species.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Database
                </label>
                <select
                  v-model="pathwayParams.database"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option
                    v-for="db in availablePathwayDatabases"
                    :key="db.value"
                    :value="db.value"
                  >
                    {{ db.label }}
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Number of DEGs to Use
              </label>
              <input
                v-model.number="pathwayParams.topN"
                type="number"
                min="1"
                max="1000"
                step="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter number (e.g., 50, 100, 200)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                v-model="pathwayParams.direction"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="both">Both (Up & Down)</option>
                <option value="up">Upregulated Only</option>
                <option value="down">Downregulated Only</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Enrichment Method
              </label>
              <select
                v-model="pathwayParams.method"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="enrichr">Enrichr</option>
                <!-- <option value="gprofiler">gProfiler</option> -->
              </select>
            </div>
            <button
              @click="runPathwayEnrichment"
              :disabled="
                !degResults ||
                isRunningPathway ||
                !pathwayParams.topN ||
                pathwayParams.topN < 1
              "
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="isRunningPathway"
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{
                isRunningPathway ? "Running..." : "Run Enrichment"
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Display -->
    <div class="flex-1 grid grid-cols-2 gap-4">
      <!-- DEG Results -->
      <div class="flex flex-col gap-4">
        <!-- DEG Table -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          style="height: 600px"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">
              DEG Table
              <span
                v-if="degResults?.summary"
                class="text-sm font-normal text-gray-600"
              >
                ({{ degResults.summary.significant_genes }} significant genes
                <span v-if="upregulatedCount > 0 || downregulatedCount > 0">
                  - {{ upregulatedCount }} up, {{ downregulatedCount }} down
                </span>
                )
              </span>
            </h3>
            <div v-if="degResults?.genes" class="flex items-center gap-2">
              <input
                v-model="degTableSearch"
                type="text"
                placeholder="Search genes..."
                class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div class="flex items-center gap-1">
                <button
                  @click="saveDEGGenesToCart('up')"
                  :disabled="upregulatedCount === 0"
                  class="px-2 py-1 border border-red-200 rounded text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Save upregulated genes to cart"
                >
                  <span>↑</span> Save Up ({{ upregulatedCount }})
                </button>
                <button
                  @click="saveDEGGenesToCart('down')"
                  :disabled="downregulatedCount === 0"
                  class="px-2 py-1 border border-blue-200 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Save downregulated genes to cart"
                >
                  <span>↓</span> Save Down ({{ downregulatedCount }})
                </button>
                <button
                  @click="saveDEGGenesToCart('all')"
                  :disabled="filteredDEGGenes.length === 0"
                  class="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save all filtered genes to cart"
                >
                  Save All
                </button>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-auto">
            <div
              v-if="isRunningDEG"
              class="h-full flex flex-col items-center justify-center text-gray-500"
            >
              <svg
                class="animate-spin h-8 w-8 text-primary-600 mb-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p class="text-sm font-medium">Calculating DEG results...</p>
              <p class="text-xs text-gray-400 mt-1">
                This may take a few seconds
              </p>
            </div>
            <table v-else-if="sortedDEGGenes.length > 0" class="w-full text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    @click="sortDEGTable('gene')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Gene
                      <span v-if="degSortColumn === 'gene'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('logFC')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Log2FC
                      <span v-if="degSortColumn === 'logFC'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('mean_expr_group1')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Mean Expr (Group 1)
                      <span v-if="degSortColumn === 'mean_expr_group1'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('mean_expr_group2')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Mean Expr (Group 2)
                      <span v-if="degSortColumn === 'mean_expr_group2'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('pct_group1')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      PCT (Group 1)
                      <span v-if="degSortColumn === 'pct_group1'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('pct_group2')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      PCT (Group 2)
                      <span v-if="degSortColumn === 'pct_group2'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('pvalue')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      P-value
                      <span v-if="degSortColumn === 'pvalue'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortDEGTable('adjPvalue')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Adj P-value
                      <span v-if="degSortColumn === 'adjPvalue'">
                        {{ degSortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(gene, idx) in sortedDEGGenes"
                  :key="idx"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="px-3 py-2 font-medium">{{ gene.gene }}</td>
                  <td
                    class="px-3 py-2"
                    :class="gene.logFC > 0 ? 'text-red-600' : 'text-blue-600'"
                  >
                    {{ gene.logFC.toFixed(3) }}
                  </td>
                  <td class="px-3 py-2">
                    {{ gene.mean_expr_group1?.toFixed(2) || "N/A" }}
                  </td>
                  <td class="px-3 py-2">
                    {{ gene.mean_expr_group2?.toFixed(2) || "N/A" }}
                  </td>
                  <td class="px-3 py-2">
                    {{
                      gene.pct_group1
                        ? (gene.pct_group1 * 100).toFixed(1) + "%"
                        : "N/A"
                    }}
                  </td>
                  <td class="px-3 py-2">
                    {{
                      gene.pct_group2
                        ? (gene.pct_group2 * 100).toFixed(1) + "%"
                        : "N/A"
                    }}
                  </td>
                  <td class="px-3 py-2">
                    {{ gene.pvalue.toExponential(2) }}
                  </td>
                  <td class="px-3 py-2">
                    {{ gene.adjPvalue.toExponential(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-else-if="degResults?.genes"
              class="h-full flex items-center justify-center text-gray-400"
            >
              No genes match your search
            </div>
            <div
              v-else
              class="h-full flex items-center justify-center text-gray-400"
            >
              Run DEG analysis to see table
            </div>
          </div>
        </div>
        <!-- Volcano Plot -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          style="height: 400px"
        >
          <h3 class="font-semibold text-gray-900 mb-3">
            DEG Results (Volcano Plot)
          </h3>
          <div class="flex-1">
            <v-chart
              v-if="degResults"
              :option="volcanoOption"
              :autoresize="true"
              class="w-full h-full"
            />
            <div
              v-else
              class="h-full flex items-center justify-center text-gray-400"
            >
              Run DEG analysis to see results
            </div>
          </div>
        </div>
      </div>

      <!-- Pathway Results -->
      <div class="flex flex-col gap-4">
        <!-- Pathway Table -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          style="height: 600px"
        >
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-900">
                Pathway Table
                <span
                  v-if="pathwayResults"
                  class="text-sm font-normal text-gray-600"
                >
                  ({{ significantPathwayCount }} significant pathways)
                </span>
              </h3>
              <div
                v-if="pathwayResults && currentDEGComparison"
                class="text-xs text-gray-500 mt-1 whitespace-pre-line"
              >
                Comparison:<br />{{ formattedComparison }}
              </div>
              <div
                v-if="pathwayResults && pathwayEnrichmentInfo"
                class="text-xs text-gray-500 mt-1"
              >
                <div class="flex flex-wrap gap-x-3 gap-y-1">
                  <span>Genes: {{ pathwayEnrichmentInfo.genesUsed }}</span>
                  <span>
                    Direction:
                    {{
                      pathwayEnrichmentInfo.direction === "both"
                        ? "Both"
                        : pathwayEnrichmentInfo.direction === "up"
                        ? "Upregulated"
                        : "Downregulated"
                    }}</span
                  >
                  <span>
                    Method:
                    {{
                      pathwayEnrichmentInfo.method === "enrichr"
                        ? "Enrichr"
                        : "gProfiler"
                    }}</span
                  >
                  <span>Database: {{ pathwayEnrichmentInfo.database }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-auto">
            <table v-if="pathwayResults" class="w-full text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    @click="sortPathwayTable('term')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Pathway
                      <span v-if="pathwaySortColumn === 'term'">
                        {{ pathwaySortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortPathwayTable('pvalue')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                    style="min-width: 120px"
                  >
                    <div class="flex items-center gap-1">
                      P-value
                      <span v-if="pathwaySortColumn === 'pvalue'">
                        {{ pathwaySortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortPathwayTable('fdr')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                    style="min-width: 120px"
                  >
                    <div class="flex items-center gap-1">
                      FDR
                      <span v-if="pathwaySortColumn === 'fdr'">
                        {{ pathwaySortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortPathwayTable('zscore')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Z-score
                      <span v-if="pathwaySortColumn === 'zscore'">
                        {{ pathwaySortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortPathwayTable('combinedScore')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Combined Score
                      <span v-if="pathwaySortColumn === 'combinedScore'">
                        {{ pathwaySortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                  <th
                    @click="sortPathwayTable('genes')"
                    class="px-3 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div class="flex items-center gap-1">
                      Genes
                      <span v-if="pathwaySortColumn === 'genes'">
                        {{ pathwaySortDirection === "asc" ? "↑" : "↓" }}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(term, idx) in sortedPathwayResults"
                  :key="idx"
                >
                  <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-3 py-2 font-medium">
                      {{ term.term }}
                    </td>
                    <td class="px-3 py-2" style="min-width: 120px">
                      {{ term.pvalue.toExponential(2) }}
                    </td>
                    <td class="px-3 py-2" style="min-width: 120px">
                      {{ term.fdr.toExponential(2) }}
                    </td>
                    <td class="px-3 py-2">
                      {{ term.zscore?.toFixed(2) || "N/A" }}
                    </td>
                    <td class="px-3 py-2">
                      {{
                        term.combinedScore?.toFixed(2) ||
                        term.score?.toFixed(2) ||
                        "N/A"
                      }}
                    </td>
                    <td class="px-3 py-2">
                      <button
                        @click="togglePathwayGenes(idx)"
                        class="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <span>{{ term.genes.split(",").length }} genes</span>
                        <span>{{
                          expandedPathwayIndex === idx ? "▼" : "▶"
                        }}</span>
                      </button>
                    </td>
                  </tr>
                  <tr
                    v-if="expandedPathwayIndex === idx"
                    class="bg-gray-50 border-b border-gray-200"
                  >
                    <td colspan="6" class="px-3 py-3">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 flex flex-wrap gap-2">
                          <span
                            v-for="(gene, geneIdx) in term.genes
                              .split(',')
                              .filter((g) => g.trim())"
                            :key="geneIdx"
                            class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {{ gene.trim() }}
                          </span>
                        </div>
                        <button
                          @click="copyGenes(term.genes)"
                          class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <AppIcon name="clipboard" size="xs" /> Copy All
                        </button>
                        <button
                          @click="savePathwayGenesToCart(term)"
                          class="px-3 py-1 border border-green-600 text-green-600 rounded text-xs font-medium hover:bg-green-50 transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <AppIcon name="save" size="xs" /> Save to Cart
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
            <div
              v-else
              class="h-full flex items-center justify-center text-gray-400"
            >
              Run enrichment analysis to see table
            </div>
          </div>
        </div>
        <!-- Pathway Bubble Plot -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
          style="height: 500px"
        >
          <h3 class="font-semibold text-gray-900 mb-3">
            Pathway Bubble Plot (significant pathways only)
          </h3>
          <div class="flex-1">
            <v-chart
              v-if="
                pathwayResults &&
                pathwayResults.length > 0 &&
                significantPathwayCount > 0
              "
              :option="pathwayBubbleOption"
              :autoresize="true"
              class="w-full h-full"
            />
            <div
              v-else-if="
                pathwayResults &&
                pathwayResults.length > 0 &&
                significantPathwayCount === 0
              "
              class="h-full flex items-center justify-center text-gray-400"
            >
              No significant pathways (FDR < 0.05) found
            </div>
            <div
              v-else
              class="h-full flex items-center justify-center text-gray-400"
            >
              Run enrichment analysis to see bubble plot
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ScatterChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
} from "echarts/components";
import { useGeneCart } from "@/composables/useGeneCart";
import AppIcon from "@/components/icons/AppIcon.vue";

use([
  CanvasRenderer,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
]);

const props = defineProps({
  datasetId: {
    type: String,
    required: true,
  },
  apiBaseUrl: {
    type: String,
    required: true,
  },
  availableDatasets: {
    type: Array,
    default: () => [],
  },
  // Optional: pass precomputed cell types with counts to avoid extra fetches
  cellTypes: {
    type: Array,
    default: null,
  },
});

const apiBaseNoH5ad = computed(() => props.apiBaseUrl.replace("/h5ad", ""));

const errorMessage = ref(null);

// Gene cart
const { cartItems, addItem: addCartItem } = useGeneCart();

// DEG state
const degParams = ref({
  cellType1: "",
  cellType2: "",
  minLogFC: 0.25,
  maxPvalue: 0.05,
});

const degSelection = ref({
  groupA: [],
  groupB: [],
});

const dataset1CellTypes = ref([]);

const allDatasetCellTypes = computed(() =>
  dataset1CellTypes.value.map((ct) => ct.name || ct)
);

const autoGroupBList = computed(() =>
  allDatasetCellTypes.value.filter(
    (ct) => !degSelection.value.groupA.includes(ct)
  )
);

const resolvedDegGroupB = computed(() => degSelection.value.groupB);

const degGroupALabel = computed(() =>
  degSelection.value.groupA.length
    ? degSelection.value.groupA.join(", ")
    : "No cell types selected"
);

const degGroupBLabel = computed(() =>
  resolvedDegGroupB.value.length
    ? resolvedDegGroupB.value.join(", ")
    : "No cell types selected"
);

watch(
  () => [...degSelection.value.groupA],
  (newGroupA, oldGroupA) => {
    if (JSON.stringify(newGroupA) === JSON.stringify(oldGroupA)) return;
    degSelection.value.groupB = degSelection.value.groupB.filter(
      (ct) => !newGroupA.includes(ct)
    );
  },
  { deep: true }
);

watch(
  () => [...degSelection.value.groupB],
  (newGroupB, oldGroupB) => {
    if (JSON.stringify(newGroupB) === JSON.stringify(oldGroupB)) return;
    degSelection.value.groupA = degSelection.value.groupA.filter(
      (ct) => !newGroupB.includes(ct)
    );
  },
  { deep: true }
);

watch(dataset1CellTypes, () => {
  const allowed = new Set(allDatasetCellTypes.value);
  degSelection.value.groupA = degSelection.value.groupA.filter((ct) =>
    allowed.has(ct)
  );
  degSelection.value.groupB = degSelection.value.groupB.filter(
    (ct) => allowed.has(ct) && !degSelection.value.groupA.includes(ct)
  );
});

const selectAllDegGroup = (group) => {
  const names = allDatasetCellTypes.value;
  if (group === "A") {
    degSelection.value.groupA = [...names];
    degSelection.value.groupB = [];
  } else if (group === "B") {
    degSelection.value.groupB = names.filter(
      (ct) => !degSelection.value.groupA.includes(ct)
    );
  }
};

const clearDegGroup = (group) => {
  if (group === "A") {
    degSelection.value.groupA = [];
  } else if (group === "B") {
    degSelection.value.groupB = [];
  }
};

const selectRestForGroupB = () => {
  degSelection.value.groupB = autoGroupBList.value.filter(
    (ct) => !degSelection.value.groupA.includes(ct)
  );
};

// Pathway enrichment
const pathwayParams = ref({
  topN: 100,
  direction: "both",
  method: "enrichr",
  database: "GO_Biological_Process_2023",
  species: "human",
});

const pathwaySpeciesOptions = [
  { value: "human", label: "Human" },
  { value: "mouse", label: "Mouse" },
];

const pathwayDatabaseOptions = {
  human: [
    {
      value: "GO_Biological_Process_2023",
      label: "GO Biological Process 2023",
    },
    {
      value: "GO_Molecular_Function_2023",
      label: "GO Molecular Function 2023",
    },
    {
      value: "GO_Cellular_Component_2023",
      label: "GO Cellular Component 2023",
    },
    {
      value: "GO_Biological_Process_2021",
      label: "GO Biological Process 2021",
    },
    {
      value: "GO_Molecular_Function_2021",
      label: "GO Molecular Function 2021",
    },
    {
      value: "GO_Cellular_Component_2021",
      label: "GO Cellular Component 2021",
    },
    {
      value: "GO_Biological_Process_2018",
      label: "GO Biological Process 2018",
    },
    {
      value: "GO_Molecular_Function_2018",
      label: "GO Molecular Function 2018",
    },
    {
      value: "GO_Cellular_Component_2018",
      label: "GO Cellular Component 2018",
    },
    { value: "KEGG_2021_Human", label: "KEGG Pathways 2021" },
    { value: "KEGG_2019_Human", label: "KEGG Pathways 2019" },
    { value: "Reactome_2022", label: "Reactome 2022" },
    { value: "Reactome_2016", label: "Reactome 2016" },
    { value: "WikiPathways_2023_Human", label: "WikiPathways 2023" },
    { value: "WikiPathways_2019_Human", label: "WikiPathways 2019" },
    { value: "DisGeNET", label: "DisGeNET (Disease-Gene)" },
    { value: "GWAS_Catalog_2023", label: "GWAS Catalog 2023" },
    { value: "OMIM_Disease", label: "OMIM Disease" },
    { value: "Jensen_DISEASES", label: "Jensen DISEASES" },
    { value: "ENCODE_TF_ChIP-seq_2015", label: "ENCODE TF ChIP-seq" },
    { value: "ChEA_2022", label: "ChEA 2022 (TF Targets)" },
    { value: "TRRUST_Transcription_Factors_2019", label: "TRRUST TF 2019" },
    { value: "Human_Gene_Atlas", label: "Human Gene Atlas" },
    { value: "GTEx_Tissue_Expression_Up", label: "GTEx Tissue Up" },
    { value: "GTEx_Tissue_Expression_Down", label: "GTEx Tissue Down" },
    { value: "Tabula_Sapiens", label: "Tabula Sapiens" },
    { value: "DSigDB", label: "DSigDB (Drug Signatures)" },
    { value: "DrugMatrix", label: "DrugMatrix" },
  ],
  mouse: [
    {
      value: "GO_Biological_Process_2023",
      label: "GO Biological Process 2023",
    },
    {
      value: "GO_Molecular_Function_2023",
      label: "GO Molecular Function 2023",
    },
    {
      value: "GO_Cellular_Component_2023",
      label: "GO Cellular Component 2023",
    },
    {
      value: "GO_Biological_Process_2021",
      label: "GO Biological Process 2021",
    },
    {
      value: "GO_Molecular_Function_2021",
      label: "GO Molecular Function 2021",
    },
    {
      value: "GO_Cellular_Component_2021",
      label: "GO Cellular Component 2021",
    },
    {
      value: "GO_Biological_Process_2018",
      label: "GO Biological Process 2018",
    },
    {
      value: "GO_Molecular_Function_2018",
      label: "GO Molecular Function 2018",
    },
    {
      value: "GO_Cellular_Component_2018",
      label: "GO Cellular Component 2018",
    },
    { value: "KEGG_2019_Mouse", label: "KEGG Pathways 2019 (Mouse)" },
    { value: "Reactome_2022", label: "Reactome 2022" },
    { value: "Reactome_2016", label: "Reactome 2016" },
    { value: "WikiPathways_2019_Mouse", label: "WikiPathways 2019 (Mouse)" },
    { value: "Mouse_Gene_Atlas", label: "Mouse Gene Atlas" },
    {
      value: "MGI_Mammalian_Phenotype_Level_4_2021",
      label: "MGI Mammalian Phenotype",
    },
    { value: "Tabula_Muris", label: "Tabula Muris" },
    { value: "ENCODE_TF_ChIP-seq_2015", label: "ENCODE TF ChIP-seq" },
    { value: "ChEA_2022", label: "ChEA 2022 (TF Targets)" },
    { value: "TRRUST_Transcription_Factors_2019", label: "TRRUST TF 2019" },
  ],
};

const availablePathwayDatabases = computed(
  () =>
    pathwayDatabaseOptions[pathwayParams.value.species] ||
    pathwayDatabaseOptions.human
);

watch(
  () => pathwayParams.value.species,
  () => {
    const available = availablePathwayDatabases.value;
    if (!available.find((db) => db.value === pathwayParams.value.database)) {
      pathwayParams.value.database = available[0]?.value || "";
    }
  }
);

const isRunningDEG = ref(false);
const isRunningPathway = ref(false);
const degResults = ref(null);
const pathwayResults = ref(null);
const degTableSearch = ref("");
const expandedPathwayIndex = ref(null);
const currentDEGComparison = ref(null);
const pathwayEnrichmentInfo = ref(null);
const degSortColumn = ref(null);
const degSortDirection = ref("asc");
const pathwaySortColumn = ref(null);
const pathwaySortDirection = ref("asc");

// Helpers
const parseGeneInput = (input) => {
  if (!input) return [];
  const list = Array.isArray(input)
    ? input
    : String(input)
        .split(/[,\s]+/)
        .filter((gene) => gene && gene.length > 0);
  return [
    ...new Set(
      list
        .map((gene) => gene.trim().toUpperCase())
        .filter((gene) => gene.length > 0)
    ),
  ];
};

const saveGeneSetToCart = (label, genes, source) => {
  const normalized = parseGeneInput(genes);
  if (!normalized.length) {
    alert("No genes available to save to the cart.");
    return false;
  }
  addCartItem({
    label: label?.trim() || `Gene Set ${cartItems.value.length + 1}`,
    genes: normalized,
    source,
  });
  return true;
};

const formatDatasetLabel = (ds) => {
  const parts = [ds.dataset_id, `${ds.n_cells?.toLocaleString() || 0} cells`];
  const meta = [];
  const metadata = ds.metadata || ds;
  if (metadata.species) meta.push(metadata.species);
  if (metadata.disease) meta.push(metadata.disease);
  if (metadata.sex) meta.push(metadata.sex);
  if (metadata.status) meta.push(metadata.status);
  else if (metadata.condition) meta.push(metadata.condition);
  if (metadata.tissue || metadata.brain_region)
    meta.push(metadata.tissue || metadata.brain_region);
  if (metadata.model) meta.push(`APOE: ${metadata.model}`);
  if (metadata.control) meta.push(`Control: ${metadata.control}`);
  if (metadata.stage && metadata.stage !== "no data available")
    meta.push(`Stage: ${metadata.stage}`);
  if (metadata.treatment) meta.push(`Treatment: ${metadata.treatment}`);
  if (metadata.public_dataset_id)
    meta.push(`ID: ${metadata.public_dataset_id}`);
  if (meta.length === 0) {
    if (ds.species) meta.push(ds.species);
    if (ds.disease) meta.push(ds.disease);
    if (ds.sex) meta.push(ds.sex);
    if (ds.status) meta.push(ds.status);
    if (ds.tissue || ds.brain_region) meta.push(ds.tissue || ds.brain_region);
    if (ds.model) meta.push(`APOE: ${ds.model}`);
    if (ds.control) meta.push(`Control: ${ds.control}`);
    if (ds.stage && ds.stage !== "no data available")
      meta.push(`Stage: ${ds.stage}`);
    if (ds.treatment) meta.push(`Treatment: ${ds.treatment}`);
    if (ds.public_dataset_id) meta.push(`ID: ${ds.public_dataset_id}`);
  }
  if (meta.length > 0) {
    parts.push(`(${meta.join(", ")})`);
  }
  return parts.join(" - ");
};

// Filtering & sorting
const filteredDEGGenes = computed(() => {
  if (!degResults.value || !degResults.value.genes) return [];
  const searchTerm = degTableSearch.value.toLowerCase().trim();
  if (!searchTerm) {
    return degResults.value.genes;
  }
  return degResults.value.genes.filter((gene) =>
    gene.gene.toLowerCase().includes(searchTerm)
  );
});

const sortedDEGGenes = computed(() => {
  const genes = [...filteredDEGGenes.value];
  if (!degSortColumn.value) return genes;
  return genes.sort((a, b) => {
    let aVal;
    let bVal;
    switch (degSortColumn.value) {
      case "gene":
        aVal = a.gene.toLowerCase();
        bVal = b.gene.toLowerCase();
        break;
      case "logFC":
        aVal = a.logFC;
        bVal = b.logFC;
        break;
      case "mean_expr_group1":
        aVal = a.mean_expr_group1 || 0;
        bVal = b.mean_expr_group1 || 0;
        break;
      case "mean_expr_group2":
        aVal = a.mean_expr_group2 || 0;
        bVal = b.mean_expr_group2 || 0;
        break;
      case "pct_group1":
        aVal = a.pct_group1 || 0;
        bVal = b.pct_group1 || 0;
        break;
      case "pct_group2":
        aVal = a.pct_group2 || 0;
        bVal = b.pct_group2 || 0;
        break;
      case "pvalue":
        aVal = a.pvalue || 0;
        bVal = b.pvalue || 0;
        break;
      case "adjPvalue":
        aVal = a.adjPvalue || a.pvalue || 0;
        bVal = b.adjPvalue || b.pvalue || 0;
        break;
      default:
        return 0;
    }
    if (typeof aVal === "string") {
      return degSortDirection.value === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return degSortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
  });
});

const sortedPathwayResults = computed(() => {
  if (!pathwayResults.value) return [];
  const results = [...pathwayResults.value];
  if (!pathwaySortColumn.value) return results;
  return results.sort((a, b) => {
    let aVal;
    let bVal;
    switch (pathwaySortColumn.value) {
      case "term":
        aVal = a.term.toLowerCase();
        bVal = b.term.toLowerCase();
        break;
      case "pvalue":
        aVal = a.pvalue || 0;
        bVal = b.pvalue || 0;
        break;
      case "fdr":
        aVal = a.fdr || 0;
        bVal = b.fdr || 0;
        break;
      case "zscore":
        aVal = a.zscore || 0;
        bVal = b.zscore || 0;
        break;
      case "combinedScore":
        aVal = a.combinedScore || a.score || 0;
        bVal = b.combinedScore || b.score || 0;
        break;
      case "genes":
        aVal = a.genes.split(",").length;
        bVal = b.genes.split(",").length;
        break;
      default:
        return 0;
    }
    if (typeof aVal === "string") {
      return pathwaySortDirection.value === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return pathwaySortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
  });
});

const sortDEGTable = (column) => {
  if (degSortColumn.value === column) {
    degSortDirection.value = degSortDirection.value === "asc" ? "desc" : "asc";
  } else {
    degSortColumn.value = column;
    degSortDirection.value = "asc";
  }
};

const sortPathwayTable = (column) => {
  if (pathwaySortColumn.value === column) {
    pathwaySortDirection.value =
      pathwaySortDirection.value === "asc" ? "desc" : "asc";
  } else {
    pathwaySortColumn.value = column;
    pathwaySortDirection.value = "asc";
  }
};

const upregulatedCount = computed(() => {
  if (!degResults.value || !degResults.value.genes) return 0;
  return degResults.value.genes.filter(
    (gene) =>
      Math.abs(gene.logFC) >= degParams.value.minLogFC &&
      (gene.adjPvalue || gene.pvalue) <= degParams.value.maxPvalue &&
      gene.logFC > 0
  ).length;
});

const downregulatedCount = computed(() => {
  if (!degResults.value || !degResults.value.genes) return 0;
  return degResults.value.genes.filter(
    (gene) =>
      Math.abs(gene.logFC) >= degParams.value.minLogFC &&
      (gene.adjPvalue || gene.pvalue) <= degParams.value.maxPvalue &&
      gene.logFC < 0
  ).length;
});

const significantPathwayCount = computed(() => {
  if (!pathwayResults.value) return 0;
  return pathwayResults.value.filter((term) => term.fdr < 0.05).length;
});

const formattedComparison = computed(() => {
  if (!currentDEGComparison.value) return "";
  const parts = currentDEGComparison.value.split(" vs ");
  if (parts.length === 2) {
    return `${parts[0]}\nvs\n${parts[1]}`;
  }
  return currentDEGComparison.value;
});

// Charts
const volcanoOption = computed(() => {
  if (!degResults.value || !degResults.value.genes) return {};
  const upregulated = [];
  const downregulated = [];
  const notSig = [];
  degResults.value.genes.forEach((gene) => {
    const x = parseFloat(gene.logFC);
    const adjPval = gene.adjPvalue || gene.pvalue;
    const y = adjPval > 0 ? -Math.log10(adjPval) : 0;
    const point = [x, y, gene.gene];
    if (
      Math.abs(x) >= degParams.value.minLogFC &&
      adjPval <= degParams.value.maxPvalue
    ) {
      if (x > 0) {
        upregulated.push(point);
      } else {
        downregulated.push(point);
      }
    } else {
      notSig.push(point);
    }
  });
  return {
    title: {
      text: `Volcano Plot (${
        upregulated.length + downregulated.length
      } significant)`,
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.value[2]}<br/>Log2FC: ${params.value[0].toFixed(
          2
        )}<br/>-log10(adj p): ${params.value[1].toFixed(2)}`,
    },
    legend: {
      data: ["Upregulated", "Downregulated", "Not Significant"],
      bottom: 10,
    },
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 80,
    },
    xAxis: {
      name: "Log2 Fold Change",
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      name: "-log10(Adjusted P-value)",
      nameLocation: "middle",
      nameGap: 40,
    },
    series: [
      {
        name: "Upregulated",
        type: "scatter",
        data: upregulated,
        symbolSize: 6,
        itemStyle: { color: "#e74c3c" },
      },
      {
        name: "Downregulated",
        type: "scatter",
        data: downregulated,
        symbolSize: 6,
        itemStyle: { color: "#3498db" },
      },
      {
        name: "Not Significant",
        type: "scatter",
        data: notSig,
        symbolSize: 4,
        itemStyle: { color: "#95a5a6", opacity: 0.3 },
      },
    ],
  };
});

const pathwayBubbleOption = computed(() => {
  if (!pathwayResults.value || pathwayResults.value.length === 0) return {};
  const significantPathways = pathwayResults.value
    .filter((term) => term.fdr < 0.05)
    .slice(0, 30);
  if (significantPathways.length === 0) return {};
  const bubbleData = significantPathways.map((term, idx) => {
    const geneCount = term.genes.split(",").length;
    const logFDR = term.fdr > 0 ? -Math.log10(term.fdr) : 0;
    const score = term.combinedScore || term.score || 0;
    return {
      value: [geneCount, logFDR, score],
      name: term.term,
      itemStyle: {
        color: `hsl(${240 - idx * 8}, 70%, ${50 + (idx % 3) * 10}%)`,
        opacity: 0.7,
      },
    };
  });
  const scoreValues = significantPathways.map(
    (t) => t.combinedScore || t.score || 0
  );
  const maxScore = Math.max(...scoreValues);
  const minScore = Math.min(...scoreValues);
  const range = maxScore - minScore || 1;
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const term = significantPathways[params.dataIndex];
        return `
          <strong>${params.name}</strong><br/>
          FDR: ${term.fdr.toExponential(2)}<br/>
          P-value: ${term.pvalue.toExponential(2)}<br/>
          Genes: ${term.genes.split(",").length}<br/>
          Combined Score: ${(term.combinedScore || term.score || 0).toFixed(2)}
        `;
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 40,
      bottom: 60,
    },
    xAxis: {
      name: "Number of Genes",
      nameLocation: "middle",
      nameGap: 30,
      type: "value",
    },
    yAxis: {
      name: "-log10(FDR)",
      nameLocation: "middle",
      nameGap: 50,
      type: "value",
    },
    series: [
      {
        type: "scatter",
        data: bubbleData,
        symbolSize: (data) => {
          const normalized = ((data[2] - minScore) / range) * 100 + 20;
          return Math.max(20, Math.min(80, normalized));
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});

// Pathway helpers
const togglePathwayGenes = (idx) => {
  if (expandedPathwayIndex.value === idx) {
    expandedPathwayIndex.value = null;
  } else {
    expandedPathwayIndex.value = idx;
  }
};

const copyGenes = async (genesString) => {
  const genes = genesString
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g);
  const genesText = genes.join("\n");
  try {
    await navigator.clipboard.writeText(genesText);
    alert(`Copied ${genes.length} genes to clipboard!`);
  } catch (err) {
    console.error("Failed to copy genes:", err);
    const textArea = document.createElement("textarea");
    textArea.value = genesText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      alert(`Copied ${genes.length} genes to clipboard!`);
    } catch (fallbackErr) {
      alert("Failed to copy genes. Please copy manually.");
    }
    document.body.removeChild(textArea);
  }
};

const savePathwayGenesToCart = (term) => {
  if (!term?.genes) {
    alert("No genes available for this pathway.");
    return;
  }
  const genes = term.genes
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
  const label = term.term || "Pathway Gene Set";
  saveGeneSetToCart(label, genes, "pathway");
};

const saveDEGGenesToCart = (direction = "all") => {
  if (!degResults.value || !degResults.value.genes) {
    alert("Run a DEG analysis before saving genes to the cart.");
    return;
  }
  let genes = filteredDEGGenes.value;
  if (direction === "up") {
    genes = genes.filter(
      (g) =>
        Math.abs(g.logFC) >= degParams.value.minLogFC &&
        (g.adjPvalue || g.pvalue) <= degParams.value.maxPvalue &&
        g.logFC > 0
    );
  } else if (direction === "down") {
    genes = genes.filter(
      (g) =>
        Math.abs(g.logFC) >= degParams.value.minLogFC &&
        (g.adjPvalue || g.pvalue) <= degParams.value.maxPvalue &&
        g.logFC < 0
    );
  }
  const geneSymbols = genes.map((gene) => gene.gene);
  if (!geneSymbols.length) {
    alert("No DEG genes available with the current filters.");
    return;
  }
  const label = `DEG: ${degGroupALabel.value} vs ${degGroupBLabel.value}`;
  saveGeneSetToCart(label, geneSymbols, "deg-result");
};

// Data fetchers
const fetchDatasetCellTypes = async (dsId) => {
  try {
    const response = await fetch(
      `${apiBaseNoH5ad.value}/deg/cell-types/${encodeURIComponent(dsId)}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.cell_types.map((ct) => ({
      name: ct,
      count: data.counts?.[ct] || 0,
    }));
  } catch (err) {
    console.error(`Error fetching cell types for ${dsId}:`, err);
    return [];
  }
};

const updateDataset1CellTypes = async () => {
  // Prefer provided cellTypes prop when available
  if (Array.isArray(props.cellTypes) && props.cellTypes.length) {
    dataset1CellTypes.value = props.cellTypes;
    degParams.value.cellType1 = "";
    degParams.value.cellType2 = "";
    degSelection.value.groupA = [];
    degSelection.value.groupB = [];
    return;
  }

  if (props.datasetId) {
    dataset1CellTypes.value = await fetchDatasetCellTypes(props.datasetId);
    degParams.value.cellType1 = "";
    degParams.value.cellType2 = "";
    degSelection.value.groupA = [];
    degSelection.value.groupB = [];
  }
};

const runDEG = async () => {
  isRunningDEG.value = true;
  errorMessage.value = null;
  try {
    const groupA =
      degSelection.value.groupA.length > 0 ? degSelection.value.groupA : [];
    const groupB = resolvedDegGroupB.value;
    if (groupA.length === 0) {
      throw new Error("Select at least one cell type for Group A.");
    }
    if (groupB.length === 0) {
      throw new Error(
        "Select at least one cell type for Group B or enable auto selection."
      );
    }
    if (groupA.some((ct) => groupB.includes(ct))) {
      throw new Error("Group A and Group B must not share cell types.");
    }
    degParams.value.cellType1 = groupA.join(", ");
    degParams.value.cellType2 = groupB.join(", ");
    const requestBody = {
      dataset_id1: props.datasetId,
      dataset_id2: props.datasetId,
      logfc_threshold: degParams.value.minLogFC,
      p_value_threshold: degParams.value.maxPvalue,
      min_pct: 0.1,
      cell_types_group1: groupA,
      cell_types_group2: groupB,
      cell_type: groupA.join(","),
      cell_type2: groupB.join(","),
    };
    const response = await fetch(
      `${apiBaseNoH5ad.value}/deg/between-datasets`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    const data = await response.json();
    degResults.value = {
      summary: data.summary,
      comparison: data.comparison,
      genes: data.genes.map((g) => ({
        gene: g.gene,
        logFC: parseFloat(g.log2_fold_change),
        pvalue: parseFloat(g.p_value),
        adjPvalue: parseFloat(g.p_value_adj),
        significant: g.significant,
        mean_expr_group1: g.mean_expr_group1,
        mean_expr_group2: g.mean_expr_group2,
        pct_group1: g.pct_group1,
        pct_group2: g.pct_group2,
      })),
    };
    const ds1 = props.availableDatasets.find(
      (d) => d.dataset_id === props.datasetId
    );
    const ds1Label = ds1 ? formatDatasetLabel(ds1) : props.datasetId;
    currentDEGComparison.value = `${ds1Label}:\n${groupA.join(
      ", "
    )} vs ${groupB.join(", ")}`;
  } catch (err) {
    console.error("Error running DEG analysis:", err);
    errorMessage.value = err.message;
    degResults.value = null;
  } finally {
    isRunningDEG.value = false;
  }
};

const runPathwayEnrichment = async () => {
  if (!degResults.value || !degResults.value.genes) return;
  isRunningPathway.value = true;
  errorMessage.value = null;
  try {
    const organismCode =
      pathwayParams.value.species === "mouse" ? "mmusculus" : "hsapiens";
    let filteredGenes = degResults.value.genes.filter((g) => {
      const logFC = parseFloat(g.logFC);
      const passesThreshold = Math.abs(logFC) >= degParams.value.minLogFC;
      const passesPvalue =
        (g.adjPvalue || g.pvalue) <= degParams.value.maxPvalue;
      if (!passesThreshold || !passesPvalue) return false;
      if (pathwayParams.value.direction === "up") {
        return logFC > 0;
      } else if (pathwayParams.value.direction === "down") {
        return logFC < 0;
      }
      return true;
    });
    const topGenes = filteredGenes
      .sort((a, b) => (a.adjPvalue || a.pvalue) - (b.adjPvalue || b.pvalue))
      .slice(0, pathwayParams.value.topN)
      .map((g) => g.gene);
    if (topGenes.length === 0) {
      throw new Error("No DEGs match the selected criteria");
    }
    if (pathwayParams.value.method === "gprofiler") {
      const gprofilerResponse = await fetch(
        "https://biit.cs.ut.ee/gprofiler/api/gost/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organism: organismCode,
            query: topGenes,
            sources: ["GO:BP", "KEGG", "REAC", "WP"],
            significance_threshold_method: "fdr",
            user_threshold: 0.05,
            no_iea: false,
            no_evidences: false,
          }),
        }
      );
      if (!gprofilerResponse.ok) {
        const errorText = await gprofilerResponse.text();
        throw new Error(
          `gProfiler API error (${gprofilerResponse.status}): ${errorText}`
        );
      }
      const gprofilerData = await gprofilerResponse.json();
      if (gprofilerData.error) {
        throw new Error(`gProfiler error: ${gprofilerData.error}`);
      }
      const gprofilerResults = gprofilerData.result || [];
      pathwayResults.value = gprofilerResults
        .map((item) => {
          let geneNames = [];
          if (item.intersections && Array.isArray(item.intersections)) {
            item.intersections.forEach((intersection, idx) => {
              if (Array.isArray(intersection) && intersection.length > 0) {
                if (topGenes[idx]) {
                  geneNames.push(topGenes[idx]);
                }
              }
            });
          }
          return {
            term: item.name || item.term || item.description || "Unknown",
            pvalue: parseFloat(item.p_value) || 1.0,
            fdr: parseFloat(item.p_value) || 1.0,
            genes: geneNames.join(","),
            score: parseFloat(item.strength) || 0,
          };
        })
        .filter((item) => item.genes.length > 0)
        .sort((a, b) => a.fdr - b.fdr);
      pathwayEnrichmentInfo.value = {
        genesUsed: topGenes.length,
        direction: pathwayParams.value.direction,
        method: pathwayParams.value.method,
        database: "GO:BP, KEGG, REAC, WP",
      };
    } else {
      const geneListString = topGenes.join("\n");
      const description =
        `${props.datasetId}_DEG_${pathwayParams.value.direction}`.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );
      const formData = new FormData();
      formData.append("list", geneListString);
      formData.append("description", description);
      const addListResponse = await fetch(
        "https://maayanlab.cloud/Enrichr/addList",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!addListResponse.ok) {
        const errorText = await addListResponse.text();
        throw new Error(
          `Enrichr API error (${addListResponse.status}): ${addListResponse.statusText}. ${errorText}`
        );
      }
      const addListData = await addListResponse.json();
      if (addListData.error) {
        throw new Error(`Enrichr error: ${addListData.error}`);
      }
      if (!addListData.userListId) {
        throw new Error("Enrichr did not return a userListId");
      }
      const userListId = addListData.userListId;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const enrichResponse = await fetch(
        `https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${pathwayParams.value.database}`
      );
      if (!enrichResponse.ok) {
        throw new Error(
          `Enrichr enrichment API error: ${enrichResponse.statusText}`
        );
      }
      const enrichData = await enrichResponse.json();
      const results = enrichData[pathwayParams.value.database];
      if (!results || !Array.isArray(results)) {
        throw new Error("Invalid response from Enrichr API");
      }
      pathwayResults.value = results
        .map((item) => ({
          term: item[1] || "Unknown",
          pvalue: parseFloat(item[2]) || 1.0,
          zscore: parseFloat(item[3]) || 0,
          combinedScore: parseFloat(item[4]) || 0,
          genes: Array.isArray(item[5]) ? item[5].join(",") : item[5] || "",
          fdr: parseFloat(item[6]) || 1.0,
          score: parseFloat(item[4]) || 0,
        }))
        .sort((a, b) => a.fdr - b.fdr);
      const databaseNames = {
        GO_Biological_Process_2023: "GO Biological Process",
        KEGG_2021_Human: "KEGG",
        Reactome_2022: "Reactome",
        WikiPathways_2023: "WikiPathways",
      };
      pathwayEnrichmentInfo.value = {
        genesUsed: topGenes.length,
        direction: pathwayParams.value.direction,
        method: pathwayParams.value.method,
        database:
          databaseNames[pathwayParams.value.database] ||
          pathwayParams.value.database,
      };
    }
  } catch (error) {
    console.error("Enrichment analysis failed:", error);
    errorMessage.value =
      error.message || "Pathway enrichment failed. Please try again.";
    pathwayResults.value = null;
    pathwayEnrichmentInfo.value = null;
  } finally {
    isRunningPathway.value = false;
  }
};

watch(
  () => props.datasetId,
  async () => {
    await updateDataset1CellTypes();
    degResults.value = null;
    pathwayResults.value = null;
    errorMessage.value = null;
  }
);

watch(
  () => props.cellTypes,
  async (val) => {
    if (Array.isArray(val) && val.length) {
      dataset1CellTypes.value = val;
      degResults.value = null;
      pathwayResults.value = null;
      errorMessage.value = null;
    } else {
      await updateDataset1CellTypes();
    }
  },
  { deep: true }
);

onMounted(async () => {
  await updateDataset1CellTypes();
});
</script>
