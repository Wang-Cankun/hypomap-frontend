# Single-Cell Analysis Components

Reusable Vue 3 components for single-cell RNA-seq data visualization and analysis.

## Components

### Shared/UI Components

#### `GeneSearchAutocomplete`
Gene search input with autocomplete dropdown.

```vue
<GeneSearchAutocomplete
  v-model="selectedGene"
  :dataset-id="datasetId"
  placeholder="Search for a gene..."
  label="Gene"
  :show-example="true"
  @select="onGeneSelect"
  @load-example="loadExampleGene"
/>
```

#### `ColorPaletteSelector`
Dropdown for selecting color palettes with preview.

```vue
<ColorPaletteSelector
  v-model="colorPalette"
  type="cellType"  <!-- 'cellType', 'expression', or 'heatmap' -->
  label="Color Palette"
/>
```

#### `CellTypeSelector`
Checkbox list for filtering cell types with All/None buttons.

```vue
<CellTypeSelector
  v-model="selectedCellTypes"
  :cell-types="cellTypes"
  :cell-type-counts="cellTypeCounts"
  :color-palette="colorPalette"
/>
```

#### `PointSizeSlider`
Range slider for adjusting visualization point sizes.

```vue
<PointSizeSlider v-model="pointSize" :min="1" :max="10" />
```

### Visualization Components

#### `UMAPVisualization`
Complete UMAP visualization with settings panel and cell type proportion chart.

```vue
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
  :show-settings="true"
  :show-stats="true"
  title="UMAP Plot"
/>
```

#### `GeneFeaturePlot`
Scatter plot showing gene expression on UMAP coordinates.

```vue
<GeneFeaturePlot
  :coordinates="umapData.coordinates"
  :expression="geneExpressionData"
  :cell-types="cellMetadata.cell_type"
  :selected-cell-types="selectedCellTypes"
  :gene-name="selectedGene"
  :color-palette="expressionPalette"
  :point-size="pointSize"
  :use-log="true"
/>
```

#### `ExpressionBoxplot`
Boxplot showing expression distribution by cell type.

```vue
<ExpressionBoxplot
  :values="geneExpressionData"
  :cell-types="cellTypes"
  :cell-type-metadata="cellMetadata.cell_type"
  :selected-cell-types="selectedCellTypes"
  :all-cell-types="allCellTypes"
  :color-palette="colorPalette"
  :title="geneName + ' Expression'"
  :use-log="true"
  :show-median-label="true"
/>
```

#### `HeatmapDotplot`
Heatmap or dotplot visualization for gene expression across cell types.

```vue
<HeatmapDotplot
  :data="heatmapData.data"
  :genes="heatmapData.genes"
  :cell-types="heatmapData.cell_types"
  :plot-type="plotType"  <!-- 'heatmap' or 'dotplot' -->
  :color-palette="colorPalette"
  :transpose="transpose"
  :plot-height="plotHeight"  <!-- 'small', 'medium', 'large', 'xlarge' -->
/>
```

## Composables

### `useSingleCellApi`
API functions for fetching single-cell data.

```js
import { useSingleCellApi } from '@/composables/useSingleCellApi';

const {
  loading,
  error,
  fetchDatasetInfo,
  fetchUMAPData,
  fetchGeneExpression,
  searchGenes,
  fetchAvailableDatasets,
  fetchDatasetMetadata,
  fetchDatasetCellTypes,
  calculateModuleScore,
  generateHeatmapData,
  runDEGAnalysis,
} = useSingleCellApi();
```

### `useColorPalettes`
Color palette definitions and utilities.

```js
import { 
  useColorPalettes, 
  cellTypeColorPalettes, 
  geneExpressionPalettes, 
  heatmapColorPalettes 
} from '@/composables/useColorPalettes';

const {
  colorPalette,
  getCellTypeColor,
  getBivariateColor,
} = useColorPalettes();
```

## Quick Start Example

```vue
<template>
  <div class="h-screen">
    <UMAPVisualization
      :umap-data="umapData"
      :cell-metadata="cellMetadata"
      :cell-types="cellTypes"
      v-model:selected-cell-types="selectedCellTypes"
      :cell-type-counts="cellTypeCounts"
      v-model:color-palette="colorPalette"
      v-model:point-size="pointSize"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UMAPVisualization } from '@/components/single-cell';
import { useSingleCellApi } from '@/composables/useSingleCellApi';

const { fetchUMAPData } = useSingleCellApi();

const datasetId = ref('AD093044');
const umapData = ref(null);
const cellMetadata = ref(null);
const cellTypes = ref([]);
const selectedCellTypes = ref([]);
const cellTypeCounts = ref({});
const colorPalette = ref('default');
const pointSize = ref(3);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const data = await fetchUMAPData(datasetId.value);
  umapData.value = data;
  cellMetadata.value = data.metadata;
  
  // Extract cell types
  const uniqueTypes = [...new Set(data.metadata.cell_type)];
  cellTypes.value = uniqueTypes;
  selectedCellTypes.value = [...uniqueTypes];
  
  // Count cells per type
  const counts = {};
  data.metadata.cell_type.forEach((type) => {
    counts[type] = (counts[type] || 0) + 1;
  });
  cellTypeCounts.value = counts;
  
  loading.value = false;
});
</script>
```

## ECharts Registration

Make sure to register the required ECharts components in your app:

```js
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  ScatterChart,
  BarChart,
  BoxplotChart,
  HeatmapChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
} from 'echarts/components';

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
```

