<template>
  <div class="card">
    
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
    </div>
    
    <!-- 表格内容 -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="table-header">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-center text-xs font-medium tracking-wider cursor-pointer"
              :class="{ 'w-0': column.width === 'auto' }"
              :style="{ width: column.width }"
              @click="column.sortable && sort(column.key)"
            >
              <div class="flex items-center justify-center space-x-1">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUpIcon 
                    class="h-3 w-3"
                    :class="{ 'text-white': sortKey === column.key && sortOrder === 'asc', 'text-gray-400': !(sortKey === column.key && sortOrder === 'asc') }"
                  />
                  <ChevronDownIcon 
                    class="h-3 w-3 -mt-1"
                    :class="{ 'text-white': sortKey === column.key && sortOrder === 'desc', 'text-gray-400': !(sortKey === column.key && sortOrder === 'desc') }"
                  />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            class="table-row hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-sm text-center"
              :class="{ 'whitespace-nowrap': column.key !== 'effect', 'whitespace-normal': column.key === 'effect' }"
              :style="column.key === 'effect' ? 'vertical-align: top; min-height: 3rem;' : 'vertical-align: middle;'"
            >
              <!-- 自定义渲染插槽 -->
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :column="column"
              >
                <!-- 默认渲染 -->
                <template v-if="column.render">
                  <div v-html="column.render(row)"></div>
                </template>
                <template v-else>
                  {{ row[column.key] }}
                </template>
              </slot>
            </td>
          </tr>
          
          <!-- 空状态 -->
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-gray-500">
              <div class="flex flex-col items-center">
                <DocumentMagnifyingGlassIcon class="h-12 w-12 text-gray-300 mb-2" />
                <span>{{ $t('common.noData') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页控件 -->
    <div v-if="!loading && total > pageSize" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div class="text-sm text-gray-700">
        {{ $t('common.page', { current: currentPage, total: totalPages }) }}
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
        
        <!-- 页码 -->
        <div class="flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="px-3 py-2 text-sm rounded-lg transition-colors"
            :class="{ 
              'bg-primary-500 text-white': page === currentPage,
              'text-gray-700 hover:bg-gray-100': page !== currentPage
            }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRightIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import type { TableColumn } from '@/types'

interface Props {
  title: string
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pageSize: 15
})

const emit = defineEmits<{
  refresh: []
  search: [query: string]
}>()

const searchQuery = ref('')
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

const filteredData = computed(() => {
  let result = [...props.data]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(query)
      )
    )
  }
  
  // 排序
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
      } else {
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        if (sortOrder.value === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      }
    })
  }
  
  return result
})

const total = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(total.value / props.pageSize))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage.value - half)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const sort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 搜索变化时重置页码
watch(searchQuery, () => {
  currentPage.value = 1
  emit('search', searchQuery.value)
})

// 数据变化时重置页码
watch(() => props.data, () => {
  currentPage.value = 1
})
</script>