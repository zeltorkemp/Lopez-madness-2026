import React, { useMemo, useState } from 'react'
import { TESTS } from '../data/program.js'
import { improvement, overallImprovement, fmt, lastValue } from '../lib/stats.js'

const VIEWS = [{ id: 'improved', label: 'Most Improved' }, ...TESTS.map(t => ({ id: t.id, label: t.name }))]

export default function Board({ athletes, openAthlete }) {
  const [view, setView] = useState('improved')
  const [ageGroup, setAgeGroup] = useState('all')

  const rows = useMemo(() => {
    let list = athletes.filter(a => !a.results ? false : true).filter(a => ageGroup === 'all' || (ageGroup === 'young' ? a.age <= 10 : a.age >= 11))
    if (view === 'improved') return [...list].map(a => ({ a, score: overallImprovement(a) })).sort((x, y) => y.score - x.score)
    const t = TESTS.find(x => x.id === view)
    return [...list].map(a => ({ a, best: lastValue(a.results[view] || []), score: improvement(view, a.results[view]) }))
      .filter(r => r.best != null)
      .sort((x, y) => t.lowerIsBetter ? x.best - y.best : y.best - x.best)
  }, [athletes, view, ageGroup])

  const maxScore = Math.max(1, ...rows.map(r => r.score))

  return (
    <section className="section">
      <h2>Speed Board<small>Tap any athlete to open their Speed Card.</small></h2>
      {athletes.some(a => a.sample) && <p className="sample-note" role="note">Sample athletes shown. Real Speed Cards start after Week 1 testing.</p>}
      <div className="toggle" role="group" aria-label="Ranking">
        {VIEWS.map(v => <button key={v.id} aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>)}
      </div>
      <div className="toggle" role="group" aria-label="Age group">
        {[['all', 'All ages'], ['young', '8–10'], ['old', '11–14']].map(([id, label]) => (
          <button key={id} aria-pressed={ageGroup === id} onClick={() => setAgeGroup(id)}>{label}</button>
        ))}
      </div>
      {rows.length === 0 && <p className="small">No times yet. Week 1 is baseline day.</p>}
      {rows.map((r, i) => (
        <button key={r.a.id} className={`row ${i === 0 ? 'top1' : ''}`} onClick={() => openAthlete(r.a)}>
          <span className="rank">{i + 1}</span>
          <span className="who">
            <b>{r.a.name}</b>
            <span>Age {r.a.age} · {r.a.sport}</span>
            <div className="bar" aria-hidden="true"><i style={{ width: `${Math.max(4, (r.score / maxScore) * 100)}%` }} /></div>
          </span>
          {view === 'improved'
            ? <span className="gain">+{r.score}%<small>overall</small></span>
            : <span className="gain" style={{ color: '#fff' }}>{fmt(view, r.best)}<small style={{ color: '#4ADE80' }}>+{r.score}%</small></span>}
        </button>
      ))}
    </section>
  )
}
