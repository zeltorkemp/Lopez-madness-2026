import React, { useEffect, useRef, useState } from 'react'
import { TESTS } from '../data/program.js'
import { GOAL_BANDS } from '../config.js'
import { usePlayers, Players } from '../lib/players.jsx'
import { syncPractice, isMine } from '../lib/me.js'

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

function Timer({ player }) {
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
    const next = [...list, { d: dist, s: secs, at: Date.now(), p: player }]
    setList(next); save(next)
    syncPractice(player, `sprint${dist}`, secs)
  }

  const cancel = () => { stopLoops(); hush(); setState('ready'); setElapsed(0) }

  const mine = list.filter(t => t.d === dist && (t.p || 'Me') === player)
  const board = bestByPlayer(list.filter(t => t.d === dist).map(t => ({ p: t.p || 'Me', v: t.s })), 'low')
  const weekAgo = Date.now() - 7 * 86400000
  const bestWeek = mine.filter(t => t.at >= weekAgo).reduce((m, t) => (m == null || t.s < m ? t.s : m), null)
  const bestEver = mine.reduce((m, t) => (m == null || t.s < m ? t.s : m), null)
  const recent = mine.slice(-5).reverse()
  const runs = streak(list.filter(t => (t.p || 'Me') === player))
  const busy = state === 'marks' || state === 'set' || state === 'running'

  const clearAll = () => {
    if (!window.confirm || window.confirm('Clear all practice times on this phone?')) { setList([]); save([]) }
  }

  return (
    <section className="section tool-pane">
      <h2>Sprint Timer</h2>
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

      <PhoneBoard title={`${dist}-yard best on this phone`} rows={board} fmt={v => `${v.toFixed(2)}s`} player={player} />

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
    <section className="section tool-pane">
      <h2>Week 10 Goal</h2>
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

/* ---------- shared score helpers ---------- */
const makeStore = key => ({
  load: () => { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } },
  save: list => { try { localStorage.setItem(key, JSON.stringify(list.slice(-300))) } catch { /* private mode */ } },
})
function bestByPlayer(rows, dir) {
  const best = {}
  for (const r of rows) if (best[r.p] == null || (dir === 'low' ? r.v < best[r.p] : r.v > best[r.p])) best[r.p] = r.v
  return Object.entries(best).map(([p, v]) => ({ p, v })).sort((a, b) => dir === 'low' ? a.v - b.v : b.v - a.v)
}
function PhoneBoard({ title, rows, fmt, player }) {
  if (rows.length < 1) return null
  return (
    <div className="phone-board">
      <p className="eyebrow">{title}</p>
      {rows.slice(0, 6).map((r, i) => (
        <div key={r.p} className={r.p === player ? 'me' : ''}>
          <span className="mono">{i === 0 ? '👑' : i + 1}</span><b>{r.p}</b><em className="mono">{fmt(r.v)}</em>
        </div>
      ))}
    </div>
  )
}

/* ---------- reaction start: the first step of every sprint ---------- */
const REACT = makeStore('sws_react_v1')
const ROUNDS = 5
const rate = ms => ms < 240 ? ['Lightning', 'gold'] : ms < 290 ? ['Quick', 'good'] : ms < 360 ? ['Solid', ''] : ['Warming up', '']

