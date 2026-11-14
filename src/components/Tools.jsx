import React, { useEffect, useRef, useState } from 'react'
import { TESTS } from '../data/program.js'
import { GOAL_BANDS } from '../config.js'

/* ---------- storage (practice times stay on this phone) ---------- */
const KEY = 'sws_practice_v1'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-300))) } catch { /* private mode */ } }
const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }

function streak(list) {
  const days = new Set(list.map(t => dayKey(t.at)))
  let n = 0
  const d = new Date()
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1) // streak survives until end of today
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

/* ---------- audio: "Set" by voice, "Go" as a beep scheduled on the audio clock ---------- */
function useStarter() {
  const ctxRef = useRef(null)
  const ctx = () => {
    if (!ctxRef.current) { const C = window.AudioContext || window.webkitAudioContext; ctxRef.current = C ? new C() : null }
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }
  // Speaks a word and calls done() when it finishes (or after a fallback, since some phones never fire onend)
  const say = (word, done, fallbackMs = 1500) => {
    let fired = false
    const finish = () => { if (!fired) { fired = true; done && done() } }
    try {
      const u = new SpeechSynthesisUtterance(word); u.rate = 0.95
      u.onend = finish; u.onerror = finish
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
    } catch { /* no voice */ }
    return setTimeout(finish, fallbackMs)
  }
  const hush = () => { try { window.speechSynthesis.cancel() } catch { /* ignore */ } }
  // Schedules the GO beep `delay` seconds from now; returns the performance.now() time it will sound.
  const scheduleGo = delay => {
    const c = ctx()
    if (!c) return performance.now() + delay * 1000
    const at = c.currentTime + delay
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'square'; o.frequency.value = 1046
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.6, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35)
    o.connect(g).connect(c.destination); o.start(at); o.stop(at + 0.4)
    const lag = (c.outputLatency || c.baseLatency || 0) * 1000
    return performance.now() + delay * 1000 + lag
  }
  return { ctx, say, hush, scheduleGo }
}

const DISTANCES = [10, 20, 40]

