<template>
  <header class="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo和标题 -->
        <div class="flex items-center space-x-4">
          <div class="text-white font-bold text-lg">
            {{ $t('common.siteTitle') }}
          </div>
          <div class="hidden md:block text-purple-200 text-sm">
            v2.0
          </div>
        </div>
        
        <!-- 右侧操作区 -->
        <div class="flex items-center space-x-4">
          <!-- 语言选择器 -->
          <LanguageSelector />
          
          <!-- 主题切换 -->
          <button 
            class="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            @click="toggleTheme"
          >
            <SunIcon v-if="isDark" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>
          
          <!-- 移动端菜单按钮 -->
          <button 
            class="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            @click="toggleMobileMenu"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div 
      v-if="mobileMenuOpen" 
      class="md:hidden bg-purple-700 border-t border-purple-500"
    >
      <div class="px-4 py-2 space-y-1">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="block px-3 py-2 text-white hover:bg-purple-600 rounded-lg transition-colors"
          @click="mobileMenuOpen = false"
        >
          {{ $t(`navigation.${item.key}`) }}
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import LanguageSelector from '@/components/common/LanguageSelector.vue'
import type { MenuItem } from '@/types'

const mobileMenuOpen = ref(false)
const isDark = ref(false)

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

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // TODO: 实现主题切换逻辑
}
</script>