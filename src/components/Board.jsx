import React, { useMemo, useState } from 'react'
import { TESTS } from '../data/program.js'
import { improvement, overallImprovement, fmt, lastValue } from '../lib/stats.js'
import { AGE_GROUPS, badgesFor } from '../lib/fun.js'
import RaceTrack from './RaceTrack.jsx'

const VIEWS = [{ id: 'improved', label: 'Most Improved' }, ...TESTS.map(t => ({ id: t.id, label: t.name }))]

export default function Board({ athletes, openAthlete }) {
  const [view, setView] = useState('improved')
  const [ageGroup, setAgeGroup] = useState('all')

  const rows = useMemo(() => {
    const g = AGE_GROUPS.find(x => x.id === ageGroup)
    const list = athletes.filter(a => a.results && g.test(a))
    if (view === 'improved') return list.map(a => ({ a, score: overallImprovement(a) })).sort((x, y) => y.score - x.score)
    const t = TESTS.find(x => x.id === view)
    return list.map(a => ({ a, best: lastValue(a.results[view] || []), score: improvement(view, a.results[view]) }))
      .filter(r => r.best != null)
      .sort((x, y) => t.lowerIsBetter ? x.best - y.best : y.best - x.best)
  }, [athletes, view, ageGroup])

  const maxScore = Math.max(1, ...rows.map(r => r.score))
  const timed = TESTS.find(t => t.id === view)?.unit === 's'
  const raceTest = timed ? view : 'forty'
  const raceYards = { forty: 40, dash: 20, shuttle: 20 }[raceTest]

  // Most Improved view races everyone against their own Week 1 ghost; time views race the group head to head.
  const lanes = useMemo(() => {
    if (view === 'improved') {
      return rows.slice(0, 6).map(r => {
        const v = r.a.results.forty || []
        const first = v[0], last = lastValue(v)
        if (first == null || last == null) return null
        return { id: r.a.id, label: r.a.name, sub: `${(first - last).toFixed(2)}s faster`, time: last, ghostTime: first }
      }).filter(Boolean)
    }
    return rows.slice(0, 6).map(r => ({ id: r.a.id, label: r.a.name, sub: `Age ${r.a.age}`, time: lastValue(r.a.results[raceTest] || []) })).filter(l => l.time != null)
  }, [rows, view, raceTest])

  return (
    <section className="section">
      <h2>Speed Board<small>Tap any athlete to open their Speed Card.</small></h2>
      {athletes.some(a => a.sample) && <p className="sample-note" role="note">Sample athletes shown. Real Speed Cards start after Week 1 testing.</p>}
      <div className="toggle" role="group" aria-label="Ranking">
        {VIEWS.map(v => <button key={v.id} aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>)}
      </div>
      <div className="toggle" role="group" aria-label="Age group">
        {AGE_GROUPS.map(g => <button key={g.id} aria-pressed={ageGroup === g.id} onClick={() => setAgeGroup(g.id)}>{g.label}</button>)}
      </div>

      {view === 'improved' && lanes.length > 0 && (
        <GhostRaceBoard lanes={lanes} />
      )}
      {timed && lanes.length > 1 && (
        <RaceTrack
          key={`${view}-${ageGroup}`}
          title={`Race the board: ${TESTS.find(t => t.id === view).name}`}
          note={ageGroup === 'all' ? 'Latest times, real speed. Pick an age group for a fair race.' : `Ages ${AGE_GROUPS.find(g => g.id === ageGroup).label}, latest times, real speed.`}
          yards={raceYards}
          lanes={lanes}
          buttonLabel="On your marks"
        />
      )}

      {rows.length === 0 && <p className="small">No times yet. Week 1 is baseline day.</p>}
      {rows.map((r, i) => {
        const badges = badgesFor(r.a, athletes)
        return (
          <button key={r.a.id} className={`row ${i === 0 ? 'top1' : ''}`} onClick={() => openAthlete(r.a)}>
            <span className="rank">{i + 1}</span>
            <span className="who">
              <b>{r.a.name}</b>
              <span>Age {r.a.age} · {r.a.sport}</span>
              {badges.length > 0 && <span className="mini-badges" aria-label={`${badges.length} badges: ${badges.map(b => b.label).join(', ')}`}>{badges.slice(0, 4).map(b => <i key={b.id} title={b.label}>{b.icon}</i>)}{badges.length > 4 && <em>+{badges.length - 4}</em>}</span>}
              <div className="bar" aria-hidden="true"><i style={{ width: `${Math.max(4, (r.score / maxScore) * 100)}%` }} /></div>
            </span>
            {view === 'improved'
              ? <span className="gain">+{r.score}%<small>overall</small></span>
              : <span className="gain" style={{ color: '#fff' }}>{fmt(view, r.best)}<small style={{ color: '#4ADE80' }}>+{r.score}%</small></span>}
          </button>
        )
      })}
    </section>
  )
}

// Each athlete runs next to their own Week 1 ghost. Everyone can win this race.
function GhostRaceBoard({ lanes }) {
  const paired = lanes.flatMap(l => [
    { id: `${l.id}-g`, label: 'Week 1', time: l.ghostTime, ghost: true, pair: l.id },
    { id: l.id, label: l.label, sub: l.sub, time: l.time, pair: l.id },
  ])
  return (
    <RaceTrack
      title="Ghost race: everyone vs their Week 1"
      note="Each athlete races their own first 40. Beat your ghost, win your race."
      lanes={paired}
      buttonLabel="Release the ghosts"
    />
  )
}
