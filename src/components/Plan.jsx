import React, { useState } from 'react'
import { WEEKS, SESSION, DRILLS } from '../data/program.js'

const COLORS = ['#16356E', '#2B5BB8', '#1E4A94', '#C62828', '#E53935', '#0F2A5A']

export default function Plan() {
  const [sel, setSel] = useState(1)
  const [homeOnly, setHomeOnly] = useState(false)
  const week = WEEKS.find(w => w.n === sel)
  const allDrills = Object.entries(DRILLS).filter(([, d]) => !homeOnly || d.home)

  return (
    <>
      <section className="section">
        <h2>The 10-Week Plan<small>Tap a week to see the focus and drills.</small></h2>
        <div className="weekstrip" role="group" aria-label="Weeks">
          {WEEKS.map(w => (
            <button key={w.n} className={w.test ? 'test' : ''} aria-pressed={sel === w.n} onClick={() => setSel(w.n)}>
              <span>WEEK</span><b>{w.n}</b>
            </button>
          ))}
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <span className={`tag ${week.test ? 'test' : ''}`}>{week.test ? 'Timed test day' : week.focus}</span>
          <h3 style={{ fontSize: 30, margin: '10px 0 6px' }}>{week.title}</h3>
          <p style={{ margin: 0, color: '#CBD6EA', lineHeight: 1.5 }}>{week.blurb}</p>
          <div style={{ marginTop: 14 }}>
            {week.drills.map(id => (
              <div className="drill" key={id}>
                <b>{DRILLS[id].name}</b>
                <p>{DRILLS[id].cue}</p>
                <div className="reps">{DRILLS[id].reps}</div>
              </div>
            ))}
          </div>
          {week.home.length > 0 && (
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px' }}>
              <span className="tag">At-home challenge · 10 min</span>
              {week.home.map(id => (
                <div className="drill" key={id}>
                  <b>{DRILLS[id].name}</b>
                  <p>{DRILLS[id].cue}</p>
                  <div className="reps">{DRILLS[id].reps}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Every Sunday<small>60 minutes. Short reps, full rest. Speed is trained fresh. Every session includes jumps, a top-speed dose and races.</small></h2>
        <div className="timeline" aria-hidden="true">
          {SESSION.map((s, i) => <div key={s.name} style={{ flex: s.min, background: COLORS[i] }}>{s.min}′</div>)}
        </div>
        <div className="card">
          <dl className="info-list">
            {SESSION.map(s => <div key={s.name}><dt style={{ color: '#fff' }}>{s.name}</dt><dd className="mono">{s.min} min</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="section">
        <h2>Drill Library</h2>
        <label className="check"><input type="checkbox" checked={homeOnly} onChange={e => setHomeOnly(e.target.checked)} /> Only show drills I can do at home</label>
        <div className="card">
          {allDrills.map(([id, d]) => (
            <div className="drill" key={id}>
              <b>{d.name}</b>{d.home && <span className="tag" style={{ marginLeft: 8, fontSize: 10 }}>At home</span>}
              <p>{d.cue}</p>
              <div className="reps">{d.reps}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
