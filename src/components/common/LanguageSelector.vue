<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
    >
      <span class="text-lg">{{ currentLanguage?.flag }}</span>
      <span class="hidden md:block">{{ currentLanguage?.label }}</span>
      <ChevronDownIcon class="h-4 w-4" />
    </button>
    
    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <button
          v-for="language in availableLocales"
          :key="language.value"
          @click="selectLanguage(language.value)"
          class="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
          :class="{ 'bg-primary-50 text-primary-600': language.value === currentLocale }"
        >
          <span class="text-lg">{{ language.flag }}</span>
          <span class="font-medium">{{ language.label }}</span>
          <CheckIcon 
            v-if="language.value === currentLocale" 
            class="h-4 w-4 ml-auto text-primary-500"
          />
        </button>
      </div>
    </Transition>
    
    <!-- 点击外部关闭 -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useI18nStore } from '@/stores/i18n'

const i18nStore = useI18nStore()
const isOpen = ref(false)

const currentLocale = computed(() => i18nStore.currentLocale)
const currentLanguage = computed(() => i18nStore.currentLanguage)
const availableLocales = computed(() => i18nStore.availableLocales)

const selectLanguage = (locale: string) => {
  i18nStore.setLocale(locale)
  isOpen.value = false
}

// ESC键关闭菜单
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>