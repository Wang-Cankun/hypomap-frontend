/**
 * Composable for Advanced Cell Filtering
 * Provides multi-dimensional filtering by metadata categories and gene expression
 * with AND/OR logic, saved presets, and statistics
 */

import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'hypomap_cell_filter_presets';

/**
 * Generate a unique ID for filters
 */
const generateId = () => `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Apply category filters to cell indices
 */
const applyCategoryFilters = (indices, filters, cellMetadata) => {
  if (!filters.length || !cellMetadata) return indices;

  // Filter out filters with no values selected (they would match nothing)
  const activeFilters = filters.filter(f => f.values && f.values.length > 0);
  if (!activeFilters.length) return indices;

  let result = null; // null means not yet initialized
  let prevLogic = 'AND';

  for (let i = 0; i < activeFilters.length; i++) {
    const filter = activeFilters[i];
    const columnData = cellMetadata[filter.column];
    if (!columnData) continue;

    // Determine which indices to check based on logic
    // For first filter or OR logic: check all indices
    // For AND logic with existing result: only check indices in current result
    const indicesToCheck = (result === null || prevLogic === 'OR') ? indices : result;

    // Get indices that pass this filter
    const passingIndices = new Set();
    indicesToCheck.forEach(idx => {
      const value = columnData[idx];
      let passes = false;

      switch (filter.operator) {
        case 'in':
          passes = filter.values.includes(value);
          break;
        case 'not_in':
          passes = !filter.values.includes(value);
          break;
        case 'equals':
          passes = filter.values.length === 1 && value === filter.values[0];
          break;
        case 'not_equals':
          passes = filter.values.length === 1 && value !== filter.values[0];
          break;
        default:
          passes = filter.values.includes(value);
      }

      if (passes) passingIndices.add(idx);
    });

    // Apply logic to combine with previous result
    if (result === null) {
      // First filter - just use passing indices
      result = [...passingIndices];
    } else if (prevLogic === 'AND') {
      // AND: intersection - keep only indices that pass both
      result = result.filter(idx => passingIndices.has(idx));
    } else {
      // OR: union - add new passing indices to result
      passingIndices.forEach(idx => {
        if (!result.includes(idx)) result.push(idx);
      });
    }

    // Store this filter's logic for use with NEXT filter
    prevLogic = filter.logic || 'AND';
  }

  return result || indices;
};

/**
 * Apply gene expression filters to cell indices
 */
const applyGeneFilters = (indices, filters, expressionCache) => {
  if (!filters.length) return indices;

  // Filter out filters without gene expression data loaded
  const activeFilters = filters.filter(f => f.gene && expressionCache[f.gene]);
  if (!activeFilters.length) return indices;

  let result = null; // null means not yet initialized
  let prevLogic = 'AND';

  for (let i = 0; i < activeFilters.length; i++) {
    const filter = activeFilters[i];
    const expression = expressionCache[filter.gene];

    // Determine which indices to check based on logic
    const indicesToCheck = (result === null || prevLogic === 'OR') ? indices : result;

    // Get indices that pass this filter
    const passingIndices = new Set();
    indicesToCheck.forEach(idx => {
      const value = expression[idx] || 0;
      let passes = false;

      switch (filter.operator) {
        case '>':
          passes = value > filter.value;
          break;
        case '<':
          passes = value < filter.value;
          break;
        case '>=':
          passes = value >= filter.value;
          break;
        case '<=':
          passes = value <= filter.value;
          break;
        case '==':
          passes = value === filter.value;
          break;
        case '!=':
          passes = value !== filter.value;
          break;
        default:
          passes = value > filter.value;
      }

      if (passes) passingIndices.add(idx);
    });

    // Apply logic to combine with previous result
    if (result === null) {
      // First filter - just use passing indices
      result = [...passingIndices];
    } else if (prevLogic === 'AND') {
      // AND: intersection - keep only indices that pass both
      result = result.filter(idx => passingIndices.has(idx));
    } else {
      // OR: union - add new passing indices to result
      passingIndices.forEach(idx => {
        if (!result.includes(idx)) result.push(idx);
      });
    }

    // Store this filter's logic for use with NEXT filter
    prevLogic = filter.logic || 'AND';
  }

  return result || indices;
};

/**
 * Load presets from localStorage
 */
const loadPresetsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load filter presets:', e);
  }
  return { presets: {} };
};

/**
 * Save presets to localStorage
 */
const savePresetsToStorage = (presets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.warn('Failed to save filter presets:', e);
  }
};

/**
 * Main composable function
 * @param {Ref} cellMetadata - Cell metadata (contains array data per cell)
 * @param {Function} geneExpressionFetcher - Function to fetch gene expression
 * @param {Ref} datasetId - Dataset ID
 * @param {Object} options - Additional options
 * @param {Ref} options.externalColumns - External columns list (overrides cellMetadata keys)
 * @param {Ref} options.externalColumnValues - External column values (overrides computed values)
 * @param {Ref} options.externalCellMetadata - Additional per-cell metadata source (e.g., compositionMetadata)
 * @param {Function} options.fetchColumnData - Function to fetch column data on-demand
 */
export function useCellFilter(cellMetadata, geneExpressionFetcher, datasetId = null, options = {}) {
  const { externalColumns, externalColumnValues, externalCellMetadata, fetchColumnData } = options;
  // ============================================================================
  // State
  // ============================================================================
  
  const categoryFilters = ref([]);
  const geneFilters = ref([]);
  const isFilterPanelOpen = ref(true); // Open by default as requested
  const geneExpressionCache = ref({});
  const loadingGenes = ref(new Set());
  const filterError = ref(null);
  
  // Logic between category and gene filter groups
  const globalLogic = ref('AND');

  // ============================================================================
  // Computed: Available metadata columns
  // ============================================================================
  
  // Priority order for columns (these will appear first)
  const columnPriorityOrder = ['cell_type', 'cluster', 'cell_class', 'cell_subtype'];
  
  const sortColumnsWithPriority = (columns) => {
    return [...columns].sort((a, b) => {
      const aIdx = columnPriorityOrder.indexOf(a);
      const bIdx = columnPriorityOrder.indexOf(b);
      
      // If both are priority columns, sort by priority order
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      // Priority columns come first
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      // Otherwise sort alphabetically
      return a.localeCompare(b);
    });
  };
  
  const availableColumns = computed(() => {
    let columns;
    // Use external columns if provided (for atlas mode with categorical metadata)
    if (externalColumns?.value && externalColumns.value.length > 0) {
      columns = externalColumns.value;
    } else if (cellMetadata?.value) {
      // Fallback to cellMetadata keys
      columns = Object.keys(cellMetadata.value).filter(key => {
        const data = cellMetadata.value[key];
        return Array.isArray(data) && data.length > 0;
      });
    } else {
      return [];
    }
    
    // Sort with priority (cell_type first)
    return sortColumnsWithPriority(columns);
  });

  // ============================================================================
  // Computed: Unique values for each column
  // ============================================================================
  
  const columnValues = computed(() => {
    const result = {};
    
    // Use external column values if provided (for atlas mode)
    if (externalColumnValues?.value) {
      availableColumns.value.forEach(col => {
        const values = externalColumnValues.value[col];
        if (Array.isArray(values)) {
          result[col] = values.sort((a, b) => String(a).localeCompare(String(b)));
        }
      });
      return result;
    }
    
    // Fallback to cellMetadata
    if (!cellMetadata?.value) return result;
    
    availableColumns.value.forEach(col => {
      const data = cellMetadata.value[col];
      if (Array.isArray(data)) {
        const unique = [...new Set(data)].filter(v => v != null && v !== '');
        result[col] = unique.sort((a, b) => String(a).localeCompare(String(b)));
      }
    });
    return result;
  });

  // ============================================================================
  // Computed: Cell counts for each value in each column
  // ============================================================================
  
  const columnValueCounts = computed(() => {
    const result = {};
    
    availableColumns.value.forEach(col => {
      // Try multiple sources for per-cell data: cellMetadata, then externalCellMetadata
      let data = cellMetadata?.value?.[col];
      if (!Array.isArray(data) && externalCellMetadata?.value) {
        data = externalCellMetadata.value[col];
      }
      
      if (Array.isArray(data)) {
        const counts = {};
        data.forEach(value => {
          if (value != null && value !== '') {
            counts[value] = (counts[value] || 0) + 1;
          }
        });
        result[col] = counts;
      }
    });
    return result;
  });

  // ============================================================================
  // Computed: Total cell count
  // ============================================================================
  
  const totalCellCount = computed(() => {
    if (!cellMetadata?.value) return 0;
    const firstColumn = Object.keys(cellMetadata.value)[0];
    if (!firstColumn) return 0;
    return cellMetadata.value[firstColumn]?.length || 0;
  });

  // ============================================================================
  // Computed: Check if any filters are active
  // ============================================================================
  
  const hasActiveFilters = computed(() => {
    return categoryFilters.value.length > 0 || geneFilters.value.length > 0;
  });

  // ============================================================================
  // Computed: Filtered cell indices
  // ============================================================================
  
  const filteredCellIndices = computed(() => {
    const total = totalCellCount.value;
    if (total === 0) return [];
    
    // Start with all cell indices
    let indices = Array.from({ length: total }, (_, i) => i);
    
    // If no filters, return all
    if (!hasActiveFilters.value) {
      return indices;
    }

    // Apply category filters
    let categoryResult = indices;
    if (categoryFilters.value.length > 0) {
      categoryResult = applyCategoryFilters(indices, categoryFilters.value, cellMetadata?.value);
    }

    // Apply gene filters
    let geneResult = indices;
    if (geneFilters.value.length > 0) {
      geneResult = applyGeneFilters(indices, geneFilters.value, geneExpressionCache.value);
    }

    // Combine results based on global logic
    if (categoryFilters.value.length > 0 && geneFilters.value.length > 0) {
      if (globalLogic.value === 'AND') {
        const geneSet = new Set(geneResult);
        return categoryResult.filter(idx => geneSet.has(idx));
      } else {
        return [...new Set([...categoryResult, ...geneResult])];
      }
    } else if (categoryFilters.value.length > 0) {
      return categoryResult;
    } else if (geneFilters.value.length > 0) {
      return geneResult;
    }

    return indices;
  });

  // ============================================================================
  // Computed: Filtered cell count
  // ============================================================================
  
  const filteredCellCount = computed(() => filteredCellIndices.value.length);

  // ============================================================================
  // Computed: Filter percentage
  // ============================================================================
  
  const filterPercentage = computed(() => {
    if (totalCellCount.value === 0) return 0;
    return (filteredCellCount.value / totalCellCount.value * 100).toFixed(1);
  });

  // ============================================================================
  // Computed: Unique cell types from filtered cells
  // ============================================================================
  
  const filteredCellTypes = computed(() => {
    if (!cellMetadata?.value?.cell_type) return [];
    const indices = filteredCellIndices.value;
    return [...new Set(indices.map(i => cellMetadata.value.cell_type[i]))];
  });

  // ============================================================================
  // Computed: Active filter count
  // ============================================================================
  
  const activeFilterCount = computed(() => {
    return categoryFilters.value.length + geneFilters.value.length;
  });

  // ============================================================================
  // Category Filter Methods
  // ============================================================================
  
  const addCategoryFilter = (column = null) => {
    // Default to cell_type if available, otherwise first available column
    let defaultColumn = column;
    if (!defaultColumn) {
      if (availableColumns.value.includes('cell_type')) {
        defaultColumn = 'cell_type';
      } else {
        defaultColumn = availableColumns.value[0] || 'cell_type';
      }
    }
    categoryFilters.value.push({
      id: generateId(),
      column: defaultColumn,
      operator: 'in',
      values: [],
      logic: 'AND',
    });
  };

  const removeCategoryFilter = (filterId) => {
    categoryFilters.value = categoryFilters.value.filter(f => f.id !== filterId);
  };

  const updateCategoryFilter = (filterId, updates) => {
    const index = categoryFilters.value.findIndex(f => f.id === filterId);
    if (index !== -1) {
      categoryFilters.value[index] = { ...categoryFilters.value[index], ...updates };
    }
  };

  // ============================================================================
  // Gene Expression Filter Methods
  // ============================================================================
  
  const addGeneFilter = async (gene = '') => {
    const filterId = generateId();
    
    geneFilters.value.push({
      id: filterId,
      gene: gene,
      operator: '>',
      value: 0,
      logic: 'AND',
      isLoading: false,
    });

    // Fetch expression if gene is provided
    if (gene && !geneExpressionCache.value[gene]) {
      await fetchGeneExpression(gene, filterId);
    }
  };

  const removeGeneFilter = (filterId) => {
    geneFilters.value = geneFilters.value.filter(f => f.id !== filterId);
  };

  const updateGeneFilter = async (filterId, updates) => {
    const index = geneFilters.value.findIndex(f => f.id === filterId);
    if (index !== -1) {
      const oldGene = geneFilters.value[index].gene;
      geneFilters.value[index] = { ...geneFilters.value[index], ...updates };
      
      // Fetch expression if gene changed
      if (updates.gene && updates.gene !== oldGene && !geneExpressionCache.value[updates.gene]) {
        await fetchGeneExpression(updates.gene, filterId);
      }
    }
  };

  const fetchGeneExpression = async (gene, filterId) => {
    if (!geneExpressionFetcher || !gene) return;
    
    // Update loading state
    const filter = geneFilters.value.find(f => f.id === filterId);
    if (filter) filter.isLoading = true;
    loadingGenes.value.add(gene);
    
    try {
      const data = await geneExpressionFetcher(gene);
      geneExpressionCache.value[gene] = data.expression || data;
      filterError.value = null;
    } catch (err) {
      console.error(`Failed to fetch expression for ${gene}:`, err);
      filterError.value = `Failed to load expression for ${gene}`;
    } finally {
      if (filter) filter.isLoading = false;
      loadingGenes.value.delete(gene);
    }
  };

  // ============================================================================
  // Reset Methods
  // ============================================================================
  
  const resetFilters = () => {
    categoryFilters.value = [];
    geneFilters.value = [];
    filterError.value = null;
  };

  const resetCategoryFilters = () => {
    categoryFilters.value = [];
  };

  const resetGeneFilters = () => {
    geneFilters.value = [];
  };

  // ============================================================================
  // Preset Management
  // ============================================================================
  
  const savedPresets = ref(loadPresetsFromStorage());

  const getPresetList = computed(() => {
    const presets = savedPresets.value.presets || {};
    return Object.entries(presets)
      .map(([id, preset]) => ({
        id,
        ...preset,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  const savePreset = (name) => {
    if (!name?.trim()) return null;
    
    const presetId = generateId();
    const preset = {
      name: name.trim(),
      datasetId: datasetId?.value || null,
      categoryFilters: JSON.parse(JSON.stringify(categoryFilters.value)),
      geneFilters: geneFilters.value.map(f => ({
        ...f,
        isLoading: false, // Don't save loading state
      })),
      globalLogic: globalLogic.value,
      createdAt: new Date().toISOString(),
    };

    savedPresets.value.presets = savedPresets.value.presets || {};
    savedPresets.value.presets[presetId] = preset;
    savePresetsToStorage(savedPresets.value);
    
    return presetId;
  };

  const loadPreset = async (presetId) => {
    const preset = savedPresets.value.presets?.[presetId];
    if (!preset) return false;

    categoryFilters.value = JSON.parse(JSON.stringify(preset.categoryFilters || []));
    globalLogic.value = preset.globalLogic || 'AND';
    
    // Load gene filters and fetch expression data
    geneFilters.value = [];
    for (const gf of (preset.geneFilters || [])) {
      geneFilters.value.push({
        ...gf,
        isLoading: false,
      });
      
      // Fetch expression if not cached
      if (gf.gene && !geneExpressionCache.value[gf.gene]) {
        await fetchGeneExpression(gf.gene, gf.id);
      }
    }

    return true;
  };

  const deletePreset = (presetId) => {
    if (savedPresets.value.presets?.[presetId]) {
      delete savedPresets.value.presets[presetId];
      savePresetsToStorage(savedPresets.value);
      return true;
    }
    return false;
  };

  // ============================================================================
  // URL Sharing (encode/decode filter state)
  // ============================================================================
  
  const encodeFiltersToUrl = () => {
    const state = {
      c: categoryFilters.value.map(f => ({
        col: f.column,
        op: f.operator,
        v: f.values,
        l: f.logic,
      })),
      g: geneFilters.value.map(f => ({
        gene: f.gene,
        op: f.operator,
        v: f.value,
        l: f.logic,
      })),
      gl: globalLogic.value,
    };
    
    try {
      return btoa(JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to encode filters:', e);
      return null;
    }
  };

  const decodeFiltersFromUrl = async (encoded) => {
    if (!encoded) return false;
    
    try {
      const state = JSON.parse(atob(encoded));
      
      // Restore category filters
      categoryFilters.value = (state.c || []).map(f => ({
        id: generateId(),
        column: f.col,
        operator: f.op,
        values: f.v,
        logic: f.l || 'AND',
      }));
      
      // Restore gene filters
      geneFilters.value = [];
      for (const f of (state.g || [])) {
        const filterId = generateId();
        geneFilters.value.push({
          id: filterId,
          gene: f.gene,
          operator: f.op,
          value: f.v,
          logic: f.l || 'AND',
          isLoading: false,
        });
        
        // Fetch expression
        if (f.gene && !geneExpressionCache.value[f.gene]) {
          await fetchGeneExpression(f.gene, filterId);
        }
      }
      
      globalLogic.value = state.gl || 'AND';
      return true;
    } catch (e) {
      console.warn('Failed to decode filters:', e);
      return false;
    }
  };

  // ============================================================================
  // Return
  // ============================================================================
  
  return {
    // State
    categoryFilters,
    geneFilters,
    isFilterPanelOpen,
    geneExpressionCache,
    loadingGenes,
    filterError,
    globalLogic,
    
    // Computed
    availableColumns,
    columnValues,
    columnValueCounts,
    totalCellCount,
    filteredCellCount,
    filteredCellIndices,
    filteredCellTypes,
    filterPercentage,
    hasActiveFilters,
    activeFilterCount,
    getPresetList,
    
    // Category Filter Methods
    addCategoryFilter,
    removeCategoryFilter,
    updateCategoryFilter,
    
    // Gene Filter Methods
    addGeneFilter,
    removeGeneFilter,
    updateGeneFilter,
    fetchGeneExpression,
    
    // Reset Methods
    resetFilters,
    resetCategoryFilters,
    resetGeneFilters,
    
    // Preset Methods
    savePreset,
    loadPreset,
    deletePreset,
    
    // URL Sharing
    encodeFiltersToUrl,
    decodeFiltersFromUrl,
  };
}
