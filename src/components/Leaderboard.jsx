import React from 'react'
import { PLAYERS, SCORING, FIRST_ROUND, KNOWN_RESULTS } from '../data/brackets.js'

const DEFAULT_RESULTS = {
  firstRound: new Array(32).fill(null),
  secondRound: new Array(16).fill(null),
  eliteEight: [], finalFour: [], champion: null, liveScores: {}
}

// Second round matchups in order (who plays who after round 1)
// Each pair of first-round winners plays each other
const SECOND_ROUND_MATCHUPS = [
  // EAST: games 1-8 winners pair up: (1v2, 3v4, 5v6, 7v8)
  [0, 1], [2, 3], [4, 5], [6, 7],
  // WEST: games 9-16
  [8, 9], [10, 11], [12, 13], [14, 15],
  // MIDWEST: games 17-24
  [16, 17], [18, 19], [20, 21], [22, 23],
  // SOUTH: games 25-32
  [24, 25], [26, 27], [28, 29], [30, 31],
]

function calcScore(player, results) {
  const r = results || DEFAULT_RESULTS
  let score = 0, correct = 0, total = 0

  // First round
  ;(r.firstRound || []).forEach((res, i) => {
    if (res !== null) { total++; if (player.firstRound[i] === res) { score += 1; correct++ } }
  })

  // Second round — check if player's first round pick survived to play and won
  ;(r.secondRound || []).forEach((res, i) => {
    if (res !== null) {
      total++
      // Player's second round pick = whoever they picked in first round from that matchup
      const [a, b] = SECOND_ROUND_MATCHUPS[i]
      const playerPickA = player.firstRound[a]
      const playerPickB = player.firstRound[b]
      // They get credit if their pick from either game in this pair won R2
      if (playerPickA === res || playerPickB === res) { score += 2; correct++ }
    }
  })

  // Elite 8 / Final Four / Champion (future rounds)
  ;(r.eliteEight || []).forEach((res, i) => {
    if (res) { total++; if ((player.eliteEight || [])[i] === res) { score += 2; correct++ } }
  })
  ;(r.finalFour || []).forEach((res, i) => {
    if (res) { total++; if ((player.finalFour || [])[i] === res) { score += 4; correct++ } }
  })
  if (r.champion) { total++; if (player.champion === r.champion) { score += 8; correct++ } }

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
  const r1Played = (results.firstRound || []).filter(r => r !== null).length
  const r2Played = (results.secondRound || []).filter(r => r !== null).length
  const currentRound = r2Played > 0 ? 'Round of 32' : r1Played > 0 ? 'Round of 64' : 'Pre-Tournament'

  return (
    <div style={{ padding: '28px 20px 100px', maxWidth: '640px', margin: '0 auto' }}>
      <SectionHeader label="STANDINGS" title="Leaderboard" subtitle={`${currentRound} · ${r1Played} R1 + ${r2Played} R2 games complete`} />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: r2Played > 0 ? 'var(--green)' : 'var(--orange)', boxShadow: `0 0 8px ${r2Played > 0 ? 'var(--green)' : 'var(--orange)'}`, animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: r2Played > 0 ? 'var(--green)' : 'var(--orange)' }}>
          {r2Played === 16 ? 'SWEET 16 SET — ROUND OF 32 COMPLETE' : r1Played === 32 ? 'ROUND OF 32 IN PROGRESS' : 'ROUND OF 64 IN PROGRESS'}
        </span>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {scored.map((player, rank) => <PlayerCard key={player.id} player={player} rank={rank} r2Played={r2Played} />)}
      </div>

      {/* Sweet 16 teams */}
      {r2Played === 16 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--purple)', letterSpacing: '3px', marginBottom: '16px' }}>🏆 SWEET 16 TEAMS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {(results.secondRound || []).map((team, i) => {
              if (!team) return null
              const dadHas = scored[0].firstRound?.some((p, fi) => {
                const [a, b] = SECOND_ROUND_MATCHUPS[i]
                return (fi === a || fi === b) && p === team
              })
              const kidsHas = scored[1]?.firstRound?.some((p, fi) => {
                const [a, b] = SECOND_ROUND_MATCHUPS[i]
                return (fi === a || fi === b) && p === team
              })
              return (
                <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{team}</span>
                  <span style={{ fontSize: '10px' }}>
                    {dadHas ? PLAYERS[0].emoji : ''}
                    {kidsHas ? PLAYERS[1].emoji : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Champion picks */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '28px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--purple)', letterSpacing: '3px', marginBottom: '16px' }}>🎯 CHAMPION PICKS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
          {PLAYERS.map((p, i) => {
            const isCorrect = results.champion && p.champion === results.champion
            const isWrong = results.champion && p.champion !== results.champion
            const stillAlive = (results.secondRound || []).includes(p.champion) || !results.secondRound?.some(r => r !== null)
            return (
              <React.Fragment key={p.id}>
                <div style={{ background: isCorrect ? 'rgba(0,255,157,0.08)' : isWrong ? 'rgba(255,45,122,0.06)' : `${p.color}0a`, border: `1px solid ${isCorrect ? 'rgba(0,255,157,0.3)' : isWrong ? 'rgba(255,45,122,0.2)' : p.color + '22'}`, borderRadius: '10px', padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{p.emoji}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: p.color, letterSpacing: '1px', marginBottom: '4px' }}>{p.name.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '20px', letterSpacing: '1.5px', color: isCorrect ? 'var(--green)' : isWrong ? 'var(--pink)' : stillAlive ? '#fff' : 'var(--muted)', textDecoration: !stillAlive && !isCorrect ? 'line-through' : 'none' }}>{p.champion}</div>
                  {isCorrect && <div style={{ fontSize: '14px', marginTop: '4px' }}>✅</div>}
                  {isWrong && <div style={{ fontSize: '14px', marginTop: '4px' }}>❌</div>}
                  {!results.champion && stillAlive && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--green)', marginTop: '4px', letterSpacing: '1px' }}>STILL ALIVE ✅</div>}
                  {!results.champion && !stillAlive && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--pink)', marginTop: '4px', letterSpacing: '1px' }}>ELIMINATED ❌</div>}
                </div>
                {i === 0 && <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '22px', color: 'var(--muted)', textAlign: 'center' }}>VS</div>}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--muted)', marginBottom: '12px' }}>SCORING</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {[['R64','1'],['R32','2'],['S16','3'],['E8','4'],['🏆','8']].map(([r,p]) => (
            <div key={r} style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: '8px', padding: '8px 2px' }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '18px', color: 'var(--blue)', lineHeight: 1 }}>{p}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '2px' }}>{r}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayerCard({ player, rank, r2Played }) {
  const maxPossible = 32 + 32 + 24 + 16 + 8 // rough max
  const isLeading = rank === 0 && player.score > 0

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
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: player.pct > 60 ? 'var(--green)' : player.pct > 40 ? 'var(--yellow)' : 'var(--text2)', letterSpacing: '1px' }}>{player.pct}%</span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((player.score / maxPossible) * 100, 100)}%`, background: `linear-gradient(90deg, ${player.color}, ${player.color}88)`, transition: 'width 1.2s ease', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s infinite' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
