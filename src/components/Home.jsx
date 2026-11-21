import React, { useMemo } from 'react'
import { PROGRAM } from '../config.js'
import { overallImprovement, lastValue, pct } from '../lib/stats.js'
import { squadStats, BADGES, AGE_GROUPS, badgesFor, badgeProgress } from '../lib/fun.js'
import { activeDays, streak, dayKey } from '../lib/me.js'
import RaceTrack from './RaceTrack.jsx'

const DAY = 86400000
function useDaysToStart() {
  if (!PROGRAM.startDate) return null
  const diff = new Date(`${PROGRAM.startDate}T00:00:00`).getTime() - Date.now()
  return diff > 0 ? Math.ceil(diff / DAY) : 0
}

/* The squad goal is real numbers only: sample athletes never count toward the pizza. */
function SquadGoal({ athletes }) {
  const real = athletes.filter(a => !a.sample)
  const s = useMemo(() => squadStats(real), [athletes])
  const goal = PROGRAM.cap
  const started = real.some(a => !a.empty)
  const pctDone = Math.min(100, (s.seconds / goal) * 100)
  return (
    <div className="squad-goal">
      <div className="squad-goal-head"><b>Squad goal: {goal} seconds faster, together</b><span className="mono">{started ? `${Math.round(pctDone)}%` : 'Week 1'}</span></div>
      <div className="squad-meter" role="img" aria-label={`${s.seconds} of ${goal} seconds`}>
        <i style={{ width: `${pctDone}%` }} />
        <em className="meter-prize" aria-hidden="true">🍕</em>
        {[0.25, 0.5, 0.75].map(m => <span key={m} className={pctDone >= m * 100 ? 'hit' : ''} style={{ left: `${m * 100}%` }} />)}
      </div>
      <p className="pizza">🍕 Hit the goal and the whole squad gets a pizza party after the Week 10 workout.</p>
      <p className="small" style={{ margin: '8px 0 0' }}>{started ? `${s.seconds.toFixed(1)} seconds shaved so far, counting every athlete's 40 and shuttle.` : 'The meter starts moving after Week 5 testing. Every athlete counts.'}</p>
    </div>
  )
}

