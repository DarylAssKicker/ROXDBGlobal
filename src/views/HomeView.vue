<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <div class="card p-8 text-center bg-cover bg-center bg-no-repeat relative" style="background-image: url('/images/banner.jpg')">
      <div class="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
      <div class="max-w-3xl mx-auto relative z-10">
        <h1 class="text-4xl font-bold text-white mb-4">
          {{ $t('home.welcome') }}
        </h1>
        <p class="text-xl text-gray-200 mb-8">
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
    
    <!-- 协作者信息 -->
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        Collaborators
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 程序员 -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon class="h-5 w-5 mr-2 text-primary-500" />
            Programmer
          </h3>
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span class="text-gray-700 font-medium">DarylAssKicker</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-gray-600 text-sm">If you want to help with the translation, please contact me on DC: daryl_48373_78664</span>
            </div>
          </div>
        </div>
        
        <!-- 翻译者 -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <GlobeAltIcon class="h-5 w-5 mr-2 text-primary-500" />
            Translator
          </h3>
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span class="text-gray-600 text-sm">English:</span>
              <span class="text-gray-700 font-medium">Dayrl,AI</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-gray-600 text-sm">Português:</span>
              <span class="text-gray-700 font-medium">Andyz0x</span>
            </div>
          </div>
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
      <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
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
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ visitCount.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ $t('common.visitCount') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">
            {{ dailyVisitCount.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            今日访问
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { 
  GlobeAltIcon,
  UserGroupIcon,
  RectangleStackIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  EyeSlashIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import { useI18nStore } from '@/stores/i18n'
import { useDataStore } from '@/stores/data'
import axios from 'axios'

const i18nStore = useI18nStore()
const dataStore = useDataStore()

const currentLanguage = computed(() => i18nStore.currentLanguage)

// 访问统计
const visitCount = ref(0)
const dailyVisitCount = ref(0)
const isNewVisit = ref(false)

// API基础URL配置
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001'

// 获取访问次数
const getVisitCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/stats/visits`)
    return {
      visits: response.data.visits || 0,
      dailyVisits: response.data.dailyVisits || 0,
      date: response.data.date
    }
  } catch (error) {
    console.error('Failed to get visit count:', error)
    return { visits: 0, dailyVisits: 0, date: null }
  }
}

// 增加访问次数（基于IP去重）
const incrementVisitCount = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/stats/visit`)
    visitCount.value = response.data.visits || 0
    isNewVisit.value = response.data.newVisit || false
    
    // 如果是新访问，显示欢迎消息
    if (isNewVisit.value) {
      console.log('欢迎新访客！您的IP:', response.data.clientIP)
    } else {
      console.log('欢迎回来！今天您已经访问过了')
    }
  } catch (error) {
    console.error('Failed to increment visit count:', error)
  }
}

// 组件挂载时初始化访问统计
onMounted(async () => {
  // 先获取当前统计数据
  const stats = await getVisitCount()
  visitCount.value = stats.visits
  dailyVisitCount.value = stats.dailyVisits
  
  // 然后尝试增加访问次数（如果是新访问才会增加）
  await incrementVisitCount()
  
  // 重新获取更新后的统计数据
  const updatedStats = await getVisitCount()
  visitCount.value = updatedStats.visits
  dailyVisitCount.value = updatedStats.dailyVisits
})



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