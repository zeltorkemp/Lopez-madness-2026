import React from 'react'
import Hero from './components/Hero.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import BracketView from './components/BracketView.jsx'
import StatsSection from './components/StatsSection.jsx'
import ChampionShowdown from './components/ChampionShowdown.jsx'
import Nav from './components/Nav.jsx'
import LiveTicker from './components/LiveTicker.jsx'
import { useLiveScores } from './hooks/useLiveScores.js'

export default function App() {
  const { bracketResults: rawResults, liveGames, lastUpdated, loading, error, refetch } = useLiveScores()

  const DEFAULT_RESULTS = {
    firstRound: new Array(32).fill(null),
    eliteEight: new Array(8).fill(null),
    finalFour: new Array(4).fill(null),
    champion: null,
    liveScores: {},
  }

  const bracketResults = rawResults || DEFAULT_RESULTS

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Scanline */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.15), transparent)',
        zIndex: 1, pointerEvents: 'none',
        animation: 'scanline 8s linear infinite',
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav />
        <LiveTicker liveGames={liveGames} lastUpdated={lastUpdated} loading={loading} error={error} onRefresh={refetch} />
        <Hero />
        <Leaderboard bracketResults={bracketResults} />
        <ChampionShowdown bracketResults={bracketResults} />
        <BracketView bracketResults={bracketResults} />
        <StatsSection bracketResults={bracketResults} />
        <Footer />
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
      textAlign: 'center',
      marginTop: '80px',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '28px',
        letterSpacing: '4px',
        background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-orange))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '8px',
      }}>LOPEZ MADNESS 2026</div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '10px',
        color: 'var(--muted)',
        letterSpacing: '2px',
      }}>MAY THE BEST BRACKET WIN 🏀</div>
    </footer>
  )
}
