import React, { useEffect, useState } from 'react'
import { PLAYERS, FIRST_ROUND } from '../data/brackets.js'

const DEFAULT_RESULTS = { firstRound: new Array(32).fill(null), liveScores: {} }

function calcScore(player, results) {
  const r = results || DEFAULT_RESULTS
  let score = 0, correct = 0, total = 0
  ;(r.firstRound || []).forEach((result, i) => {
    if (result !== null) { total++; if (player.firstRound[i] === result) { score++; correct++ } }
  })
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return { score, correct, total, pct }
}

export default function Hero({ bracketResults, setActiveTab }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { setTimeout(() => setVis(true), 80) }, [])

  const results = bracketResults || DEFAULT_RESULTS
  const gamesPlayed = (results.firstRound || []).filter(r => r !== null).length

  // Find upsets from results
  const upsets = FIRST_ROUND.filter((g, i) => {
    const winner = results.firstRound[i]
    if (!winner) return false
    const winnerSeed = winner === g.top.name ? g.top.seed : g.bottom.seed
    const loserSeed = winner === g.top.name ? g.bottom.seed : g.top.seed
    return winnerSeed > loserSeed
  })

  const scored = PLAYERS.map(p => ({ ...p, ...calcScore(p, results) })).sort((a, b) => b.score - a.score)
  const leader = scored[0]

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', padding: '20px 20px 80px' }}>

      {/* Title */}
      <div style={{ textAlign: 'center', paddingTop: '40px', marginBottom: '32px',
        opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '4px', color: 'var(--blue)', marginBottom: '12px', opacity: 0.7 }}>// NCAA MARCH MADNESS 2026</div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(52px, 16vw, 110px)', letterSpacing: '4px', lineHeight: 0.9,
          background: 'linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.5) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LOPEZ</div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(52px, 16vw, 110px)', letterSpacing: '4px', lineHeight: 0.9,
          background: 'linear-gradient(180deg, var(--blue) 0%, rgba(0,200,255,0.4) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>MADNESS</div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '5px', color: 'var(--text2)', marginTop: '8px', textTransform: 'uppercase' }}>The Family Bracket Battle</div>
      </div>

      {/* Status pill */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px',
        opacity: vis ? 1 : 0, transition: 'all 0.7s ease 0.2s' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '999px', padding: '8px 16px',
        }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: gamesPlayed > 0 ? 'var(--green)' : 'var(--orange)', boxShadow: `0 0 8px ${gamesPlayed > 0 ? 'var(--green)' : 'var(--orange)'}`, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: gamesPlayed > 0 ? 'var(--green)' : 'var(--orange)' }}>
            {gamesPlayed > 0 ? `${gamesPlayed} GAMES COMPLETE` : 'AWAITING TIP-OFF'}
          </span>
        </div>
      </div>

      {/* Score cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px',
        opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.3s' }}>
        {scored.map((player, rank) => (
          <HeroPlayerCard key={player.id} player={player} rank={rank} isLeading={rank === 0 && gamesPlayed > 0} />
        ))}
      </div>

      {/* Upsets section */}
      {upsets.length > 0 && (
        <div style={{ marginBottom: '24px', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease 0.5s' }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--orange)', marginBottom: '10px' }}>🚨 UPSETS SO FAR</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {upsets.map((g, i) => {
              const winner = results.firstRound[g.id - 1]
              const winnerSeed = winner === g.top.name ? g.top.seed : g.bottom.seed
              const loserSeed = winner === g.top.name ? g.bottom.seed : g.top.seed
              const loser = winner === g.top.name ? g.bottom.name : g.top.name
              // Check who called it
              const dadCalled = PLAYERS[0].firstRound[g.id - 1] === winner
              const kidsCalled = PLAYERS[1].firstRound[g.id - 1] === winner
              return (
                <div key={i} style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '14px', color: 'var(--orange)', letterSpacing: '1px' }}>({winnerSeed}) {winner} def. ({loserSeed}) {loser}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)', marginTop: '2px' }}>
                    {dadCalled && `${PLAYERS[0].emoji} called it! `}{kidsCalled && `${PLAYERS[1].emoji} called it!`}
                    {!dadCalled && !kidsCalled && '😬 nobody picked this'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick nav buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
        opacity: vis ? 1 : 0, transition: 'all 0.7s ease 0.5s' }}>
        {[
          { label: 'View Standings', icon: '🏆', tab: 'standings', color: 'var(--blue)' },
          { label: 'View Bracket', icon: '📋', tab: 'bracket', color: 'var(--orange)' },
          { label: 'View Stats', icon: '📊', tab: 'stats', color: 'var(--green)' },
          { label: 'Champion Picks', icon: '🎯', tab: 'standings', color: 'var(--purple)' },
        ].map(btn => (
          <button key={btn.tab + btn.label} onClick={() => setActiveTab(btn.tab)} style={{
            background: 'var(--surface)', border: `1px solid ${btn.color}33`,
            borderRadius: 'var(--radius)', padding: '14px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = btn.color}
          onMouseLeave={e => e.currentTarget.style.borderColor = btn.color + '33'}>
            <span style={{ fontSize: '20px' }}>{btn.icon}</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '14px', color: btn.color, letterSpacing: '0.5px' }}>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function HeroPlayerCard({ player, rank, isLeading }) {
  return (
    <div style={{
      background: isLeading ? `linear-gradient(135deg, ${player.color}12, var(--surface))` : 'var(--surface)',
      border: `1px solid ${isLeading ? player.color + '44' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: '16px',
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s',
    }}>
      {isLeading && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.01), transparent)', animation: 'shimmer 3s infinite', pointerEvents: 'none' }} />
      )}
      {/* Rank */}
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '40px', lineHeight: 1, color: isLeading ? player.color : 'var(--muted)', minWidth: '28px', textAlign: 'center' }}>{rank + 1}</div>
      {/* Emoji + Name */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '22px' }}>{player.emoji}</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '22px', letterSpacing: '2px', color: player.color }}>{player.name}</span>
          {isLeading && player.score > 0 && <span style={{ fontSize: '14px' }}>👑</span>}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)', letterSpacing: '1px' }}>🏆 {player.champion}</div>
        {/* Mini progress */}
        <div style={{ marginTop: '8px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${player.pct}%`, background: `linear-gradient(90deg, ${player.color}, ${player.color}88)`, transition: 'width 1s ease' }} />
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '3px' }}>{player.correct}/{player.total} correct · {player.pct}%</div>
      </div>
      {/* Score */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '52px', lineHeight: 1, color: player.score > 0 ? player.color : 'var(--muted)' }}>{player.score}</div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', letterSpacing: '1px', color: 'var(--muted)' }}>PTS</div>
      </div>
    </div>
  )
}
