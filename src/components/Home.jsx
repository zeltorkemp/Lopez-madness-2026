import React, { useEffect, useMemo, useState } from 'react'
import { PROGRAM, FUND } from '../config.js'
import { rsvpCount } from '../lib/store.js'
import { overallImprovement } from '../lib/stats.js'

function useCountdown(dateStr) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  if (!dateStr) return null
  const diff = new Date(`${dateStr}T13:00:00`).getTime() - now
  if (diff <= 0) return null
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60
  return { d, h, m, s }
}

export default function Home({ go, athletes, openAthlete }) {
  const [count, setCount] = useState(null)
  useEffect(() => { rsvpCount().then(setCount).catch(() => setCount(null)) }, [])
  const cd = useCountdown(PROGRAM.startDate)
  const spotsLeft = count == null ? PROGRAM.cap : Math.max(PROGRAM.cap - count, 0)
  const top = useMemo(() => [...athletes].sort((a, b) => overallImprovement(b) - overallImprovement(a))[0], [athletes])
  const fundPct = Math.min(100, Math.round((FUND.raised / FUND.goal) * 100))

  return (
    <>
      <section className="hero">
        <div className="speedlines" aria-hidden="true">
          {[12, 30, 48, 66, 84].map((t, i) => <i key={t} style={{ top: `${t}%`, width: `${40 + i * 12}%`, animationDelay: `${i * 0.27}s` }} />)}
        </div>
        <p className="kicker">Free offseason speed clinic · Ages {PROGRAM.ages}</p>
        <h1>Speed Work<span>Sundays</span></h1>
        <p className="sub">{PROGRAM.tagline} Ten Sundays at {PROGRAM.location.replace(' track', '')}.</p>

        {cd ? (
          <div className="chips" aria-label="Countdown to Week 1">
            <div className="chip"><b className="mono">{cd.d}</b><span>days</span></div>
            <div className="chip"><b className="mono">{cd.h}</b><span>hours</span></div>
            <div className="chip"><b className="mono">{cd.m}</b><span>min</span></div>
            <div className="chip"><b className="mono">{cd.s}</b><span>sec</span></div>
          </div>
        ) : (
          <div className="chips">
            <div className="chip"><b>10</b><span>Sundays</span></div>
            <div className="chip"><b>3</b><span>Timed tests</span></div>
            <div className="chip"><b>{PROGRAM.cap}</b><span>Spots</span></div>
            <div className="chip"><b>$0</b><span>Cost</span></div>
          </div>
        )}

        <div className="btn-row">
          <a className="btn btn-red" href="#join">Reserve a spot</a>
          <a className="btn btn-ghost" href="#lab">Test your reaction</a>
        </div>
      </section>

      <section className="section card" aria-label="Spots remaining">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h2 style={{ fontSize: 22, margin: 0 }}>{spotsLeft} of {PROGRAM.cap} spots left</h2>
          <span className="small">{PROGRAM.startDate ? `Starts ${new Date(`${PROGRAM.startDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Start date coming soon'}</span>
        </div>
        <div className="meter"><i style={{ width: `${((PROGRAM.cap - spotsLeft) / PROGRAM.cap) * 100}%` }} /></div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <div className="grid-3">
          <div className="card step"><b>01</b><h3>Get timed</h3><p>Week 1: 20-yard dash, 5-10-5 shuttle and broad jump.</p></div>
          <div className="card step"><b>02</b><h3>Train smart</h3><p>Short reps, full rest, real sprint mechanics. 60 minutes every Sunday.</p></div>
          <div className="card step"><b>03</b><h3>See the proof</h3><p>Retest in Weeks 5 and 10. Your Speed Card shows every gain.</p></div>
        </div>
      </section>

      {top && (
        <section className="section">
          <h2>Most Improved<small>The scoreboard is your own progress, not who started fastest.</small></h2>
          <button className="row top1" onClick={() => openAthlete(top)}>
            <span className="rank" aria-hidden="true">★</span>
            <span className="who"><b>{top.name}</b><span>Age {top.age} · {top.sport}</span></span>
            <span className="gain">+{overallImprovement(top)}%<small>overall</small></span>
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 4 }} onClick={() => go('board')}>See the full Speed Board</button>
        </section>
      )}

      <section className="section card">
        <h2 style={{ fontSize: 24 }}>The details</h2>
        <dl className="info-list">
          <div><dt>Who</dt><dd>Ages {PROGRAM.ages}, any sport</dd></div>
          <div><dt>When</dt><dd>Sundays · {PROGRAM.time}</dd></div>
          <div><dt>Where</dt><dd><a href={PROGRAM.locationMapUrl} target="_blank" rel="noreferrer">{PROGRAM.location}</a></dd></div>
          <div><dt>Cost</dt><dd>Free</dd></div>
          <div><dt>Bring</dt><dd>Water, sneakers or turf cleats</dd></div>
        </dl>
      </section>

      <section className="section card">
        <h2 style={{ fontSize: 24 }}>Equipment Fund</h2>
        <p style={{ color: '#CBD6EA', margin: '6px 0 14px', lineHeight: 1.5 }}>100% of donations go to equipment: timing lasers, parachutes, speed ladders and guest coaches. Every purchase gets posted here.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 8 }}>
          <span className="mono">${FUND.raised}</span><span className="small">goal ${FUND.goal}</span>
        </div>
        <div className="meter"><i style={{ width: `${fundPct}%` }} /></div>
        <a className="btn btn-ghost" href="#join" style={{ marginTop: 16, width: '100%' }}>Help out</a>
      </section>
    </>
  )
}
