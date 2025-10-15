
'use client'
import { useEffect, useState } from 'react'
import { load, save } from '@/lib/storage'
import { useI18n } from '@/components/I18nProvider'

export default function StudyPlanner(){
  const { messages } = useI18n()
  const copy = messages.study
  const [topics, setTopics] = useState(load('study_topics', []))
  const [session, setSession] = useState({topic:'', minutes:30, note:''})
  const [history, setHistory] = useState(load('study_history', []))

  useEffect(()=> save('study_topics', topics), [topics])
  useEffect(()=> save('study_history', history), [history])

  function addTopic(e){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const t = (form.get('topic')||'').toString().trim()
    if(!t) return
    if(!topics.includes(t)) setTopics(prev => [t, ...prev])
    setSession({...session, topic: t})
    e.currentTarget.reset()
  }

  function logSession(){
    if(!session.topic) return
    const entry = { ...session, id: Date.now(), date: new Date().toISOString() }
    setHistory(prev => [entry, ...prev])
  }

  return (
    <div className="card">
      <h3>{copy.title}</h3>
      <form onSubmit={addTopic} className="row">
        <input className="input" name="topic" placeholder={copy.addPlaceholder}/>
        <button className="button primary">{copy.addButton}</button>
      </form>

      <div className="row" style={{marginTop:8}}>
        <select className="select" value={session.topic} onChange={e=>setSession({...session,topic:e.target.value})}>
          <option value="">{copy.selectPlaceholder}</option>
          {topics.map(t => <option key={t}>{t}</option>)}
        </select>
        <input className="input" type="number" min="5" value={session.minutes} onChange={e=>setSession({...session,minutes:parseInt(e.target.value||'30')})} aria-label={copy.minutesLabel}/>
        <input className="input" placeholder={copy.notesPlaceholder} value={session.note} onChange={e=>setSession({...session,note:e.target.value})}/>
        <button className="button primary" onClick={logSession} type="button">{copy.logButton}</button>
      </div>

      <div className="list">
        {history.map(h => (
          <div key={h.id} className="item">
            <div>
              <div style={{fontWeight:600}}>{h.topic} • {h.minutes} min</div>
              <div className="small">{new Date(h.date).toLocaleString()} • {h.note||copy.emptyNote}</div>
            </div>
          </div>
        ))}
        {!history.length && <div className="notice small">{copy.emptyHistory}</div>}
      </div>
    </div>
  )
}
