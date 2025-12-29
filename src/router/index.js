import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AtlasView from "../views/AtlasView.vue";
import DatasetsExplorer from "../views/DatasetsExplorer.vue";
import SpatialView from "../views/SpatialView.vue";
import HelpView from "../views/HelpView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("@/views/UploadView.vue"),
    meta: { title: "Upload Dataset" },
  },
  {
    path: "/analysis/:id",
    name: "Analysis",
    component: () => import("@/views/AnalysisView.vue"),
    meta: { title: "Dataset Analysis" },
  },
  {
    path: "/atlas",
    redirect: "/atlas/human",
  },
  {
    path: "/atlas/human",
    name: "HumanAtlas",
    component: () => import("@/views/AtlasView.vue"),
    props: { defaultDatasetId: "human_subset" },
    meta: { title: "Human Atlas" },
  },
  {
    path: "/atlas/scrna",
    component: () => import("@/layouts/AtlasLayout.vue"),
    children: [
      {
        path: "",
        name: "AtlasSingleCell",
        component: () => import("@/views/AtlasView.vue"),
        meta: { title: "scRNA-seq" },
      },
    ],
  },
  {
    path: "/atlas/spatial",
    component: () => import("@/layouts/AtlasLayout.vue"),
    children: [
      {
        path: "",
        name: "AtlasSpatial",
        component: () => import("@/views/SpatialView.vue"),
        meta: { title: "Spatial transcriptomics" },
      },
    ],
  },
  {
    path: "/atlas/analysis/:id",
    name: "SingleCellAnalysis",
    component: () => import("@/views/SingleCellAnalysis.vue"),
    meta: { title: "Single-Cell Analysis" },
  },
  {
    path: "/functions",
    redirect: "/demo/scrna",
  },
  {
    path: "/demo/scrna",
    name: "DemoScRNA",
    component: () => import("@/views/SingleCellAnalysis.vue"),
    props: { defaultDatasetId: "AD093044", isAtlasMode: false },
    meta: { title: "scRNA-seq Demo" },
  },
  {
    path: "/demo/visium",
    name: "DemoVisium",
    component: () => import("@/views/SpatialAnalysis.vue"),
    props: { defaultDatasetId: "ST024001", datasetType: "visium" },
    meta: { title: "Spatial Visium Demo" },
  },
  {
    path: "/demo/xenium",
    name: "DemoXenium",
    component: () => import("@/views/SpatialAnalysis.vue"),
    props: { defaultDatasetId: "ST034001", datasetType: "xenium" },
    meta: { title: "Xenium Demo" },
  },
  {
    path: "/datasets",
    name: "Datasets",
    component: DatasetsExplorer,
  },
  {
    path: "/sskind/datasets",
    name: "DatasetsSskind",
    component: DatasetsExplorer,
  },
  {
    path: "/knowledge",
    name: "Knowledge",
    component: () => import("@/views/KnowledgeGraphView.vue"),
  },
  {
    path: "/help",
    name: "Help",
    component: HelpView,
    redirect: "/help/methods",
    children: [
      {
        path: ":topic",
        name: "HelpTopic",
        component: HelpView, // Still points to HelpView, but now it reads the :topic param
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