function Reaction({ player }) {
  const [phase, setPhase] = useState('idle') // idle | wait | go | early | hit | done
  const [tries, setTries] = useState([])
  const [list, setList] = useState(REACT.load)
  const goAt = useRef(0), timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const arm = () => {
    setPhase('wait')
    timer.current = setTimeout(() => {
      setPhase('go')
      requestAnimationFrame(() => { goAt.current = performance.now() })
    }, 1200 + Math.random() * 2600)
  }
  const tap = e => {
    e.preventDefault()
    if (phase === 'idle' || phase === 'done') { setTries([]); arm(); return }
    if (phase === 'wait') { clearTimeout(timer.current); setPhase('early'); return }
    if (phase === 'early') { arm(); return }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - goAt.current)
      const next = [...tries, ms]
      setTries(next)
      if (next.length >= ROUNDS) {
        const best = Math.min(...next)
        const all = [...list, { p: player, v: best, at: Date.now() }]
        setList(all); REACT.save(all); setPhase('done')
        syncPractice(player, 'react', best)
      } else setPhase('hit')
      return
    }
    if (phase === 'hit') arm()
  }

  const last = tries[tries.length - 1]
  const best = tries.length ? Math.min(...tries) : null
  const avg = tries.length ? Math.round(tries.reduce((a, b) => a + b, 0) / tries.length) : null
  const mineBest = list.filter(r => r.p === player).reduce((m, r) => (m == null || r.v < m ? r.v : m), null)
  const big = { idle: 'TAP TO START', wait: 'WAIT…', go: 'GO!', early: 'TOO SOON', hit: `${last} ms`, done: `${best} ms` }[phase]
  const small = {
    idle: `${ROUNDS} rounds. Tap the moment it turns green.`,
    wait: 'Hold still. Tap when it turns green.',
    go: 'TAP!',
    early: 'False start. Tap to try that round again.',
    hit: `Round ${tries.length} of ${ROUNDS}. Tap for the next one.`,
    done: `Best of ${ROUNDS} · average ${avg} ms · tap to go again`,
  }[phase]

  return (
    <section className="section tool-pane">
      <h2>Reaction Start</h2>
      <p className="sub">Races are won on the first step. Tap the pad the instant it flashes green, like reacting to the gun.</p>
      <button className={`react-pad ${phase}`} onPointerDown={tap} aria-live="polite">
        <span className="react-big">{big}</span>
        <span className="react-small">{small}</span>
        {phase === 'done' && <span className={`react-rate ${rate(best)[1]}`}>{rate(best)[0]}{mineBest === best ? ' · new best' : ''}</span>}
      </button>
      <div className="dots" aria-hidden="true">{Array.from({ length: ROUNDS }, (_, i) => <i key={i} className={i < tries.length ? 'on' : ''} />)}</div>
      <div className="tool-stats">
        <div><span>This round</span><b className="good">{best != null ? `${best}` : '–'}</b></div>
        <div><span>Average</span><b>{avg != null ? avg : '–'}</b></div>
        <div><span>{player} best</span><b className="gold">{mineBest != null ? mineBest : '–'}</b></div>
      </div>
      <PhoneBoard title="Fastest reactions on this phone (ms)" rows={bestByPlayer(list, 'low')} fmt={v => `${v} ms`} player={player} />
      <p className="small" style={{ marginTop: 12, lineHeight: 1.5 }}>Phone screens add a little delay, so compare scores on the same phone. Lower is faster.</p>
    </section>
  )
}

/* ---------- quick feet: alternate left and right as fast as you can ---------- */
const FEET = makeStore('sws_feet_v1')
const FEET_SECS = 10

