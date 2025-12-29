<template>
  <div
    v-if="!isAtlasMode"
    class="mt-6 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-3"
  >
    <h3
      class="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between cursor-pointer"
      @click="toggle"
    >
      <span>Dataset Information</span>
      <button
        class="text-gray-400 hover:text-gray-600 transition-transform"
        :class="{ 'rotate-180': !isExpanded }"
      >
        ▼
      </button>
    </h3>
    <div v-show="isExpanded">
      <dl class="grid grid-cols-2 gap-x-3 gap-y-2">
        <div>
          <dt class="text-xs text-gray-500">Species</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.species }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Cells</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.cells?.toLocaleString() }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Genes</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.genes?.toLocaleString() }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Tissue</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.tissue }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Disease</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.disease }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Sex</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.sex }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Age</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{
              metadata.age && metadata.age !== "N/A"
                ? metadata.age
                : "no data available"
            }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500">Protocol</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.protocol }}
          </dd>
        </div>
        <div v-if="metadata.publicDatasetId">
          <dt class="text-xs text-gray-500">Public Dataset ID</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.publicDatasetId }}
          </dd>
        </div>
        <div v-if="metadata.model">
          <dt class="text-xs text-gray-500">APOE Genotype</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.model }}
          </dd>
        </div>
        <div v-if="metadata.status && metadata.status !== 'N/A'">
          <dt class="text-xs text-gray-500">Status</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.status }}
          </dd>
        </div>
        <div v-if="metadata.stage && metadata.stage !== 'no data available'">
          <dt class="text-xs text-gray-500">Stage</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.stage }}
          </dd>
        </div>
        <div v-if="metadata.treatment">
          <dt class="text-xs text-gray-500">Treatment</dt>
          <dd class="text-sm font-medium text-gray-900">
            {{ metadata.treatment }}
          </dd>
        </div>
      </dl>
      <div
        v-if="
          (metadata.doi || (metadata.pmid && metadata.pmid !== 'N/A')) &&
          metadata.paper_title !== 'N/A'
        "
        class="mt-3 pt-3 border-t border-gray-200"
      >
        <dt class="text-xs text-gray-500 mb-1">Related Paper</dt>
        <dd class="text-xs font-medium text-gray-900 mb-2 leading-relaxed">
          {{ metadata.paper_title }}
        </dd>
        <div class="flex flex-col gap-2">
          <a
            v-if="metadata.doi"
            :href="`https://doi.org/${metadata.doi}`"
            target="_blank"
            class="flex items-start text-xs text-primary-600 hover:text-primary-700 font-medium break-words"
          >
            <AppIcon name="document" size="xs" class="mr-1 flex-shrink-0" />
            <span class="break-all">DOI: {{ metadata.doi }}</span>
          </a>
          <a
            v-if="metadata.pmid && metadata.pmid !== 'N/A'"
            :href="`https://pubmed.ncbi.nlm.nih.gov/${metadata.pmid}`"
            target="_blank"
            class="flex items-start text-xs text-primary-600 hover:text-primary-700 font-medium break-words"
          >
            <AppIcon name="link" size="xs" class="mr-1 flex-shrink-0" />
            <span>PubMed: {{ metadata.pmid }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppIcon from "@/components/icons/AppIcon.vue";

const props = defineProps({
  isAtlasMode: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Object,
    default: () => ({}),
  },
  defaultExpanded: {
    type: Boolean,
    default: true,
  },
});

const isExpanded = ref(props.defaultExpanded);

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};
</script>
