/**
 * Composable for Color Palettes
 * Centralized color definitions for the entire application
 * Based on scientific paper standards and accessibility guidelines
 */

import { ref, computed } from 'vue';

// ============================================================================
// HUMAN ATLAS CELL TYPE COLORS (31 cell types - from paper)
// ============================================================================
export const humanAtlasCellTypeColors = {
  'Committed oligodendrocyte precursor': '#00B8C3',
  'Oligodendrocyte precursor': '#006091',
  'Oligodendrocyte': '#5C89CC',
  'Astrocyte': '#AFE1AF',
  'Bergmann glia': '#005C07',
  'Midbrain-derived inhibitory': '#0BDA51',
  'Cerebellar inhibitory': '#B4C424',
  'LAMP5-LHX6 and Chandelier': '#53A39D',
  'Upper rhombic lip': '#FA8072',
  'Lower rhombic lip': '#FF7F50',
  'CGE interneuron': '#EDE1D8',
  'MGE interneuron': '#FF69B4',
  'Upper-layer intratelencephalic': '#FFDF11',
  'Deep-layer intratelencephalic': '#FFB307',
  'Thalamic excitatory': '#C77767',
  'Amygdala excitatory': '#DC143C',
  'Eccentric medium spiny neuron': '#FA5F55',
  'Medium spiny neuron': '#FF5F1F',
  'Deep-layer corticothalamic and 6b': '#AA336A',
  'Deep-layer near-projecting': '#F33A6A',
  'Choroid plexus': '#9440F3',
  'Hippocampal dentate gyrus': '#9900B3',
  'Hippocampal CA4': '#C266D1',
  'Hippocampal CA1-3': '#6C00BF',
  'Mammillary body': '#A700FF',
  'Ependymal': '#475D4B',
  'Vascular': '#9A0F03',
  'Fibroblast': '#D4B48C',
  'Microglia': '#F0E68C',
  'Splatter': '#708090',
  'Miscellaneous': '#AEAEAE',
};

// Human atlas cell type order (for consistent ordering)
export const humanAtlasCellTypeOrder = [
  'Committed oligodendrocyte precursor',
  'Oligodendrocyte precursor',
  'Oligodendrocyte',
  'Astrocyte',
  'Bergmann glia',
  'Midbrain-derived inhibitory',
  'Cerebellar inhibitory',
  'LAMP5-LHX6 and Chandelier',
  'Upper rhombic lip',
  'Lower rhombic lip',
  'CGE interneuron',
  'MGE interneuron',
  'Upper-layer intratelencephalic',
  'Deep-layer intratelencephalic',
  'Thalamic excitatory',
  'Amygdala excitatory',
  'Eccentric medium spiny neuron',
  'Medium spiny neuron',
  'Deep-layer corticothalamic and 6b',
  'Deep-layer near-projecting',
  'Choroid plexus',
  'Hippocampal dentate gyrus',
  'Hippocampal CA4',
  'Hippocampal CA1-3',
  'Mammillary body',
  'Ependymal',
  'Vascular',
  'Fibroblast',
  'Microglia',
  'Splatter',
  'Miscellaneous',
];

// ============================================================================
// METADATA COLORS (Conditions, Species, Disease, Tech, Tissue)
// ============================================================================
export const metadataColors = {
  // Sex
  sex: {
    Female: '#D4BBD4',
    Male: '#DBA1D9',
    Unknown: '#A5A5A5',
  },

  // Species
  species: {
    Human: '#F7CECD',
    Mouse: '#F19E9C',
    Rat: '#E8B4B4',
    Other: '#A5A5A5',
    Unknown: '#A5A5A5',
  },

  // Condition (Disease vs Healthy - binary)
  condition: {
    Healthy: '#D1EDF9',
    Disease: '#7DC9F0',
    Control: '#D1EDF9',
    Unknown: '#A5A5A5',
  },

  // Technology - Sequencing
  technology: {
    'scRNA-seq': '#DFF1D3',
    'snRNA-seq': '#9FD77F',
    'scATAC-seq': '#B8E6B8',
    'Other': '#A5A5A5',
    Unknown: '#A5A5A5',
  },

  // Technology - Spatial
  spatialTechnology: {
    'Cell level': '#489F8B',
    'Spot level': '#72D169',
    'Visium': '#72D169',
    'MERFISH': '#489F8B',
    'Xenium': '#489F8B',
    'CosMx': '#489F8B',
    'Other': '#A5A5A5',
    Unknown: '#A5A5A5',
  },

  // Tissue
  tissue: {
    Brain: '#EBB24B',
    Organoid: '#D76238',
    PBMC: '#E48B40',
    Blood: '#E48B40',
    CSF: '#F5D89A',
    Other: '#A5A5A5',
    Unknown: '#A5A5A5',
  },

  // Disease types (specific diseases)
  disease: {
    AD: '#B1CBAD',
    MS: '#57BDC3',
    FTD: '#BC7FF8',
    PD: '#E87D72',
    HD: '#255761',
    ALS: '#ED7298',
    Healthy: '#989793',
    Control: '#989793',
    NA: '#A5A5A5',
    Unknown: '#A5A5A5',
  },
};