function QuickFeet({ player }) {
  const [phase, setPhase] = useState('idle') // idle | run | done
  const [count, setCount] = useState(0)
  const [left, setLeft] = useState(FEET_SECS)
  const [list, setList] = useState(FEET.load)
  const lastSide = useRef(null), startAt = useRef(0), tick = useRef(0), countRef = useRef(0)
  useEffect(() => () => clearInterval(tick.current), [])

  const finish = () => {
    clearInterval(tick.current)
    setPhase('done'); setLeft(0)
    const all = [...FEET.load(), { p: player, v: countRef.current, at: Date.now() }]
    setList(all); FEET.save(all)
    syncPractice(player, 'feet', countRef.current)
  }
  const press = side => e => {
    e.preventDefault()
    if (phase === 'done') return
    if (phase === 'idle') {
      setPhase('run'); startAt.current = performance.now(); countRef.current = 0
      tick.current = setInterval(() => {
        const rem = FEET_SECS - (performance.now() - startAt.current) / 1000
        if (rem <= 0) finish(); else setLeft(rem)
      }, 50)
    }
    if (side === lastSide.current) return // must alternate, like real feet
    lastSide.current = side
    countRef.current += 1; setCount(countRef.current)
  }
  const reset = () => { clearInterval(tick.current); setPhase('idle'); setCount(0); setLeft(FEET_SECS); lastSide.current = null; countRef.current = 0 }
  const mineBest = list.filter(r => r.p === player).reduce((m, r) => (m == null || r.v > m ? r.v : m), null)

  return (
    <section className="section tool-pane">
      <h2>Quick Feet</h2>
      <p className="sub">A {FEET_SECS}-second rhythm game. Alternate left, right, left, right with two thumbs. Same-side taps don't count. Then go do it with your feet on a line.</p>
      <div className="feet-head">
        <b className="mono">{count}</b>
        <span className="mono">{phase === 'run' ? left.toFixed(1) : phase === 'done' ? 'TIME' : `${FEET_SECS}.0`}</span>
      </div>
      <div className="meter" style={{ height: 6, marginBottom: 10 }}><i style={{ width: `${(left / FEET_SECS) * 100}%`, transition: 'none', background: 'var(--gold)' }} /></div>
      <div className="feet-pads">
        <button className={`feet-pad ${lastSide.current === 'L' && phase === 'run' ? 'hit' : ''}`} onPointerDown={press('L')} disabled={phase === 'done'}>LEFT</button>
        <button className={`feet-pad ${lastSide.current === 'R' && phase === 'run' ? 'hit' : ''}`} onPointerDown={press('R')} disabled={phase === 'done'}>RIGHT</button>
      </div>
      {phase === 'done'
        ? <button className="btn btn-red btn-block" style={{ marginTop: 12 }} onClick={reset}>{count >= (mineBest ?? 0) ? 'New best! Go again' : 'Go again'}</button>
        : <p className="small" style={{ textAlign: 'center', marginTop: 10 }}>{phase === 'idle' ? 'The clock starts on your first tap.' : 'Faster!'}</p>}
      <div className="tool-stats">
        <div><span>Taps</span><b className="good">{count}</b></div>
        <div><span>Per second</span><b>{phase === 'idle' ? '–' : (count / Math.max(0.5, FEET_SECS - left)).toFixed(1)}</b></div>
        <div><span>{player} best</span><b className="gold">{mineBest ?? '–'}</b></div>
      </div>
      <PhoneBoard title="Most taps on this phone" rows={bestByPlayer(list, 'high')} fmt={v => `${v}`} player={player} />
    </section>
  )
}

