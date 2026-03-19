import React, { useState } from 'react'
import { PLAYERS, SCORING, FIRST_ROUND } from '../data/brackets.js'

function calcScore(player) {
  let score = 0
  let correct = 0
  let total = 0

  // First round
  bracketResults.firstRound.forEach((result, i) => {
    if (result !== null) {
      total++
      if (player.firstRound[i] === result) { score += SCORING.firstRound; correct++ }
    }
  })

  // Elite 8
  bracketResults.eliteEight || [].forEach((result, i) => {
    if (result !== null) {
      total++
      if (player.eliteEight[i] === result) { score += SCORING.eliteEight; correct++ }
    }
  })

  // Final Four
  bracketResults.finalFour || [].forEach((result, i) => {
    if (result !== null) {
      total++
      if (player.finalFour[i] === result) { score += SCORING.finalFour; correct++ }
    }
  })

  // Champion
  if (bracketResults.champion !== null) {
    total++
    if (player.champion === bracketResults.champion) { score += SCORING.champion; correct++ }
  }

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return { score, correct, total, pct }
}

export default function Leaderboard({ bracketResults }) {
  const scored = PLAYERS.map(p => ({ ...p, ...calcScore(p) }))
    .sort((a, b) => b.score - a.score)

  const gamesPlayed = bracketResults.firstRound.filter(r => r !== null).length
  const totalGames = 32 + 8 + 4 + 1

  return (
    <section id="leaderboard" style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Section header */}
      <SectionHeader label="STANDINGS" title="Leaderboard" />

      {/* Status bar */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: gamesPlayed > 0 ? '#00ff9d' : '#ff6b00',
            boxShadow: gamesPlayed > 0 ? '0 0 8px #00ff9d' : '0 0 8px #ff6b00',
            animation: 'pulse 1.5s infinite',
          }} />
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            letterSpacing: '2px',
            color: gamesPlayed > 0 ? '#00ff9d' : '#ff6b00',
          }}>{gamesPlayed > 0 ? 'TOURNAMENT IN PROGRESS' : 'AWAITING TIP-OFF'}</span>
        </div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: 'var(--muted)',
          letterSpacing: '1px',
        }}>{gamesPlayed} / {totalGames} GAMES SCORED</div>
      </div>

      {/* Player cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scored.map((player, rank) => (
          <PlayerCard key={player.id} player={player} rank={rank} />
        ))}
      </div>

      {/* Scoring legend */}
      <div style={{
        marginTop: '24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'var(--muted)',
          width: '100%',
          marginBottom: '6px',
        }}>SCORING SYSTEM</div>
        {[
          { round: 'Round of 64', pts: 1 },
          { round: 'Elite 8', pts: 2 },
          { round: 'Final Four', pts: 4 },
          { round: 'Champion', pts: 8 },
        ].map(s => (
          <div key={s.round} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: '18px',
              color: 'var(--neon-blue)',
            }}>{s.pts}</span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '9px',
              color: 'var(--text2)',
              letterSpacing: '1px',
            }}>{s.round}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PlayerCard({ player, rank }) {
  const medals = ['🥇', '🥈', '🥉']
  const maxPossible = 32 * 1 + 8 * 2 + 4 * 4 + 1 * 8 // 68

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${rank === 0 ? player.color + '55' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
    >
      {rank === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, ${player.color}08, transparent)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Rank */}
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: '36px',
          color: rank === 0 ? player.color : 'var(--muted)',
          lineHeight: 1,
          minWidth: '32px',
        }}>{rank + 1}</div>

        {/* Name + emoji */}
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>{player.emoji}</span>
            <span style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: '26px',
              letterSpacing: '2px',
              color: player.color,
            }}>{player.name}</span>
            {rank === 0 && player.score > 0 && <span style={{ fontSize: '16px' }}>👑</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '9px',
              letterSpacing: '1px',
              color: 'var(--muted)',
            }}>🏆 {player.champion}</span>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '48px',
            lineHeight: 1,
            color: player.score > 0 ? player.color : 'var(--muted)',
            animation: player.score > 0 ? 'countUp 0.5s ease' : 'none',
          }}>{player.score}</div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px',
            letterSpacing: '2px',
            color: 'var(--muted)',
          }}>POINTS</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: 'var(--muted)',
            letterSpacing: '1px',
          }}>{player.correct} CORRECT / {player.total} PLAYED</span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: player.pct > 60 ? 'var(--neon-green)' : player.pct > 40 ? 'var(--neon-yellow)' : 'var(--text2)',
            letterSpacing: '1px',
          }}>{player.pct}% ACC</span>
        </div>
        <div style={{
          height: '3px',
          background: 'var(--border)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${player.total > 0 ? (player.score / maxPossible) * 100 : 0}%`,
            background: `linear-gradient(90deg, ${player.color}, ${player.color}88)`,
            borderRadius: '2px',
            transition: 'width 1s ease',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionHeader({ label, title }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '10px',
        letterSpacing: '4px',
        color: 'var(--neon-blue)',
        marginBottom: '8px',
      }}>// {label}</div>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: 'clamp(36px, 6vw, 56px)',
        letterSpacing: '3px',
        color: '#fff',
        lineHeight: 1,
      }}>{title}</div>
      <div style={{
        height: '2px',
        width: '60px',
        background: 'linear-gradient(90deg, var(--neon-blue), transparent)',
        marginTop: '12px',
      }} />
    </div>
  )
}
