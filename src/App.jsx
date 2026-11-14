import React, { useEffect, useState, useCallback } from 'react'
import { LIVE, PROGRAM } from './config.js'
import { getAthletes } from './lib/store.js'
import Home from './components/Home.jsx'
import Lab from './components/Lab.jsx'
import Board from './components/Board.jsx'
import Plan from './components/Plan.jsx'
import Join from './components/Join.jsx'
import Coach from './components/Coach.jsx'
import SpeedCard from './components/SpeedCard.jsx'

const TABS = [
  { id: 'home', label: 'Home', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'board', label: 'Speed Board', icon: 'M5 20V10M12 20V4M19 20v-7' },
  { id: 'lab', label: 'Speed Lab', icon: 'M12 8v5l3 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9 2h6' },
  { id: 'plan', label: 'Plan', icon: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'join', label: 'Join', icon: 'M12 5v14M5 12h14' },
]

const readHash = () => (window.location.hash.replace('#', '') || 'home')

export default function App() {
  const [tab, setTab] = useState(readHash)
  const [athletes, setAthletes] = useState([])
  const [open, setOpen] = useState(null)

  const refresh = useCallback(() => { getAthletes().then(setAthletes).catch(() => setAthletes([])) }, [])
  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const onHash = () => { setTab(readHash()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = id => { window.location.hash = id }
  // Speed Card opens as its own history entry so the phone's Back button/swipe closes it
  const openAthlete = a => { window.history.pushState({ card: true }, ''); setOpen(a) }
  const closeCard = useCallback(() => { if (window.history.state?.card) window.history.back(); else setOpen(null) }, [])
  useEffect(() => {
    const onPop = () => setOpen(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <div className="app">
      {!LIVE && (
        <div className="demo-banner" role="note">Preview mode: sample athletes shown. Real Speed Cards go live on Week 1.</div>
      )}
      <header className="topbar">
        <button className="brand" onClick={() => go('home')} aria-label="Speed Work Sundays home">
          <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#E53935"/><path d="M36 12l-7 23h10l-4 17 16-25H41l6-15z" fill="#fff"/></svg>
          <span>Speed Work <em>Sundays</em></span>
        </button>
        <a className="top-cta" href="#join">Sign up</a>
      </header>

      <main className="main">
        {tab === 'home' && <Home go={go} athletes={athletes} openAthlete={openAthlete} />}
        {tab === 'board' && <Board athletes={athletes} openAthlete={openAthlete} />}
        {tab === 'lab' && <Lab />}
        {tab === 'plan' && <Plan />}
        {tab === 'join' && <Join />}
        {tab === 'coach' && <Coach athletes={athletes} onSaved={refresh} />}
        <footer className="footer">
          <p>{PROGRAM.name} · Free youth speed clinic · {PROGRAM.location}</p>
          <p>{PROGRAM.coach}{PROGRAM.contact && <> · <a href={`mailto:${PROGRAM.contact}`}>{PROGRAM.contact}</a></>}</p>
          <a href="#coach" className="coach-link">Coach login</a>
        </footer>
      </main>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map(t => (
          <a key={t.id} href={`#${t.id}`} className={tab === t.id ? 'active' : ''} aria-current={tab === t.id ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.icon} /></svg>
            <span>{t.label}</span>
          </a>
        ))}
      </nav>

      {open && <SpeedCard athlete={open} athletes={athletes} onClose={closeCard} />}
    </div>
  )
}