function Timer() {
  const [dist, setDist] = useState(10)
  const [state, setState] = useState('ready') // ready | marks | set | running | done
  const [elapsed, setElapsed] = useState(0)
  const [list, setList] = useState(load)
  const goAt = useRef(0), raf = useRef(0), timers = useRef([])
  const { ctx, say, hush, scheduleGo } = useStarter()

  const stopLoops = () => { cancelAnimationFrame(raf.current); timers.current.forEach(clearTimeout); timers.current = []; goAt.current = Infinity }
  useEffect(() => stopLoops, [])

  const start = () => {
    ctx() // unlock audio inside the tap
    stopLoops(); setElapsed(0); setState('marks')
    const tick = () => {
      const t = performance.now() - goAt.current
      if (t >= 0) { setState(s => (s === 'set' ? 'running' : s)); setElapsed(t) }
      raf.current = requestAnimationFrame(tick)
    }
    // Like a real track start: "On your marks", time to get down, "Set", then a random hold before Go
    timers.current.push(setTimeout(() => {
      timers.current.push(say('On your marks', null, 2000))
      timers.current.push(setTimeout(() => {
        setState('set')
        timers.current.push(say('Set', () => {
          const hold = 1.6 + Math.random() * 1.2 // 1.6 to 2.8 seconds after "Set" finishes
          goAt.current = scheduleGo(hold)
          raf.current = requestAnimationFrame(tick)
        }))
      }, 4500))
    }, 600))
  }

  const stop = () => {
    const t = performance.now() - goAt.current
    stopLoops(); hush()
    if (!(t >= 300)) { setState('ready'); setElapsed(0); return } // stopped before or right at Go: discard
    const secs = Math.round(t / 10) / 100
    setElapsed(secs * 1000); setState('done')
    const next = [...list, { d: dist, s: secs, at: Date.now() }]
    setList(next); save(next)
  }

  const cancel = () => { stopLoops(); hush(); setState('ready'); setElapsed(0) }

  const mine = list.filter(t => t.d === dist)
  const weekAgo = Date.now() - 7 * 86400000
  const bestWeek = mine.filter(t => t.at >= weekAgo).reduce((m, t) => (m == null || t.s < m ? t.s : m), null)
  const bestEver = mine.reduce((m, t) => (m == null || t.s < m ? t.s : m), null)
  const recent = mine.slice(-5).reverse()
  const runs = streak(list)
  const busy = state === 'marks' || state === 'set' || state === 'running'

  const clearAll = () => {
    if (!window.confirm || window.confirm('Clear all practice times on this phone?')) { setList([]); save([]) }
  }

  return (
    <section className="section">
      <p className="eyebrow">At-home timer</p>
      <h2>Practice sprints</h2>
      <p className="sub">Turn the volume up, tap Start and stand at the finish. The phone calls "On your marks," then "Set," then beeps Go after a random 1.6 to 2.8 second hold and starts the clock on the beep. Tap Stop as the runner crosses the line.</p>

      <div className="toggle" role="group" aria-label="Sprint distance">
        {DISTANCES.map(d => (
          <button key={d} aria-pressed={dist === d} disabled={busy} onClick={() => setDist(d)}>{d} yards</button>
        ))}
      </div>

      <div className={`timer-face ${state}`} aria-live="polite">
        <div className="timer-num" style={state === 'marks' ? { fontSize: 'clamp(40px, 12vw, 64px)' } : null}>{state === 'marks' ? 'ON YOUR MARKS' : state === 'set' ? 'SET' : (elapsed / 1000).toFixed(2)}</div>
        <div className="small">{state === 'marks' ? 'Get in your stance' : state === 'set' ? 'Wait for the beep' : state === 'running' ? 'GO' : 'seconds'}</div>
      </div>

      {busy
        ? (state === 'running'
          ? <button className="btn btn-red btn-block huge" onClick={stop}>Stop</button>
          : <button className="btn btn-ghost btn-block huge" onClick={cancel}>Cancel</button>)
        : <button className="btn btn-red btn-block huge" onClick={start}>{state === 'done' ? 'Run it again' : 'Start'}</button>}

      <div className="tool-stats">
        <div><span>Best this week</span><b className="good">{bestWeek != null ? `${bestWeek.toFixed(2)}s` : '–'}</b></div>
        <div><span>Best ever</span><b>{bestEver != null ? `${bestEver.toFixed(2)}s` : '–'}</b></div>
        <div><span>Practice streak</span><b className="gold">{runs} {runs === 1 ? 'day' : 'days'}</b></div>
      </div>

      {recent.length > 0 && (
        <div className="info-list" style={{ marginTop: 14 }}>
          {recent.map(t => (
            <div key={t.at}>
              <dt>{new Date(t.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</dt>
              <dd className="mono">{t.s.toFixed(2)}s{bestEver === t.s ? ' · best' : ''}</dd>
            </div>
          ))}
        </div>
      )}

      <p className="small" style={{ marginTop: 14, lineHeight: 1.5 }}>
        Practice times are saved on this phone only. They're great for tracking practice. Official Speed Card times come from Sunday testing, run the same way every week.
        {list.length > 0 && <> <button className="linkish" onClick={clearAll}>Clear my times</button></>}
      </p>
    </section>
  )
}

/* ---------- goal calculator ---------- */
const LIMITS = { dash: [2.5, 8], forty: [4, 12], shuttle: [4, 10], jump: [20, 130] }
const YARDS = { dash: 20, forty: 40 }
const GOAL_TESTS = TESTS
const mph = (yards, s) => Math.round(((yards * 3) / 5280 / (s / 3600)) * 10) / 10

function Goal() {
  const [test, setTest] = useState('dash')
  const [raw, setRaw] = useState('')
  const [err, setErr] = useState('')
  const [shared, setShared] = useState('')
  const t = GOAL_TESTS.find(x => x.id === test)
  const band = GOAL_BANDS[test]
  const v = Number(raw)
  const [lo, hi] = LIMITS[test]
  const valid = raw !== '' && v >= lo && v <= hi

  const onChange = e => {
    setRaw(e.target.value); setShared('')
    const n = Number(e.target.value)
    setErr(e.target.value === '' || (n >= lo && n <= hi) ? '' : `Enter a ${t.unit === 's' ? `time between ${lo} and ${hi} seconds` : `jump between ${lo} and ${hi} inches`}.`)
  }

  let res = null
  if (valid) {
    if (t.lowerIsBetter) {
      const a = v * (1 - band.low), b = v * (1 - band.high), s = v * (1 - band.stretch)
      const saved = v - a, savedMax = v - b
      res = {
        range: `${b.toFixed(2)} to ${a.toFixed(2)}s`, stretch: `${s.toFixed(2)}s`,
        extra: YARDS[test] ? `Now ${mph(YARDS[test], v)} mph. At ${a.toFixed(2)}s that's ${mph(YARDS[test], a)} mph.` : null,
        ahead: YARDS[test] ? `That's ${saved.toFixed(2)} to ${savedMax.toFixed(2)}s faster, which finishes about ${Math.round(saved * (YARDS[test] * 3 / v))} to ${Math.round(savedMax * (YARDS[test] * 3 / v))} feet ahead of the Week 1 you.` : `That's ${saved.toFixed(2)} to ${savedMax.toFixed(2)}s faster, an edge on every cut in a game.`,
        shareText: `My Week 10 goal for the ${t.name}: ${b.toFixed(2)} to ${a.toFixed(2)}s.`,
      }
    } else {
      const a = v * (1 + band.low), b = v * (1 + band.high), s = v * (1 + band.stretch)
      res = {
        range: `${Math.round(a)}" to ${Math.round(b)}"`, stretch: `${Math.round(s)}"`, extra: null,
        ahead: `That's about ${Math.round(a - v)} to ${Math.round(b - v)} more inches of pop off the ground.`,
        shareText: `My Week 10 goal for the Broad Jump: ${Math.round(a)} to ${Math.round(b)} inches.`,
      }
    }
  }

  const share = async () => {
    const text = `${res.shareText} Training at Speed Work Sundays: https://www.speedworksundays.com`
    try {
      if (navigator.share) { await navigator.share({ text }); return }
      await navigator.clipboard.writeText(text); setShared('Copied. Paste it anywhere.')
    } catch { /* user closed the share sheet */ }
  }

  return (
    <section className="section">
      <p className="eyebrow">Goal calculator</p>
      <h2>What's my Week 10 target?</h2>
      <p className="sub">Enter a Week 1 result to get a realistic target to chase.</p>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="g-test">Test</label>
          <select id="g-test" value={test} onChange={e => { setTest(e.target.value); setRaw(''); setErr(''); setShared('') }}>
            {GOAL_TESTS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="g-val">Week 1 {t.unit === 's' ? 'time (sec)' : 'jump (inches)'}</label>
          <input id="g-val" inputMode="decimal" type="number" step={t.unit === 's' ? '0.01' : '1'} placeholder={t.unit === 's' ? ({ dash: '4.32', forty: '7.40', shuttle: '6.40' }[test]) : '52'} value={raw} onChange={onChange} aria-invalid={!!err} />
        </div>
      </div>
      {err && <p role="alert" style={{ color: 'var(--red)', fontSize: 13, margin: '-6px 0 10px' }}>{err}</p>}

      {res && (
        <div className="goal-card">
          <span className="small">Week 10 target range</span>
          <b>{res.range}</b>
          <p>Stretch goal {res.stretch}{res.extra ? ` · ${res.extra}` : ''}</p>
          <p>{res.ahead}</p>
          <button className="btn btn-ghost btn-block" onClick={share}>Share my goal</button>
          {shared && <p className="small" style={{ textAlign: 'center' }}>{shared}</p>}
        </div>
      )}
      <p className="small" style={{ marginTop: 12, lineHeight: 1.5 }}>Targets start conservative and get updated with our own athletes' real results after Week 5.</p>
    </section>
  )
}

export default function Tools() {
  return (
    <>
      <div className="section" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 34 }}>Speed Tools</h2>
        <p className="sub" style={{ marginBottom: 0 }}>Two tools for the days between Sundays.</p>
      </div>
      <Timer />
      <Goal />
    </>
  )
}
