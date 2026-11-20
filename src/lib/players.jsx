import React, { useState } from 'react'

/* ---------- players: siblings and teammates can compete on one phone ---------- */
const PKEY = 'sws_players_v1'
export function usePlayers() {
  const [st, setSt] = useState(() => { try { return JSON.parse(localStorage.getItem(PKEY)) || { list: ['Me'], cur: 'Me' } } catch { return { list: ['Me'], cur: 'Me' } } })
  const set = next => { setSt(next); try { localStorage.setItem(PKEY, JSON.stringify(next)) } catch { /* private mode */ } }
  return [st, set]
}

export function Players({ st, set }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const add = e => {
    e.preventDefault()
    const n = name.trim().slice(0, 14)
    if (!n) return setAdding(false)
    const list = st.list.includes(n) ? st.list : [...st.list, n].slice(-8)
    set({ list, cur: n }); setName(''); setAdding(false)
  }
  const remove = n => {
    if (st.list.length < 2) return
    if (window.confirm && !window.confirm(`Remove ${n} from this phone? Their scores stay saved.`)) return
    const list = st.list.filter(x => x !== n)
    set({ list, cur: list[0] })
  }
  return (
    <div className="players">
      <span className="small">Who's up?</span>
      <div className="toggle" role="group" aria-label="Player" style={{ marginBottom: 0 }}>
        {st.list.map(n => (
          <button key={n} aria-pressed={st.cur === n} onClick={() => st.cur === n ? remove(n) : set({ ...st, cur: n })} title={st.cur === n && st.list.length > 1 ? 'Tap again to remove' : undefined}>{n}</button>
        ))}
        {adding
          ? <form onSubmit={add} className="add-player"><input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={add} placeholder="Name" maxLength={14} aria-label="Player name" /></form>
          : <button onClick={() => setAdding(true)}>+ Add</button>}
      </div>
    </div>
  )
}

