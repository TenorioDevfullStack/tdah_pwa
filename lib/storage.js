
'use client'
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
  }catch(e){/* ignore */}
}
