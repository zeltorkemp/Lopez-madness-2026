import React, { useEffect, useState } from 'react'

export default function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px 60px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow behind title */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(0,200,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Year badge */}
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        letterSpacing: '5px',
        color: 'var(--neon-blue)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.6s ease',
        marginBottom: '16px',
        border: '1px solid rgba(0,200,255,0.2)',
        padding: '6px 16px',
        borderRadius: '2px',
      }}>// NCAA MARCH MADNESS 2026</div>

      {/* Main title */}
      <div style={{
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s ease 0.1s',
        marginBottom: '8px',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 'clamp(64px, 15vw, 140px)',
          letterSpacing: '6px',
          lineHeight: '0.9',
          background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>LOPEZ</div>
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 'clamp(64px, 15vw, 140px)',
          letterSpacing: '6px',
          lineHeight: '0.9',
          background: 'linear-gradient(180deg, var(--neon-blue) 0%, rgba(0,200,255,0.5) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>MADNESS</div>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '16px',
        fontWeight: 600,
        letterSpacing: '4px',
        color: 'var(--text2)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.7s ease 0.25s',
        marginBottom: '48px',
        textTransform: 'uppercase',
      }}>The Family Bracket Battle</div>

      {/* Player cards */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease 0.4s',
        marginBottom: '60px',
      }}>
        {[
          { name: 'Dad', emoji: '👨🏻', color: '#00c8ff', champion: 'Duke', role: 'The Veteran' },
          { name: 'Kannon & Kai', emoji: '👦🏻👦🏻', color: '#ff6b00', champion: 'Michigan', role: 'The Challengers' },
        ].map((p, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: `1px solid ${p.color}33`,
            borderRadius: '12px',
            padding: '20px 28px',
            textAlign: 'center',
            minWidth: '160px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = p.color + '88'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = p.color + '33'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{p.emoji}</div>
            <div style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: '22px',
              letterSpacing: '2px',
              color: p.color,
              marginBottom: '4px',
            }}>{p.name}</div>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              letterSpacing: '2px',
              color: 'var(--muted)',
              marginBottom: '10px',
              textTransform: 'uppercase',
            }}>{p.role}</div>
            <div style={{
              background: `${p.color}18`,
              border: `1px solid ${p.color}44`,
              borderRadius: '6px',
              padding: '6px 10px',
            }}>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '7px',
                letterSpacing: '2px',
                color: p.color,
                marginBottom: '2px',
              }}>🏆 CHAMPION PICK</div>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: '18px',
                letterSpacing: '1.5px',
                color: '#fff',
              }}>{p.champion}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        opacity: visible ? 0.5 : 0,
        transition: 'opacity 1s ease 1s',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '8px',
          letterSpacing: '3px',
          color: 'var(--muted)',
        }}>SCROLL</div>
        <div style={{
          width: '1px',
          height: '32px',
          background: 'linear-gradient(var(--neon-blue), transparent)',
          animation: 'pulse 1.5s infinite',
        }} />
      </div>
    </section>
  )
}
