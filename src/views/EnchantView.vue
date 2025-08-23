<template>
  <div class="space-y-6">
    <!-- 筛选器 -->
    <div class="card p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7 gap-3 items-end">
        <!-- 城市筛选 -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">{{ $t('enchant.filters.city') }}</label>
          <select 
            v-model="selectedCity" 
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{{ $t('enchant.filters.selectCity') }}</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <!-- 装备位置筛选 -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">{{ $t('enchant.filters.position') }}</label>
          <select 
            v-model="selectedPosition" 
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{{ $t('enchant.filters.selectPosition') }}</option>
            <option v-for="position in positions" :key="position" :value="position">{{ position }}</option>
          </select>
        </div>

        <!-- 属性搜索 -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">{{ $t('enchant.filters.attribute') }}</label>
          <input 
            v-model="searchAttribute" 
            type="text" 
:placeholder="$t('enchant.filters.searchAttribute')" 
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- 每页显示数量 -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">{{ $t('enchant.filters.pageSize') }}</label>
          <select 
            v-model="pageSize" 
            @change="goToPage(1)" 
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <!-- 重置按钮 -->
        <div class="flex space-x-1 col-span-1">
          <button 
            @click="resetFilters" 
            class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
          >
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端卡片视图 -->
    <div class="lg:hidden space-y-4">
      <div v-for="enchant in paginatedEnchants" :key="enchant.id" class="card p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCityColor(enchant.city)">
              {{ enchant.city }}
            </span>
            <span class="text-sm text-gray-500">{{ enchant.position }}</span>
          </div>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-3">{{ enchant.attribute }}</h3>
        
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ $t('enchant.columns.white') }}</div>
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {{ enchant.white }}
            </span>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ $t('enchant.columns.blue') }}</div>
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {{ enchant.blue }}
            </span>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ $t('enchant.columns.purple') }}</div>
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              {{ enchant.purple }}
            </span>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ $t('enchant.columns.orange') }}</div>
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
              {{ enchant.orange }}
            </span>
          </div>
        </div>
        
        <div class="pt-3 border-t border-gray-200">
          <div class="text-xs text-gray-500 mb-1">{{ $t('enchant.columns.costItems') }}</div>
          <div class="text-sm text-gray-700">{{ enchant.cost_items }}</div>
        </div>
      </div>
    </div>

    <!-- 桌面端表格视图 -->
    <div class="hidden lg:block card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="table-header">
            <tr>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider cursor-pointer w-24" @click="sortBy('city')">
                <div class="flex items-center justify-center space-x-1">
                  <span>{{ $t('enchant.columns.city') }}</span>
                  <span class="ml-1" v-if="sortField === 'city'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider w-32">{{ $t('enchant.columns.position') }}</th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider cursor-pointer w-28" @click="sortBy('attribute')">
                <div class="flex items-center justify-center space-x-1">
                  <span>{{ $t('enchant.columns.attribute') }}</span>
                  <span class="ml-1" v-if="sortField === 'attribute'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider w-20">{{ $t('enchant.columns.white') }}</th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider w-20">{{ $t('enchant.columns.blue') }}</th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider w-20">{{ $t('enchant.columns.purple') }}</th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider w-20">{{ $t('enchant.columns.orange') }}</th>
              <th class="px-6 py-3 text-center text-xs font-medium tracking-wider">{{ $t('enchant.columns.costItems') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="enchant in paginatedEnchants" :key="enchant.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-center w-24">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCityColor(enchant.city)">
                  {{ enchant.city }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 text-center w-32">
                <div class="break-words whitespace-normal">{{ enchant.position }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center w-28">
                <span class="text-sm font-medium text-gray-900">{{ enchant.attribute }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center w-20">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {{ enchant.white }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center w-20">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ enchant.blue }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center w-20">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {{ enchant.purple }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center w-20">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  {{ enchant.orange }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 text-center">
                <div class="max-w-sm break-words whitespace-normal leading-tight" :title="enchant.cost_items">
                  {{ enchant.cost_items }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredEnchants.length === 0" class="card text-center py-12">
      <SparklesIcon class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-sm font-medium text-gray-900 mb-2">{{ $t('common.noData') }}</h3>
      <p class="text-sm text-gray-500">{{ $t('common.adjustFilters') }}</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="card text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p class="text-sm text-gray-500">{{ $t('common.loading') }}</p>
    </div>

    <!-- 分页控件 -->
    <div v-if="!loading && filteredEnchants.length > 0" class="card p-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-600">
          显示第 {{ startIndex + 1 }} - {{ endIndex }} 条，共 {{ filteredEnchants.length }} 条结果
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <div class="flex items-center space-x-1">
            <button 
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 text-sm border rounded-md',
                page === currentPage 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
        
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="card p-4">
      <div class="flex flex-wrap gap-4 text-sm text-gray-600">
        <div>总计: <span class="font-medium text-gray-900">{{ enchants.length }}</span> 条附魔</div>
        <div>筛选结果: <span class="font-medium text-gray-900">{{ filteredEnchants.length }}</span> 条</div>
        <div>城市数量: <span class="font-medium text-gray-900">{{ cities.length }}</span> 个</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { useI18nStore } from '@/stores/i18n'

interface EnchantData {
  id: number
  city: string
  position: string
  attribute: string
  white: string
  blue: string
  purple: string
  orange: string
  cost_items: string
}

// 获取 i18n store
const i18nStore = useI18nStore()

// 响应式数据
const enchants = ref<EnchantData[]>([])
const loading = ref(true)
const selectedCity = ref('')
const selectedPosition = ref('')
const searchAttribute = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)

// 排序相关
const sortField = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// 加载数据
const loadEnchants = async () => {
  try {
    loading.value = true
    // 根据当前语言加载对应的数据文件
    const locale = i18nStore.currentLocale
    const dataPath = `/src/data/enchant/${locale}.json`
    
    let response = await fetch(dataPath)
    
    // 如果当前语言的数据文件不存在，回退到中文
    if (!response.ok && locale !== 'zh-CN') {
      console.warn(`Enchant data for ${locale} not found, falling back to zh-CN`)
      response = await fetch('/src/data/enchant/zh-CN.json')
    }
    
    if (!response.ok) {
      throw new Error('Failed to load enchant data')
    }
    
    const data = await response.json()
    enchants.value = data
  } catch (error) {
    console.error('Error loading enchant data:', error)
  } finally {
    loading.value = false
  }
}

// 计算属性 - 获取所有城市（按配置表顺序）
const cities = computed(() => {
  // 定义城市的显示顺序（支持多语言）
  const cityOrder = i18nStore.currentLocale === 'zh-CN' 
    ? ['普隆德拉', '依斯鲁得', '梦洛克', '艾尔贝塔', '斐扬', '吉芬']
    : ['Prontera', 'Izlude', 'Morocc', 'Alberta', 'Payon', 'Geffen']
  
  const citySet = new Set(enchants.value.map(e => e.city))
  const availableCities = Array.from(citySet)
  
  // 按预定义顺序排序，未知城市放在最后
  return cityOrder.filter(city => availableCities.includes(city))
    .concat(availableCities.filter(city => !cityOrder.includes(city)).sort())
})

// 计算属性 - 获取所有装备位置
const positions = computed(() => {
  const positionSet = new Set(enchants.value.map(e => e.position))
  return Array.from(positionSet).sort()
})

// 计算属性 - 筛选和排序后的附魔数据
const filteredEnchants = computed(() => {
  let filtered = enchants.value.filter(enchant => {
    const matchCity = !selectedCity.value || enchant.city === selectedCity.value
    const matchPosition = !selectedPosition.value || enchant.position === selectedPosition.value
    const matchAttribute = !searchAttribute.value || 
      enchant.attribute.toLowerCase().includes(searchAttribute.value.toLowerCase())
    
    return matchCity && matchPosition && matchAttribute
  })

  // 排序
  if (sortField.value) {
    filtered = filtered.sort((a, b) => {
      const aValue = a[sortField.value as keyof EnchantData]
      const bValue = b[sortField.value as keyof EnchantData]
      
      let comparison = 0
      if (aValue < bValue) {
        comparison = -1
      } else if (aValue > bValue) {
        comparison = 1
      }
      
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }

  return filtered
})

// 计算属性 - 分页相关
const totalPages = computed(() => Math.ceil(filteredEnchants.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredEnchants.value.length))

const paginatedEnchants = computed(() => {
  return filteredEnchants.value.slice(startIndex.value, endIndex.value)
})

// 计算可见页码
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  
  if (current - delta > 2) {
    range.unshift('...' as any)
  }
  if (current + delta < total - 1) {
    range.push('...' as any)
  }
  
  range.unshift(1)
  if (total !== 1) {
    range.push(total)
  }
  
  return range.filter((item, index) => range.indexOf(item) === index)
})

// 获取城市对应的颜色样式
const getCityColor = (city: string) => {
  const cityColors = {
    // 中文城市名
    '普隆德拉': 'bg-blue-100 text-blue-800',      // 蓝色 - 首都
    '依斯鲁得': 'bg-green-100 text-green-800',    // 绿色 - 沙漠城市  
    '梦洛克': 'bg-purple-100 text-purple-800',     // 紫色 - 魔法城市
    '艾尔贝塔': 'bg-indigo-100 text-indigo-800',  // 靛蓝 - 港口城市
    '斐扬': 'bg-orange-100 text-orange-800',       // 橙色 - 森林城市
    '吉芬': 'bg-red-100 text-red-800',            // 红色 - 工业城市
    
    // 英文城市名
    'Prontera': 'bg-blue-100 text-blue-800',      // 蓝色 - 首都
    'Izlude': 'bg-green-100 text-green-800',      // 绿色 - 沙漠城市  
    'Morocc': 'bg-purple-100 text-purple-800',    // 紫色 - 魔法城市
    'Alberta': 'bg-indigo-100 text-indigo-800',   // 靛蓝 - 港口城市
    'Payon': 'bg-orange-100 text-orange-800',     // 橙色 - 森林城市
    'Geffen': 'bg-red-100 text-red-800'          // 红色 - 工业城市
  }
  return cityColors[city as keyof typeof cityColors] || 'bg-gray-100 text-gray-800'
}

// 方法
const resetFilters = () => {
  selectedCity.value = ''
  selectedPosition.value = ''
  searchAttribute.value = ''
  currentPage.value = 1
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 监听筛选条件变化，重置页码
watch([selectedCity, selectedPosition, searchAttribute], () => {
  currentPage.value = 1
})

// 页面加载时获取数据
onMounted(() => {
  loadEnchants()
})

// 监听语言变化，重新加载数据
watch(() => i18nStore.currentLocale, () => {
  loadEnchants()
})
</script>