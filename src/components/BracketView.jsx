import React, { useState } from 'react'
import { PLAYERS, FIRST_ROUND, REGION_COLORS } from '../data/brackets.js'
import { SectionHeader } from './Leaderboard.jsx'

const REGIONS = ['East', 'West', 'Midwest', 'South']

export default function BracketView({ bracketResults }) {
  const [activeRegion, setActiveRegion] = useState('East')

  const regionGames = FIRST_ROUND.filter(g => g.region === activeRegion)

  return (
    <section id="bracket" style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <SectionHeader label="PICKS" title="Bracket Breakdown" />

      {/* Region tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {REGIONS.map(r => (
          <button key={r} onClick={() => setActiveRegion(r)} style={{
            background: activeRegion === r ? REGION_COLORS[r] + '22' : 'var(--surface)',
            border: `1px solid ${activeRegion === r ? REGION_COLORS[r] : 'var(--border)'}`,
            borderRadius: '6px',
            padding: '8px 20px',
            cursor: 'pointer',
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '16px',
            letterSpacing: '2px',
            color: activeRegion === r ? REGION_COLORS[r] : 'var(--text2)',
            transition: 'all 0.2s',
          }}>{r}</button>
        ))}
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 1fr',
        gap: '8px',
        marginBottom: '8px',
        padding: '0 4px',
      }}>
        {PLAYERS.map((p, i) => (
          <React.Fragment key={p.id}>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '9px',
              letterSpacing: '3px',
              color: p.color,
              textAlign: i === 1 ? 'right' : 'left',
              gridColumn: i === 0 ? 1 : 3,
            }}>{p.emoji} {p.name.toUpperCase()}</div>
          </React.Fragment>
        ))}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '8px',
          letterSpacing: '2px',
          color: 'var(--muted)',
          textAlign: 'center',
          gridColumn: 2,
        }}>GAME</div>
      </div>

      {/* Games */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {regionGames.map((game, idx) => {
          const result = bracketResults.firstRound[game.id - 1]
          return (
            <GameRow
              key={game.id}
              game={game}
              result={result}
              dadPick={PLAYERS[0].firstRound[game.id - 1]}
              kidsPick={PLAYERS[1].firstRound[game.id - 1]}
              regionColor={REGION_COLORS[activeRegion]}
              idx={idx}
            />
          )
        })}
      </div>

      {/* Final four for this region */}
      <div style={{ marginTop: '24px' }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '3px',
          color: 'var(--muted)',
          marginBottom: '10px',
        }}>// FINAL FOUR PICK — {activeRegion.toUpperCase()}</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          gap: '8px',
        }}>
          {PLAYERS.map((p, i) => {
            const ff = p.finalFour.find(t => {
              const regionTeams = FIRST_ROUND.filter(g => g.region === activeRegion)
                .flatMap(g => [g.top.name, g.bottom.name])
              return regionTeams.includes(t)
            }) || p.finalFour[REGIONS.indexOf(activeRegion)]
            return (
              <div key={p.id} style={{
                background: `${p.color}11`,
                border: `1px solid ${p.color}33`,
                borderRadius: '8px',
                padding: '12px 14px',
                textAlign: i === 0 ? 'left' : 'right',
                gridColumn: i === 0 ? 1 : 3,
              }}>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '7px',
                  letterSpacing: '2px',
                  color: p.color,
                  marginBottom: '4px',
                }}>FINAL FOUR</div>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: '20px',
                  letterSpacing: '1.5px',
                  color: '#fff',
                }}>{ff || '—'}</div>
              </div>
            )
          })}
          <div style={{ gridColumn: 2 }} />
        </div>
      </div>
    </section>
  )
}

function GameRow({ game, result, dadPick, kidsPick, regionColor, idx }) {
  const dadCorrect = result && dadPick === result
  const kidsCorrect = result && kidsPick === result
  const agree = dadPick === kidsPick

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 80px 1fr',
      gap: '8px',
      animation: `fadeUp 0.3s ease ${idx * 0.04}s both`,
    }}>
      {/* Dad pick */}
      <PickCell
        pick={dadPick}
        game={game}
        result={result}
        isCorrect={dadCorrect}
        color={PLAYERS[0].color}
        align="left"
      />

      {/* Center - game info */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 4px',
        gap: '2px',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '7px',
          color: regionColor,
          letterSpacing: '1px',
        }}>G{game.id}</div>
        {agree && (
          <div style={{ fontSize: '10px' }} title="Both agree">🤝</div>
        )}
        {result && (
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--neon-green)',
            boxShadow: '0 0 6px var(--neon-green)',
          }} />
        )}
      </div>

      {/* Kids pick */}
      <PickCell
        pick={kidsPick}
        game={game}
        result={result}
        isCorrect={kidsCorrect}
        color={PLAYERS[1].color}
        align="right"
      />
    </div>
  )
}

function PickCell({ pick, game, result, isCorrect, color, align }) {
  const isUpset = pick && (
    (pick === game.bottom.name && game.top.seed < game.bottom.seed) ||
    (pick === game.top.name && game.top.seed > game.bottom.seed)
  )
  // Actually: upset = picking the higher number seed
  const pickedSeed = pick === game.top.name ? game.top.seed : game.bottom.seed
  const opposingSeed = pick === game.top.name ? game.bottom.seed : game.top.seed
  const isActualUpset = pickedSeed > opposingSeed

  const bg = result
    ? isCorrect
      ? 'rgba(0,255,157,0.08)'
      : 'rgba(255,45,122,0.06)'
    : `${color}08`

  const borderColor = result
    ? isCorrect ? 'rgba(0,255,157,0.3)' : 'rgba(255,45,122,0.2)'
    : `${color}22`

  return (
    <div style={{
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: '6px',
      padding: '8px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '13px',
          color: result ? (isCorrect ? 'var(--neon-green)' : '#ff2d7a') : 'var(--text)',
          textAlign: align,
          letterSpacing: '0.3px',
        }}>{pick}</div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '7px',
          color: 'var(--muted)',
          textAlign: align,
          letterSpacing: '1px',
        }}>
          {pick === game.top.name ? game.top.seed : game.bottom.seed} seed
          {isActualUpset && <span style={{ color: color, marginLeft: '4px' }}>↑UPSET</span>}
        </div>
      </div>
      {result && (
        <span style={{ fontSize: '12px' }}>{isCorrect ? '✅' : '❌'}</span>
      )}
    </div>
  )
}
