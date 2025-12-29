<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useDatasets } from "@/composables/useDatasets";
import {
  metadataColors,
  cellTypeColorPalettes,
  humanAtlasCellTypeColors,
} from "@/composables/useColorPalettes";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import {
  PieChart,
  BarChart,
  ScatterChart,
  HeatmapChart,
  TreemapChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Register ECharts components
use([
  PieChart,
  BarChart,
  ScatterChart,
  HeatmapChart,
  TreemapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const { datasets, loading, loadDatasets } = useDatasets();

// Neural Network Canvas
const canvasRef = ref(null);
const canvasContainer = ref(null);
let animationFrameId = null;
let nodes = [];
let mouse = { x: null, y: null };

// Use centralized color palettes
const diseaseColors = metadataColors.disease;
const speciesColors = metadataColors.species;

// Extended color palette for dynamic assignment (fallback)
const extendedColorPalette = cellTypeColorPalettes.default;

// Function to generate a color for a category based on its name (deterministic)
const getColorForCategory = (name, index) => {
  // Use a simple hash function to deterministically assign colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % extendedColorPalette.length;
  return extendedColorPalette[colorIndex];
};

// Format numbers
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || "0";
};

// Overall stats
const overallStats = computed(() => {
  if (!datasets.value.length) {
    return { datasets: 0, cells: 0, species: 0, studies: 0, brainRegions: 0 };
  }

  const totalCells = datasets.value.reduce(
    (sum, d) => sum + (d.n_cells || 0),
    0
  );
  const uniqueSpecies = new Set(
    datasets.value.map((d) => d.species).filter(Boolean)
  ).size;
  const uniqueStudies = new Set(
    datasets.value.map((d) => d.pubmed_id).filter(Boolean)
  ).size;
  const uniqueRegions = new Set(
    datasets.value.map((d) => d.brain_region).filter(Boolean)
  ).size;

  return {
    datasets: datasets.value.length,
    cells: totalCells,
    species: uniqueSpecies,
    studies: uniqueStudies,
    brainRegions: uniqueRegions,
  };
});

// Disease stats for charts
const diseaseData = computed(() => {
  if (!datasets.value.length) return [];
  const stats = {};
  datasets.value.forEach((d) => {
    const disease = d.disease || "NA";
    if (!stats[disease]) stats[disease] = { count: 0, cells: 0 };
    stats[disease].count++;
    stats[disease].cells += d.n_cells || 0;
  });
  return Object.entries(stats)
    .map(([name, data], index) => ({
      name,
      ...data,
      color: diseaseColors[name] || getColorForCategory(name, index),
    }))
    .sort((a, b) => b.count - a.count);
});

// Species stats
const speciesData = computed(() => {
  if (!datasets.value.length) return [];
  const stats = {};
  datasets.value.forEach((d) => {
    const species = d.species || "Other";
    if (!stats[species]) stats[species] = { count: 0, cells: 0 };
    stats[species].count++;
    stats[species].cells += d.n_cells || 0;
  });
  return Object.entries(stats)
    .map(([name, data], index) => ({
      name,
      ...data,
      color: speciesColors[name] || getColorForCategory(name, index),
    }))
    .sort((a, b) => b.count - a.count);
});

// Brain region stats (top 10)
const brainRegionData = computed(() => {
  if (!datasets.value.length) return [];
  const stats = {};
  datasets.value.forEach((d) => {
    const region = d.brain_region;
    if (region) {
      if (!stats[region]) stats[region] = { count: 0, cells: 0 };
      stats[region].count++;
      stats[region].cells += d.n_cells || 0;
    }
  });
  return Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

// Disease vs Species cross-tabulation for heatmap
const diseaseSpeciesMatrix = computed(() => {
  if (!datasets.value.length) return { diseases: [], species: [], data: [] };

  const diseaseSet = new Set();
  const speciesSet = new Set();
  const matrix = {};

  datasets.value.forEach((d) => {
    const disease = d.disease || "NA";
    const species = d.species || "Other";
    diseaseSet.add(disease);
    speciesSet.add(species);
    const key = `${disease}-${species}`;
    matrix[key] = (matrix[key] || 0) + 1;
  });

  const diseases = Array.from(diseaseSet).sort();
  const species = Array.from(speciesSet).sort();
  const data = [];

  diseases.forEach((disease, i) => {
    species.forEach((sp, j) => {
      const value = matrix[`${disease}-${sp}`] || 0;
      if (value > 0) {
        data.push([j, i, value]);
      }
    });
  });

  return { diseases, species, data };
});

// Dataset size distribution
const datasetSizeData = computed(() => {
  if (!datasets.value.length) return [];
  return datasets.value
    .filter((d) => d.n_cells > 0)
    .map((d) => ({
      name: d.dataset_id || d.id,
      value: [d.n_cells, d.disease || "NA"],
      disease: d.disease || "NA",
    }));
});

// 1. Disease Distribution Donut
const diseaseDonutOption = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: (params) =>
      `${params.name}<br/>Datasets: ${params.value} (${params.percent}%)<br/>`,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#e2e8f0",
    textStyle: { color: "#334155", fontSize: 12 },
  },
  legend: {
    orient: "vertical",
    right: "5%",
    top: "center",
    textStyle: { color: "#64748b", fontSize: 11 },
    itemWidth: 12,
    itemHeight: 12,
  },
  series: [
    {
      type: "pie",
      radius: ["45%", "75%"],
      center: ["35%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: "600" },
        itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.15)" },
      },
      data: diseaseData.value.map((d) => ({
        value: d.count,
        name: d.name,
        itemStyle: { color: d.color },
      })),
    },
  ],
}));

