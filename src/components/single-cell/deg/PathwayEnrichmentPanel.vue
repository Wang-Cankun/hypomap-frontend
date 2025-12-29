<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="font-semibold text-gray-900 mb-3">2. Pathway Enrichment</h3>
    <div class="space-y-3">
      <div
        v-if="autoDetectedSpecies"
        class="mb-2 text-xs text-gray-600 bg-blue-50 p-2 rounded"
      >
        Species:
        <strong>{{
          autoDetectedSpecies === "human" ? "Human" : "Mouse"
        }}</strong>
        (auto-detected from dataset)
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Database
        </label>
        <select
          :value="pathwayParams.database"
          @input="
            $emit('update:pathwayParams', {
              ...pathwayParams,
              database: $event.target.value,
            })
          "
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
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            # DEGs to Use
          </label>
          <input
            :value="pathwayParams.topN"
            @input="
              $emit('update:pathwayParams', {
                ...pathwayParams,
                topN: parseInt($event.target.value) || 0,
              })
            "
            type="number"
            min="1"
            max="1000"
            step="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="100"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            # Pathways to Plot
          </label>
          <input
            :value="pathwayParams.topPathways"
            @input="
              $emit('update:pathwayParams', {
                ...pathwayParams,
                topPathways: parseInt($event.target.value) || 0,
              })
            "
            type="number"
            min="5"
            max="50"
            step="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="20"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Direction
        </label>
        <select
          :value="pathwayParams.direction"
          @input="
            $emit('update:pathwayParams', {
              ...pathwayParams,
              direction: $event.target.value,
            })
          "
          class="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="both">Both (Run Up & Down separately)</option>
          <option value="up">Upregulated Only</option>
          <option value="down">Downregulated Only</option>
        </select>
      </div>
      <button
        @click="$emit('runPathwayEnrichment')"
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
        <span>{{ isRunningPathway ? "Running..." : "Run Enrichment" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pathwayParams: {
    type: Object,
    required: true,
  },
  availablePathwayDatabases: {
    type: Array,
    default: () => [
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
      { value: "KEGG_2021_Human", label: "KEGG 2021 Human" },
      { value: "Reactome_2022", label: "Reactome 2022" },
    ],
  },
  degResults: {
    type: Object,
    default: null,
  },
  isRunningPathway: {
    type: Boolean,
    default: false,
  },
  autoDetectedSpecies: {
    type: String,
    default: "human",
  },
});

defineEmits(["update:pathwayParams", "runPathwayEnrichment"]);
</script>
