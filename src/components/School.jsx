import React, { useEffect, useRef, useState } from 'react'
import { usePlayers, Players } from '../lib/players.jsx'
import { Figure, gait, lerpPose } from './Runner.jsx'
import RaceTrack from './RaceTrack.jsx'

/* ---------- progress: each player on this phone earns Speed Scholar ---------- */
const SKEY = 'sws_school_v1'
const loadProg = () => { try { return JSON.parse(localStorage.getItem(SKEY)) || {} } catch { return {} } }
const saveProg = p => { try { localStorage.setItem(SKEY, JSON.stringify(p)) } catch { /* private mode */ } }

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ---------- lesson 1: the speed formula ---------- */
function SpeedFormula() {
  const [stride, setStride] = useState(4.5) // feet per step
  const [rate, setRate] = useState(3.8) // steps per second
  const fps = stride * rate
  const mph = fps * 0.6818
  const forty = 120 / fps
  const W = 340, track = W - 40
  const [frame, setFrame] = useState({ x: 0, p: 0, prints: [] })
  const st = useRef({ x: 0, p: 0, prints: [], last: 0, sinceStep: 0 })
  const cfg = useRef({ fps, rate, stride })
  cfg.current = { fps, rate, stride }

  useEffect(() => {
    if (reduceMotion()) { setFrame({ x: track * 0.55, p: 0.8, prints: [] }); return }
    let raf
    const tick = now => {
      const s = st.current
      const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0
      s.last = now
      const { fps: v, rate: r, stride: L } = cfg.current
      s.x += (v / 120) * track * dt // real time: 40 yards across the track
      s.p += Math.PI * r * dt // one full leg cycle = two steps
      s.sinceStep += dt
      if (s.sinceStep >= 1 / r) { s.sinceStep = 0; s.prints = [...s.prints.slice(-14), { x: s.x, id: now, L }] }
      if (s.x > track + 30) { s.x = -20; s.prints = [] }
      setFrame({ x: s.x, p: s.p, prints: s.prints })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div>
      <div className="lesson-visual">
        <svg viewBox={`0 0 ${W} 150`} width="100%" role="img" aria-label={`Runner at ${mph.toFixed(1)} miles per hour`}>
          <line x1="0" y1="122" x2={W} y2="122" stroke="#1E2738" strokeWidth="2" />
          {Array.from({ length: 5 }, (_, i) => <g key={i}><line x1={20 + (track * i) / 4} y1="122" x2={20 + (track * i) / 4} y2="132" stroke="#2A3449" /><text x={20 + (track * i) / 4} y="145" fill="#8E9AB2" fontSize="10" textAnchor="middle">{i * 10}</text></g>)}
          <text x={W - 6} y="145" fill="#8E9AB2" fontSize="10" textAnchor="end">yd</text>
          {frame.prints.map(f => <rect key={f.id} x={20 + f.x - 4} y="119" width="8" height="3" rx="1.5" fill="#FFD34D" opacity="0.7" />)}
          <Figure x={20 + frame.x} y={80} p={gait(frame.p)} />
        </svg>
      </div>
      <div className="formula">
        <div><b className="mono">{stride.toFixed(1)}</b><span>feet per step</span></div>
        <i>×</i>
        <div><b className="mono">{rate.toFixed(1)}</b><span>steps per sec</span></div>
        <i>=</i>
        <div className="hot"><b className="mono">{mph.toFixed(1)}</b><span>mph</span></div>
      </div>
      <label className="slider"><span>Stride length <b>{stride.toFixed(1)} ft</b></span>
        <input type="range" min="3" max="7" step="0.1" value={stride} onChange={e => setStride(+e.target.value)} /></label>
      <label className="slider"><span>Steps per second <b>{rate.toFixed(1)}</b></span>
        <input type="range" min="3" max="5" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} /></label>
      <p className="lesson-callout">At this speed the whole 40 takes <b className="mono">{forty.toFixed(2)}s</b>. Real 40s are a bit slower because you start from a standstill. Make either number bigger and you get faster. Sundays train both.</p>
    </div>
  )
}

/* ---------- lesson 2: sprint form ---------- */
const PHASES = [
  {
    id: 'start', label: 'The start', y: 92,
    pose: { lean: 0.8, legs: [[1.0, 1.55], [-0.3, 0.5]], arms: [[0.55, 1.1], [-0.65, 0.5]] },
    cues: ['Front foot near the line, back foot a step behind', 'Weight forward over the front foot', 'First move is a push, not a step'],
  },
  {
    id: 'drive', label: 'Drive: 0 to 10 yards', y: 86,
    pose: { lean: 0.78, legs: [[1.15, 1.75], [-0.62, 0.12]], arms: [[1.0, 1.25], [-0.85, 0.45]] }, angle: true,
    cues: ['Lean like a falling tree, body in one line', 'Push the ground back behind you', 'Low, powerful steps that get longer each stride'],
  },
  {
    id: 'top', label: 'Top speed: 20+ yards', y: 76,
    pose: { lean: 0.08, legs: [[1.35, 1.95], [-0.38, 1.05]], arms: [[0.95, 1.45], [-0.62, 0.6]] },
    cues: ['Run tall, like a string pulls your head up', 'Knee up, toe up, then strike down under your hips', 'Arms swing cheek to pocket, front to back'],
  },
]

function SprintForm() {
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(PHASES[0].pose)
  const [y, setY] = useState(PHASES[0].y)
  const from = useRef({ pose: PHASES[0].pose, y: PHASES[0].y })

  useEffect(() => {
    const target = PHASES[i]
    const start = performance.now(), a = from.current
    if (reduceMotion()) { setShown(target.pose); setY(target.y); from.current = target; return }
    let raf
    const tick = now => {
      const k = Math.min(1, (now - start) / 450)
      const e = 1 - Math.pow(1 - k, 3)
      const p = lerpPose(a.pose, target.pose, e), yy = a.y + (target.y - a.y) * e
      setShown(p); setY(yy); from.current = { pose: p, y: yy }
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [i])

  const ph = PHASES[i]
  const deg = Math.round((shown.lean * 180) / Math.PI)
  return (
    <div>
      <div className="toggle" role="group" aria-label="Sprint phase">
        {PHASES.map((p, n) => <button key={p.id} aria-pressed={i === n} onClick={() => setI(n)}>{n + 1}. {p.label.split(':')[0]}</button>)}
      </div>
      <div className="lesson-visual">
        <svg viewBox="0 0 340 150" width="100%" role="img" aria-label={`${ph.label}: ${ph.cues.join('. ')}`}>
          <line x1="0" y1="132" x2="340" y2="132" stroke="#1E2738" strokeWidth="2" />
          {i === 0 && <line x1="196" y1="124" x2="196" y2="140" stroke="#fff" strokeWidth="3" />}
          {i === 1 && (
            <g>
              <line x1="120" y1="132" x2={120 + 120 * Math.sin(shown.lean)} y2={132 - 120 * Math.cos(shown.lean)} stroke="#FFD34D" strokeWidth="2" strokeDasharray="5 5" />
              <path d={`M120 102 A30 30 0 0 1 ${120 + 30 * Math.sin(shown.lean)} ${132 - 30 * Math.cos(shown.lean)}`} fill="none" stroke="#FFD34D" strokeWidth="2" />
              <text x="104" y="96" fill="#FFD34D" fontSize="13" fontWeight="700">{deg}°</text>
            </g>
          )}
          {i === 2 && <line x1="170" y1="20" x2="170" y2="132" stroke="#4ADE80" strokeWidth="2" strokeDasharray="5 5" />}
          <Figure x={170} y={y} p={shown} w={6} />
        </svg>
      </div>
      <h4 className="phase-title">{ph.label}</h4>
      <ol className="cues">{ph.cues.map(c => <li key={c}>{c}</li>)}</ol>
      {i < PHASES.length - 1 && <button className="btn btn-ghost btn-block" onClick={() => setI(i + 1)}>Next phase →</button>}
    </div>
  )
}

/* ---------- lesson 3: why a tenth matters ---------- */
function Tenths() {
  const [t, setT] = useState(6.5)
  const [gain, setGain] = useState(0.1)
  const feet = 120 * (gain / t)
  const yards = feet / 3
  const compare = feet < 2.5 ? 'the difference between a tag and a miss' : feet < 4.5 ? 'about one full stride' : feet < 9 ? 'about two full strides, a tackle missed' : 'almost a car length'
  return (
    <div>
      <div className="grid-2">
        <label className="slider"><span>Your 40 <b>{t.toFixed(2)}s</b></span>
          <input type="range" min="5" max="9" step="0.05" value={t} onChange={e => setT(+e.target.value)} /></label>
        <label className="slider"><span>Get faster by <b>{gain.toFixed(1)}s</b></span>
          <input type="range" min="0.1" max="0.6" step="0.1" value={gain} onChange={e => setGain(+e.target.value)} /></label>
      </div>
      <div className="big-stat">
        <b className="mono">{feet >= 3 ? `${yards.toFixed(1)} yd` : `${feet.toFixed(1)} ft`}</b>
        <span>ahead at the finish. That's {compare}.</span>
      </div>
      <RaceTrack
        title="You vs faster you"
        note="Same race, real speed. Watch the gap."
        lanes={[
          { id: 'now', label: 'You now', time: t, ghost: true, pair: 'x' },
          { id: 'fast', label: `−${gain.toFixed(1)}s you`, time: Math.round((t - gain) * 100) / 100, pair: 'x' },
        ]}
        buttonLabel="Race them"
      />
      <p className="lesson-callout">Most kids drop a few tenths over 10 weeks. That's the difference between getting caught and scoring. Tiny gains, big results.</p>
    </div>
  )
}

/* ---------- lessons and quizzes ---------- */
const LESSONS = [
  {
    id: 'l1', icon: '📐', title: 'The speed formula', time: '2 min', Visual: SpeedFormula,
    intro: 'Every runner on Earth has the same two dials: how far each step goes and how many steps you take each second. Move the sliders and watch.',
    quiz: [
      { q: 'Speed equals stride length times…', a: ['How tall you are', 'Steps per second', 'How hard you breathe'], c: 1 },
      { q: 'Your steps per second stay the same but your stride gets longer. You get…', a: ['Faster', 'Slower', 'The same speed'], c: 0 },
      { q: 'Which builds faster steps?', a: ['Jogging a long way', 'Short, all-out sprints with full rest', 'Standing around stretching'], c: 1 },
    ],
  },
  {
    id: 'l2', icon: '🏃', title: 'Sprint form', time: '3 min', Visual: SprintForm,
    intro: 'A sprint has three parts, and each one needs a different body shape. Tap through them.',
    quiz: [
      { q: 'In the first 10 yards your body should…', a: ['Pop straight up right away', 'Lean forward and push the ground back', 'Look down at your feet'], c: 1 },
      { q: 'At top speed you run…', a: ['Tall, with knees and toes up', 'Bent over at the waist', 'On your heels'], c: 0 },
      { q: 'Your arms should swing…', a: ['Side to side across your body', 'Cheek to pocket, front to back', 'Not at all'], c: 1 },
    ],
  },
  {
    id: 'l3', icon: '⏱️', title: 'Why a tenth matters', time: '2 min', Visual: Tenths,
    intro: 'A tenth of a second sounds tiny. Put in your 40 time and see how far ahead it puts you.',
    quiz: [
      { q: 'At a 6.5 second 40, being 0.1s faster puts you about how far ahead?', a: ['1 inch', 'Almost 2 feet', '10 yards'], c: 1 },
      { q: 'Being 0.3s faster puts you ahead by about…', a: ['5 or 6 feet', '5 or 6 inches', 'The whole field'], c: 0 },
      { q: 'Who can win the ghost race?', a: ['Only the fastest kid', 'Only the oldest kid', 'Anyone who beats their own Week 1'], c: 2 },
    ],
  },
]

function Quiz({ lesson, passed, onPass }) {
  const [picks, setPicks] = useState({})
  const [checked, setChecked] = useState(false)
  const all = lesson.quiz.every((_, n) => picks[n] != null)
  const right = lesson.quiz.filter((x, n) => picks[n] === x.c).length
  const check = () => { setChecked(true); if (right === lesson.quiz.length) onPass() }
  const retry = () => { setPicks({}); setChecked(false) }
  return (
    <div className="quiz">
      <p className="eyebrow" style={{ margin: '0 0 8px' }}>Quick quiz {passed && '· passed ✓'}</p>
      {lesson.quiz.map((x, n) => (
        <fieldset key={n} className="q">
          <legend>{n + 1}. {x.q}</legend>
          {x.a.map((opt, k) => {
            const state = checked ? (k === x.c ? 'right' : picks[n] === k ? 'wrong' : '') : picks[n] === k ? 'picked' : ''
            return <button key={k} type="button" className={`opt ${state}`} aria-pressed={picks[n] === k} disabled={checked} onClick={() => setPicks({ ...picks, [n]: k })}>{opt}</button>
          })}
        </fieldset>
      ))}
      {!checked
        ? <button className="btn btn-red btn-block" disabled={!all} onClick={check}>{all ? 'Check answers' : 'Answer all 3'}</button>
        : right === lesson.quiz.length
          ? <p className="quiz-win">3 for 3. Lesson passed! 🎉</p>
          : <><p className="quiz-miss">{right} of 3. Look at the green answers, then try again.</p><button className="btn btn-ghost btn-block" onClick={retry}>Try again</button></>}
    </div>
  )
}

export default function School() {
  const [players, setPlayers] = usePlayers()
  const [prog, setProg] = useState(loadProg)
  const [open, setOpen] = useState(null)
  const [party, setParty] = useState(false)
  const me = players.cur
  const done = prog[me] || {}
  const count = LESSONS.filter(l => done[l.id]).length
  const scholar = count === LESSONS.length

  const pass = id => {
    if (done[id]) return
    const next = { ...prog, [me]: { ...done, [id]: Date.now() } }
    setProg(next); saveProg(next)
    if (LESSONS.every(l => next[me][l.id])) { setParty(true); setTimeout(() => setParty(false), 3500) }
  }
  const toggle = id => {
    setOpen(open === id ? null : id)
    if (open !== id) setTimeout(() => document.getElementById(`lesson-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  return (
    <section className="section">
      <h2>Speed School<small>Short lessons with visuals you can play with. Pass all three quizzes to earn Speed Scholar.</small></h2>
      <Players st={players} set={setPlayers} />
      <div className={`scholar ${scholar ? 'got' : ''}`}>
        <span className="scholar-icon" aria-hidden="true">🧠</span>
        <div>
          <b>{scholar ? (me === 'Me' ? "You're a Speed Scholar!" : `${me} is a Speed Scholar!`) : 'Speed Scholar'}</b>
          <span>{scholar ? 'All three lessons passed.' : `${count} of ${LESSONS.length} lessons passed`}</span>
          <div className="scholar-bar"><i style={{ width: `${(count / LESSONS.length) * 100}%` }} /></div>
        </div>
      </div>
      {party && <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, n) => <i key={n} style={{ left: `${(n * 41) % 100}%`, animationDelay: `${(n % 8) * 0.12}s` }}>{['🎉', '⚡', '🧠', '🏃'][n % 4]}</i>)}</div>}

      <div className="lessons">
        {LESSONS.map((l, n) => {
          const isOpen = open === l.id
          return (
            <article key={l.id} id={`lesson-${l.id}`} className={`lesson ${isOpen ? 'open' : ''}`}>
              <button className="lesson-head" aria-expanded={isOpen} onClick={() => toggle(l.id)}>
                <span className="lesson-icon" aria-hidden="true">{l.icon}</span>
                <span className="lesson-name"><small>Lesson {n + 1} · {l.time}</small><b>{l.title}</b></span>
                <span className={`lesson-state ${done[l.id] ? 'ok' : ''}`}>{done[l.id] ? '✓' : isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="lesson-body">
                  <p className="sub">{l.intro}</p>
                  <l.Visual />
                  <Quiz key={`${l.id}-${me}`} lesson={l} passed={!!done[l.id]} onPass={() => pass(l.id)} />
                  {n < LESSONS.length - 1 && <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => toggle(LESSONS[n + 1].id)}>Next lesson: {LESSONS[n + 1].title} →</button>}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
