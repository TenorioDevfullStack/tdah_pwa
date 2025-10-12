
'use client'
import { idbGet, idbSet } from './idb'

const KEYS = [
  'tasks',
  'study_topics',
  'study_history',
  'finance_items',
  'quick_notes',
  'pomodoro_settings',
  'habits_list',
  'habits_checks',
]

function migrateOnce(){
  if (typeof window === 'undefined') return
  try{
    const done = localStorage.getItem('idb_migrated') === '1'
    if (done) return
    // Best-effort: copia chaves conhecidas para IDB
    KEYS.forEach(async (k) => {
      const raw = localStorage.getItem(k)
      if (raw){
        try{ await idbSet(k, JSON.parse(raw)) }catch{}
      }
    })
    localStorage.setItem('idb_migrated','1')
  }catch{}
}

migrateOnce()

export function load(key, fallback){
  if (typeof window === 'undefined') return fallback
  try{
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  }catch(e){ return fallback }
}
export function save(key, value){
  if (typeof window === 'undefined') return
  try{
    localStorage.setItem(key, JSON.stringify(value))
  }catch(e){}
  // grava também no IndexedDB em background
  idbSet(key, value).catch(()=>{})
}

// utilitários opcionais
export async function exportAll(){
  const out = {}
  for (const k of KEYS){
    const v = await idbGet(k)
    if (v !== null && v !== undefined) out[k] = v
  }
  return out
}
