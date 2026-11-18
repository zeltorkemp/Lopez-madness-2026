import React, { useEffect, useRef, useState } from 'react'

// Replays real times at real speed. lanes: [{ id, label, sub, time, ghost }]
export default function RaceTrack({ lanes, yards = 40, title, note, buttonLabel = 'Run it' }) {
  const [t, setT] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | set | run | done
  const raf = useRef(0)
  const timers = useRef([])
  const maxT = Math.max(...lanes.map(l => l.time))
  const order = [...lanes].sort((a, b) => a.time - b.time).map(l => l.id)

  const stop = () => { cancelAnimationFrame(raf.current); timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => stop, [])
  useEffect(() => { stop(); setT(null); setPhase('idle') }, [lanes.map(l => `${l.id}:${l.time}`).join('|')])

  const go = () => {
    stop()
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setT(maxT); setPhase('done'); return }
    setT(0); setPhase('set')
    timers.current.push(setTimeout(() => {
      setPhase('run')
      const start = performance.now()
      const tick = now => {
        const e = (now - start) / 1000
        if (e >= maxT) { setT(maxT); setPhase('done'); return }
        setT(e)
        raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }, 900))
  }

  return (
    <div className="race">
      <div className="race-head">
        <div>
          {title && <b>{title}</b>}
          {note && <span>{note}</span>}
        </div>
        <span className="race-clock mono" aria-live="off">{phase === 'set' ? 'SET' : t == null ? `${yards} YD` : `${t.toFixed(2)}s`}</span>
      </div>
      <div className="lanes">
        {lanes.map(l => {
          const p = t == null ? 0 : Math.min(1, t / l.time)
          const finished = t != null && t >= l.time
          const pool = l.pair ? order.filter(id => lanes.find(x => x.id === id).pair === l.pair) : order
          const place = pool.indexOf(l.id) + 1
          const tag = l.pair ? (place === 1 && !l.ghost ? 'Beat it · ' : '') : (place === 1 ? '1st · ' : '')
          return (
            <div key={l.id} className={`lane ${l.ghost ? 'ghost' : ''} ${l.pair && l.ghost ? 'pair-start' : ''} ${finished && place === 1 && !l.ghost ? 'won' : ''}`}>
              <span className="lane-name"><b>{l.label}</b>{l.sub && <small>{l.sub}</small>}</span>
              <span className="lane-track">
                <i className="runner" style={{ left: `calc(${p * 100}% - ${p * 16}px)` }} />
                {finished && <em className="lane-time mono">{tag}{l.time.toFixed(2)}s</em>}
              </span>
            </div>
          )
        })}
      </div>
      <button className="btn btn-red btn-block" onClick={go} disabled={phase === 'set' || phase === 'run'}>
        {phase === 'idle' ? buttonLabel : phase === 'done' ? 'Run it back' : 'Racing…'}
      </button>
    </div>
  )
}
