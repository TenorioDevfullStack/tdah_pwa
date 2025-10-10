
'use client'
import { useState } from 'react'

export default function Tabs({ tabs, onChange }){
  const [active, setActive] = useState(Object.keys(tabs)[0])
  function select(k){ setActive(k); onChange && onChange(k) }
  return (
    <div className="tabs">
      {Object.entries(tabs).map(([k,label]) => (
        <div key={k} className={"tab" + (k===active?' active':'')} onClick={() => select(k)}>{label}</div>
      ))}
    </div>
  )
}
