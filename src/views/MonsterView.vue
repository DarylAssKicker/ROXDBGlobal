<template>
  <div class="space-y-4">
    
    <!-- 筛选面板 -->
    <div class="mb-4">
      <FilterPanel
        :filters="filterConfig"
        v-model="filters"
        @apply="applyFilters"
      />
    </div>
    
    <!-- 数据表格 -->
    <div>
      <DataTable
        :title="$t('monster.title')"
        :data="filteredMonsters"
        :columns="columns"
        :loading="loading"
        @refresh="loadMonsters"
      >
          <!-- 自定义渲染单元格 -->
          <template #cell-image="{ row }">
            <div class="flex justify-center">
              <img 
                :src="getMonsterImage(row.id)" 
                :alt="row.name"
                class="h-8 w-8 rounded-lg"
                @error="handleImageError"
              >
            </div>
          </template>
          
          <template #cell-name="{ row }">
            <div class="text-center">
              <span class="font-medium leading-5 h-5 flex items-center justify-center">{{ row.name }}</span>
            </div>
          </template>
          
          <template #cell-level="{ value }">
            <div class="text-center">
              <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Lv.{{ value }}
              </span>
            </div>
          </template>
          
          <template #cell-hp="{ value }">
            <div class="text-center">
              <span class="font-mono">{{ value }}</span>
            </div>
          </template>
          
          <template #cell-shape="{ value }">
            <div class="text-center">
              <span 
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getShapeColor(value)"
              >
                {{ value }}
              </span>
            </div>
          </template>
          
          <template #cell-attribute="{ value }">
            <div class="text-center">
              <span 
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getAttributeColor(value)"
              >
                {{ value }}
              </span>
            </div>
          </template>
          
          <template #cell-race="{ value }">
            <div class="text-center">
              <span>{{ value }}</span>
            </div>
          </template>
          
          <template #cell-baseExp="{ value }">
            <div class="text-center">
              <span class="font-mono text-green-600">
                {{ value?.toLocaleString() }}
              </span>
            </div>
          </template>
          
          <template #cell-jobExp="{ value }">
            <div class="text-center">
              <span class="font-mono text-purple-600">
                {{ value?.toLocaleString() }}
              </span>
            </div>
          </template>
        </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/common/DataTable.vue'
import FilterPanel from '@/components/common/FilterPanel.vue'
import { useDataStore } from '@/stores/data'
import { useI18nStore } from '@/stores/i18n'
import type { Monster, TableColumn, MonsterFilter } from '@/types'

const dataStore = useDataStore()
const i18nStore = useI18nStore()

const loading = ref(true)
const filters = reactive<MonsterFilter>({})

// 表格列配置
const { t } = useI18n()
const columns = computed<TableColumn[]>(() => [
  { key: 'image', label: t('monster.columns.monster'), width: '80px' },
  { key: 'name', label: t('monster.columns.name'), width: '150px' },
  { key: 'level', label: t('monster.columns.level'), sortable: true, width: '80px' },
  { key: 'hp', label: t('monster.columns.hp'), sortable: true, width: '100px' },
  { key: 'shape', label: t('monster.columns.shape'), width: '80px' },
  { key: 'attribute', label: t('monster.columns.attribute'), width: '80px' },
  { key: 'race', label: t('monster.columns.race'), width: '100px' },
  { key: 'baseExp', label: t('monster.columns.baseExp'), sortable: true, width: '120px' },
  { key: 'jobExp', label: t('monster.columns.jobExp'), sortable: true, width: '120px' }
])

