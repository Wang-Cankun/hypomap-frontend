import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AtlasView from '../views/AtlasView.vue'
import FunctionsView from '../views/FunctionsView.vue'
import DataTableView from '../views/DataTableView.vue'
import KnowledgeView from '../views/KnowledgeView.vue'
import SpatialView from '../views/SpatialView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/atlas',
      name: 'atlas',
      component: AtlasView
    },
    {
      path: '/functions',
      name: 'functions',
      component: FunctionsView
    },
    {
      path: '/data-table',
      name: 'data-table',
      component: DataTableView
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: KnowledgeView
    },
    {
      path: '/spatial',
      name: 'spatial',
      component: SpatialView
    }
  ]
})

export default router 