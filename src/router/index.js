import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
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
    path: "/demo",
    name: "Demo",
    component: () => import("@/views/AtlasView.vue"),
    props: { defaultDatasetId: "hypomap_demo" },
    meta: { title: "HypoMap Demo" },
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
        component: HelpView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
