import React, { useState, useEffect } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(6,10,18,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '20px',
        letterSpacing: '3px',
        background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-orange))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>LOPEZ MADNESS</div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {[
          { label: 'STANDINGS', id: 'leaderboard' },
          { label: 'BRACKET', id: 'bracket' },
          { label: 'STATS', id: 'stats' },
        ].map(item => (
          <button key={item.id} onClick={() => scrollTo(item.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--text2)',
            transition: 'color 0.2s',
            padding: '4px 0',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--neon-blue)'}
          onMouseLeave={e => e.target.style.color = 'var(--text2)'}
          >{item.label}</button>
        ))}
      </div>
    </nav>
  )
}
