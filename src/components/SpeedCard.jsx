import React, { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { TESTS, TEST_WEEKS } from '../data/program.js'
import { improvement, overallImprovement, fmt, dashMph, lastValue } from '../lib/stats.js'

export default function SpeedCard({ athlete, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const overall = overallImprovement(athlete)
  const dash = lastValue(athlete.results.dash || [])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`${athlete.name} Speed Card`} onClick={e => e.stopPropagation()}>
        <div className="sheet-bar">
          <button className="sheet-back" onClick={onClose} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>
          <span className="sheet-title">Speed Card</span>
          <button className="close" onClick={onClose} aria-label="Close Speed Card">×</button>
        </div>
        <div className="sheet-head">
          <div>
            <h2 style={{ fontSize: 34 }}>{athlete.name}</h2>
            <p className="small" style={{ margin: '2px 0 0' }}>Age {athlete.age} · {athlete.sport}</p>
            {athlete.sample && <p className="sample-note" style={{ margin: '10px 0 0' }}>Sample athlete for preview</p>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, margin: '18px 0' }}>
          <div className="big-gain">+{overall}%</div>
          <p style={{ margin: '0 0 8px', color: 'var(--soft)', lineHeight: 1.4 }}>faster and stronger overall{dash ? <><br />20-yard average speed: <b className="mono">{dashMph(dash)} mph</b></> : null}</p>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {TESTS.map(t => {
            const vals = athlete.results[t.id] || []
            const data = TEST_WEEKS.map((w, i) => ({ week: `Wk ${w}`, v: vals[i] ?? null }))
            const gain = improvement(t.id, vals)
            return (
              <div className="test-tile" key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3>{t.name}</h3>
                  <span className="mono" style={{ color: '#4ADE80', fontWeight: 700 }}>+{gain}%</span>
                </div>
                <p className="small" style={{ margin: '2px 0 0' }}>{t.skill}{t.lowerIsBetter ? ' · lower is better' : ' · farther is better'}</p>
                <div style={{ height: 90, marginTop: 6 }} aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 22, left: 22, bottom: 0 }}>
                      <XAxis dataKey="week" interval={0} padding={{ left: 4, right: 4 }} tick={{ fill: '#8E9AB2', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis hide reversed={t.lowerIsBetter} domain={['dataMin', 'dataMax']} />
                      <Tooltip formatter={v => [fmt(t.id, v), 'Result']} contentStyle={{ background: '#0A0F1A', border: '1px solid #1E2738', borderRadius: 0 }} labelStyle={{ color: '#fff' }} />
                      <Line type="monotone" dataKey="v" stroke="#FF3B30" strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: '#FF3B30', strokeWidth: 2 }} connectNulls isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="weeks">
                  {TEST_WEEKS.map((w, i) => <div key={w}><span>Week {w}</span><b>{fmt(t.id, vals[i])}</b></div>)}
                </div>
              </div>
            )
          })}
        </div>
        <button className="btn btn-ghost btn-block" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}
