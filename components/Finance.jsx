
'use client'
import { useEffect, useMemo, useState } from 'react'
import { load, save } from '@/lib/storage'

function uid(){ return Math.random().toString(36).slice(2) }

const cats = ['Transporte','Alimentação','Moradia','Saúde','Lazer','Educação','Trabalho','Outros']

export default function Finance(){
  const [items, setItems] = useState(load('finance_items', []))
  const [filter, setFilter] = useState('Todos')

  useEffect(()=> save('finance_items', items), [items])

  function add(e){
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const amount = parseFloat((f.get('amount')||'0').toString().replace(',','.'))
    const entry = {
      id: uid(),
      type: (f.get('type')||'Despesa').toString(),
      desc: (f.get('desc')||'').toString(),
      cat: (f.get('cat')||'Outros').toString(),
      date: (f.get('date')||'').toString(),
      amount: isNaN(amount)?0:amount
    }
    if(!entry.desc) return
    setItems(prev => [entry, ...prev])
    e.currentTarget.reset()
  }
  function del(id){
    setItems(prev => {
      const removed = prev.find(i=>i.id===id)
      const next = prev.filter(i => i.id!==id)
      window.dispatchEvent(new CustomEvent('toast', { detail: {
        text: `Lançamento removido: ${removed?.desc||''}`,
        actionLabel: 'Desfazer',
        onAction: () => setItems(curr => [removed, ...curr])
      }}))
      return next
    })
  }

  const summary = useMemo(()=>{
    const inSum = items.filter(i=>i.type==='Receita').reduce((a,b)=>a+b.amount,0)
    const outSum = items.filter(i=>i.type!=='Receita').reduce((a,b)=>a+b.amount,0)
    return {inSum, outSum, balance: inSum - outSum}
  }, [items])

  const view = useMemo(()=>{
    let list = items
    if(filter!=='Todos') list = items.filter(i => i.cat===filter)
    return list.sort((a,b)=> (b.date||'').localeCompare(a.date||''))
  }, [items, filter])

  return (
    <div className="card">
      <h3>Finanças</h3>
      <div className="row">
        <div className="badge">Receitas: R$ {summary.inSum.toFixed(2)}</div>
        <div className="badge">Despesas: R$ {summary.outSum.toFixed(2)}</div>
        <div className="badge" style={{borderColor: summary.balance>=0?'var(--ok)':'var(--danger)'}}>Saldo: R$ {summary.balance.toFixed(2)}</div>
      </div>
      <form onSubmit={add} className="row" style={{marginTop:8}}>
        <select className="select" name="type">
          <option>Despesa</option>
          <option>Receita</option>
        </select>
        <input className="input" name="desc" placeholder="Descrição"/>
        <select className="select" name="cat">{cats.map(c=><option key={c}>{c}</option>)}</select>
        <input className="input" name="date" type="date"/>
        <input className="input" name="amount" placeholder="Valor (ex.: 12.50)"/>
        <button className="button primary">Adicionar</button>
      </form>

      <div className="row" style={{marginTop:8}}>
        <select className="select" value={filter} onChange={e=>setFilter(e.target.value)}>
          {['Todos', ...cats].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="list">
        {view.map(i => (
          <div key={i.id} className="item">
            <div>
              <div style={{fontWeight:600}}>{i.desc} • <span className="badge">{i.cat}</span></div>
              <div className="small">{i.date||'—'} • {i.type}</div>
            </div>
            <div style={{fontWeight:700}}>{(i.type==='Receita'?'+':'-')} R$ {i.amount.toFixed(2)}</div>
            <button className="button danger" onClick={()=>del(i.id)}>Excluir</button>
          </div>
        ))}
        {!view.length && <div className="notice small">Sem lançamentos.</div>}
      </div>
    </div>
  )
}
