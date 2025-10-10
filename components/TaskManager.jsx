
'use client'
import { useEffect, useMemo, useState } from 'react'
import { load, save } from '@/lib/storage'

function uid(){ return Math.random().toString(36).slice(2) }

const priorities = ['Baixa','Média','Alta']
const areas = ['Geral','Estudos','Trabalho','Saúde','Casa','Financeiro']

export default function TaskManager(){
  const [tasks, setTasks] = useState(load('tasks', []))
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [sort, setSort] = useState('data')

  useEffect(()=>{ save('tasks', tasks) }, [tasks])

  function addTask(e){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const t = {
      id: uid(),
      title: (form.get('title')||'').toString().trim(),
      due: (form.get('due')||'').toString(),
      priority: (form.get('priority')||'Média').toString(),
      area: (form.get('area')||'Geral').toString(),
      done: false,
      createdAt: Date.now()
    }
    if(!t.title) return
    setTasks(prev => [t, ...prev])
    e.currentTarget.reset()
  }

  function toggle(id){ setTasks(prev => prev.map(t => t.id===id ? {...t, done: !t.done} : t)) }
  function del(id){ setTasks(prev => prev.filter(t => t.id!==id)) }

  const view = useMemo(()=>{
    const now = new Date().toISOString().slice(0,10)
    let list = tasks.filter(t => t.title.toLowerCase().includes(q.toLowerCase()))
    if(filter==='Hoje'){ list = list.filter(t => t.due===now) }
    if(filter==='Pendentes'){ list = list.filter(t => !t.done) }
    if(filter==='Concluídas'){ list = list.filter(t => t.done) }
    if(sort==='prioridade'){
      const order = {'Alta':0,'Média':1,'Baixa':2}
      list = list.slice().sort((a,b)=> order[a.priority]-order[b.priority])
    }else if(sort==='data'){
      list = list.slice().sort((a,b)=> (a.due||'').localeCompare(b.due||''))
    }else{
      list = list.slice().sort((a,b)=> b.createdAt - a.createdAt)
    }
    return list
  }, [tasks,q,filter,sort])

  // Simple notification when a task is due "today" on load
  useEffect(()=>{
    if (typeof window==='undefined') return
    if ('Notification' in window && Notification.permission==='default'){
      Notification.requestPermission().catch(()=>{})
    }
    const today = new Date().toISOString().slice(0,10)
    const dueToday = tasks.filter(t => t.due===today && !t.done)
    if(dueToday.length && 'Notification' in window && Notification.permission==='granted'){
      new Notification('Tarefas para hoje', { body: dueToday.map(t=>t.title).join(', ') })
    }
  }, [])

  return (
    <div className="card">
      <h3>Tarefas</h3>
      <form onSubmit={addTask} className="row">
        <input className="input" name="title" placeholder="Nova tarefa..." style={{flex:1,minWidth:200}} />
        <input className="input" name="due" type="date" />
        <select className="select" name="priority">{priorities.map(p=><option key={p}>{p}</option>)}</select>
        <select className="select" name="area">{areas.map(a=><option key={a}>{a}</option>)}</select>
        <button className="button">Adicionar</button>
      </form>

      <div className="row" style={{marginTop:8}}>
        <input className="input" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
        <select className="select" value={filter} onChange={e=>setFilter(e.target.value)}>
          {['Todas','Pendentes','Concluídas','Hoje'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="select" value={sort} onChange={e=>setSort(e.target.value)}>
          {['data','prioridade','criação'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="list">
        {view.map(t => (
          <div className="item" key={t.id}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={t.done} onChange={()=>toggle(t.id)} />
              <div>
                <div style={{fontWeight:600}}>{t.title}</div>
                <div className="small">Venc: {t.due||'—'} • <span className="badge">{t.priority}</span> • <span className="badge">{t.area}</span></div>
              </div>
            </div>
            <div className="row">
              <button className="button" onClick={()=>toggle(t.id)}>{t.done?'Reabrir':'Concluir'}</button>
              <button className="button" onClick={()=>del(t.id)} style={{borderColor:'var(--danger)'}}>Excluir</button>
            </div>
          </div>
        ))}
        {!view.length && <div className="notice small">Nenhuma tarefa encontrada.</div>}
      </div>
    </div>
  )
}