// 2. Species Distribution Donut
const speciesDonutOption = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: (params) =>
      `${params.name}<br/>Datasets: ${params.value} (${params.percent}%)`,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#e2e8f0",
    textStyle: { color: "#334155", fontSize: 12 },
  },
  legend: {
    orient: "vertical",
    right: "5%",
    top: "center",
    textStyle: { color: "#64748b", fontSize: 11 },
    itemWidth: 12,
    itemHeight: 12,
  },
  series: [
    {
      type: "pie",
      radius: ["45%", "75%"],
      center: ["35%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: "600" },
        itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.15)" },
      },
      data: speciesData.value.map((d) => ({
        value: d.count,
        name: d.name,
        itemStyle: { color: d.color },
      })),
    },
  ],
}));

// 3. Brain Regions Horizontal Bar
const brainRegionBarOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params) => `${params[0].name}<br/>Datasets: ${params[0].value}`,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#e2e8f0",
    textStyle: { color: "#334155", fontSize: 12 },
  },
  grid: {
    left: "3%",
    right: "10%",
    bottom: "3%",
    top: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "value",
    axisLabel: { color: "#94a3b8", fontSize: 10 },
    splitLine: { lineStyle: { color: "#f1f5f9" } },
  },
  yAxis: {
    type: "category",
    data: brainRegionData.value.map((d) => d.name).reverse(),
    axisLabel: {
      color: "#64748b",
      fontSize: 10,
      width: 100,
      overflow: "truncate",
      ellipsis: "...",
    },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      type: "bar",
      data: brainRegionData.value.map((d) => d.count).reverse(),
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: "#0ea5e9" },
            { offset: 1, color: "#8b5cf6" },
          ],
        },
      },
      barWidth: "60%",
    },
  ],
}));

// 4. Cell Count by Disease Bar
const cellsByDiseaseOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params) =>
      `${params[0].name}<br/>Cells: ${formatNumber(params[0].value)}`,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#e2e8f0",
    textStyle: { color: "#334155", fontSize: 12 },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "12%",
    top: "8%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: diseaseData.value.slice(0, 8).map((d) => d.name),
    axisLabel: { color: "#64748b", fontSize: 10, rotate: 30 },
    axisLine: { lineStyle: { color: "#e2e8f0" } },
  },
  yAxis: {
    type: "value",
    axisLabel: {
      color: "#94a3b8",
      fontSize: 10,
      formatter: (v) => formatNumber(v),
    },
    splitLine: { lineStyle: { color: "#f1f5f9" } },
  },
  series: [
    {
      type: "bar",
      data: diseaseData.value.slice(0, 8).map((d) => ({
        value: d.cells,
        itemStyle: { color: d.color },
      })),
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      barWidth: "50%",
    },
  ],
}));

// 5. Disease-Species Heatmap
const heatmapOption = computed(() => {
  const { diseases, species, data } = diseaseSpeciesMatrix.value;
  const maxValue = Math.max(...data.map((d) => d[2]), 1);

  return {
    tooltip: {
      position: "top",
      formatter: (params) => {
        const [speciesIdx, diseaseIdx, value] = params.data;
        return `${diseases[diseaseIdx]} × ${species[speciesIdx]}<br/>Datasets: ${value}`;
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      textStyle: { color: "#334155", fontSize: 12 },
    },
    grid: { left: "15%", right: "10%", bottom: "20%", top: "5%" },
    xAxis: {
      type: "category",
      data: species,
      splitArea: { show: true },
      axisLabel: { color: "#64748b", fontSize: 10, rotate: 30 },
    },
    yAxis: {
      type: "category",
      data: diseases,
      splitArea: { show: true },
      axisLabel: { color: "#64748b", fontSize: 10 },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "0%",
      itemWidth: 10,
      itemHeight: 60,
      textStyle: { color: "#64748b", fontSize: 10 },
      inRange: {
        color: ["#f0f9ff", "#bae6fd", "#38bdf8", "#0284c7", "#075985"],
      },
    },
    series: [
      {
        type: "heatmap",
        data: data,
        label: {
          show: true,
          fontSize: 10,
          color: "#334155",
          formatter: (params) => params.data[2] || "",
        },
        itemStyle: { borderWidth: 1, borderColor: "#fff" },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.2)" },
        },
      },
    ],
  };
});

// 6. Treemap for Brain Regions by Cells
const treemapOption = computed(() => ({
  tooltip: {
    formatter: (params) =>
      `${params.name}<br/>Cells: ${formatNumber(params.value)}<br/>Datasets: ${
        params.data.datasets
      }`,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#e2e8f0",
    textStyle: { color: "#334155", fontSize: 12 },
  },
  series: [
    {
      type: "treemap",
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: "{b}",
        fontSize: 11,
        color: "#fff",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowBlur: 2,
      },
      itemStyle: { borderColor: "#fff", borderWidth: 2, gapWidth: 2 },
      levels: [
        {
          itemStyle: { borderColor: "#fff", borderWidth: 2, gapWidth: 2 },
          upperLabel: { show: false },
        },
      ],
      data: brainRegionData.value.slice(0, 12).map((d, i) => ({
        name: d.name,
        value: d.cells,
        datasets: d.count,
        itemStyle: {
          color: [
            "#0ea5e9",
            "#8b5cf6",
            "#f59e0b",
            "#10b981",
            "#ef4444",
            "#ec4899",
            "#06b6d4",
            "#84cc16",
            "#f97316",
            "#6366f1",
            "#14b8a6",
            "#a855f7",
          ][i % 12],
        },
      })),
    },
  ],
}));

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9117/sskind-backend/api/v1";