// ============================================================================
// CELL TYPE COLOR PALETTES (Categorical - for general use)
// ============================================================================
export const cellTypeColorPalettes = {
  // Default palette based on human atlas colors (first 15)
  default: [
    '#00B8C3', '#006091', '#5C89CC', '#AFE1AF', '#005C07',
    '#0BDA51', '#B4C424', '#53A39D', '#FA8072', '#FF7F50',
    '#EDE1D8', '#FF69B4', '#FFDF11', '#FFB307', '#C77767',
    '#DC143C', '#FA5F55', '#FF5F1F', '#AA336A', '#F33A6A',
    '#9440F3', '#9900B3', '#C266D1', '#6C00BF', '#A700FF',
    '#475D4B', '#9A0F03', '#D4B48C', '#F0E68C', '#708090',
  ],
  pastel: [
    '#ffb3ba', '#bae1ff', '#baffc9', '#ffffba', '#ffdfba',
    '#e0bbe4', '#fec8d8', '#d4a5a5', '#ffd1dc', '#b4e7f5',
    '#ffd4a3', '#c5cae9', '#d7ccc8', '#fff9c4', '#b3e5fc',
  ],
  vibrant: [
    '#ff006e', '#3a86ff', '#06ffa5', '#ffbe0b', '#8338ec',
    '#06d6a0', '#ff5400', '#457b9d', '#fb5607', '#4361ee',
    '#06ffa5', '#d90429', '#7209b7', '#f72585', '#4cc9f0',
  ],
  colorblind: [
    '#0173b2', '#de8f05', '#029e73', '#cc78bc', '#ece133',
    '#56b4e9', '#ca9161', '#949494', '#d55e00', '#0072b2',
    '#f0e442', '#009e73', '#cc79a7', '#e69f00', '#999999',
  ],
  warm: [
    '#d32f2f', '#e64a19', '#f57c00', '#fbc02d', '#fdd835',
    '#c0ca33', '#7cb342', '#388e3c', '#00897b', '#00acc1',
    '#0288d1', '#1976d2', '#303f9f', '#512da8', '#7b1fa2',
  ],
  cool: [
    '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5',
    '#5e35b1', '#7e57c2', '#673ab7', '#5c6bc0', '#00838f',
    '#0097a7', '#00acc1', '#00bcd4', '#26c6da', '#4dd0e1',
  ],
  // Scanpy default (similar to matplotlib tab20)
  scanpy: [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5',
  ],
};

// ============================================================================
// GENE EXPRESSION COLOR PALETTES (Continuous gradients)
// ============================================================================
export const geneExpressionPalettes = {
  reds: [
    '#f7f7f7', '#fee5d9', '#fcbba1', '#fc9272',
    '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d',
  ],
  blues: [
    '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
    '#6baed6', '#4292c6', '#2171b5', '#084594',
  ],
  greens: [
    '#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
    '#74c476', '#41ab5d', '#238b45', '#005a32',
  ],
  purples: [
    '#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc',
    '#9e9ac8', '#807dba', '#6a51a3', '#4a1486',
  ],
  oranges: [
    '#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b',
    '#fd8d3c', '#f16913', '#d94801', '#8c2d04',
  ],
  viridis: [
    '#440154', '#482777', '#3e4a89', '#31688e',
    '#26828e', '#1f9e89', '#35b779', '#6ece58',
    '#b5de2b', '#fde725',
  ],
  magma: [
    '#000004', '#180f3d', '#440f76', '#721f81',
    '#9e2f7f', '#cd4071', '#f1605d', '#fd9668',
    '#feca8d', '#fcfdbf',
  ],
  plasma: [
    '#0d0887', '#46039f', '#7201a8', '#9c179e',
    '#bd3786', '#d8576b', '#ed7953', '#fb9f3a',
    '#fdca26', '#f0f921',
  ],
};

// ============================================================================
// HEATMAP COLOR PALETTES (Including diverging)
// ============================================================================
export const heatmapColorPalettes = {
  reds: [
    '#ffffff', '#fee5d9', '#fcbba1', '#fc9272',
    '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d',
  ],
  blues: [
    '#ffffff', '#deebf7', '#c6dbef', '#9ecae1',
    '#6baed6', '#4292c6', '#2171b5', '#084594',
  ],
  greens: [
    '#ffffff', '#e5f5e0', '#c7e9c0', '#a1d99b',
    '#74c476', '#41ab5d', '#238b45', '#005a32',
  ],
  purples: [
    '#ffffff', '#efedf5', '#dadaeb', '#bcbddc',
    '#9e9ac8', '#807dba', '#6a51a3', '#4a1486',
  ],
  oranges: [
    '#ffffff', '#fee6ce', '#fdd0a2', '#fdae6b',
    '#fd8d3c', '#f16913', '#d94801', '#8c2d04',
  ],
  viridis: [
    '#440154', '#482777', '#3e4a89', '#31688e',
    '#26828e', '#1f9e89', '#35b779', '#6ece58',
    '#b5de2b', '#fde725',
  ],
  diverging_blue_red: [
    '#313695', '#4575b4', '#74add1', '#abd9e9',
    '#e0f3f8', '#ffffbf', '#fee090', '#fdae61',
    '#f46d43', '#d73027', '#a50026',
  ],
  diverging_blue_yellow_red: [
    '#2166ac', '#4393c3', '#92c5de', '#d1e5f0',
    '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d', '#b2182b',
  ],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper to convert hex to RGB
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

/**
 * Helper to convert RGB to hex
 */
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b]
    .map((x) => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
};

