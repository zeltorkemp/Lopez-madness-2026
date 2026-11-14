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
            <div><b>10</b><span>Sundays</span></div>
            <div><b>$0</b><span>Cost</span></div>
          </>
        )}
      </section>

      <section className="section">
        <h2>Inside the clinic</h2>
        <p className="sub">Tap any of these to try it now.</p>
        <div className="features">
          <button className="feature" onClick={() => ranked[0] && openAthlete(ranked[0])}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M7 15l3-3 3 2 4-5" /></svg>
            <b>Your Speed Card</b><span>Every time, every week, charted.</span><em>See a sample →</em>
          </button>
          <button className="feature" onClick={() => go('board')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 20V10M12 20V4M18 20v-6" /></svg>
            <b>Speed Board</b><span>Ranked by improvement, not raw speed.</span><em>View board →</em>
          </button>
          <button className="feature" onClick={() => go('tools')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
            <b>Speed Tools</b><span>Home sprint timer and a Week 10 goal calculator.</span><em>Try it →</em>
          </button>
          <button className="feature" onClick={() => go('plan')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
            <b>10-Week Plan</b><span>Drills, focus and at-home challenges.</span><em>See week 1 →</em>
          </button>
        </div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <ol className="steps">
          <li><span className="num">01</span><div><b>Get timed</b><p>Week 1: 40-yard dash with a 20-yard split, 5-10-5 shuttle and broad jump.</p></div></li>
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
          <div><b>40-yard dash</b><span>Weeks 1, 5, 10</span></div>
          <div><b>20-yard split</b><span>Inside the 40</span></div>
          <div><b>5-10-5 shuttle</b><span>Weeks 1, 5, 10</span></div>
          <div><b>Broad jump</b><span>Weeks 1, 5, 10</span></div>
        </div>
      </section>

      <section className="section">
        <h2>The details</h2>
        <dl className="info-list">
          <div><dt>Who</dt><dd>Ages {PROGRAM.ages}, any sport</dd></div>
          <div><dt>When</dt><dd>Sundays, {PROGRAM.startLabel.toLowerCase()}<br /><span className="small">{PROGRAM.timeNote}</span></dd></div>
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