// Feature Carousel - 4 main features with illustrations
const analysisFeatures = [
  {
    id: "atlas",
    title: "Interactive Single-Cell Atlas",
    subtitle: "UMAP Visualization",
    description:
      "Explore single-cell data with interactive UMAP visualizations. Navigate through cell clusters, filter by cell types, and discover expression patterns across populations.",
    highlights: [
      "Dynamic cell type filtering",
      "Multi-resolution clustering",
      "Gene expression overlays",
    ],
    link: "/atlas/human",
    linkText: "Explore Atlas",
  },
  {
    id: "spatial",
    title: "Spatial Transcriptomics",
    subtitle: "Tissue Context Analysis",
    description:
      "Visualize gene expression in spatial context. Map transcriptomic data onto tissue sections to understand cellular organization and microenvironment interactions.",
    highlights: [
      "Tissue section visualization",
      "Spot-level expression",
      "Spatial gene patterns",
    ],
    link: "/spatial",
    linkText: "View Spatial Data",
  },
  {
    id: "analysis",
    title: "Differential Expression & Pathways",
    subtitle: "DEG & Enrichment Analysis",
    description:
      "Perform comprehensive differential expression analysis across cell types and conditions. Discover enriched pathways and biological processes with integrated databases.",
    highlights: [
      "Cross-condition DEG analysis",
      "GO & KEGG enrichment",
      "Cell type comparisons",
    ],
    link: "/datasets",
    linkText: "Analyze Data",
  },
  {
    id: "knowledge",
    title: "Knowledge Graphs & AI",
    subtitle: "Foundation Model Integration",
    description:
      "Leverage AI-powered exploration with integrated knowledge graphs. Natural language queries connect genes, diseases, pathways, and cell types for intelligent discovery.",
    highlights: [
      "Semantic search",
      "Entity relationships",
      "LLM-powered insights",
    ],
    link: "/knowledge",
    linkText: "Explore Knowledge",
  },
];

// Real data for illustrations
const sampleUmapData = ref(null);
const umapLoading = ref(true);
const sampleSpatialData = ref(null);
const spatialLoading = ref(true);

// Fixed dataset IDs for homepage illustrations
const DEMO_UMAP_DATASET = "AD093044";
const DEMO_SPATIAL_DATASET = "ST024001";

// Fetch UMAP data from fixed dataset
const fetchSampleUmap = async () => {
  try {
    umapLoading.value = true;
    const response = await fetch(
      `${API_BASE_URL}/h5ad/${DEMO_UMAP_DATASET}/plot-data?embedding=umap&metadata=cell_type`
    );
    if (response.ok) {
      sampleUmapData.value = await response.json();
    }
  } catch (err) {
    console.warn("Could not load sample UMAP for illustration:", err);
  } finally {
    umapLoading.value = false;
  }
};

// Fetch spatial plot data with cluster metadata
const fetchSampleSpatial = async () => {
  try {
    spatialLoading.value = true;
    const response = await fetch(
      `${API_BASE_URL}/h5ad/${DEMO_SPATIAL_DATASET}/spatial/plot-data-with-image?sample_key=slice1&image_key=hires&metadata=cell_type,annotation,seurat_clusters,cluster,clusters,sample`
    );
    if (response.ok) {
      sampleSpatialData.value = await response.json();
    }
  } catch (err) {
    console.warn("Could not load sample spatial data for illustration:", err);
  } finally {
    spatialLoading.value = false;
  }
};

// Generate realistic mock volcano plot data (since no direct DEG API for homepage)
const generateMockVolcanoData = () => {
  const geneNames = [
    "APOE",
    "TREM2",
    "CLU",
    "PICALM",
    "BIN1",
    "CD33",
    "MS4A6A",
    "ABCA7",
    "EPHA1",
    "CD2AP",
    "GFAP",
    "AQP4",
    "SLC1A2",
    "ALDH1L1",
    "S100B",
    "VIM",
    "NDRG2",
    "GJA1",
    "SOX9",
    "FABP7",
    "SNAP25",
    "SYP",
    "MAP2",
    "RBFOX3",
    "DCX",
    "TUBB3",
    "GAP43",
    "SYN1",
    "DLG4",
    "CAMK2A",
    "CX3CR1",
    "ITGAM",
    "AIF1",
    "CD68",
    "TMEM119",
    "P2RY12",
    "CSF1R",
    "TGFBR1",
    "HEXB",
    "SALL1",
    "MBP",
    "MOG",
    "PLP1",
    "MAG",
    "CNP",
    "OLIG1",
    "OLIG2",
    "SOX10",
    "NKX2-2",
    "CSPG4",
  ];

  const genes = [];
  for (let i = 0; i < 500; i++) {
    // Generate realistic distribution
    const logFC = (Math.random() - 0.5) * 6;
    const basePval = Math.pow(10, -Math.random() * 8);
    // Significant genes tend to have higher fold changes
    const isSignificant = Math.random() < 0.15;
    const adjustedLogFC = isSignificant
      ? logFC * (1.5 + Math.random())
      : logFC * 0.5;
    const adjustedPval = isSignificant ? basePval * 0.01 : basePval * 10;

    genes.push({
      gene:
        geneNames[i % geneNames.length] +
        (i >= geneNames.length ? `_${Math.floor(i / geneNames.length)}` : ""),
      logFC: adjustedLogFC,
      pvalue: Math.min(1, Math.max(1e-300, adjustedPval)),
      adjPvalue: Math.min(1, Math.max(1e-300, adjustedPval * 1.5)),
    });
  }
  return { genes };
};

// Pre-generate mock DEG data
const mockDegData = generateMockVolcanoData();

// Current feature index for carousel
const currentFeatureIndex = ref(0);
const isAutoPlaying = ref(true);
let autoPlayInterval = null;

const nextFeature = () => {
  currentFeatureIndex.value =
    (currentFeatureIndex.value + 1) % analysisFeatures.length;
};