/* ---------- sprint session: hands-free reps with full rest ---------- */
function Session() {
  const [reps, setReps] = useState(6)
  const [rest, setRest] = useState(60)
  const [phase, setPhase] = useState('idle') // idle | call | set | go | rest | done
  const [rep, setRep] = useState(0)
  const [left, setLeft] = useState(0)
  const timers = useRef([]), lock = useRef(null)
  const { ctx, say, hush, scheduleGo } = useStarter()

  const clear = () => { timers.current.forEach(t => { clearTimeout(t); clearInterval(t) }); timers.current = [] }
  const release = () => { try { lock.current?.release() } catch { /* ignore */ } lock.current = null }
  useEffect(() => () => { clear(); hush(); release() }, [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const runRep = (i, total, restSecs) => {
    setRep(i); setPhase('call')
    timers.current.push(say(i === total ? `Last rep. Rep ${i}.` : `Rep ${i} of ${total}.`, () => later(() => {
      setPhase('set')
      timers.current.push(say('Set', () => {
        const hold = 1.2 + Math.random() * 1.2
        scheduleGo(hold)
        later(() => setPhase('go'), hold * 1000)
        later(() => {
          if (i >= total) { setPhase('done'); say('Workout done. Great work.', null); release(); return }
          setPhase('rest')
          const end = performance.now() + restSecs * 1000
          let warned = false
          setLeft(restSecs)
          const iv = setInterval(() => {
            const rem = Math.max(0, (end - performance.now()) / 1000)
            setLeft(rem)
            if (!warned && rem <= 10 && restSecs > 15) { warned = true; say('Ten seconds. Walk back to the line.', null) }
            if (rem <= 0) { clearInterval(iv); runRep(i + 1, total, restSecs) }
          }, 200)
          timers.current.push(iv)
        }, hold * 1000 + 5000)
      }))
    }, 2200), 2500))
  }

  const start = async () => {
    ctx(); clear(); hush()
    try { lock.current = await navigator.wakeLock?.request('screen') } catch { /* not supported */ }
    runRep(1, reps, rest)
  }
  const stop = () => { clear(); hush(); release(); setPhase('idle'); setRep(0) }
  const busy = phase !== 'idle' && phase !== 'done'
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.ceil(s) % 60).padStart(2, '0')}`.replace(/^(\d+):60$/, (m, a) => `${+a + 1}:00`)
  const big = { idle: `${reps} × sprint`, call: `REP ${rep}/${reps}`, set: 'SET', go: 'GO!', rest: mmss(left), done: 'DONE' }[phase]
  const small = { idle: `${rest}s full rest between reps`, call: 'Walk to the line', set: 'Get in your stance', go: 'Sprint through the line', rest: `Rest. Rep ${rep + 1} is next.`, done: `${reps} reps finished. Nice work.` }[phase]

  return (
    <section className="section tool-pane">
      <h2>Sprint Session</h2>
      <p className="sub">Hands-free practice. The phone calls each rep, starts it with a beep and times your rest, so you never rush a rep. Full rest is how speed gets built.</p>
      <div className="grid-2">
        <div className="field">
          <label>Reps</label>
          <div className="toggle" role="group" aria-label="Reps" style={{ marginBottom: 0 }}>
            {[4, 6, 8].map(n => <button key={n} aria-pressed={reps === n} disabled={busy} onClick={() => setReps(n)}>{n}</button>)}
          </div>
        </div>
        <div className="field">
          <label>Rest</label>
          <div className="toggle" role="group" aria-label="Rest" style={{ marginBottom: 0 }}>
            {[45, 60, 90].map(n => <button key={n} aria-pressed={rest === n} disabled={busy} onClick={() => setRest(n)}>{n}s</button>)}
          </div>
        </div>
      </div>
      <div className={`timer-face ${phase === 'go' ? 'running' : phase === 'set' || phase === 'call' ? 'set' : ''}`} aria-live="polite">
        <div className="timer-num" style={{ fontSize: 'clamp(44px, 14vw, 72px)' }}>{big}</div>
        <div className="small">{small}</div>
      </div>
      {busy
        ? <button className="btn btn-ghost btn-block huge" onClick={stop}>Stop session</button>
        : <button className="btn btn-red btn-block huge" onClick={start}>{phase === 'done' ? 'Run another session' : 'Start session'}</button>}
      <p className="small" style={{ marginTop: 12, lineHeight: 1.5 }}>Try 10-yard starts or 20-yard sprints. Volume up, phone near the start line. The screen stays on during the session where your phone allows it.</p>
    </section>
  )
}

/* ---------- the tab ---------- */
const TOOLS = [
  { id: 'timer', icon: '⏱️', label: 'Sprint Timer', blurb: 'Real start, real time' },
  { id: 'react', icon: '🚦', label: 'Reaction Start', blurb: 'Beat the gun' },
  { id: 'feet', icon: '👟', label: 'Quick Feet', blurb: '10-second tap battle' },
  { id: 'session', icon: '🔁', label: 'Sprint Session', blurb: 'Hands-free reps' },
  { id: 'goal', icon: '🎯', label: 'Week 10 Goal', blurb: 'Set your target' },
]

export default function Tools() {
  const [tool, setTool] = useState(() => { try { return sessionStorage.getItem('sws_tool') || 'timer' } catch { return 'timer' } })
  const [players, setPlayers] = usePlayers()
  const pick = id => {
    setTool(id)
    try { sessionStorage.setItem('sws_tool', id) } catch { /* ignore */ }
    setTimeout(() => document.querySelector('.players, .tool-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const player = players.cur
  const competitive = tool !== 'goal' && tool !== 'session'
  return (
    <>
      <div className="section" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 34 }}>Speed Tools</h2>
        <p className="sub" style={{ marginBottom: 14 }}>Practice and compete between Sundays. Scores stay on this phone.</p>
        <div className="tool-menu" role="tablist" aria-label="Tools">
          {TOOLS.map(t => (
            <button key={t.id} role="tab" aria-selected={tool === t.id} className={tool === t.id ? 'on' : ''} onClick={() => pick(t.id)}>
              <span aria-hidden="true">{t.icon}</span><b>{t.label}</b><small>{t.blurb}</small>
            </button>
          ))}
        </div>
        {competitive && <Players st={players} set={setPlayers} />}
        {competitive && isMine(player) && <p className="small" style={{ margin: '8px 0 0' }}>Bests also save to {player}'s Speed Card.</p>}
      </div>
      {tool === 'timer' && <Timer player={player} />}
      {tool === 'react' && <Reaction player={player} />}
      {tool === 'feet' && <QuickFeet player={player} />}
      {tool === 'session' && <Session />}
      {tool === 'goal' && <Goal />}
    </>
  )
}
