import { createI18n } from 'vue-i18n'
import type { I18nOptions } from 'vue-i18n'

// 导入语言包
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
// import esES from './locales/es-ES.json'
// import jaJP from './locales/ja-JP.json'
import ptBR from './locales/pt-BR.json'

// 支持的语言列表
export const SUPPORTED_LOCALES = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'pt-BR', label: 'Português' }
]

// 获取浏览器默认语言
const getDefaultLocale = (): string => {
  const stored = localStorage.getItem('rox-locale')
  if (stored && SUPPORTED_LOCALES.find(l => l.value === stored)) {
    return stored
  }
  
  const browserLang = navigator.language
  const supported = SUPPORTED_LOCALES.find(l => 
    browserLang.startsWith(l.value.split('-')[0])
  )
  
  return supported?.value || 'en-US'
}

const options: I18nOptions = {
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
    // 'es-ES': esES,
    // 'ja-JP': jaJP,
    'pt-BR': ptBR
  },
  globalInjection: true,
  warnHtmlMessage: false
}

export const i18n = createI18n(options)

export default i18n