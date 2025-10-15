
'use client'
import { useEffect, useState } from 'react'
import { load, save } from '@/lib/storage'
import { useI18n } from '@/components/I18nProvider'

export default function QuickNotes(){
  const { messages } = useI18n()
  const copy = messages.quickNotes
  const [text, setText] = useState(load('quick_notes', ''))
  useEffect(()=> save('quick_notes', text), [text])
  return (
    <div className="card">
      <h3>{copy.title}</h3>
      <textarea className="input" style={{width:'100%',minHeight:150}} value={text} onChange={e=>setText(e.target.value)} placeholder={copy.placeholder}></textarea>
      <div className="small">{copy.helper}</div>
    </div>
  )
}
