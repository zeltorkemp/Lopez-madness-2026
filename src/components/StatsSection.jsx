import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts'
import { PLAYERS, FIRST_ROUND, REGION_COLORS } from '../data/brackets.js'
import { SectionHeader } from './Leaderboard.jsx'

const REGIONS = ['East', 'West', 'Midwest', 'South']
const DEFAULT_RESULTS = { firstRound: new Array(32).fill(null), liveScores: {} }

function getRegionStats(results) {
  const r = results || DEFAULT_RESULTS
  return REGIONS.map(region => {
    const games = FIRST_ROUND.filter(g => g.region === region)
    const played = games.filter(g => r.firstRound[g.id - 1] !== null).length
    const stats = { region }
    PLAYERS.forEach(p => {
      const correct = games.filter(g => {
        const res = r.firstRound[g.id - 1]
        return res !== null && p.firstRound[g.id - 1] === res
      }).length
      stats[p.name] = played > 0 ? Math.round((correct / played) * 100) : 0
    })
    return stats
  })
}

function getUpsetCount(player) {
  return FIRST_ROUND.filter((game, i) => {
    const pick = player.firstRound[i]
    if (!pick) return false
    const pickedSeed = pick === game.top.name ? game.top.seed : game.bottom.seed
    const opposeSeed = pick === game.top.name ? game.bottom.seed : game.top.seed
    return pickedSeed > opposeSeed
  }).length
}

function getAgreeCount() {
  return FIRST_ROUND.filter((_, i) => PLAYERS[0].firstRound[i] === PLAYERS[1].firstRound[i]).length
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px' }}>
      <div style={{ color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>{label}</div>
      {payload.map(entry => (
        <div key={entry.name} style={{ color: entry.color, letterSpacing: '1px' }}>{entry.name}: {entry.value}%</div>
      ))}
    </div>
  )
}

export default function StatsSection({ bracketResults }) {
  const results = bracketResults || DEFAULT_RESULTS
  const regionData = getRegionStats(results)
  const agreeCount = getAgreeCount()
  const gamesPlayed = (results.firstRound || []).filter(r => r !== null).length

  const radarData = REGIONS.map(r => {
    const obj = { region: r.slice(0, 4) }
    PLAYERS.forEach(p => {
      const games = FIRST_ROUND.filter(g => g.region === r)
      obj[p.name] = games.filter(g => {
        const pick = p.firstRound[g.id - 1]
        if (!pick) return false
        const pickedSeed = pick === g.top.name ? g.top.seed : g.bottom.seed
        const opposeSeed = pick === g.top.name ? g.bottom.seed : g.top.seed
        return pickedSeed > opposeSeed
      }).length
    })
    return obj
  })

  return (
    <section id="stats" style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <SectionHeader label="ANALYTICS" title="Bracket Stats" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        <StatCard label="Games Agree" value={agreeCount} suffix="/32" color="var(--neon-green)" icon="🤝" />
        <StatCard label="Dad's Upsets" value={getUpsetCount(PLAYERS[0])} suffix=" picks" color={PLAYERS[0].color} icon="⚡" />
        <StatCard label="Boys' Upsets" value={getUpsetCount(PLAYERS[1])} suffix=" picks" color={PLAYERS[1].color} icon="🔥" />
        <StatCard label="Games Scored" value={gamesPlayed} suffix="/32" color="var(--neon-blue)" icon="📊" />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--neon-blue)', marginBottom: '20px' }}>// ACCURACY BY REGION (%)</div>
        {gamesPlayed > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData} barCategoryGap="30%">
              <XAxis dataKey="region" tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fill: 'var(--muted)', letterSpacing: 2 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              {PLAYERS.map(p => <Bar key={p.id} dataKey={p.name} fill={p.color} radius={[3, 3, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        ) : <NoData />}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--neon-orange)', marginBottom: '20px' }}>// UPSET PICKS BY REGION</div>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="region" tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fill: 'var(--text2)' }} />
            {PLAYERS.map(p => <Radar key={p.id} name={p.name} dataKey={p.name} stroke={p.color} fill={p.color} fillOpacity={0.15} strokeWidth={2} />)}
            <Legend wrapperStyle={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function StatCard({ label, value, suffix, color, icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '18px 20px' }}>
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '36px', color, lineHeight: 1 }}>
        {value}<span style={{ fontSize: '16px', color: 'var(--muted)' }}>{suffix}</span>
      </div>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)', marginTop: '4px', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

function NoData() {
  return (
    <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div style={{ fontSize: '32px', opacity: 0.3 }}>📊</div>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '3px', color: 'var(--muted)' }}>AWAITING RESULTS</div>
    </div>
  )
}
