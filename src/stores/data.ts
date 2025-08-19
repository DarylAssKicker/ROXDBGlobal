import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Monster, Card, Equipment, Character } from '@/types'

export const useDataStore = defineStore('data', () => {
  // 状态
  const monsters = ref<Monster[]>([])
  const cards = ref<Card[]>([])
  const equipment = ref<Equipment[]>([])
  const characters = ref<Character[]>([])
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性
  const monstersCount = computed(() => monsters.value.length)
  const cardsCount = computed(() => cards.value.length)
  const equipmentCount = computed(() => equipment.value.length)
  const charactersCount = computed(() => characters.value.length)
  
  // 方法
  const setLoading = (value: boolean) => {
    loading.value = value
  }
  
  const setError = (message: string | null) => {
    error.value = message
  }
  
  const setMonsters = (data: Monster[]) => {
    monsters.value = data
  }
  
  const setCards = (data: Card[]) => {
    cards.value = data
  }
  
  const setEquipment = (data: Equipment[]) => {
    equipment.value = data
  }
  
  const setCharacters = (data: Character[]) => {
    characters.value = data
  }
  
  // 获取单个数据项
  const getMonsterById = (id: number) => {
    return monsters.value.find(monster => monster.id === id)
  }
  
  const getCardByName = (name: string) => {
    return cards.value.find(card => card.name === name)
  }
  
  const getEquipmentById = (id: number) => {
    return equipment.value.find(item => item.id === id)
  }
  
  // 筛选方法
  const filterMonsters = (filters: {
    level?: [number, number]
    shape?: string
    attribute?: string
    race?: string
    name?: string
  }) => {
    return monsters.value.filter(monster => {
      if (filters.level && (monster.level < filters.level[0] || monster.level > filters.level[1])) {
        return false
      }
      if (filters.shape && monster.shape !== filters.shape) {
        return false
      }
      if (filters.attribute && monster.attribute !== filters.attribute) {
        return false
      }
      if (filters.race && monster.race !== filters.race) {
        return false
      }
      if (filters.name && !monster.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false
      }
      return true
    })
  }
  
  const filterCards = (filters: {
    position?: number | string
    quality?: number | string
    type?: string
    effect?: string
  }) => {
    return cards.value.filter(card => {
      if (filters.position && card.position !== Number(filters.position)) {
        return false
      }
      if (filters.quality && card.quality !== Number(filters.quality)) {
        return false
      }
      if (filters.type && !card.type.includes(filters.type)) {
        return false
      }
      if (filters.effect && !card.effect.toLowerCase().includes(filters.effect.toLowerCase())) {
        return false
      }
      return true
    })
  }
  
  // 清除数据
  const clearAll = () => {
    monsters.value = []
    cards.value = []
    equipment.value = []
    characters.value = []
    error.value = null
  }
  
  return {
    // 状态
    monsters: computed(() => monsters.value),
    cards: computed(() => cards.value),
    equipment: computed(() => equipment.value),
    characters: computed(() => characters.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // 计算属性
    monstersCount,
    cardsCount,
    equipmentCount,
    charactersCount,
    
    // 方法
    setLoading,
    setError,
    setMonsters,
    setCards,
    setEquipment,
    setCharacters,
    getMonsterById,
    getCardByName,
    getEquipmentById,
    filterMonsters,
    filterCards,
    clearAll
  }
})