// 筛选器配置
const filterConfig = computed(() => [
  {
    key: 'level',
    label: t('monster.filters.level'),
    type: 'range' as const,
    placeholder: [
      t('monster.filters.minLevel'),
      t('monster.filters.maxLevel')
    ]
  },
  {
    key: 'shape',
    label: '',
    type: 'select' as const,
    placeholder: t('monster.filters.selectShape'),
    options: [
      { value: '小体型', label: t('game.Size3') },
      { value: '中体型', label: t('game.Size2') },
      { value: '大体型', label: t('game.Size1') }
    ]
  },
  {
    key: 'attribute',
    label: '',
    type: 'select' as const,
    placeholder: t('monster.filters.selectAttribute'),
    options: [
      { value: t('game.Attr1'), label: t('game.Attr1') },
      { value: t('game.Attr2'), label: t('game.Attr2') },
      { value: t('game.Attr3'), label: t('game.Attr3') },
      { value: t('game.Attr4'), label: t('game.Attr4') },
      { value: t('game.Attr5'), label: t('game.Attr5') },
      { value: t('game.Attr6'), label: t('game.Attr6') },
      { value: t('game.Attr7'), label: t('game.Attr7') },
      { value: t('game.Attr8'), label: t('game.Attr8') },
      { value: t('game.Attr9'), label: t('game.Attr9') },
      { value: t('game.Attr10'), label: t('game.Attr10') }
    ]
  },
  {
    key: 'race',
    label: '',
    type: 'select' as const,
    placeholder: t('monster.filters.selectRace'),
    options: [
      { value: '天使', label: t('game.Race1') },
      { value: '恶魔', label: t('game.Race2') },
      { value: '无形', label: t('game.Race3') },
      { value: '昆虫', label: t('game.Race4') },
      { value: '鱼贝', label: t('game.Race5') },
      { value: '人形', label: t('game.Race6') },
      { value: '不死', label: t('game.Race7') },
      { value: '龙', label: t('game.Race8') },
      { value: '植物', label: t('game.Race9') },
      { value: '动物', label: t('game.Race10') }
    ]
  },
  {
    key: 'name',
    label: '',
    type: 'text' as const,
    placeholder: t('monster.filters.searchName')
  }
])

// 计算筛选后的数据
const filteredMonsters = computed(() => {
  return dataStore.filterMonsters(filters)
})

