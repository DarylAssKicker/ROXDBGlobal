// 基础数据类型
export interface Monster {
  id: number
  name: string
  level: number
  hp: number
  shape: string
  attribute: string
  race: string
  baseExp: number
  jobExp: number
  image?: string
  location?: string
  drops?: string[]
}

export interface Card {
  id: number
  name: string
  position: number
  quality: number
  type: string
  effect: string
}

export interface Equipment {
  id: number
  name: string
  type: string
  level: number
  job: string[]
  attack?: number
  matk?: number
  def?: number
  mdef?: number
  weight: number
  slots: number
  materials?: Material[]
  image?: string
}

export interface Material {
  name: string
  quantity: number
  image?: string
}

export interface Character {
  id: number
  name: string
  type: string
  description: string
  skills: Skill[]
  image?: string
}

export interface Skill {
  id: number
  name: string
  type: string
  maxLevel: number
  description: string
  effects: SkillEffect[]
  requirements?: SkillRequirement[]
  image?: string
}

export interface SkillEffect {
  level: number
  damage?: number
  duration?: number
  cooldown?: number
  cost?: number
  description: string
}

export interface SkillRequirement {
  skillId: number
  level: number
}

export interface Enchant {
  id: number
  name: string
  city: string
  position: string
  effect: string
  materials: Material[]
  cost: number
}

export interface OXQuestion {
  id: number
  question: string
  answer: boolean
  category?: string
}

// UI组件相关类型
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (row: any) => string
}

export interface FilterOption {
  value: string | number
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'text' | 'range' | 'checkbox'
  placeholder?: string | string[]
  options?: FilterOption[]
}

export interface PaginationInfo {
  current: number
  total: number
  pageSize: number
}

// 筛选器类型
export interface MonsterFilter {
  level?: [number, number]
  shape?: string
  attribute?: string
  race?: string
  name?: string
}

export interface CardFilter {
  position?: number
  quality?: number
  type?: string
  effect?: string
}

export interface EquipmentFilter {
  level?: [number, number]
  type?: string
  job?: string[]
  name?: string
}

// API相关类型
export interface ApiResponse<T> {
  data: T
  message?: string
  code?: number
}

export interface LoadingState {
  loading: boolean
  error: string | null
}

// 语言相关类型
export interface Language {
  value: string
  label: string
  flag: string
}

// 路由Meta类型
export interface RouteMeta {
  title: string
  requiresAuth?: boolean
  hideInMenu?: boolean
}

// 菜单项类型
export interface MenuItem {
  key: string
  label: string
  icon: string
  path: string
  children?: MenuItem[]
}

// 主题类型
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}