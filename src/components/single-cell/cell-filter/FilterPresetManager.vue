<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <AppIcon name="save" size="sm" />
        Saved Presets
      </h3>
    </div>

    <!-- Save New Preset -->
    <div class="flex gap-2">
      <input
        v-model="newPresetName"
        type="text"
        placeholder="Enter preset name..."
        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        @keyup.enter="saveNewPreset"
      />
      <button
        @click="saveNewPreset"
        :disabled="!newPresetName.trim() || !hasActiveFilters"
        class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Save
      </button>
    </div>

    <!-- Help Text -->
    <p v-if="!hasActiveFilters" class="text-xs text-gray-500">
      Add filters first before saving a preset
    </p>

    <!-- Preset List -->
    <div v-if="presets.length > 0" class="space-y-2">
      <div 
        v-for="preset in presets" 
        :key="preset.id"
        class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 group hover:border-primary-200 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-700 truncate">{{ preset.name }}</p>
          <p class="text-xs text-gray-500">
            {{ formatPresetInfo(preset) }}
          </p>
        </div>
        
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="$emit('load', preset.id)"
            class="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="Load this preset"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button
            @click="copyShareLink(preset.id)"
            class="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            title="Copy share link"
          >
            <AppIcon name="link" size="sm" />
          </button>
          <button
            @click="confirmDelete(preset)"
            class="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete preset"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <p class="text-sm text-gray-500">No saved presets</p>
      <p class="text-xs text-gray-400 mt-1">Save your current filters for quick access</p>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="deleteConfirm" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="deleteConfirm = null"
    >
      <div class="bg-white rounded-lg shadow-xl p-4 max-w-sm mx-4">
        <h4 class="font-semibold text-gray-900 mb-2">Delete Preset?</h4>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{{ deleteConfirm.name }}"? This cannot be undone.
        </p>
        <div class="flex justify-end gap-2">
          <button
            @click="deleteConfirm = null"
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            @click="doDelete"
            class="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Copy Success Toast -->
    <div 
      v-if="showCopySuccess"
      class="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
    >
      Link copied to clipboard!
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps({
  presets: {
    type: Array,
    default: () => [],
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
  encodeFilters: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['save', 'load', 'delete']);

const newPresetName = ref('');
const deleteConfirm = ref(null);
const showCopySuccess = ref(false);

const saveNewPreset = () => {
  if (!newPresetName.value.trim() || !props.hasActiveFilters) return;
  emit('save', newPresetName.value.trim());
  newPresetName.value = '';
};

const formatPresetInfo = (preset) => {
  const parts = [];
  
  const catCount = preset.categoryFilters?.length || 0;
  const geneCount = preset.geneFilters?.length || 0;
  
  if (catCount > 0) {
    parts.push(`${catCount} category ${catCount === 1 ? 'filter' : 'filters'}`);
  }
  if (geneCount > 0) {
    parts.push(`${geneCount} gene ${geneCount === 1 ? 'filter' : 'filters'}`);
  }
  
  if (preset.createdAt) {
    const date = new Date(preset.createdAt);
    parts.push(date.toLocaleDateString());
  }
  
  return parts.join(' | ') || 'Empty preset';
};

const confirmDelete = (preset) => {
  deleteConfirm.value = preset;
};

const doDelete = () => {
  if (deleteConfirm.value) {
    emit('delete', deleteConfirm.value.id);
    deleteConfirm.value = null;
  }
};

const copyShareLink = async (presetId) => {
  if (!props.encodeFilters) return;
  
  try {
    const encoded = props.encodeFilters();
    if (encoded) {
      const url = new URL(window.location.href);
      url.searchParams.set('filter', encoded);
      await navigator.clipboard.writeText(url.toString());
      
      showCopySuccess.value = true;
      setTimeout(() => {
        showCopySuccess.value = false;
      }, 2000);
    }
  } catch (e) {
    console.warn('Failed to copy link:', e);
  }
};
</script>
