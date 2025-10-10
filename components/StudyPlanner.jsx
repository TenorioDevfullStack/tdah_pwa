
'use client'
import { useEffect, useState } from 'react'
import { load, save } from '@/lib/storage'

export default function StudyPlanner(){
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
      <h3>Estudos</h3>
      <form onSubmit={addTopic} className="row">
        <input className="input" name="topic" placeholder="Adicionar tópico (ex.: Cálculo, JS, NBR 5410)"/>
        <button className="button">Adicionar tópico</button>
      </form>

      <div className="row" style={{marginTop:8}}>
        <select className="select" value={session.topic} onChange={e=>setSession({...session,topic:e.target.value})}>
          <option value="">Selecione um tópico</option>
          {topics.map(t => <option key={t}>{t}</option>)}
        </select>
        <input className="input" type="number" min="5" value={session.minutes} onChange={e=>setSession({...session,minutes:parseInt(e.target.value||'30')})}/>
        <input className="input" placeholder="Anotações" value={session.note} onChange={e=>setSession({...session,note:e.target.value})}/>
        <button className="button" onClick={logSession} type="button">Registrar sessão</button>
      </div>

      <div className="list">
        {history.map(h => (
          <div key={h.id} className="item">
            <div>
              <div style={{fontWeight:600}}>{h.topic} • {h.minutes} min</div>
              <div className="small">{new Date(h.date).toLocaleString()} • {h.note||'Sem notas'}</div>
            </div>
          </div>
        ))}
        {!history.length && <div className="notice small">Nenhuma sessão registrada ainda.</div>}
      </div>
    </div>
  )
}
