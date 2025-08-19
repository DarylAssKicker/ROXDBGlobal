<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <NavHeader />
    
    <!-- 主要内容区域 -->
    <div class="flex mx-auto px-4 py-6" style="max-width: 1380px;">
      <!-- 侧边栏 -->
      <aside class="w-64 mr-6">
        <SideNavigation />
      </aside>
      
      <!-- 内容区域 -->
      <main class="flex-1 min-w-0">
        <Suspense>
          <template #default>
            <RouterView />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center h-64">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
            </div>
          </template>
        </Suspense>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavHeader from '@/components/layout/NavHeader.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import { useI18nStore } from '@/stores/i18n'

const i18nStore = useI18nStore()

onMounted(() => {
  // 初始化国际化
  i18nStore.initialize()
})
</script>

<style scoped>
/* 响应式布局 */
@media (max-width: 1024px) {
  .flex {
    flex-direction: column;
  }
  
  aside {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1.5rem;
  }
}
</style>