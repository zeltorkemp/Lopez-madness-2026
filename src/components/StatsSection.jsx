import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts'
import { PLAYERS, FIRST_ROUND, REGION_COLORS } from '../data/brackets.js'
import { SectionHeader } from './Leaderboard.jsx'

const REGIONS = ['East', 'West', 'Midwest', 'South']

function getRegionStats() {
  return REGIONS.map(region => {
    const games = FIRST_ROUND.filter(g => g.region === region)
    const results = games.map((g, localIdx) => {
      const globalIdx = FIRST_ROUND.indexOf(g)
      return bracketResults.firstRound[globalIdx]
    })
    const played = results.filter(r => r !== null).length

    const stats = { region }
    PLAYERS.forEach(p => {
      const picks = games.map(g => p.firstRound[FIRST_ROUND.indexOf(g)])
      const correct = picks.filter((pick, i) => results[i] !== null && pick === results[i]).length
      stats[p.name] = played > 0 ? Math.round((correct / played) * 100) : 0
    })
    return stats
  })
}

function getUpsetCount(player) {
  return FIRST_ROUND.filter((game, i) => {
    const pick = player.firstRound[i]
    const pickedSeed = pick === game.top.name ? game.top.seed : game.bottom.seed
    const opposeSeed = pick === game.top.name ? game.bottom.seed : game.top.seed
    return pickedSeed > opposeSeed
  }).length
}

function getAgreeCount() {
  return FIRST_ROUND.filter((_, i) =>
    PLAYERS[0].firstRound[i] === PLAYERS[1].firstRound[i]
  ).length
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
      }}>
        <div style={{ color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>{label}</div>
        {payload.map(entry => (
          <div key={entry.name} style={{ color: entry.color, letterSpacing: '1px' }}>
            {entry.name}: {entry.value}{typeof entry.value === 'number' && entry.name.includes('%') ? '' : '%'}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function StatsSection({ bracketResults }) {
  const regionData = getRegionStats()
  const agreeCount = getAgreeCount()
  const gamesPlayed = bracketResults.firstRound.filter(r => r !== null).length

  const upsetData = PLAYERS.map(p => ({
    name: p.name,
    upsets: getUpsetCount(p),
    color: p.color,
  }))

  const radarData = REGIONS.map(r => {
    const obj = { region: r.slice(0, 4) }
    PLAYERS.forEach(p => {
      const games = FIRST_ROUND.filter(g => g.region === r)
      const upsets = games.filter((g, li) => {
        const pick = p.firstRound[FIRST_ROUND.indexOf(g)]
        const pickedSeed = pick === g.top.name ? g.top.seed : g.bottom.seed
        return pickedSeed > (pick === g.top.name ? g.bottom.seed : g.top.seed)
      }).length
      obj[p.name] = upsets
    })
    return obj
  })

  return (
    <section id="stats" style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <SectionHeader label="ANALYTICS" title="Bracket Stats" />

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        <StatCard label="Games Agree" value={agreeCount} suffix="/32" color="var(--neon-green)" icon="🤝" />
        <StatCard label="Dad's Upsets" value={getUpsetCount(PLAYERS[0])} suffix=" picks" color={PLAYERS[0].color} icon="⚡" />
        <StatCard label="Boys' Upsets" value={getUpsetCount(PLAYERS[1])} suffix=" picks" color={PLAYERS[1].color} icon="🔥" />
        <StatCard label="Games Scored" value={gamesPlayed} suffix="/32" color="var(--neon-blue)" icon="📊" />
      </div>

      {/* Accuracy by region */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '3px',
          color: 'var(--neon-blue)',
          marginBottom: '20px',
        }}>// ACCURACY BY REGION (%)</div>
        {gamesPlayed > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData} barCategoryGap="30%">
              <XAxis
                dataKey="region"
                tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fill: 'var(--muted)', letterSpacing: 2 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fill: 'var(--muted)' }}
                axisLine={false} tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              {PLAYERS.map(p => (
                <Bar key={p.id} dataKey={p.name} fill={p.color} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoDataPlaceholder />
        )}
      </div>

      {/* Upset picks radar */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '3px',
          color: 'var(--neon-orange)',
          marginBottom: '20px',
        }}>// UPSET PICKS BY REGION</div>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="region"
              tick={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fill: 'var(--text2)' }}
            />
            {PLAYERS.map(p => (
              <Radar
                key={p.id}
                name={p.name}
                dataKey={p.name}
                stroke={p.color}
                fill={p.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend
              wrapperStyle={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '10px',
                letterSpacing: '1px',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function StatCard({ label, value, suffix, color, icon }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${color}33`,
      borderRadius: '10px',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '36px',
        color: color,
        lineHeight: 1,
      }}>
        {value}<span style={{ fontSize: '16px', color: 'var(--muted)' }}>{suffix}</span>
      </div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '9px',
        letterSpacing: '2px',
        color: 'var(--muted)',
        marginTop: '4px',
        textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  )
}

function NoDataPlaceholder() {
  return (
    <div style={{
      height: '160px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}>
      <div style={{ fontSize: '32px', opacity: 0.3 }}>📊</div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '10px',
        letterSpacing: '3px',
        color: 'var(--muted)',
      }}>AWAITING RESULTS</div>
    </div>
  )
}
