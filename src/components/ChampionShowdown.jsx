import React from 'react'
import { PLAYERS } from '../data/brackets.js'
import { SectionHeader } from './Leaderboard.jsx'

export default function ChampionShowdown({ bracketResults }) {
  const champion = bracketResults?.champion || null

  return (
    <section style={{ padding: '0 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
      <SectionHeader label="THE BIG QUESTION" title="Champion Picks" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
        {PLAYERS.map((p, i) => (
          <React.Fragment key={p.id}>
            <ChampCard player={p} champion={champion} />
            {i === 0 && (
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: '32px',
                color: 'var(--muted)',
                textAlign: 'center',
                letterSpacing: '2px',
              }}>VS</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {champion && (
        <div style={{
          marginTop: '24px',
          background: 'linear-gradient(135deg, rgba(0,255,157,0.08), rgba(0,255,157,0.03))',
          border: '1px solid rgba(0,255,157,0.3)',
          borderRadius: '12px',
          padding: '20px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            letterSpacing: '3px',
            color: 'var(--neon-green)',
            marginBottom: '8px',
          }}>🏆 2026 NATIONAL CHAMPION</div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '48px',
            letterSpacing: '3px',
            color: '#fff',
          }}>{champion}</div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: 'var(--text2)',
            marginTop: '8px',
          }}>
            {PLAYERS.filter(p => p.champion === champion).map(p => p.name).join(' & ')} called it! 🎯
          </div>
        </div>
      )}
    </section>
  )
}

function ChampCard({ player, champion }) {
  const isCorrect = champion && player.champion === champion
  const isWrong = champion && player.champion !== champion

  return (
    <div style={{
      background: isCorrect
        ? 'linear-gradient(135deg, rgba(0,255,157,0.1), rgba(0,255,157,0.03))'
        : isWrong
          ? 'rgba(255,45,122,0.05)'
          : 'var(--surface)',
      border: `1px solid ${isCorrect ? 'rgba(0,255,157,0.4)' : isWrong ? 'rgba(255,45,122,0.3)' : player.color + '33'}`,
      borderRadius: '12px',
      padding: '24px 20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{player.emoji}</div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '9px',
        letterSpacing: '2px',
        color: 'var(--muted)',
        marginBottom: '4px',
        textTransform: 'uppercase',
      }}>{player.name}</div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '8px',
        letterSpacing: '2px',
        color: player.color,
        marginBottom: '12px',
      }}>CHAMPION PICK</div>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '32px',
        letterSpacing: '2px',
        color: isCorrect ? 'var(--neon-green)' : isWrong ? 'var(--neon-pink)' : '#fff',
        marginBottom: '8px',
      }}>{player.champion}</div>
      {isCorrect && <div style={{ fontSize: '20px' }}>✅</div>}
      {isWrong && <div style={{ fontSize: '20px' }}>❌</div>}
      {!champion && (
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '8px',
          color: 'var(--muted)',
          letterSpacing: '1px',
          animation: 'pulse 2s infinite',
        }}>PENDING...</div>
      )}
    </div>
  )
}