/* ---------- visitors: the pitch, kept short ---------- */
function VisitorHome({ go, athletes, openAthlete, count }) {
  const days = useDaysToStart()
  const inCount = count?.confirmed
  const spotsLeft = count == null ? null : Math.max(PROGRAM.cap - count.confirmed, 0)
  const full = spotsLeft === 0
  const realRanked = useMemo(() => athletes.filter(a => !a.sample && !a.empty).sort((a, b) => overallImprovement(b) - overallImprovement(a)).slice(0, 3), [athletes])
  const demo = useMemo(() => [...athletes].filter(a => a.sample).sort((a, b) => overallImprovement(b) - overallImprovement(a))[0], [athletes])
  const demoGhost = demo?.results?.forty?.[0], demoNow = demo ? lastValue(demo.results.forty || []) : null

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
          {/* The button lives inside the photo so it is on the first screen of any phone. */}
          <a className="btn btn-red btn-block hero-cta" href="#join">{full ? 'Join the waitlist' : `Reserve a spot${spotsLeft ? ` · ${spotsLeft} left` : ''}`}</a>
        </div>
      </section>

      <section className="intro">
        <p className="lede">Get timed on day one. Get timed again in Week 10. See the difference on your own Speed Card.</p>
        <p className="where">Sundays, {PROGRAM.startLabel.replace(/^Starting/, 'starting')} · {PROGRAM.sessionLength} · <a href={PROGRAM.locationMapUrl} target="_blank" rel="noreferrer">{PROGRAM.location}</a></p>
      </section>

      <section className="scoreboard" aria-label="Key details">
        <div><b>{inCount ?? '–'}</b><span>Athletes in</span></div>
        <div><b>{full ? 'FULL' : spotsLeft ?? '–'}</b><span>{full ? 'Waitlist open' : 'Spots left'}</span></div>
        {days != null ? <div><b>{days}</b><span>Days to go</span></div> : <div><b>$0</b><span>Cost</span></div>}
      </section>

      <section className="section">
        <h2>How it works</h2>
        <ol className="steps">
          <li><span className="num">01</span><div><b>Get timed</b><p>Week 1: 40-yard dash with a 20-yard split, 5-10-5 shuttle and broad jump.</p></div></li>
          <li><span className="num">02</span><div><b>Train smart</b><p>Short reps, full rest, real sprint mechanics. Jumps, top speed and races every Sunday.</p></div></li>
          <li><span className="num">03</span><div><b>See the proof</b><p>Retest in Weeks 5 and 10. Your Speed Card shows every gain, and the board ranks improvement, not who started fastest.</p></div></li>
        </ol>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 16 }} onClick={() => go('plan')}>See the 10-week plan</button>
      </section>

      <section className="section">
        <h2>Inside the clinic</h2>
        <p className="sub">Tap any of these to try it now.</p>
        <div className="features">
          <button className="feature" onClick={() => demo && openAthlete(demo)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M7 15l3-3 3 2 4-5" /></svg>
            <b>Your Speed Card</b><span>Every time, every week, charted.</span><em>See a sample →</em>
          </button>
          <button className="feature" onClick={() => go('board')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 20V10M12 20V4M18 20v-6" /></svg>
            <b>Speed Board</b><span>Ranked by improvement, not raw speed.</span><em>View board →</em>
          </button>
          <button className="feature" onClick={() => go('tools')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
            <b>Speed Tools</b><span>Sprint timer, reaction game, hands-free reps.</span><em>Try it →</em>
          </button>
          <button className="feature" onClick={() => go('learn')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 8l10-5 10 5-10 5zM6 10.5V16c3 2 9 2 12 0v-5.5" /></svg>
            <b>Speed School</b><span>Lessons, visuals and quizzes. Earn Speed Scholar.</span><em>Start lesson 1 →</em>
          </button>
        </div>
      </section>

      {demo && demoGhost && demoNow && (
        <section className="section">
          <h2>Race your ghost</h2>
          <p className="sub">Every Speed Card races your Week 10 self against your Week 1 self, at real speed.</p>
          <RaceTrack title={demo.name} note="Sample athlete" lanes={[{ id: 'g', label: 'Week 1', time: demoGhost, ghost: true, pair: 'x' }, { id: 'n', label: 'Week 10', time: demoNow, pair: 'x' }]} buttonLabel="Race the ghost" />
        </section>
      )}

      <section className="section">
        <h2>The Squad</h2>
        <p className="sub">Every second anyone shaves goes into one team total. Fast or new, everyone pushes the squad forward.</p>
        <SquadGoal athletes={athletes} />
        <p className="eyebrow" style={{ margin: '22px 0 10px' }}>Badges to chase</p>
        <div className="badge-strip">
          {BADGES.map(b => <div key={b.id} className="badge-pill"><span aria-hidden="true">{b.icon}</span><b>{b.label}</b><small>{b.desc}</small></div>)}
        </div>
      </section>

      {realRanked.length > 0 && (
        <section className="section">
          <h2>Most Improved</h2>
          <div className="board">
            {realRanked.map((a, i) => (
              <button key={a.id} className="board-row" onClick={() => openAthlete(a)}>
                <span className={`rank ${i === 0 ? 'gold' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="who"><b>{a.name}</b> <span>· {a.age}</span></span>
                <span className="gain">{pct(overallImprovement(a))}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 16 }} onClick={() => go('board')}>Full Speed Board</button>
        </section>
      )}

      <section className="section">
        <a className="btn btn-red btn-block" href="#join">{full ? 'Join the waitlist' : `Reserve a spot${spotsLeft ? ` · ${spotsLeft} left` : ''}`}</a>
        <p className="small" style={{ textAlign: 'center', marginTop: 10 }}>Details, the waiver, FAQs and the equipment fund are on the sign-up page.</p>
      </section>
    </>
  )
}

/* ---------- athletes: their own home ---------- */
const CHALLENGES = [
  { id: 'react', icon: '🚦', title: 'Reaction Start', desc: 'Play one 5-round set and try to beat your best.', tool: 'react' },
  { id: 'feet', icon: '👟', title: 'Quick Feet', desc: 'Two 10-second rounds. Beat your tap count.', tool: 'feet' },
  { id: 'timer', icon: '⏱️', title: '3 practice sprints', desc: '10 yards each, full rest in between. Get someone to stand at the finish.', tool: 'timer' },
  { id: 'session', icon: '🔁', title: 'Sprint Session', desc: '4 reps of 10-yard starts with 60 seconds rest. Hands-free.', tool: 'session' },
]

function AthleteHome({ me, mine, athletes, go, openAthlete }) {
  const days = useDaysToStart()
  const first = mine.name.split(' ')[0]
  const earned = badgesFor(mine, athletes)
  const next = badgeProgress(mine, athletes).slice(0, 3)
  const runDays = activeDays()
  const doneToday = runDays.includes(dayKey())
  const st = streak(runDays)

  // Speed School comes first until it's passed, then the tools rotate by day.
  const dayNum = Math.floor(Date.now() / DAY)
  const challenge = (mine.lessons || 0) < 3
    ? { id: 'school', icon: '🧠', title: `Speed School lesson ${(mine.lessons || 0) + 1}`, desc: 'About 2 minutes, then a 3-question quiz. Counts toward Speed Scholar.', learn: true }
    : CHALLENGES[dayNum % CHALLENGES.length]
  const startChallenge = () => {
    if (challenge.learn) { go('learn'); return }
    try { sessionStorage.setItem('sws_tool', challenge.tool) } catch { /* ignore */ }
    go('tools')
  }

  const group = AGE_GROUPS.slice(1).find(g => g.test(mine))
  const peers = athletes.filter(a => !a.sample && !a.empty && group?.test(a)).sort((a, b) => overallImprovement(b) - overallImprovement(a))
  const rank = mine.empty ? null : peers.findIndex(a => a.id === mine.id) + 1

  const status = mine.empty
    ? (days != null ? `${days} days to Week 1. Get a head start below.` : `Week 1 is in ${PROGRAM.startLabel.replace(/^Starting /, '')}. Get a head start below.`)
    : `${pct(overallImprovement(mine))} overall since Week 1.`

  return (
    <>
      <section className="section me-hero">
        <p className="eyebrow">Speed Work Sundays</p>
        <h1 className="me-hi">Hey {first}!</h1>
        <p className="me-status">{status}</p>
        <div className="tool-stats" style={{ marginTop: 14 }}>
          <div><span>Streak</span><b className="gold">{st ? `🔥 ${st}` : '0'}</b></div>
          <div><span>Badges</span><b className="good">{earned.length}/{BADGES.length}</b></div>
          <div><span>{rank ? `Ages ${group.label}` : 'Lessons'}</span><b>{rank ? `#${rank} of ${peers.length}` : `${mine.lessons || 0}/3`}</b></div>
        </div>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={() => openAthlete(mine)}>Open my Speed Card</button>
      </section>

      <section className="section">
        <h2>Today's challenge</h2>
        <div className={`challenge ${doneToday ? 'done' : ''}`}>
          <span className="challenge-icon" aria-hidden="true">{challenge.icon}</span>
          <div>
            <b>{challenge.title}</b>
            <p>{challenge.desc}</p>
          </div>
        </div>
        <button className="btn btn-red btn-block" onClick={startChallenge}>{doneToday ? 'Done today ✓ · go again' : "Let's go"}</button>
        <p className="small" style={{ marginTop: 8 }}>{st >= 2 ? `${st} days in a row. Keep it going tomorrow.` : 'Do something every day to build a streak.'}</p>
      </section>

      {next.length > 0 && (
        <section className="section">
          <h2>Closest badges</h2>
          <div className="next-badges">
            {next.map(b => (
              <div key={b.id} className="next-badge">
                <span aria-hidden="true">{b.icon}</span>
                <div>
                  <b>{b.label}</b>
                  <small>{b.desc}</small>
                  <div className="scholar-bar"><i style={{ width: `${Math.round(b.pct * 100)}%` }} /></div>
                  <small className="hint">{b.hint}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>The Squad</h2>
        <SquadGoal athletes={athletes} />
      </section>

      <section className="section">
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className="btn btn-ghost" onClick={() => go('board')}>Speed Board</button>
          <button className="btn btn-ghost" onClick={() => go('plan')}>10-Week Plan</button>
        </div>
      </section>
    </>
  )
}

export default function Home({ go, athletes, openAthlete, me, count }) {
  const mine = me && athletes.find(a => a.id === me.id)
  return mine
    ? <AthleteHome me={me} mine={mine} athletes={athletes} go={go} openAthlete={openAthlete} />
    : <VisitorHome go={go} athletes={athletes} openAthlete={openAthlete} count={count} />
}