const prevFeature = () => {
  currentFeatureIndex.value =
    (currentFeatureIndex.value - 1 + analysisFeatures.length) %
    analysisFeatures.length;
};

const goToFeature = (index) => {
  currentFeatureIndex.value = index;
  resetAutoPlay();
};

const resetAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  if (isAutoPlaying.value) {
    autoPlayInterval = setInterval(nextFeature, 6000);
  }
};

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value;
  resetAutoPlay();
};

// Use centralized cell type colors from human atlas
const cellTypeColors = cellTypeColorPalettes.default;

// Helper to get color for a cell type (prefers human atlas colors)
const getCellTypeColor = (cellType, index) => {
  // First check if it's a known human atlas cell type
  if (humanAtlasCellTypeColors[cellType]) {
    return humanAtlasCellTypeColors[cellType];
  }
  // Fallback to palette
  return cellTypeColors[index % cellTypeColors.length];
};

// ECharts options for feature illustrations - same pattern as actual components
const umapChartOption = computed(() => {
  // Show empty chart while loading
  if (umapLoading.value) {
    return {
      grid: { left: 40, right: 40, top: 20, bottom: 60 },
      xAxis: { show: false },
      yAxis: { show: false },
      series: [],
    };
  }

  // Use real UMAP data if available (same logic as UMAPVisualization.vue)
  if (
    sampleUmapData.value?.coordinates &&
    sampleUmapData.value?.metadata?.cell_type
  ) {
    const { coordinates, metadata } = sampleUmapData.value;
    const cellTypes = metadata.cell_type;

    // Group cells by type (same as generateUMAPData in UMAPVisualization.vue)
    const cellsByType = {};
    cellTypes.forEach((type, idx) => {
      if (!cellsByType[type]) cellsByType[type] = [];
      cellsByType[type].push(coordinates[idx]);
    });

    // Sample for performance (max ~500 points per type for home page preview)
    const maxPoints = 500;
    const series = Object.entries(cellsByType).map(
      ([cellType, points], idx) => {
        const sampled =
          points.length > maxPoints
            ? points.filter(
                (_, i) => i % Math.ceil(points.length / maxPoints) === 0
              )
            : points;
        return {
          name: cellType,
          type: "scatter",
          data: sampled,
          symbolSize: 3,
          itemStyle: {
            color: getCellTypeColor(cellType, idx),
            opacity: 0.6,
          },
          large: true,
          largeThreshold: 2000,
        };
      }
    );

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) => `${params.seriesName}`,
      },
      legend: {
        data: Object.keys(cellsByType),
        bottom: 5,
        type: "scroll",
        textStyle: { color: "#94a3b8", fontSize: 9 },
        itemWidth: 8,
        itemHeight: 8,
        pageIconSize: 10,
      },
      grid: { left: 40, right: 40, top: 20, bottom: 60 },
      xAxis: {
        name: "UMAP1",
        nameLocation: "middle",
        nameGap: 25,
        nameTextStyle: { color: "#64748b", fontSize: 10 },
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        scale: true,
      },
      yAxis: {
        name: "UMAP2",
        nameLocation: "middle",
        nameGap: 25,
        nameTextStyle: { color: "#64748b", fontSize: 10 },
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        scale: true,
      },
      series,
    };
  }

  // No data available
  return {
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: "No UMAP data available",
        fill: "#94a3b8",
        fontSize: 12,
      },
    },
  };
});

