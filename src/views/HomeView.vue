<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <div class="card p-8 text-center">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ $t('home.welcome') }}
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          {{ $t('home.description') }}
        </p>
        <div class="flex items-center justify-center space-x-4">
          <router-link to="/monster" class="btn-primary">
            {{ $t('home.getStarted') }}
          </router-link>
          <button class="btn-secondary">
            {{ $t('common.language') }}: {{ currentLanguage?.label }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 功能特色 -->
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        {{ $t('home.features') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <component :is="feature.icon" class="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ $t(`home.${feature.key}`) }}
          </h3>
          <p class="text-gray-600">
            {{ $t(`home.${feature.key}Desc`) }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- 快速访问 -->
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        {{ $t('home.quickAccess') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="item in quickAccessItems"
          :key="item.path"
          :to="item.path"
          class="group p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-medium transition-all duration-200"
        >
          <div class="flex items-center space-x-4">
            <component 
              :is="getIcon(item.icon)" 
              class="h-8 w-8 text-gray-400 group-hover:text-primary-500 transition-colors"
            />
            <div>
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                {{ $t(`navigation.${item.key}`) }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ item.description }}
              </p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    
    <!-- 数据统计 -->
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        {{ $t('common.statistics') }}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ dataStore.monstersCount.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ $t('navigation.monster') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ dataStore.cardsCount.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ $t('navigation.card') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ dataStore.equipmentCount.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ $t('navigation.equipment') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">5</div>
          <div class="text-sm text-gray-500 mt-1">
            {{ $t('common.language') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  ComputerDesktopIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  RectangleStackIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  EyeSlashIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'
import { useI18nStore } from '@/stores/i18n'
import { useDataStore } from '@/stores/data'

const i18nStore = useI18nStore()
const dataStore = useDataStore()

const currentLanguage = computed(() => i18nStore.currentLanguage)

const features = [
  { key: 'modernUI', icon: ComputerDesktopIcon },
  { key: 'multiLanguage', icon: GlobeAltIcon },
  { key: 'responsive', icon: DevicePhoneMobileIcon },
  { key: 'fastSearch', icon: MagnifyingGlassIcon }
]

const quickAccessItems = [
  { 
    key: 'monster', 
    path: '/monster', 
    icon: 'monster',
    description: '查看所有魔物的详细信息'
  },
  { 
    key: 'card', 
    path: '/card', 
    icon: 'card',
    description: '查看卡片属性和效果'
  },
  { 
    key: 'enchant', 
    path: '/enchant', 
    icon: 'enchant',
    description: '了解各种附魔效果'
  },
  { 
    key: 'equipment', 
    path: '/equipment', 
    icon: 'equipment',
    description: '查看装备制作信息'
  },
  { 
    key: 'character', 
    path: '/character', 
    icon: 'character',
    description: '了解职业技能和加点'
  },
  { 
    key: 'tools', 
    path: '/tools', 
    icon: 'tools',
    description: '使用各种实用工具'
  }
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
</script>