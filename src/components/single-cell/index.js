// Single-Cell Analysis Components
// Export all components for easy importing

// Shared/Reusable Components
export { default as GeneSearchAutocomplete } from "./GeneSearchAutocomplete.vue";
export { default as ColorPaletteSelector } from "./ColorPaletteSelector.vue";
export { default as CellTypeSelector } from "./CellTypeSelector.vue";
export { default as PointSizeSlider } from "./PointSizeSlider.vue";
export { default as SingleCellViewHeader } from "./SingleCellViewHeader.vue";
export { default as DatasetInfoSidebar } from "./DatasetInfoSidebar.vue";
export { default as ToolSelector } from "./ToolSelector.vue";

// Visualization Components
export { default as UMAPVisualization } from "./UMAPVisualization.vue";
export { default as GeneFeaturePlot } from "./GeneFeaturePlot.vue";
export { default as ExpressionBoxplot } from "./ExpressionBoxplot.vue";
export { default as HeatmapDotplot } from "./HeatmapDotplot.vue";
export { default as GeneCartDrawer } from "./GeneCartDrawer.vue";
export { default as CompositionAnalysis } from "./CompositionAnalysis.vue";
export { default as AtlasDegPanel } from "./AtlasDegPanel.vue";
export { default as GroupFilterBuilder } from "./GroupFilterBuilder.vue";
export { default as CellFilterPanel } from "./CellFilterPanel.vue";

// Cell Filter sub-components
export * from "./cell-filter";

// Re-export composables for convenience
export { useSingleCellApi } from "@/composables/useSingleCellApi";
export { useSingleCellViewState } from "@/composables/useSingleCellViewState";
export { useDatasetMetadata } from "@/composables/useDatasetMetadata";
export { useAtlasMetadata } from "@/composables/useAtlasMetadata";
export { useGeneExpressionAnalysis } from "@/composables/useGeneExpressionAnalysis";
export { 
  useColorPalettes, 
  cellTypeColorPalettes, 
  geneExpressionPalettes, 
  heatmapColorPalettes,
} from "@/composables/useColorPalettes";
export { useCellFilter } from "@/composables/useCellFilter";
