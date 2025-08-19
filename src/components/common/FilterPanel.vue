<template>
  <div class="card p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7 gap-3 items-end">
      <!-- 动态渲染筛选器 -->
      <div
        v-for="filter in filters"
        :key="filter.key"
        :class="[
          filter.type === 'range' && filter.label ? 'flex items-center space-x-2' : 'space-y-1',
          filter.type === 'range' && filter.label ? 'col-span-2' : 'col-span-1'
        ]"
      >
        <label 
          v-if="filter.label && filter.type !== 'range'" 
          class="block text-xs font-medium text-gray-700"
        >
          {{ filter.label }}
        </label>
        
        <label 
          v-if="filter.label && filter.type === 'range'" 
          class="text-xs font-medium text-gray-700 flex-shrink-0"
        >
          {{ filter.label }}:
        </label>
        
        <!-- 选择框 -->
        <select
          v-if="filter.type === 'select'"
          :value="modelValue[filter.key]"
          @change="updateSelectFilter(filter.key, ($event.target as HTMLSelectElement).value)"
          class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{{ filter.placeholder }}</option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        
        <!-- 文本输入框 -->
        <input
          v-else-if="filter.type === 'text'"
          :value="modelValue[filter.key]"
          @input="updateFilter(filter.key, ($event.target as HTMLInputElement).value)"
          :placeholder="Array.isArray(filter.placeholder) ? filter.placeholder[0] : filter.placeholder"
          class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
        
        <!-- 数字范围 -->
        <div v-else-if="filter.type === 'range'" class="flex items-center space-x-1 flex-1">
          <input
            :value="modelValue[filter.key]?.[0] || ''"
            @input="updateRangeFilter(filter.key, ($event.target as HTMLInputElement).value, 0)"
            :placeholder="filter.placeholder?.[0] || '最小值'"
            type="number"
            class="w-16 flex-1 min-w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          >
          <span class="text-gray-500 text-xs flex-shrink-0">-</span>
          <input
            :value="modelValue[filter.key]?.[1] || ''"
            @input="updateRangeFilter(filter.key, ($event.target as HTMLInputElement).value, 1)"
            :placeholder="filter.placeholder?.[1] || '最大值'"
            type="number"
            class="w-16 flex-1 min-w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          >
        </div>
        
        <!-- 多选框 -->
        <div v-else-if="filter.type === 'checkbox'" class="space-y-1">
          <label
            v-for="option in filter.options"
            :key="option.value"
            class="flex items-center"
          >
            <input
              :checked="(modelValue[filter.key] || []).includes(option.value)"
              @change="updateCheckboxFilter(filter.key, option.value, ($event.target as HTMLInputElement).checked)"
              type="checkbox"
              class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <span class="ml-1 text-xs text-gray-700">{{ option.label }}</span>
          </label>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex space-x-1 col-span-1">
        <button
          @click="clearFilters"
          class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
        >
          {{ $t('common.reset') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FilterOption, FilterConfig } from '@/types'

interface Props {
  filters: FilterConfig[]
  modelValue: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'apply': [filters: Record<string, any>]
}>()

const localFilters = reactive({ ...props.modelValue })

const updateFilter = (key: string, value: string) => {
  localFilters[key] = value || undefined
  emit('update:modelValue', { ...localFilters })
}

const updateSelectFilter = (key: string, value: string) => {
  localFilters[key] = value || undefined
  emit('update:modelValue', { ...localFilters })
  
  // 选择框立即应用筛选
  const cleanFilters = Object.fromEntries(
    Object.entries(localFilters).filter(([, value]) => value !== undefined)
  )
  emit('apply', cleanFilters)
}

const updateRangeFilter = (key: string, value: string, index: number) => {
  if (!localFilters[key]) {
    localFilters[key] = [undefined, undefined]
  }
  localFilters[key][index] = value ? Number(value) : undefined
  
  // 清理空数组
  if (!localFilters[key][0] && !localFilters[key][1]) {
    localFilters[key] = undefined
  }
  
  emit('update:modelValue', { ...localFilters })
}

const updateCheckboxFilter = (key: string, value: string | number, checked: boolean) => {
  if (!localFilters[key]) {
    localFilters[key] = []
  }
  
  if (checked) {
    if (!localFilters[key].includes(value)) {
      localFilters[key].push(value)
    }
  } else {
    const index = localFilters[key].indexOf(value)
    if (index > -1) {
      localFilters[key].splice(index, 1)
    }
  }
  
  // 清理空数组
  if (localFilters[key].length === 0) {
    localFilters[key] = undefined
  }
  
  emit('update:modelValue', { ...localFilters })
}

const clearFilters = () => {
  // 清空所有筛选器
  Object.keys(localFilters).forEach(key => {
    delete localFilters[key]
  })
  
  // 重新初始化为空对象
  Object.assign(localFilters, {})
  
  // 发出更新事件
  emit('update:modelValue', {})
  
  // 立即应用清空的筛选器
  emit('apply', {})
}

const applyFilters = () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(localFilters).filter(([, value]) => value !== undefined)
  )
  emit('apply', cleanFilters)
}

// 同步外部变更
watch(() => props.modelValue, (newValue) => {
  Object.assign(localFilters, newValue)
}, { deep: true })
</script>