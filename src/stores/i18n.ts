import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES } from '@/i18n'

export const useI18nStore = defineStore('i18n', () => {
  const { locale, t } = useI18n()
  
  const currentLocale = ref(locale.value)
  
  // 计算属性
  const currentLanguage = computed(() => {
    return SUPPORTED_LOCALES.find(lang => lang.value === currentLocale.value)
  })
  
  const availableLocales = computed(() => SUPPORTED_LOCALES)
  
  // 方法
  const setLocale = (newLocale: string) => {
    if (SUPPORTED_LOCALES.find(lang => lang.value === newLocale)) {
      currentLocale.value = newLocale
      locale.value = newLocale
      localStorage.setItem('rox-locale', newLocale)
      
      // 更新页面语言属性
      document.documentElement.lang = newLocale
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('locale-changed', {
        detail: { locale: newLocale }
      }))
    }
  }
  
  const initialize = () => {
    // 从本地存储获取语言设置
    const stored = localStorage.getItem('rox-locale')
    if (stored && SUPPORTED_LOCALES.find(lang => lang.value === stored)) {
      setLocale(stored)
    }
    
    // 设置页面语言属性
    document.documentElement.lang = currentLocale.value
  }
  
  const getTranslation = (key: string, params?: Record<string, any>) => {
    return t(key, params || {})
  }
  
  return {
    currentLocale: computed(() => currentLocale.value),
    currentLanguage,
    availableLocales,
    setLocale,
    initialize,
    getTranslation,
    t
  }
})