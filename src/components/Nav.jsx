import React, { useState, useEffect } from 'react'

export default function Nav({ activeTab, setActiveTab }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '56px',
      background: scrolled ? 'rgba(5,8,16,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', transition: 'all 0.3s ease',
    }}>
      <button onClick={() => setActiveTab('home')} style={{
        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '18px' }}>🏀</span>
        <span style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: '18px', letterSpacing: '3px',
          background: 'linear-gradient(90deg, var(--blue), var(--orange))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>LOPEZ MADNESS</span>
      </button>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: '9px',
        letterSpacing: '2px', color: 'var(--muted)',
      }}>2026</div>
    </nav>
  )
}
