import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts'
import { PLAYERS, FIRST_ROUND, REGION_COLORS } from '../data/brackets.js'
import { SectionHeader } from './Leaderboard.jsx'

const REGIONS = ['East', 'West', 'Midwest', 'South']
const DEFAULT_RESULTS = { firstRound: new Array(32).fill(null) }

function getUpsetCount(player) {
  return FIRST_ROUND.filter((g, i) => {
    const pick = player.firstRound[i]
    if (!pick) return false
    const ps = pick === g.top.name ? g.top.seed : g.bottom.seed
    const os = pick === g.top.name ? g.bottom.seed : g.top.seed
    return ps > os
  }).length
}

function getAgreeCount() {
  return FIRST_ROUND.filter((_, i) => PLAYERS[0].firstRound[i] === PLAYERS[1].firstRound[i]).length
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>{label}</div>
      {payload.map(e => <div key={e.name} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: e.color, letterSpacing: '1px' }}>{e.name}: {e.value}%</div>)}
    </div>
  )
}

export default function StatsSection({ bracketResults }) {
  const results = bracketResults || DEFAULT_RESULTS
  const gamesPlayed = (results.firstRound || []).filter(r => r !== null).length

  const regionData = REGIONS.map(region => {
    const games = FIRST_ROUND.filter(g => g.region === region)
    const played = games.filter(g => results.firstRound[g.id - 1] !== null).length
    const obj = { region: region.slice(0, 4) }
    PLAYERS.forEach(p => {
      const correct = games.filter(g => { const r = results.firstRound[g.id - 1]; return r && p.firstRound[g.id - 1] === r }).length
      obj[p.name] = played > 0 ? Math.round((correct / played) * 100) : 0
    })
    return obj
  })

  const radarData = REGIONS.map(region => {
    const obj = { region: region.slice(0, 4) }
    PLAYERS.forEach(p => {
      obj[p.name] = FIRST_ROUND.filter(g => {
        if (g.region !== region) return false
        const pick = p.firstRound[g.id - 1]
        if (!pick) return false
        const ps = pick === g.top.name ? g.top.seed : g.bottom.seed
        const os = pick === g.top.name ? g.bottom.seed : g.top.seed
        return ps > os
      }).length
    })
    return obj
  })

  // Head to head comparison
  const headToHead = FIRST_ROUND.map((g, i) => {
    const dadPick = PLAYERS[0].firstRound[i]
    const kidsPick = PLAYERS[1].firstRound[i]
    const result = results.firstRound[i]
    const dadCorrect = result && dadPick === result
    const kidsCorrect = result && kidsPick === result
    return { dadCorrect, kidsCorrect, result, game: g }
  }).filter(x => x.result)

  const dadWins = headToHead.filter(x => x.dadCorrect && !x.kidsCorrect).length
  const kidsWins = headToHead.filter(x => !x.dadCorrect && x.kidsCorrect).length
  const ties = headToHead.filter(x => x.dadCorrect && x.kidsCorrect).length
  const bothWrong = headToHead.filter(x => !x.dadCorrect && !x.kidsCorrect).length

  return (
    <div style={{ padding: '28px 20px 100px', maxWidth: '640px', margin: '0 auto' }}>
      <SectionHeader label="ANALYTICS" title="Stats" subtitle="Deep dive into the bracket battle" />

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Games Agree', value: getAgreeCount(), suffix: '/32', color: 'var(--green)', icon: '🤝' },
          { label: 'Games Scored', value: gamesPlayed, suffix: '/32', color: 'var(--blue)', icon: '📊' },
          { label: "Dad's Upsets", value: getUpsetCount(PLAYERS[0]), suffix: ' picks', color: PLAYERS[0].color, icon: '⚡' },
          { label: "Boys' Upsets", value: getUpsetCount(PLAYERS[1]), suffix: ' picks', color: PLAYERS[1].color, icon: '🔥' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: `1px solid ${s.color}22`, borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '32px', color: s.color, lineHeight: 1 }}>{s.value}<span style={{ fontSize: '14px', color: 'var(--muted)' }}>{s.suffix}</span></div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)', marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Head to head */}
      {headToHead.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--blue)', letterSpacing: '3px', marginBottom: '16px' }}>// HEAD TO HEAD ({headToHead.length} games)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
            {[
              { label: `${PLAYERS[0].emoji} Only`, value: dadWins, color: PLAYERS[0].color },
              { label: `${PLAYERS[1].emoji} Only`, value: kidsWins, color: PLAYERS[1].color },
              { label: 'Both ✅', value: ties, color: 'var(--green)' },
              { label: 'Both ❌', value: bothWrong, color: 'var(--muted)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: '8px', padding: '12px 6px' }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '28px', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '4px', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accuracy by region */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--blue)', letterSpacing: '3px', marginBottom: '16px' }}>// ACCURACY BY REGION</div>
        {gamesPlayed > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={regionData} barCategoryGap="25%">
              <XAxis dataKey="region" tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fill: 'var(--muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              {PLAYERS.map(p => <Bar key={p.id} dataKey={p.name} fill={p.color} radius={[3, 3, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '28px', opacity: 0.3 }}>📊</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px' }}>AWAITING RESULTS</div>
          </div>
        )}
      </div>

      {/* Upset radar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--orange)', letterSpacing: '3px', marginBottom: '16px' }}>// UPSET PICKS BY REGION</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="region" tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fill: 'var(--text2)' }} />
            {PLAYERS.map(p => <Radar key={p.id} name={p.name} dataKey={p.name} stroke={p.color} fill={p.color} fillOpacity={0.15} strokeWidth={2} />)}
            <Legend wrapperStyle={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px' }} />
            <Tooltip content={<TT />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
