<template>
  <div class="space-y-6">

    
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
        :title="$t('card.title')"
        :data="filteredCards"
        :columns="columns"
        :loading="loading"
        @refresh="loadCards"
      >
        <template #cell-name="{ row }">
          <div class="text-center">
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
        
        <template #cell-quality="{ value }">
          <span 
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="getQualityColor(value)"
          >
            {{ getQualityText(value) }}
          </span>
        </template>
        
        <template #cell-position="{ value }">
          <span 
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="getPositionColor(value)"
          >
            {{ getPositionText(value) }}
          </span>
        </template>
        
        <template #cell-type="{ value }">
          {{ getTypeText(value) }}
        </template>
        
        <template #cell-effect="{ value, row }">
          <div 
            class="whitespace-pre-line" 
            :title="`原始值: ${value}`"
            :style="{
              'min-height': '2.5rem',
              'line-height': '1.4',
              'word-wrap': 'break-word',
              'display': 'flex',
              'align-items': value.includes('|') ? 'flex-start' : 'center',
              'justify-content': 'center'
            }"
          >
            {{ value.replace(/\|/g, '\n') }}
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
import type { Card, TableColumn, CardFilter, FilterConfig } from '@/types'

const dataStore = useDataStore()
const i18nStore = useI18nStore()

const loading = ref(true)
const filters = reactive<CardFilter>({})

// 表格列配置
const { t } = useI18n()
const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('card.columns.name'), width: '200px' },
  { key: 'position', label: t('card.columns.position'), width: '100px' },
  { key: 'quality', label: t('card.columns.quality'), width: '80px' },
  { key: 'type', label: t('card.columns.type'), width: '100px' },
  { key: 'effect', label: t('card.columns.effect'), width: '400px' }
])

// 筛选器配置
const filterConfig = computed(() => [
  {
    key: 'position',
    label: t('card.filters.position'),
    type: 'select' as const,
    placeholder: t('card.filters.selectPosition'),
    options: [
      { value: 1, label: t('game.CardPosition1') },
      { value: 2, label: t('game.CardPosition2') },
      { value: 3, label: t('game.CardPosition3') },
      { value: 4, label: t('game.CardPosition4') },
      { value: 5, label: t('game.CardPosition5') },
      { value: 6, label: t('game.CardPosition6') }
    ]
  },
  {
    key: 'quality',
    label: t('card.filters.quality'),
    type: 'select' as const,
    placeholder: t('card.filters.selectQuality'),
    options: [
      { value: 1, label: t('game.CardQuality1') },
      { value: 2, label: t('game.CardQuality2') },
      { value: 3, label: t('game.CardQuality3') },
      { value: 4, label: t('game.CardQuality4') }
    ]
  }
])

const filteredCards = computed(() => {
  return dataStore.filterCards(filters)
})

const getQualityColor = (quality: number) => {
  const colors = {
    1: 'bg-gray-100 text-gray-800',    // 白卡
    2: 'bg-blue-100 text-blue-800',    // 蓝卡
    3: 'bg-purple-100 text-purple-800', // 精英蓝卡（原金卡样式）
    4: 'bg-orange-100 text-orange-800'  // 金卡（原精英蓝卡样式）
  }
  return colors[quality as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getPositionColor = (position: number) => {
  const colors = {
    1: 'bg-red-100 text-red-800',      // 头部
    2: 'bg-green-100 text-green-800',  // 身体
    3: 'bg-blue-100 text-blue-800',    // 左手
    4: 'bg-yellow-100 text-yellow-800', // 右手
    5: 'bg-indigo-100 text-indigo-800', // 披肩
    6: 'bg-pink-100 text-pink-800'     // 鞋子
  }
  return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getQualityText = (quality: number) => {
  return i18nStore.t(`game.CardQuality${quality}`) || i18nStore.t('common.unknown')
}

const getPositionText = (position: number) => {
  return i18nStore.t(`game.CardPosition${position}`) || i18nStore.t('common.unknown')
}

const getTypeText = (type: string) => {
  // 处理多个类型的情况，如 "1,4"
  if (type.includes(',')) {
    return type.split(',').map(t => {
      const typeKey = `game.CardType${t.trim()}`
      return i18nStore.t(typeKey) || t
    }).join(',')
  }
  const typeKey = `game.CardType${type}`
  return i18nStore.t(typeKey) || type
}


const applyFilters = (newFilters: CardFilter) => {
  // 清空现有的筛选器
  Object.keys(filters).forEach(key => {
    delete (filters as any)[key]
  })
  
  // 设置新的筛选器
  Object.assign(filters, newFilters)
}

const loadCards = async () => {
  loading.value = true
  try {
    // 从本地JSON文件加载数据
    const response = await import('@/data/cards.json')
    const cardsData = response.default
    
    // 转换数据格式并应用翻译
    const cards = cardsData.map((item: any) => ({
      id: item.id,
      name: i18nStore.t(`game.${item.name}`) || item.name,
      position: item.position,
      quality: item.quality,
      type: item.type,
      effect: i18nStore.t(`game.${item.effect}`) || item.effect
    }))
    
    dataStore.setCards(cards)
  } catch (error) {
    console.error('Failed to load cards:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCards()
})

// 监听语言变化，重新加载数据
watch(() => i18nStore.currentLocale, () => {
  loadCards()
})
</script>