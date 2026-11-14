import React, { useEffect, useMemo, useState } from 'react'
import { PROGRAM, FUND } from '../config.js'
import { rsvpCount } from '../lib/store.js'
import { overallImprovement } from '../lib/stats.js'

function useCountdown(dateStr) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  if (!dateStr) return null
  const diff = new Date(`${dateStr}T09:00:00`).getTime() - now
  if (diff <= 0) return null
  return { d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60 }
}

export default function Home({ go, athletes, openAthlete }) {
  const [count, setCount] = useState(null)
  useEffect(() => { rsvpCount().then(setCount).catch(() => setCount(null)) }, [])
  const cd = useCountdown(PROGRAM.startDate)
  const spotsLeft = count == null ? PROGRAM.cap : Math.max(PROGRAM.cap - count.confirmed, 0)
  const full = spotsLeft === 0
  const ranked = useMemo(() => [...athletes].sort((a, b) => overallImprovement(b) - overallImprovement(a)).slice(0, 3), [athletes])
  const sample = ranked.some(a => a.sample)
  const fundPct = Math.min(100, Math.round((FUND.raised / FUND.goal) * 100))

  return (
    <>
      <section className="hero">
        <picture>
          <source media="(max-width: 700px)" srcSet="/hero-sm.jpg" />
          <img src="/hero.jpg" alt="Youth athlete sprinting" />
        </picture>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Free · {PROGRAM.weeks} Sundays · Ages {PROGRAM.ages}</p>
          <h1>Speed<br />Work<br />Sundays</h1>
        </div>
      </section>

      <section className="intro">
        <p className="lede">Get timed on day one. Get timed again in Week 10. See the difference on your own Speed Card.</p>
        <a className="btn btn-red btn-block" href="#join">{full ? 'Join the waitlist' : 'Reserve a spot'}</a>
      </section>

      <section className="scoreboard" aria-label="Key details">
        {cd ? (
          <>
            <div><b>{cd.d}</b><span>Days</span></div>
            <div><b>{cd.h}</b><span>Hours</span></div>
            <div><b>{cd.m}</b><span>Min</span></div>
          </>
        ) : (
          <>
            <div><b>{full ? 'FULL' : spotsLeft}</b><span>{full ? 'Waitlist open' : 'Spots left'}</span></div>
            <div><b>9:00</b><span>Sundays AM</span></div>
            <div><b>$0</b><span>Cost</span></div>
          </>
        )}
      </section>

      <section className="section">
        <h2>How it works</h2>
        <ol className="steps">
          <li><span className="num">01</span><div><b>Get timed</b><p>Week 1: 20-yard dash, 5-10-5 shuttle and broad jump.</p></div></li>
          <li><span className="num">02</span><div><b>Train smart</b><p>Short reps, full rest, real sprint mechanics. Jumps, top speed and races every Sunday.</p></div></li>
          <li><span className="num">03</span><div><b>See the proof</b><p>Retest in Weeks 5 and 10. Your Speed Card shows every gain.</p></div></li>
        </ol>
      </section>

      {ranked.length > 0 && (
        <section className="section">
          <h2>Most Improved</h2>
          <p className="sub">The scoreboard is your own progress, not who started fastest.{sample ? ' Sample athletes shown until Week 1.' : ''}</p>
          <div className="board">
            {ranked.map((a, i) => (
              <button key={a.id} className="board-row" onClick={() => openAthlete(a)}>
                <span className={`rank ${i === 0 ? 'gold' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="who"><b>{a.name}</b> <span>· {a.age}</span></span>
                <span className="gain">+{overallImprovement(a)}%</span>
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 16 }} onClick={() => go('board')}>Full Speed Board</button>
        </section>
      )}

      <section className="section">
        <h2>What gets timed</h2>
        <div className="tested">
          <div><b>20-yard dash</b><span>Weeks 1, 5, 10</span></div>
          <div><b>5-10-5 shuttle</b><span>Weeks 1, 5, 10</span></div>
          <div><b>Broad jump</b><span>Weeks 1, 5, 10</span></div>
        </div>
      </section>

      <section className="section">
        <h2>The details</h2>
        <dl className="info-list">
          <div><dt>Who</dt><dd>Ages {PROGRAM.ages}, any sport</dd></div>
          <div><dt>When</dt><dd>Sundays, {PROGRAM.time}<br /><span className="small">{PROGRAM.startLabel}</span></dd></div>
          <div><dt>Where</dt><dd><a href={PROGRAM.locationMapUrl} target="_blank" rel="noreferrer">{PROGRAM.location}</a></dd></div>
          <div><dt>Cost</dt><dd>Free</dd></div>
          <div><dt>Bring</dt><dd>Water, sneakers or turf cleats</dd></div>
        </dl>
      </section>

      <section className="section">
        <h2>Equipment Fund</h2>
        <p className="sub">100% of donations buy gear: timing lasers, parachutes, ladders and guest coaches. Every purchase gets posted here.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 22, color: 'var(--gold)' }}>${FUND.raised}</span>
          <span className="small">goal ${FUND.goal}</span>
        </div>
        <div className="meter"><i style={{ width: `${fundPct}%` }} /></div>
        <div className="btn-row">
          <a className="btn btn-red" href={PROGRAM.cashAppUrl} target="_blank" rel="noreferrer">Donate {PROGRAM.cashApp}</a>
          <a className="btn btn-ghost" href="#join">See the gear list</a>
        </div>
      </section>
    </>
  )
}
