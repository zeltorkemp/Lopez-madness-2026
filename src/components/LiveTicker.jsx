import React, { useState } from 'react'

export default function LiveTicker({ liveGames, lastUpdated, loading, error, onRefresh }) {
  const inProgress = liveGames.filter(g => g.inProgress)
  const recentlyCompleted = liveGames.filter(g => g.completed).slice(0, 5)

  if (loading) return null
  if (inProgress.length === 0 && recentlyCompleted.length === 0) return null

  const displayGames = inProgress.length > 0 ? inProgress : recentlyCompleted

  return (
    <div style={{
      position: 'fixed',
      top: '56px',
      left: 0,
      right: 0,
      zIndex: 90,
      background: 'rgba(6,10,18,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${inProgress.length > 0 ? 'rgba(0,255,157,0.3)' : 'var(--border)'}`,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        height: '36px',
        gap: '0',
      }}>
        {/* Live badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginRight: '16px',
          flexShrink: 0,
        }}>
          {inProgress.length > 0 && (
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#00ff9d',
              boxShadow: '0 0 6px #00ff9d',
              animation: 'pulse 1s infinite',
            }} />
          )}
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            letterSpacing: '2px',
            color: inProgress.length > 0 ? '#00ff9d' : 'var(--muted)',
            whiteSpace: 'nowrap',
          }}>{inProgress.length > 0 ? 'LIVE' : 'FINAL'}</span>
        </div>

        {/* Scrolling games */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          gap: '32px',
          animation: displayGames.length > 3 ? 'ticker 20s linear infinite' : 'none',
        }}>
          {displayGames.map((game, i) => (
            <TickerGame key={game.id || i} game={game} />
          ))}
        </div>

        {/* Last updated + refresh */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '16px',
          flexShrink: 0,
        }}>
          {lastUpdated && (
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              color: 'var(--muted)',
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
            }}>
              {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={onRefresh} style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px',
            color: 'var(--muted)',
            letterSpacing: '1px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--neon-blue)'; e.target.style.color = 'var(--neon-blue)' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
          >↻</button>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

function TickerGame({ game }) {
  const leading = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam
  const trailing = game.homeScore > game.awayScore ? game.awayTeam : game.homeTeam
  const leadScore = Math.max(game.homeScore, game.awayScore)
  const trailScore = Math.min(game.homeScore, game.awayScore)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        fontSize: '13px',
        color: 'var(--text)',
      }}>{leading}</span>
      <span style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '15px',
        color: 'var(--neon-blue)',
        letterSpacing: '1px',
      }}>{leadScore} – {trailScore}</span>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 600,
        fontSize: '13px',
        color: 'var(--text2)',
      }}>{trailing}</span>
      {game.inProgress && game.clock && (
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: '#00ff9d',
          letterSpacing: '1px',
        }}>{game.clock} {game.period && `H${game.period}`}</span>
      )}
      {game.completed && (
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: 'var(--muted)',
          letterSpacing: '1px',
        }}>F</span>
      )}
    </div>
  )
}
