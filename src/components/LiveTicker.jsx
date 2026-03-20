import React from 'react'

export default function LiveTicker({ liveGames, lastUpdated, loading, onRefresh }) {
  const active = (liveGames || []).filter(g => g.inProgress || g.completed).slice(0, 8)
  if (active.length === 0) return null

  const hasLive = active.some(g => g.inProgress)

  return (
    <div style={{
      position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 90, height: '36px',
      background: 'rgba(5,8,16,0.98)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${hasLive ? 'rgba(0,255,157,0.2)' : 'var(--border)'}`,
      display: 'flex', alignItems: 'center', gap: '0', overflow: 'hidden',
    }}>
      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 12px', flexShrink: 0, borderRight: '1px solid var(--border)' }}>
        {hasLive && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)', animation: 'pulse 1s infinite' }} />}
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '2px', color: hasLive ? 'var(--green)' : 'var(--muted)' }}>{hasLive ? 'LIVE' : 'FINAL'}</span>
      </div>
      {/* Scores */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '24px', padding: '0 12px' }}>
        {active.map((g, i) => {
          const leading = g.homeScore >= g.awayScore ? g.homeTeam : g.awayTeam
          const trailing = g.homeScore >= g.awayScore ? g.awayTeam : g.homeTeam
          const leadScore = Math.max(g.homeScore, g.awayScore)
          const trailScore = Math.min(g.homeScore, g.awayScore)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '12px', color: 'var(--text)' }}>{leading}</span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '14px', color: 'var(--blue)', letterSpacing: '1px' }}>{leadScore}–{trailScore}</span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: 'var(--text2)' }}>{trailing}</span>
              {g.inProgress && g.clock && <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--green)' }}>{g.clock}</span>}
              {g.completed && <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)' }}>F</span>}
            </div>
          )
        })}
      </div>
      {/* Refresh */}
      <button onClick={onRefresh} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', height: '100%',
        fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: 'var(--muted)',
        borderLeft: '1px solid var(--border)', transition: 'color 0.2s', flexShrink: 0,
      }}
      onMouseEnter={e => e.target.style.color = 'var(--blue)'}
      onMouseLeave={e => e.target.style.color = 'var(--muted)'}
      >↻</button>
    </div>
  )
}
