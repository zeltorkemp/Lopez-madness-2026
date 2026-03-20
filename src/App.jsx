import React, { useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import BracketView from './components/BracketView.jsx'
import StatsSection from './components/StatsSection.jsx'
import ChampionShowdown from './components/ChampionShowdown.jsx'
import LiveTicker from './components/LiveTicker.jsx'
import { useLiveScores } from './hooks/useLiveScores.js'

const DEFAULT_RESULTS = {
  firstRound: new Array(32).fill(null),
  eliteEight: new Array(8).fill(null),
  finalFour: new Array(4).fill(null),
  champion: null,
  liveScores: {},
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const { bracketResults: raw, liveGames, lastUpdated, loading, error, refetch } = useLiveScores()
  const bracketResults = raw || DEFAULT_RESULTS

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-20vh', left: '-10vw', width: '60vw', height: '60vh', background: 'radial-gradient(ellipse, rgba(0,200,255,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20vh', right: '-10vw', width: '60vw', height: '60vh', background: 'radial-gradient(ellipse, rgba(255,107,0,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
        <LiveTicker liveGames={liveGames} lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />

        <div style={{ paddingTop: liveGames.filter(g => g.inProgress || g.completed).length > 0 ? '92px' : '56px' }}>
          {activeTab === 'home' && <Hero bracketResults={bracketResults} setActiveTab={setActiveTab} />}
          {activeTab === 'standings' && <Leaderboard bracketResults={bracketResults} />}
          {activeTab === 'bracket' && <BracketView bracketResults={bracketResults} />}
          {activeTab === 'stats' && <StatsSection bracketResults={bracketResults} />}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}

function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'standings', icon: '🏆', label: 'Standings' },
    { id: 'bracket', icon: '📋', label: 'Bracket' },
    { id: 'stats', icon: '📊', label: 'Stats' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      height: '64px', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px',
          transition: 'all 0.2s',
          borderTop: activeTab === tab.id ? `2px solid var(--blue)` : '2px solid transparent',
        }}>
          <span style={{ fontSize: '20px', filter: activeTab === tab.id ? 'none' : 'grayscale(1) opacity(0.4)' }}>{tab.icon}</span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '1px',
            color: activeTab === tab.id ? 'var(--blue)' : 'var(--muted)',
            textTransform: 'uppercase',
          }}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
