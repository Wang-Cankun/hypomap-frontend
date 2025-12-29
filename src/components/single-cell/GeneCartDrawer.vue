<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50">
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>
      <div
        class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
      >
        <div class="p-4 border-b flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Gene Cart ({{ items.length }})
            </h2>
            <p class="text-xs text-gray-500">
              Save and reuse frequently used gene sets across tools
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="items.length > 0"
              @click="confirmClearAll"
              class="text-xs text-red-500 hover:text-red-700 font-medium"
              title="Remove all gene sets"
            >
              Clear All
            </button>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="p-4 border-b space-y-3">
          <p class="text-sm font-semibold text-gray-700">
            Add Custom Gene Set
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-600">Title</label>
              <input
                v-model="newLabel"
                type="text"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., AD Risk Genes"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600">Source</label>
              <input
                v-model="newSource"
                type="text"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Custom"
              />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600"
              >Genes (comma or space separated)</label
            >
            <textarea
              v-model="newGenes"
              rows="3"
              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
          <div class="flex justify-between items-center">
            <button
              @click="clearNewForm"
              type="button"
              class="text-xs text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
            <button
              @click="submitNewGeneSet"
              class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
            >
              Save to Cart
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto divide-y">
          <div
            v-if="items.length === 0"
            class="h-full flex items-center justify-center text-gray-400 text-sm"
          >
            No gene sets saved yet
          </div>
          <div v-for="item in items" :key="item.id" class="p-4 space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-gray-900">
                  {{ item.label }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ item.genes.length }} genes • {{ item.source || "Custom" }}
                </p>
              </div>
              <button
                @click="$emit('remove', item.id)"
                class="text-gray-300 hover:text-red-500"
                title="Remove from cart"
              >
                ✕
              </button>
            </div>
            <div
              class="flex flex-wrap gap-1 text-[11px] text-gray-600 max-h-16 overflow-y-auto"
            >
              <span
                v-for="gene in item.genes"
                :key="gene"
                class="px-2 py-0.5 bg-gray-100 rounded"
              >
                {{ gene }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <button
                class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                @click="$emit('copy', item.id)"
              >
                Copy Genes
              </button>
              <button
                class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                @click="$emit('apply', { id: item.id, target: 'module' })"
              >
                Use in Module Score
              </button>
              <button
                class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                @click="$emit('apply', { id: item.id, target: 'heatmap' })"
              >
                Use in Heatmap/Dotplot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "add", "remove", "apply", "copy", "clearAll"]);

const newLabel = ref("");
const newGenes = ref("");
const newSource = ref("Custom");

const clearNewForm = () => {
  newLabel.value = "";
  newGenes.value = "";
  newSource.value = "Custom";
};

const submitNewGeneSet = () => {
  emit("add", {
    label: newLabel.value,
    genes: newGenes.value,
    source: newSource.value,
  });
  clearNewForm();
};

const confirmClearAll = () => {
  if (confirm(`Are you sure you want to remove all ${props.items.length} gene sets from the cart?`)) {
    emit("clearAll");
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