// 样式方法
const getShapeColor = (shape: string) => {
  const colors = {
    '小': 'bg-green-100 text-green-800',
    '中': 'bg-yellow-100 text-yellow-800',
    '大': 'bg-red-100 text-red-800'
  }
  return colors[shape as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getAttributeColor = (attribute: string) => {
  const colors = {
    // Chinese
    '无': 'bg-gray-100 text-gray-800',
    '水': 'bg-blue-100 text-blue-800',
    '地': 'bg-yellow-100 text-yellow-800',
    '火': 'bg-red-100 text-red-800',
    '风': 'bg-green-100 text-green-800',
    '毒': 'bg-purple-100 text-purple-800',
    '圣': 'bg-yellow-100 text-yellow-800',
    '暗': 'bg-gray-100 text-gray-800',
    '念': 'bg-indigo-100 text-indigo-800',
    '不死': 'bg-gray-100 text-gray-800',
    // English
    'None': 'bg-gray-100 text-gray-800',
    'Water': 'bg-blue-100 text-blue-800',
    'Earth': 'bg-yellow-100 text-yellow-800',
    'Fire': 'bg-red-100 text-red-800',
    'Wind': 'bg-green-100 text-green-800',
    'Poison': 'bg-purple-100 text-purple-800',
    'Holy': 'bg-yellow-100 text-yellow-800',
    'Shadow': 'bg-gray-100 text-gray-800',
    'Ghost': 'bg-indigo-100 text-indigo-800',
    'Undead': 'bg-gray-100 text-gray-800',
    // Spanish
    'Ninguno': 'bg-gray-100 text-gray-800',
    'Agua': 'bg-blue-100 text-blue-800',
    'Tierra': 'bg-yellow-100 text-yellow-800',
    'Fuego': 'bg-red-100 text-red-800',
    'Viento': 'bg-green-100 text-green-800',
    'Veneno': 'bg-purple-100 text-purple-800',
    'Sagrado': 'bg-yellow-100 text-yellow-800',
    'Sombra': 'bg-gray-100 text-gray-800',
    'Fantasma': 'bg-indigo-100 text-indigo-800',
    'No-muerto': 'bg-gray-100 text-gray-800',
    // Japanese
    '無': 'bg-gray-100 text-gray-800',
    '風': 'bg-green-100 text-green-800',
    '聖': 'bg-yellow-100 text-yellow-800',
    '闇': 'bg-gray-100 text-gray-800',
    'アンデッド': 'bg-gray-100 text-gray-800',
    // Portuguese  
    'Nenhum': 'bg-gray-100 text-gray-800',
    'Água': 'bg-blue-100 text-blue-800',
    'Terra': 'bg-yellow-100 text-yellow-800',
    'Fogo': 'bg-red-100 text-red-800',
    'Vento': 'bg-green-100 text-green-800',
    'Morto-vivo': 'bg-gray-100 text-gray-800'
  }
  return colors[attribute as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getMonsterImage = (id: number) => {
  return `/images/monster/${id}.png`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 如果图片加载失败，使用一个占位符
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNMTYgMjJDMTkuMzEzNyAyMiAyMiAxOS4zMTM3IDIyIDE2QzIyIDEyLjY4NjMgMTkuMzEzNyAxMCAxNiAxMEMxMi42ODYzIDEwIDEwIDEyLjY4NjMgMTAgMTZDMTAgMTkuMzEzNyAxMi42ODYzIDIyIDE2IDIyWiIgZmlsbD0iI0Q1RDlERiIvPgo8cGF0aCBkPSJNMTMuNSAxNEMxNC4zMjg0IDE0IDE1IDEzLjMyODQgMTUgMTIuNUMxNSAxMS42NzE2IDE0LjMyODQgMTEgMTMuNSAxMUMxMi42NzE2IDExIDEyIDExLjY3MTYgMTIgMTIuNUMxMiAxMy4zMjg0IDEyLjY3MTYgMTQgMTMuNSAxNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4LjUgMTRDMTkuMzI4NCAxNCAyMCAxMy4zMjg0IDIwIDEyLjVDMjAgMTEuNjcxNiAxOS4zMjg0IDExIDE4LjUgMTFDMTcuNjcxNiAxMSAxNyAxMS42NzE2IDE3IDEyLjVDMTcgMTMuMzI4NCAxNy42NzE2IDE0IDE4LjUgMTRaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNiAxOEMxNy4xMDQ2IDE4IDE4IDE3LjEwNDYgMTggMTZDMTggMTQuODk1NCAxNy4xMDQ2IDE0IDE2IDE0QzE0Ljg5NTQgMTQgMTQgMTQuODk1NCAxNCAxNkMxNCAxNy4xMDQ2IDE0Ljg5NTQgMTggMTYgMThaIiBmaWxsPSIjNjM3MUY2Ii8+Cjwvc3ZnPgo='
}

const applyFilters = (newFilters: MonsterFilter) => {
  // 清空现有的筛选器
  Object.keys(filters).forEach(key => {
    delete (filters as any)[key]
  })
  
  // 设置新的筛选器
  Object.assign(filters, newFilters)
}

// 加载数据
const loadMonsters = async () => {
  loading.value = true
  try {
    // 从本地JSON文件加载数据
    const response = await import('@/data/monsters.json')
    const monstersData = response.default
    
    // 转换数据格式并应用翻译
    const monsters: Monster[] = monstersData.map((item: any) => ({
      id: parseInt(item.id),
      name: i18nStore.t(`game.${item.name}`) || item.name,
      level: item.level,
      hp: item.hp,
      baseExp: item.base,
      jobExp: item.job,
      shape: i18nStore.t(`game.${item.size}`) || item.size,
      attribute: i18nStore.t(`game.${item.element}`) || item.element,
      race: i18nStore.t(`game.${item.race}`) || item.race
    }))
    
    dataStore.setMonsters(monsters)
  } catch (error) {
    console.error('Failed to load monsters:', error)
    dataStore.setError('加载魔物数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMonsters()
})

// 监听语言变化，重新加载数据
watch(() => i18nStore.currentLocale, () => {
  loadMonsters()
})
</script>