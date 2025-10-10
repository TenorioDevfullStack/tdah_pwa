
'use client'
import { useEffect, useState } from 'react'
import { load, save } from '@/lib/storage'

export default function QuickNotes(){
  const [text, setText] = useState(load('quick_notes', ''))
  useEffect(()=> save('quick_notes', text), [text])
  return (
    <div className="card">
      <h3>Notas rápidas</h3>
      <textarea className="input" style={{width:'100%',minHeight:150}} value={text} onChange={e=>setText(e.target.value)} placeholder="Escreva lembretes, pensamentos ou ideias..."></textarea>
      <div className="small">Conteúdo salvo automaticamente no seu dispositivo.</div>
    </div>
  )
}