// Volcano plot - uses mock DEG data with realistic distribution
const volcanoChartOption = computed(() => {
  const upregulated = [];
  const downregulated = [];
  const notSig = [];
  const minLogFC = 1;
  const maxPvalue = 0.05;

  mockDegData.genes.forEach((gene) => {
    const x = gene.logFC;
    const adjPval = gene.adjPvalue || gene.pvalue;
    const y = adjPval > 0 ? -Math.log10(adjPval) : 0;
    const point = [x, y, gene.gene];

    if (Math.abs(x) >= minLogFC && adjPval <= maxPvalue) {
      if (x > 0) upregulated.push(point);
      else downregulated.push(point);
    } else {
      notSig.push(point);
    }
  });

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.value[2]}<br/>Log2FC: ${params.value[0].toFixed(
          2
        )}<br/>-log10(p): ${params.value[1].toFixed(2)}`,
    },
    legend: {
      data: ["Up", "Down", "NS"],
      bottom: 5,
      textStyle: { color: "#94a3b8", fontSize: 9 },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: {
      name: "Log2FC",
      nameLocation: "middle",
      nameGap: 25,
      nameTextStyle: { color: "#64748b" },
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { show: false },
    },
    yAxis: {
      name: "-log10(p)",
      nameLocation: "middle",
      nameGap: 35,
      nameTextStyle: { color: "#64748b" },
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { show: false },
    },
    series: [
      {
        name: "Up",
        type: "scatter",
        data: upregulated,
        symbolSize: 5,
        itemStyle: { color: "#e74c3c" },
      },
      {
        name: "Down",
        type: "scatter",
        data: downregulated,
        symbolSize: 5,
        itemStyle: { color: "#3498db" },
      },
      {
        name: "NS",
        type: "scatter",
        data: notSig,
        symbolSize: 3,
        itemStyle: { color: "#95a5a6", opacity: 0.5 },
      },
    ],
  };
});

// Spatial scatter plot option - uses spatial plot data with cluster metadata
const spatialChartOption = computed(() => {
  // Show empty chart while loading
  if (spatialLoading.value) {
    return {
      grid: { left: 40, right: 40, top: 20, bottom: 60 },
      xAxis: { show: false },
      yAxis: { show: false },
      series: [],
    };
  }

  // Use spatial data with cluster/annotation metadata
  if (
    sampleSpatialData.value?.coordinates &&
    sampleSpatialData.value?.metadata
  ) {
    const { coordinates, metadata } = sampleSpatialData.value;

    // Find the best available cluster metadata (prefer seurat_clusters, cluster, annotation)
    const clusterKey = [
      "seurat_clusters",
      "cluster",
      "clusters",
      "annotation",
      "cell_type",
    ].find((key) => metadata[key] && Array.isArray(metadata[key]));

    if (!clusterKey) {
      return {
        graphic: {
          type: "text",
          left: "center",
          top: "center",
          style: { text: "No cluster data", fill: "#94a3b8", fontSize: 12 },
        },
      };
    }

    const clusters = metadata[clusterKey];

    // Group spots by cluster
    const spotsByCluster = {};
    coordinates.forEach((coord, idx) => {
      const cluster = clusters[idx] ?? "Unknown";
      if (!spotsByCluster[cluster]) spotsByCluster[cluster] = [];
      spotsByCluster[cluster].push(coord);
    });

    // Create series for each cluster
    const series = Object.entries(spotsByCluster).map(
      ([cluster, points], idx) => ({
        name: String(cluster),
        type: "scatter",
        data: points,
        symbolSize: 4,
        itemStyle: {
          color: getCellTypeColor(String(cluster), idx),
          opacity: 0.8,
        },
      })
    );

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) => `Cluster ${params.seriesName}`,
      },
      legend: {
        data: Object.keys(spotsByCluster).map(String),
        bottom: 5,
        type: "scroll",
        textStyle: { color: "#94a3b8", fontSize: 9 },
        itemWidth: 8,
        itemHeight: 8,
        pageIconSize: 10,
      },
      grid: { left: 40, right: 40, top: 20, bottom: 60 },
      xAxis: {
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        scale: true,
      },
      yAxis: {
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        scale: true,
        inverse: true, // Spatial coordinates typically have inverted y-axis
      },
      series,
    };
  }

  // No data available
  return {
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: "No spatial data available",
        fill: "#94a3b8",
        fontSize: 12,
      },
    },
  };
});

// Neural network animation
const initNeuralNetwork = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const container = canvasContainer.value;

  const resizeCanvas = () => {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    initNodes();
  };

  const initNodes = () => {
    nodes = [];
    const nodeCount = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < Math.min(nodeCount, 80); i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      });
      nodes[i].baseX = nodes[i].x;
      nodes[i].baseY = nodes[i].y;
    }
  };

  const drawNetwork = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const connectionDistance = 150;
    const mouseInfluenceRadius = 200;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseInfluenceRadius) {
          const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius;
          node.x += dx * force * 0.02;
          node.y += dy * force * 0.02;
        }
      }

      node.x += (node.baseX - node.x) * 0.01;
      node.y += (node.baseY - node.y) * 0.01;
      node.baseX += node.vx;
      node.baseY += node.vy;

      if (node.baseX < 0 || node.baseX > canvas.width) node.vx *= -1;
      if (node.baseY < 0 || node.baseY > canvas.height) node.vy *= -1;
      node.baseX = Math.max(0, Math.min(canvas.width, node.baseX));
      node.baseY = Math.max(0, Math.min(canvas.height, node.baseY));

      node.pulsePhase += 0.02;
      const pulse = Math.sin(node.pulsePhase) * 0.2 + 1;

      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const cdist = Math.sqrt(
          (node.x - other.x) ** 2 + (node.y - other.y) ** 2
        );
        if (cdist < connectionDistance) {
          let lineOpacity = (1 - cdist / connectionDistance) * 0.3;
          if (mouse.x !== null && mouse.y !== null) {
            const midX = (node.x + other.x) / 2;
            const midY = (node.y + other.y) / 2;
            const mouseDist = Math.sqrt(
              (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2
            );
            if (mouseDist < mouseInfluenceRadius) {
              lineOpacity += (1 - mouseDist / mouseInfluenceRadius) * 0.4;
            }
          }
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(14, 165, 233, ${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      let nodeOpacity = node.opacity;
      let nodeRadius = node.radius * pulse;

      if (mouse.x !== null && mouse.y !== null) {
        const mouseDist = Math.sqrt(
          (mouse.x - node.x) ** 2 + (mouse.y - node.y) ** 2
        );
        if (mouseDist < mouseInfluenceRadius) {
          const glow = 1 - mouseDist / mouseInfluenceRadius;
          nodeOpacity = Math.min(1, node.opacity + glow * 0.5);
          nodeRadius = node.radius * pulse * (1 + glow * 0.3);
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            nodeRadius * 3
          );
          gradient.addColorStop(0, `rgba(14, 165, 233, ${glow * 0.3})`);
          gradient.addColorStop(1, "rgba(14, 165, 233, 0)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(14, 165, 233, ${nodeOpacity})`;
      ctx.fill();
    }
    animationFrameId = requestAnimationFrame(drawNetwork);
  };

  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", resizeCanvas);

  return () => {
    window.removeEventListener("resize", resizeCanvas);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
};

const handleMouseMove = (e) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
};

const handleMouseLeave = () => {
  mouse.x = null;
  mouse.y = null;
};

let cleanup = null;

onMounted(async () => {
  await loadDatasets();
  cleanup = initNeuralNetwork();
  // Start auto-play for feature carousel
  autoPlayInterval = setInterval(nextFeature, 6000);
  // Fetch sample data for illustrations (non-blocking)
  fetchSampleUmap();
  fetchSampleSpatial();
});

