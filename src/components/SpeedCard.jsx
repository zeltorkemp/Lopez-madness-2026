import React, { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { TESTS, TEST_WEEKS } from '../data/program.js'
import { improvement, overallImprovement, fmt, dashMph, lastValue, pct } from '../lib/stats.js'
import { badgesFor, BADGES } from '../lib/fun.js'
import RaceTrack from './RaceTrack.jsx'

export default function SpeedCard({ athlete, athletes = [], onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const overall = overallImprovement(athlete)
  const forty = lastValue(athlete.results.forty || [])
  const dash = lastValue(athlete.results.dash || [])
  const ghost = athlete.results.forty?.[0]
  const yardsAhead = ghost && forty && forty < ghost ? Math.round(40 * (1 - forty / ghost) * 10) / 10 : 0
  const earned = badgesFor(athlete, athletes)
  const earnedIds = new Set(earned.map(b => b.id))

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
            <p className="small" style={{ margin: '2px 0 0' }}>{[athlete.age && `Age ${athlete.age}`, athlete.sport].filter(Boolean).join(" · ")}</p>
            {athlete.sample && <p className="sample-note" style={{ margin: '10px 0 0' }}>Sample athlete for preview</p>}
          </div>
        </div>

        {!athlete.empty && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, margin: '18px 0' }}>
          <div className="big-gain">{pct(overall)}</div>
          <p style={{ margin: '0 0 8px', color: 'var(--soft)', lineHeight: 1.4 }}>faster and stronger overall{forty ? <><br />40-yard average speed: <b className="mono">{dashMph(forty, 40)} mph</b></> : dash ? <><br />20-yard average speed: <b className="mono">{dashMph(dash)} mph</b></> : null}</p>
        </div>
        )}

        {ghost && forty && forty !== ghost && (
          <div style={{ marginBottom: 18 }}>
            <RaceTrack
              title="Beat your ghost"
              note={yardsAhead > 0 ? `Your Week 1 self finishes ${yardsAhead} yards behind you.` : 'Your Week 1 self is still ahead. Next test, catch them.'}
              lanes={[
                { id: 'ghost', label: 'Week 1 you', time: ghost, ghost: true, pair: 'me' },
                { id: 'now', label: 'You now', time: forty, pair: 'me' },
              ]}
              buttonLabel="Race your ghost"
            />
          </div>
        )}

        {athlete.empty && <p className="sample-note">Week 1 testing fills in this card. Badges you earn in Speed School show up here before then.</p>}
        {athlete.practice && (
          <div className="practice-bests">
            <h3>Practice bests <span className="small">from home</span></h3>
            <div>
              {[['sprint10', '10 yd', v => `${Number(v).toFixed(2)}s`], ['sprint20', '20 yd', v => `${Number(v).toFixed(2)}s`], ['sprint40', '40 yd', v => `${Number(v).toFixed(2)}s`], ['react', 'Reaction', v => `${Math.round(v)} ms`], ['feet', 'Quick Feet', v => `${Math.round(v)} taps`]]
                .filter(([k]) => athlete.practice[k] != null)
                .map(([k, label, f]) => <span key={k}><small>{label}</small><b className="mono">{f(athlete.practice[k])}</b></span>)}
            </div>
          </div>
        )}

        <div className="badge-case">
          <div className="badge-case-head"><h3>Badges</h3><span className="small">{earned.length} of {BADGES.length} earned</span></div>
          <div className="badge-grid">
            {BADGES.map(b => {
              const got = earned.find(e => e.id === b.id)
              return (
                <div key={b.id} className={`badge ${earnedIds.has(b.id) ? 'got' : 'locked'}`}>
                  <span className="badge-icon" aria-hidden="true">{b.icon}</span>
                  <b>{b.label}</b>
                  <small>{(got || b).desc}</small>
                </div>
              )
            })}
          </div>
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
                  <span className="mono" style={{ color: '#4ADE80', fontWeight: 700 }}>{pct(gain)}</span>
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
