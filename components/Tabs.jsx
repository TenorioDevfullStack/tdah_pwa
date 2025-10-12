
'use client'
import { useMemo, useRef, useState } from 'react'

export default function Tabs({ tabs, onChange }){
  const keys = useMemo(() => Object.keys(tabs), [tabs])
  const [active, setActive] = useState(keys[0])
  const listRef = useRef(null)

  function select(k){
    setActive(k)
    onChange && onChange(k)
  }

  function onKeyDown(e){
    const idx = keys.indexOf(active)
    if(idx === -1) return
    let next = null
    if(e.key === 'ArrowRight') next = keys[(idx + 1) % keys.length]
    if(e.key === 'ArrowLeft') next = keys[(idx - 1 + keys.length) % keys.length]
    if(e.key === 'Home') next = keys[0]
    if(e.key === 'End') next = keys[keys.length - 1]
    if(next){
      e.preventDefault()
      select(next)
      // move focus to the newly active tab
      const el = listRef.current?.querySelector(`[data-tab="${next}"]`)
      el?.focus()
    }
  }

  return (
    <div
      className="tabs"
      role="tablist"
      aria-label="Seções principais"
      onKeyDown={onKeyDown}
      ref={listRef}
    >
      {keys.map((k) => (
        <div
          key={k}
          role="tab"
          aria-selected={k===active}
          tabIndex={k===active?0:-1}
          data-tab={k}
          className={"tab" + (k===active?' active':'')}
          onClick={() => select(k)}
        >
          {tabs[k]}
        </div>
      ))}
    </div>
  )
}
