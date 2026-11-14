import React, { useEffect, useRef, useState } from 'react'
import { dashMph } from '../lib/stats.js'

const getBest = () => { try { return Number(localStorage.getItem('sws_best_reaction')) || null } catch { return null } }
const setBestStore = v => { try { localStorage.setItem('sws_best_reaction', String(v)) } catch { /* ignore */ } }

function ReactionRace() {
  const [state, setState] = useState('idle') // idle | wait | go | done | early
  const [lights, setLights] = useState(0)
  const [ms, setMs] = useState(null)
  const [best, setBest] = useState(getBest)
  const timers = useRef([])
  const goAt = useRef(0)

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => clear, [])

  const start = () => {
    clear(); setMs(null); setLights(0); setState('wait')
    for (let i = 1; i <= 5; i++) timers.current.push(setTimeout(() => setLights(i), i * 550))
    const delay = 5 * 550 + 600 + Math.random() * 2200
    timers.current.push(setTimeout(() => { goAt.current = performance.now(); setState('go') }, delay))
  }

  const press = () => {
    if (state === 'idle' || state === 'done' || state === 'early') return start()
    if (state === 'wait') { clear(); setState('early'); return }
    if (state === 'go') {
      const t = Math.round(performance.now() - goAt.current)
      setMs(t); setState('done')
      if (!best || t < best) { setBest(t); setBestStore(t) }
    }
  }

  const label = {
    idle: ['Reaction Race', 'Tap to start. Wait for green, then tap as fast as you can.'],
    wait: ['Set…', 'Wait for green. Do not jump early!'],
    go: ['GO!', 'Tap now!'],
    done: [`${ms} ms`, ms < 250 ? 'Lightning start! Tap to race again.' : ms < 350 ? 'Quick! Tap to beat it.' : 'Good start. Tap to go again.'],
    early: ['False start', 'You jumped early. Tap to try again.'],
  }[state]

  return (
    <div>
      <button className={`reaction ${state === 'early' ? 'wait' : state}`} onPointerDown={press} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press() } }} aria-live="polite">
        <div className="lights" aria-hidden="true">{[1, 2, 3, 4, 5].map(i => <i key={i} className={state === 'wait' && lights >= i ? 'on' : ''} />)}</div>
        <span className="display">{label[0]}</span>
        <p>{label[1]}</p>
      </button>
      <p className="small" style={{ textAlign: 'center', marginTop: 10 }}>{best ? <>Your best: <b className="mono" style={{ color: '#fff' }}>{best} ms</b> on this device</> : 'Sprinters react to the gun in about 0.15 seconds. How close can you get?'}</p>
    </div>
  )
}

function SpeedMath() {
  const [t, setT] = useState(3.8)
  const mph = dashMph(t)
  const fps = 60 / t
  const ahead = Math.round(fps * 0.1 * 10) / 10
  return (
    <div className="card">
      <div className="field">
        <label htmlFor="dash">Your 20-yard dash time: <span className="mono">{t.toFixed(2)}s</span></label>
        <input id="dash" type="range" min="2.8" max="5" step="0.01" value={t} onChange={e => setT(Number(e.target.value))} />
      </div>
      <div className="grid-2">
        <div className="test-tile" style={{ textAlign: 'center' }}><span className="small">Average speed</span><div className="display" style={{ fontSize: 40 }}>{mph}<span style={{ fontSize: 18 }}> mph</span></div></div>
        <div className="test-tile" style={{ textAlign: 'center' }}><span className="small">Feet per second</span><div className="display" style={{ fontSize: 40 }}>{fps.toFixed(1)}</div></div>
      </div>
      <p style={{ margin: '14px 0 0', color: 'var(--soft)', lineHeight: 1.5 }}>Cut just <b>0.1 seconds</b> and you finish about <b className="mono">{ahead} feet</b> ahead of the old you. That is the difference between catching the ball and watching it.</p>
    </div>
  )
}

export default function Lab() {
  return (
    <>
      <section className="section">
        <h2>Speed Lab<small>Games and tools to train your fast-twitch brain.</small></h2>
        <ReactionRace />
      </section>
      <section className="section">
        <h2>Speed Math</h2>
        <SpeedMath />
      </section>
    </>
  )
}