/**
 * Get color for human atlas cell type (exact match)
 */
export const getHumanAtlasCellTypeColor = (cellType) => {
  return humanAtlasCellTypeColors[cellType] || '#A5A5A5';
};

/**
 * Get color for metadata field
 */
export const getMetadataColor = (category, value) => {
  const categoryColors = metadataColors[category];
  if (!categoryColors) return '#A5A5A5';
  return categoryColors[value] || categoryColors['Unknown'] || '#A5A5A5';
};

/**
 * Get disease color
 */
export const getDiseaseColor = (disease) => {
  return metadataColors.disease[disease] || metadataColors.disease['Unknown'];
};

/**
 * Get species color
 */
export const getSpeciesColor = (species) => {
  return metadataColors.species[species] || metadataColors.species['Unknown'];
};

// ============================================================================
// COMPOSABLE
// ============================================================================
export function useColorPalettes() {
  const colorPalette = ref('default');
  const geneExpressionPalette = ref('reds');
  const heatmapPalette = ref('diverging_blue_yellow_red');

  /**
   * Get color for a cell type based on index (for generic datasets)
   */
  const getCellTypeColor = (cellTypes, cellType, palette = 'default') => {
    // First, check if it's a known human atlas cell type
    if (humanAtlasCellTypeColors[cellType]) {
      return humanAtlasCellTypeColors[cellType];
    }
    
    // Otherwise, use palette-based coloring
    const paletteColors = cellTypeColorPalettes[palette] || cellTypeColorPalettes.default;
    const index = cellTypes.indexOf(cellType);
    if (index === -1) return '#A5A5A5';
    return paletteColors[index % paletteColors.length];
  };

  /**
   * Get colors for a list of cell types (returns object mapping cellType -> color)
   */
  const getCellTypeColors = (cellTypes, palette = 'default') => {
    const colors = {};
    const paletteColors = cellTypeColorPalettes[palette] || cellTypeColorPalettes.default;
    
    cellTypes.forEach((cellType, index) => {
      // First check human atlas colors
      if (humanAtlasCellTypeColors[cellType]) {
        colors[cellType] = humanAtlasCellTypeColors[cellType];
      } else {
        colors[cellType] = paletteColors[index % paletteColors.length];
      }
    });
    
    return colors;
  };

  /**
   * Get bivariate color for co-expression visualization
   * Blue = high in gene 1, Red = high in gene 2, Purple = high in both, Gray = low in both
   */
  const getBivariateColor = (expr1, expr2, max1, max2, threshold1 = 0, threshold2 = 0) => {
    const norm1 = max1 > 0 ? Math.min(expr1 / max1, 1) : 0;
    const norm2 = max2 > 0 ? Math.min(expr2 / max2, 1) : 0;

    // Corner colors for bilinear interpolation
    const c00 = hexToRgb('#e0e0e0'); // Low-Low (gray)
    const c01 = hexToRgb('#e74c3c'); // Low-High (red - gene2 high)
    const c10 = hexToRgb('#3498db'); // High-Low (blue - gene1 high)
    const c11 = hexToRgb('#9b59b6'); // High-High (purple - both high)

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

    return rgbToHex(final.r, final.g, final.b);
  };

  /**
   * Get continuous color from expression palette
   */
  const getExpressionColor = (value, min, max, palette = 'reds') => {
    const colors = geneExpressionPalettes[palette] || geneExpressionPalettes.reds;
    const normalized = max > min ? (value - min) / (max - min) : 0;
    const index = Math.min(Math.floor(normalized * (colors.length - 1)), colors.length - 1);
    return colors[Math.max(0, index)];
  };

  return {
    // Refs
    colorPalette,
    geneExpressionPalette,
    heatmapPalette,
    
    // Color definitions
    humanAtlasCellTypeColors,
    humanAtlasCellTypeOrder,
    metadataColors,
    cellTypeColorPalettes,
    geneExpressionPalettes,
    heatmapColorPalettes,
    
    // Functions
    getCellTypeColor,
    getCellTypeColors,
    getBivariateColor,
    getExpressionColor,
    getHumanAtlasCellTypeColor,
    getMetadataColor,
    getDiseaseColor,
    getSpeciesColor,
    hexToRgb,
    rgbToHex,
  };
}
