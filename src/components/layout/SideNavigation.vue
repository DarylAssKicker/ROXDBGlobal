<template>
  <nav class="bg-white rounded-xl shadow-soft border border-gray-200 p-4">
    <div class="space-y-2">
      <router-link
        v-for="item in navigationItems"
        :key="item.path"
        :to="item.path"
        class="navigation-item"
        :class="{ 'active': isCurrentRoute(item.path) }"
      >
        <component 
          :is="getIcon(item.icon)" 
          class="h-5 w-5"
        />
        <span>{{ $t(`navigation.${item.key}`) }}</span>
      </router-link>
    </div>
    
    <!-- 统计信息 -->
    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">
        {{ $t('common.statistics') }}
      </h3>
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex justify-between">
          <span>{{ $t('navigation.monster') }}</span>
          <span class="font-medium">{{ dataStore.monstersCount }}</span>
        </div>
        <div class="flex justify-between">
          <span>{{ $t('navigation.card') }}</span>
          <span class="font-medium">{{ dataStore.cardsCount }}</span>
        </div>
        <div class="flex justify-between">
          <span>{{ $t('navigation.equipment') }}</span>
          <span class="font-medium">{{ dataStore.equipmentCount }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  HomeIcon, 
  UserGroupIcon,
  RectangleStackIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  EyeSlashIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import { useDataStore } from '@/stores/data'
import type { MenuItem } from '@/types'

const route = useRoute()
const dataStore = useDataStore()

const navigationItems: MenuItem[] = [
  { key: 'home', label: '首页', icon: 'home', path: '/' },
  { key: 'monster', label: '魔物资料', icon: 'monster', path: '/monster' },
  { key: 'card', label: '卡片资料', icon: 'card', path: '/card' },
  { key: 'enchant', label: '附魔资料', icon: 'enchant', path: '/enchant' },
  { key: 'equipment', label: '装备资料', icon: 'equipment', path: '/equipment' },
  { key: 'character', label: '职业资料', icon: 'character', path: '/character' },
  { key: 'shadow', label: '影装资料', icon: 'shadow', path: '/shadow' },
  { key: 'favorite', label: 'NPC好感度', icon: 'favorite', path: '/favorite' },
  { key: 'ox', label: 'OX答题', icon: 'ox', path: '/ox' },
  { key: 'tools', label: '实用工具', icon: 'tools', path: '/tools' }
]

const iconMap = {
  home: HomeIcon,
  monster: UserGroupIcon,
  card: RectangleStackIcon,
  enchant: SparklesIcon,
  equipment: ShieldCheckIcon,
  character: UserIcon,
  shadow: EyeSlashIcon,
  favorite: HeartIcon,
  ox: QuestionMarkCircleIcon,
  tools: WrenchScrewdriverIcon
}

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || HomeIcon
}

const isCurrentRoute = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
.navigation-item {
  @apply flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all duration-200 font-medium;
}

.navigation-item.active {
  @apply bg-primary-500 text-white hover:bg-primary-600 hover:text-white;
}

.navigation-item.active svg {
  @apply text-white;
}
</style>