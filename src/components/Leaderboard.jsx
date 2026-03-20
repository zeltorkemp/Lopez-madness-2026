import React from 'react'
import { PLAYERS, SCORING, FIRST_ROUND } from '../data/brackets.js'

const DEFAULT_RESULTS = { firstRound: new Array(32).fill(null), eliteEight: [], finalFour: [], champion: null, liveScores: {} }

function calcScore(player, results) {
  const r = results || DEFAULT_RESULTS
  let score = 0, correct = 0, total = 0
  ;(r.firstRound || []).forEach((res, i) => { if (res !== null) { total++; if (player.firstRound[i] === res) { score += SCORING.firstRound; correct++ } } })
  ;(r.eliteEight || []).forEach((res, i) => { if (res !== null) { total++; if ((player.eliteEight || [])[i] === res) { score += SCORING.eliteEight; correct++ } } })
  ;(r.finalFour || []).forEach((res, i) => { if (res !== null) { total++; if ((player.finalFour || [])[i] === res) { score += SCORING.finalFour; correct++ } } })
  if (r.champion) { total++; if (player.champion === r.champion) { score += SCORING.champion; correct++ } }
  return { score, correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : 0 }
}

export function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '4px', color: 'var(--blue)', marginBottom: '6px', opacity: 0.7 }}>// {label}</div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(32px, 8vw, 48px)', letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>{title}</div>
      {subtitle && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: 'var(--text2)', marginTop: '6px' }}>{subtitle}</div>}
      <div style={{ height: '2px', width: '48px', background: 'linear-gradient(90deg, var(--blue), transparent)', marginTop: '10px' }} />
    </div>
  )
}

export default function Leaderboard({ bracketResults }) {
  const results = bracketResults || DEFAULT_RESULTS
  const scored = PLAYERS.map(p => ({ ...p, ...calcScore(p, results) })).sort((a, b) => b.score - a.score)
  const gamesPlayed = (results.firstRound || []).filter(r => r !== null).length

  return (
    <div style={{ padding: '28px 20px 100px', maxWidth: '640px', margin: '0 auto' }}>
      <SectionHeader label="STANDINGS" title="Leaderboard" subtitle={`${gamesPlayed} of 32 first round games complete`} />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: gamesPlayed > 0 ? 'var(--green)' : 'var(--orange)', boxShadow: `0 0 8px ${gamesPlayed > 0 ? 'var(--green)' : 'var(--orange)'}`, animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: gamesPlayed > 0 ? 'var(--green)' : 'var(--orange)' }}>
          {gamesPlayed > 0 ? 'TOURNAMENT IN PROGRESS' : 'AWAITING TIP-OFF'}
        </span>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {scored.map((player, rank) => <PlayerCard key={player.id} player={player} rank={rank} results={results} gamesPlayed={gamesPlayed} />)}
      </div>

      {/* Champion showdown */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '28px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--purple)', marginBottom: '16px' }}>🎯 CHAMPION PICKS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
          {PLAYERS.map((p, i) => {
            const isCorrect = results.champion && p.champion === results.champion
            const isWrong = results.champion && p.champion !== results.champion
            return (
              <React.Fragment key={p.id}>
                <div style={{ background: isCorrect ? 'rgba(0,255,157,0.08)' : isWrong ? 'rgba(255,45,122,0.06)' : `${p.color}0a`, border: `1px solid ${isCorrect ? 'rgba(0,255,157,0.3)' : isWrong ? 'rgba(255,45,122,0.2)' : p.color + '22'}`, borderRadius: '10px', padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{p.emoji}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: p.color, letterSpacing: '1px', marginBottom: '4px' }}>{p.name.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '22px', letterSpacing: '1.5px', color: isCorrect ? 'var(--green)' : isWrong ? 'var(--pink)' : '#fff' }}>{p.champion}</div>
                  {isCorrect && <div style={{ fontSize: '16px', marginTop: '4px' }}>✅</div>}
                  {isWrong && <div style={{ fontSize: '16px', marginTop: '4px' }}>❌</div>}
                  {!results.champion && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)', marginTop: '4px', animation: 'pulse 2s infinite' }}>PENDING</div>}
                </div>
                {i === 0 && <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '24px', color: 'var(--muted)', textAlign: 'center' }}>VS</div>}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--muted)', marginBottom: '12px' }}>SCORING</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[['R64','1pt'],['E8','2pts'],['F4','4pts'],['🏆','8pts']].map(([r,p]) => (
            <div key={r} style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: '8px', padding: '10px 4px' }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '20px', color: 'var(--blue)' }}>{p}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)' }}>{r}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayerCard({ player, rank, results, gamesPlayed }) {
  const maxPossible = 68
  const isLeading = rank === 0 && gamesPlayed > 0

  return (
    <div style={{
      background: isLeading ? `linear-gradient(135deg, ${player.color}0e, var(--surface))` : 'var(--surface)',
      border: `1px solid ${isLeading ? player.color + '44' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '44px', color: isLeading ? player.color : 'var(--muted)', lineHeight: 1, minWidth: '32px' }}>{rank + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '22px' }}>{player.emoji}</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '24px', letterSpacing: '2px', color: player.color }}>{player.name}</span>
            {isLeading && <span>👑</span>}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)', letterSpacing: '1px' }}>🏆 {player.champion}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '52px', lineHeight: 1, color: player.score > 0 ? player.color : 'var(--muted)' }}>{player.score}</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--muted)', letterSpacing: '1px' }}>POINTS</div>
        </div>
      </div>
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--muted)', letterSpacing: '1px' }}>{player.correct} CORRECT / {player.total} PLAYED</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: player.pct > 60 ? 'var(--green)' : 'var(--text2)', letterSpacing: '1px' }}>{player.pct}%</span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(player.score / maxPossible) * 100}%`, background: `linear-gradient(90deg, ${player.color}, ${player.color}88)`, transition: 'width 1.2s ease', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s infinite' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