onUnmounted(() => {
  if (cleanup) cleanup();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (autoPlayInterval) clearInterval(autoPlayInterval);
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-secondary-800">
    <!-- Hero Section -->
    <section
      ref="canvasContainer"
      class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-primary-50/30 to-secondary-50"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Primary Title: ssKIND - Maximum prominence -->
          <h1
            class="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter mb-6 animate-fade-in drop-shadow-sm"
          >
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-500 to-violet-500"
            >
              ssKIND
            </span>
          </h1>

          <!-- Acronym Expansion - Highlighted letters -->
          <div class="mb-10 animate-slide-up" style="animation-delay: 50ms">
            <p class="text-sm sm:text-base text-secondary-400 font-medium tracking-wide">
              <span class="text-primary-600 font-semibold">s</span>ingle-cell &
              <span class="text-primary-600 font-semibold">s</span>patial
              <span class="text-primary-600 font-semibold">K</span>nowledge
              <span class="text-primary-600 font-semibold">I</span>ntegration for
              <span class="text-primary-600 font-semibold">N</span>eurodegeneration
              <span class="text-primary-600 font-semibold">D</span>iscovery
            </p>
          </div>

          <!-- Tagline - Secondary emphasis -->
          <h2
            class="text-xl sm:text-2xl lg:text-3xl font-semibold text-secondary-700 leading-relaxed mb-5 animate-slide-up"
            style="animation-delay: 100ms"
          >
            Decoding Neurodegeneration at Single-Cell Resolution
          </h2>

          <p
            class="text-base sm:text-lg text-secondary-400 max-w-xl mx-auto leading-relaxed mb-10 animate-slide-up"
            style="animation-delay: 150ms"
          >
            Explore curated transcriptomics datasets with AI-powered analysis
            and comprehensive visualization tools.
          </p>

          <div
            class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style="animation-delay: 200ms"
          >
            <router-link
              to="/atlas/human"
              class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-secondary-900 text-white font-semibold shadow-xl shadow-secondary-200 hover:bg-primary-600 hover:shadow-primary-200 hover:-translate-y-1 transition-all duration-300"
            >
              <span>Explore Human Atlas</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </router-link>
            <router-link
              to="/datasets"
              class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-secondary-700 font-medium border border-secondary-200 shadow-sm hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200"
            >
              <span>Browse Datasets</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          class="w-6 h-6 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>

    <!-- Database Overview Section with Charts -->
    <section class="py-24 bg-gradient-to-b from-secondary-50/50 to-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-12">
          <p
            class="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3"
          >
            Database Overview
          </p>
          <h2
            class="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-900 mb-6"
          >
            Neurodegenerative Disease Atlas
          </h2>
          <p class="text-lg text-secondary-600 leading-relaxed">
            Comprehensive single-cell and spatial transcriptomics data across
            multiple diseases, species, and brain regions.
          </p>
        </div>

        <!-- Overall Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <div
            class="bg-white rounded-2xl p-5 border border-secondary-100 shadow-sm text-center hover:shadow-md transition-shadow"
          >
            <div class="text-3xl font-bold text-secondary-900">
              {{ loading ? "..." : overallStats.datasets }}
            </div>
            <div class="text-sm text-secondary-500 mt-1">Datasets</div>
          </div>
          <div
            class="bg-white rounded-2xl p-5 border border-secondary-100 shadow-sm text-center hover:shadow-md transition-shadow"
          >
            <div class="text-3xl font-bold text-secondary-900">
              {{ loading ? "..." : formatNumber(overallStats.cells) }}
            </div>
            <div class="text-sm text-secondary-500 mt-1">Total Cells</div>
          </div>
          <div
            class="bg-white rounded-2xl p-5 border border-secondary-100 shadow-sm text-center hover:shadow-md transition-shadow"
          >
            <div class="text-3xl font-bold text-secondary-900">
              {{ loading ? "..." : overallStats.species }}
            </div>
            <div class="text-sm text-secondary-500 mt-1">Species</div>
          </div>
          <div
            class="bg-white rounded-2xl p-5 border border-secondary-100 shadow-sm text-center hover:shadow-md transition-shadow"
          >
            <div class="text-3xl font-bold text-secondary-900">
              {{ loading ? "..." : overallStats.brainRegions }}
            </div>
            <div class="text-sm text-secondary-500 mt-1">Brain Regions</div>
          </div>
          <div
            class="bg-white rounded-2xl p-5 border border-secondary-100 shadow-sm text-center hover:shadow-md transition-shadow col-span-2 sm:col-span-1"
          >
            <div class="text-3xl font-bold text-secondary-900">
              {{ loading ? "..." : overallStats.studies }}
            </div>
            <div class="text-sm text-secondary-500 mt-1">Publications</div>
          </div>
        </div>

        <!-- Charts Grid - Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Disease Distribution -->
          <div
            class="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 class="text-base font-semibold text-secondary-900 mb-4">
              Datasets by Disease
            </h3>
            <div class="h-[280px]">
              <v-chart
                v-if="!loading && diseaseData.length"
                :option="diseaseDonutOption"
                autoresize
              />
              <div
                v-else
                class="h-full flex items-center justify-center text-secondary-400"
              >
                {{ loading ? "Loading..." : "No data" }}
              </div>
            </div>
          </div>

          <!-- Species Distribution -->
          <div
            class="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 class="text-base font-semibold text-secondary-900 mb-4">
              Datasets by Species
            </h3>
            <div class="h-[280px]">
              <v-chart
                v-if="!loading && speciesData.length"
                :option="speciesDonutOption"
                autoresize
              />
              <div
                v-else
                class="h-full flex items-center justify-center text-secondary-400"
              >
                {{ loading ? "Loading..." : "No data" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid - Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Cell Count by Disease -->
          <div
            class="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 class="text-base font-semibold text-secondary-900 mb-4">
              Cell Count by Disease
            </h3>
            <div class="h-[280px]">
              <v-chart
                v-if="!loading && diseaseData.length"
                :option="cellsByDiseaseOption"
                autoresize
              />
              <div
                v-else
                class="h-full flex items-center justify-center text-secondary-400"
              >
                {{ loading ? "Loading..." : "No data" }}
              </div>
            </div>
          </div>

          <!-- Top Brain Regions -->
          <div
            class="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 class="text-base font-semibold text-secondary-900 mb-4">
              Top 10 Brain Regions
            </h3>
            <div class="h-[280px]">
              <v-chart
                v-if="!loading && brainRegionData.length"
                :option="brainRegionBarOption"
                autoresize
              />
              <div
                v-else
                class="h-full flex items-center justify-center text-secondary-400"
              >
                {{ loading ? "Loading..." : "No data" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid - Row 3 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Disease-Species Heatmap -->
          <div
            class="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 class="text-base font-semibold text-secondary-900 mb-4">
              Disease × Species Matrix
            </h3>
            <div class="h-[320px]">
              <v-chart
                v-if="!loading && diseaseSpeciesMatrix.data.length"
                :option="heatmapOption"
                autoresize
              />
              <div
                v-else
                class="h-full flex items-center justify-center text-secondary-400"
              >
                {{ loading ? "Loading..." : "No data" }}
              </div>
            </div>
          </div>

          <!-- Brain Regions Treemap -->
          <div
            class="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 class="text-base font-semibold text-secondary-900 mb-4">
              Brain Regions by Cell Count
            </h3>
            <div class="h-[320px]">
              <v-chart
                v-if="!loading && brainRegionData.length"
                :option="treemapOption"
                autoresize
              />
              <div
                v-else
                class="h-full flex items-center justify-center text-secondary-400"
              >
                {{ loading ? "Loading..." : "No data" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comprehensive Analysis Section - Auto-scroll Carousel -->
    <section
      class="py-24 bg-gradient-to-br from-secondary-50 via-white to-primary-50/30"
    >
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-12">
          <p
            class="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3"
          >
            Platform Capabilities
          </p>
          <h2
            class="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-900 mb-6"
          >
            Comprehensive Single-Cell & Spatial Analysis
          </h2>
          <p class="text-lg text-secondary-600 leading-relaxed">
            Powerful tools designed to make single-cell and spatial
            transcriptomics analysis intuitive and reproducible.
          </p>
        </div>

        <!-- Feature Carousel -->
        <div class="relative">
          <!-- Carousel Container -->
          <div
            class="overflow-hidden rounded-3xl bg-white border border-secondary-100 shadow-xl"
          >
            <div class="relative">
              <!-- Feature Slides -->
              <div
                v-for="(feature, idx) in analysisFeatures"
                :key="feature.id"
                class="transition-all duration-700 ease-in-out"
                :class="idx === currentFeatureIndex ? 'block' : 'hidden'"
              >
                <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
                  <!-- Left: Illustration -->
                  <div
                    class="relative bg-gradient-to-br from-secondary-900 to-secondary-800 p-8 flex items-center justify-center overflow-hidden"
                  >
                    <!-- UMAP Chart for Atlas -->
                    <div v-if="feature.id === 'atlas'" class="w-full h-[360px]">
                      <v-chart
                        :option="umapChartOption"
                        autoresize
                        class="w-full h-full"
                      />
                      <div
                        class="absolute top-4 left-4 text-xs text-white/60 font-medium"
                      >
                        UMAP Projection
                      </div>
                    </div>

                    <!-- Spatial Scatter Plot - Demo Visium coordinates -->
                    <div
                      v-else-if="feature.id === 'spatial'"
                      class="w-full h-[360px]"
                    >
                      <v-chart
                        :option="spatialChartOption"
                        autoresize
                        class="w-full h-full"
                      />
                      <div
                        class="absolute top-4 left-4 text-xs text-white/60 font-medium"
                      >
                        Spatial Coordinates
                      </div>
                    </div>

                    <!-- Volcano Plot for DEG -->
                    <div
                      v-else-if="feature.id === 'analysis'"
                      class="w-full h-[360px]"
                    >
                      <v-chart
                        :option="volcanoChartOption"
                        autoresize
                        class="w-full h-full"
                      />
                      <div
                        class="absolute top-4 left-4 text-xs text-white/60 font-medium"
                      >
                        Volcano Plot
                      </div>
                    </div>

                    <!-- Knowledge Graph Animation for KG/AI -->
                    <div
                      v-else-if="feature.id === 'knowledge'"
                      class="relative w-full h-[360px]"
                    >
                      <!-- Animated nodes and connections -->
                      <div
                        class="absolute w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
                        style="top: 18%; left: 12%"
                      ></div>
                      <div
                        class="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
                        style="top: 32%; left: 22%; animation-delay: 0.5s"
                      ></div>
                      <div
                        class="absolute w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
                        style="top: 58%; left: 8%; animation-delay: 1s"
                      ></div>
                      <div
                        class="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
                        style="top: 72%; left: 28%; animation-delay: 1.5s"
                      ></div>
                      <div
                        class="absolute w-5 h-5 bg-rose-400 rounded-full animate-pulse shadow-lg shadow-rose-400/50"
                        style="top: 28%; left: 48%; animation-delay: 0.3s"
                      ></div>
                      <div
                        class="absolute w-4 h-4 bg-rose-400 rounded-full animate-pulse shadow-lg shadow-rose-400/50"
                        style="top: 52%; left: 58%; animation-delay: 0.8s"
                      ></div>
                      <div
                        class="absolute w-4 h-4 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"
                        style="top: 22%; left: 72%; animation-delay: 0.2s"
                      ></div>
                      <div
                        class="absolute w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"
                        style="top: 68%; left: 78%; animation-delay: 0.7s"
                      ></div>
                      <div
                        class="absolute w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"
                        style="top: 42%; left: 32%; animation-delay: 0.4s"
                      ></div>
                      <div
                        class="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"
                        style="top: 78%; left: 52%; animation-delay: 0.9s"
                      ></div>
                      <svg class="absolute inset-0 w-full h-full">
                        <defs>
                          <linearGradient
                            id="kg1"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stop-color="rgb(34, 211, 238)"
                              stop-opacity="0.6"
                            />
                            <stop
                              offset="100%"
                              stop-color="rgb(251, 113, 133)"
                              stop-opacity="0.6"
                            />
                          </linearGradient>
                          <linearGradient
                            id="kg2"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stop-color="rgb(251, 113, 133)"
                              stop-opacity="0.6"
                            />
                            <stop
                              offset="100%"
                              stop-color="rgb(251, 191, 36)"
                              stop-opacity="0.6"
                            />
                          </linearGradient>
                        </defs>
                        <line
                          x1="14%"
                          y1="19%"
                          x2="48%"
                          y2="29%"
                          stroke="url(#kg1)"
                          stroke-width="1.5"
                          class="animate-pulse"
                        />
                        <line
                          x1="24%"
                          y1="33%"
                          x2="32%"
                          y2="43%"
                          stroke="rgb(34, 211, 238)"
                          stroke-opacity="0.5"
                          stroke-width="1"
                          class="animate-pulse"
                          style="animation-delay: 0.4s"
                        />
                        <line
                          x1="48%"
                          y1="29%"
                          x2="72%"
                          y2="23%"
                          stroke="url(#kg2)"
                          stroke-width="1.5"
                          class="animate-pulse"
                          style="animation-delay: 0.6s"
                        />
                        <line
                          x1="58%"
                          y1="53%"
                          x2="78%"
                          y2="69%"
                          stroke="rgb(251, 191, 36)"
                          stroke-opacity="0.5"
                          stroke-width="1"
                          class="animate-pulse"
                          style="animation-delay: 0.8s"
                        />
                        <line
                          x1="32%"
                          y1="43%"
                          x2="58%"
                          y2="53%"
                          stroke="rgb(52, 211, 153)"
                          stroke-opacity="0.5"
                          stroke-width="1"
                          class="animate-pulse"
                          style="animation-delay: 1s"
                        />
                        <line
                          x1="48%"
                          y1="29%"
                          x2="58%"
                          y2="53%"
                          stroke="rgb(251, 113, 133)"
                          stroke-opacity="0.4"
                          stroke-width="1"
                          class="animate-pulse"
                          style="animation-delay: 0.5s"
                        />
                      </svg>
                      <div
                        class="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-white/80"
                      >
                        <span class="flex items-center gap-1.5"
                          ><span class="w-2 h-2 bg-cyan-400 rounded-full"></span
                          >Genes</span
                        >
                        <span class="flex items-center gap-1.5"
                          ><span class="w-2 h-2 bg-rose-400 rounded-full"></span
                          >Diseases</span
                        >
                        <span class="flex items-center gap-1.5"
                          ><span
                            class="w-2 h-2 bg-amber-400 rounded-full"
                          ></span
                          >Pathways</span
                        >
                        <span class="flex items-center gap-1.5"
                          ><span
                            class="w-2 h-2 bg-emerald-400 rounded-full"
                          ></span
                          >Cell Types</span
                        >
                      </div>
                      <div
                        class="absolute top-4 left-4 text-xs text-white/60 font-medium"
                      >
                        Knowledge Graph
                      </div>
                    </div>
                  </div>

                  <!-- Right: Content -->
                  <div class="p-8 lg:p-12 flex flex-col justify-center">
                    <p
                      class="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2"
                    >
                      {{ feature.subtitle }}
                    </p>
                    <h3
                      class="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4"
                    >
                      {{ feature.title }}
                    </h3>
                    <p class="text-lg text-secondary-600 leading-relaxed mb-6">
                      {{ feature.description }}
                    </p>

                    <!-- Highlights -->
                    <ul class="space-y-3 mb-8">
                      <li
                        v-for="highlight in feature.highlights"
                        :key="highlight"
                        class="flex items-center gap-3 text-secondary-700"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"
                        ></span>
                        {{ highlight }}
                      </li>
                    </ul>

                    <!-- CTA Link -->
                    <router-link
                      :to="feature.link"
                      class="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
                    >
                      <span>{{ feature.linkText }}</span>
                      <svg
                        class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="flex items-center justify-center mt-8 gap-6">
            <!-- Previous Button -->
            <button
              @click="prevFeature"
              class="p-2 rounded-full bg-white border border-secondary-200 text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 transition-all shadow-sm"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- Dot Indicators -->
            <div class="flex items-center gap-2">
              <button
                v-for="(feature, idx) in analysisFeatures"
                :key="feature.id"
                @click="goToFeature(idx)"
                class="group relative w-3 h-3 rounded-full transition-all duration-300"
                :class="
                  idx === currentFeatureIndex
                    ? 'bg-primary-600 w-8'
                    : 'bg-secondary-300 hover:bg-secondary-400'
                "
              >
                <span class="sr-only">{{ feature.title }}</span>
              </button>
            </div>

            <!-- Next Button -->
            <button
              @click="nextFeature"
              class="p-2 rounded-full bg-white border border-secondary-200 text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 transition-all shadow-sm"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <!-- Auto-play Toggle -->
            <button
              @click="toggleAutoPlay"
              class="ml-4 p-2 rounded-full bg-white border border-secondary-200 text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 transition-all shadow-sm"
              :title="isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'"
            >
              <svg
                v-if="isAutoPlaying"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
