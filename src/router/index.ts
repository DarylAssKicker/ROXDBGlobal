import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'home.title' }
  },
  {
    path: '/monster',
    name: 'Monster',
    component: () => import('@/views/MonsterView.vue'),
    meta: { title: 'monster.title' }
  },
  {
    path: '/card',
    name: 'Card',
    component: () => import('@/views/CardView.vue'),
    meta: { title: 'card.title' }
  },
  {
    path: '/enchant',
    name: 'Enchant',
    component: () => import('@/views/EnchantView.vue'),
    meta: { title: 'enchant.title' }
  },
  {
    path: '/equipment',
    name: 'Equipment',
    component: () => import('@/views/EquipmentView.vue'),
    meta: { title: 'equipment.title' }
  },
  {
    path: '/character',
    name: 'Character',
    component: () => import('@/views/CharacterView.vue'),
    meta: { title: 'character.title' }
  },
  {
    path: '/shadow',
    name: 'Shadow',
    component: () => import('@/views/ShadowView.vue'),
    meta: { title: 'shadow.title' }
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('@/views/FavoriteView.vue'),
    meta: { title: 'favorite.title' }
  },
  {
    path: '/ox',
    name: 'OX',
    component: () => import('@/views/OXView.vue'),
    meta: { title: 'ox.title' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('@/views/ToolsView.vue'),
    meta: { title: 'tools.title' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router