import React, { useEffect, useRef, useState } from 'react'
import { LIVE } from '../config.js'
import { TESTS, TEST_WEEKS } from '../data/program.js'
import { logTime, resetDemo, timePrefCounts, emailList, buildRoster, getRoster, updateAthlete } from '../lib/store.js'

const SITE = 'https://www.speedworksundays.com'
const cardLink = token => `${SITE}/#me/${token}`

/* START -> SPLIT at 20 (40 only) -> STOP. Returns state and controls. */
function useStopwatch(isForty) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [split, setSplit] = useState('')
  const [result, setResult] = useState('')
  const startAt = useRef(0), raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const now = () => ((performance.now() - startAt.current) / 1000).toFixed(2)
  const tick = () => { setElapsed((performance.now() - startAt.current) / 1000); raf.current = requestAnimationFrame(tick) }
  const press = () => {
    if (!running) { startAt.current = performance.now(); setElapsed(0); setSplit(''); setResult(''); setRunning(true); raf.current = requestAnimationFrame(tick); return }
    if (isForty && !split) { setSplit(now()); return }
    cancelAnimationFrame(raf.current); setRunning(false); setResult(now())
  }
  const reset = () => { cancelAnimationFrame(raf.current); setRunning(false); setElapsed(0); setSplit(''); setResult('') }
  const label = !running ? 'START' : isForty && !split ? 'SPLIT at 20' : 'STOP'
  return { running, elapsed, split, setSplit, result, setResult, press, reset, label }
}

/* ---------- roster: build from sign-ups, fix ages, share private links ---------- */
function Roster({ pin, onChange }) {
  const [rows, setRows] = useState(null)
  const [msg, setMsg] = useState('')
  const load = async () => {
    try { setRows(await getRoster(pin)); setMsg('') } catch { setMsg('Enter the coach PIN above first.') }
  }
  const build = async () => {
    try {
      const n = await buildRoster(pin)
      setMsg(n ? `Added ${n} athlete${n === 1 ? '' : 's'} from confirmed sign-ups.` : 'Roster is up to date. No new confirmed sign-ups.')
      await load(); onChange()
    } catch { setMsg('Not built. Check the coach PIN.') }
  }
  const saveAge = async (r, age) => {
    const n = Number(age)
    if (!(n >= 6 && n <= 18) || n === r.age) return
    try { await updateAthlete(pin, { id: r.id, age: n }); setRows(rows.map(x => x.id === r.id ? { ...x, age: n } : x)); setMsg(`${r.display_name}: age ${n} saved.`); onChange() } catch { setMsg('Age not saved. Check the coach PIN.') }
  }
  const saveSport = async (r, sport) => {
    const v = sport.trim()
    if (!v || v === r.sport) return
    try { await updateAthlete(pin, { id: r.id, sport: v }); setRows(rows.map(x => x.id === r.id ? { ...x, sport: v } : x)); setMsg(`${r.display_name}: sport saved.`); onChange() } catch { setMsg('Sport not saved. Check the coach PIN.') }
  }
  const saveName = async (r, name) => {
    const v = name.trim()
    if (!v || v === r.display_name) return
    try { await updateAthlete(pin, { id: r.id, name: v }); setRows(rows.map(x => x.id === r.id ? { ...x, display_name: v } : x)); setMsg(`Board name saved: ${v}.`); onChange() } catch { setMsg('Name not saved. Check the coach PIN.') }
  }
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); setMsg(`Copied ${label}.`) } catch { setMsg(text) }
  }
  const allLinks = () => rows.map(r => `${r.full_name || r.display_name}${r.parent_name ? ` (${r.parent_name})` : ''}: ${cardLink(r.card_token)}`).join('\n')

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 18 }}>Roster and Speed Card links</h3>
      <p className="small" style={{ margin: '4px 0 12px' }}>Build turns every confirmed sign-up into an athlete. Safe to tap again: it only adds new ones. The board shows first name and last initial.</p>
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button className="btn btn-red" onClick={build}>Build roster from sign-ups</button>
        <button className="btn btn-ghost" onClick={load}>{rows ? 'Refresh' : 'Show roster'}</button>
      </div>
      {msg && <p role="status" className="small" style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg}</p>}
      {rows && (
        <>
          <p style={{ margin: '14px 0 6px' }}><b>{rows.length}</b> athletes · {rows.filter(r => !r.age).length ? <span style={{ color: 'var(--gold)' }}>{rows.filter(r => !r.age).length} need an age</span> : 'all ages set'}</p>
          <div className="roster">
            {rows.map(r => (
              <div key={r.id} className="roster-row">
                <input className="roster-name" defaultValue={r.display_name} aria-label={`Board name for ${r.full_name}`} onBlur={e => saveName(r, e.target.value)} />
                <input className={`roster-age ${r.age ? '' : 'need'}`} type="number" inputMode="numeric" defaultValue={r.age ?? ''} placeholder="Age" aria-label={`Age for ${r.display_name}`} onBlur={e => saveAge(r, e.target.value)} />
                <button className="linkish" onClick={() => copy(cardLink(r.card_token), `${r.display_name}'s link`)}>Copy link</button>
                <input className="roster-sport" defaultValue={r.sport ?? ''} placeholder="Sport, e.g. Football & Basketball" aria-label={`Sport for ${r.display_name}`} onBlur={e => saveSport(r, e.target.value)} />
                {r.parent_name && <small>{r.full_name} · parent {r.parent_name}{r.has_times ? ' · timed' : ''}</small>}
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={() => copy(allLinks(), `all ${rows.length} links`)}>Copy all links</button>
          <p className="small" style={{ margin: '8px 0 0' }}>Each link is private to one athlete. Opening it on a phone ties that phone's quizzes and practice bests to the athlete's Speed Card.</p>
        </>
      )}
    </div>
  )
}

/* ---------- test day: go down the line, one athlete at a time ---------- */
function TestDay({ pin, onSaved, onClose, testId, weekIndex }) {
  const [rows, setRows] = useState(null)
  const [i, setI] = useState(0)
  const [msg, setMsg] = useState('')
  const [log, setLog] = useState([])
  const test = TESTS.find(t => t.id === testId)
  const isForty = testId === 'forty'
  const sw = useStopwatch(isForty)
  useEffect(() => { getRoster(pin).then(setRows).catch(() => setMsg('Could not load the roster. Check the coach PIN.')) }, [])

  if (!rows) return <div className="card testday"><p>{msg || 'Loading roster…'}</p><button className="btn btn-ghost btn-block" onClick={onClose}>Back</button></div>
  if (!rows.length) return <div className="card testday"><p>No athletes yet. Build the roster first.</p><button className="btn btn-ghost btn-block" onClick={onClose}>Back</button></div>

  const done = i >= rows.length
  const a = rows[Math.min(i, rows.length - 1)]
  const next = () => { sw.reset(); setMsg(''); setI(i + 1) }
  const save = async () => {
    const value = Number(sw.result), splitVal = Number(sw.split)
    if (!value) { setMsg(test.unit === 's' ? 'Time them first, or type the time.' : 'Type the jump in inches.'); return }
    if (isForty && sw.split && !(splitVal > 0 && splitVal < value)) { setMsg('The 20-yard split has to be less than the 40 time.'); return }
    try {
      await logTime({ athleteId: a.id, testId, weekIndex, value, pin })
      if (isForty && splitVal) await logTime({ athleteId: a.id, testId: 'dash', weekIndex, value: splitVal, pin })
      setLog([{ name: a.display_name, text: `${value}${test.unit === 's' ? 's' : '"'}${isForty && splitVal ? ` (20: ${splitVal}s)` : ''}` }, ...log])
      onSaved(); next()
    } catch { setMsg('Not saved. Check the coach PIN and signal.') }
  }

  return (
    <div className="card testday">
      <div className="testday-head">
        <span className="tag test">{test.name} · Week {TEST_WEEKS[weekIndex]}</span>
        <span className="small">{Math.min(i + 1, rows.length)} of {rows.length}</span>
      </div>
      <div className="meter" style={{ margin: '10px 0 14px' }}><i style={{ width: `${(i / rows.length) * 100}%` }} /></div>
      {done ? (
        <>
          <h3 style={{ fontSize: 26 }}>All done! {log.length} saved.</h3>
          <p className="small">Speed Cards and the board already show these.</p>
        </>
      ) : (
        <>
          <p className="small" style={{ margin: 0 }}>Up now</p>
          <h3 className="testday-name">{a.display_name}</h3>
          <p className="small" style={{ margin: '0 0 10px' }}>{a.age ? `Age ${a.age}` : 'Age not set'}{rows[i + 1] ? ` · On deck: ${rows[i + 1].display_name}` : ' · Last one'}</p>
          {test.unit === 's' && (
            <>
              <div className="stopwatch" aria-live="off">{sw.elapsed.toFixed(2)}</div>
              <button className={`btn huge ${sw.running ? 'btn-ghost' : 'btn-red'}`} onClick={sw.press}>{sw.label}</button>
            </>
          )}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <div className="field"><label htmlFor="td-res">{test.unit === 's' ? 'Time (sec)' : 'Jump (inches)'}</label>
              <input id="td-res" type="number" step={test.unit === 's' ? '0.01' : '1'} inputMode="decimal" value={sw.result} onChange={e => sw.setResult(e.target.value)} />
            </div>
            {isForty && <div className="field"><label htmlFor="td-spl">20-yard split</label>
              <input id="td-spl" type="number" step="0.01" inputMode="decimal" value={sw.split} onChange={e => sw.setSplit(e.target.value)} />
            </div>}
          </div>
          {msg && <p role="alert" style={{ color: 'var(--red)', margin: '0 0 10px' }}>{msg}</p>}
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-red" onClick={save} disabled={sw.running}>Save · next</button>
            <button className="btn btn-ghost" onClick={next}>Skip</button>
          </div>
          {i > 0 && <button className="linkish" style={{ marginTop: 10 }} onClick={() => { sw.reset(); setI(i - 1) }}>← Back to {rows[i - 1].display_name}</button>}
        </>
      )}
      {log.length > 0 && (
        <div className="info-list" style={{ marginTop: 14 }}>
          {log.slice(0, 6).map((l, n) => <div key={n}><dt>{l.name}</dt><dd className="mono">{l.text}</dd></div>)}
        </div>
      )}
      <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={onClose}>Exit test day</button>
    </div>
  )
}

export default function Coach({ athletes: all, onSaved }) {
  const athletes = LIVE ? all.filter(a => !a.sample) : all
  const [pin, setPin] = useState('')
  const [prefs, setPrefs] = useState(null)
  useEffect(() => { timePrefCounts().then(setPrefs).catch(() => setPrefs(null)) }, [])

  const [testId, setTestId] = useState('forty')
  const [weekIndex, setWeekIndex] = useState(0)
  const [testDay, setTestDay] = useState(false)

  const [athleteId, setAthleteId] = useState('')
  const [msg, setMsg] = useState('')
  const test = TESTS.find(t => t.id === testId)
  const isForty = testId === 'forty'
  const sw = useStopwatch(isForty)

  const [emails, setEmails] = useState(null)
  const [emailMsg, setEmailMsg] = useState('')
  const loadEmails = async () => {
    try { setEmails(await emailList(pin)); setEmailMsg('') } catch { setEmailMsg(LIVE ? 'Enter the coach PIN above first.' : 'Could not load emails.') }
  }
  const copy = async list => {
    const text = [...new Set(list.filter(r => r.email).map(r => r.email))].join(', ')
    try { await navigator.clipboard.writeText(text); setEmailMsg(`Copied ${text ? text.split(', ').length : 0} emails. Paste into BCC.`) } catch { setEmailMsg(text) }
  }

  const save = async () => {
    const value = Number(sw.result), splitVal = Number(sw.split)
    if (!athleteId || !value) { setMsg('Pick an athlete and enter a result.'); return }
    if (isForty && sw.split && !(splitVal > 0 && splitVal < value)) { setMsg('The 20-yard split has to be less than the 40 time.'); return }
    try {
      await logTime({ athleteId, testId, weekIndex, value, pin })
      if (isForty && splitVal) await logTime({ athleteId, testId: 'dash', weekIndex, value: splitVal, pin })
      const a = athletes.find(x => x.id === athleteId)
      setMsg(`Saved ${a?.name}: ${test.name} ${value}${test.unit === 's' ? 's' : ' in'}${isForty && splitVal ? `, 20-yard split ${splitVal}s` : ''} (Week ${TEST_WEEKS[weekIndex]})`)
      sw.reset(); onSaved()
    } catch { setMsg(LIVE ? 'Not saved. Check the coach PIN.' : 'Not saved.') }
  }

  return (
    <>
      <section className="section">
        <h2>Coach<small>Everything here uses the coach PIN.</small></h2>
        {LIVE && <div className="field"><label htmlFor="pin">Coach PIN</label><input id="pin" type="password" value={pin} onChange={e => setPin(e.target.value)} /></div>}
        {prefs && (
          <div className="tool-stats" style={{ marginTop: 0 }}>
            {[['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']].map(([k, l]) => (
              <div key={k}><span>{l} votes</span><b className="gold">{prefs[k] ?? 0}</b></div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Test Day<small>Pick the test, then go down the roster one athlete at a time.</small></h2>
        <div className="grid-2">
          <div className="field"><label htmlFor="tst">Test</label>
            <select id="tst" value={testId} disabled={testDay} onChange={e => { setTestId(e.target.value); sw.reset() }}>
              {TESTS.filter(t => t.id !== 'dash').map(t => <option key={t.id} value={t.id}>{t.id === 'forty' ? '40-Yard Dash (+ 20 split)' : t.name}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="wk">Test day</label>
            <select id="wk" value={weekIndex} disabled={testDay} onChange={e => setWeekIndex(Number(e.target.value))}>
              {TEST_WEEKS.map((w, i) => <option key={w} value={i}>Week {w}</option>)}
            </select>
          </div>
        </div>
        {testDay
          ? <TestDay pin={pin} onSaved={onSaved} onClose={() => setTestDay(false)} testId={testId} weekIndex={weekIndex} />
          : <button className="btn btn-red btn-block huge" onClick={() => setTestDay(true)}>Start test day</button>}
        {isForty && !testDay && <p className="small" style={{ margin: '8px 0 0', textAlign: 'center' }}>Stand where you can see the 20 and 40 cones. Tap SPLIT at 20, STOP at 40.</p>}

        <Roster pin={pin} onChange={onSaved} />

        <details className="card" style={{ marginTop: 16 }}>
          <summary style={{ fontWeight: 700, cursor: 'pointer' }}>Time one athlete</summary>
          <div className="field" style={{ marginTop: 12 }}><label htmlFor="ath">Athlete</label>
            <select id="ath" value={athleteId} onChange={e => setAthleteId(e.target.value)}>
              <option value="">{athletes.length ? 'Pick an athlete' : 'No athletes added yet'}</option>
              {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <p className="small" style={{ marginTop: 0 }}>Uses the test and week picked above.</p>
          {test.unit === 's' && (
            <>
              <div className="stopwatch" aria-live="off">{sw.elapsed.toFixed(2)}</div>
              <button className={`btn huge ${sw.running ? 'btn-ghost' : 'btn-red'}`} onClick={sw.press}>{sw.label}</button>
            </>
          )}
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="res">{test.unit === 's' ? 'Time in seconds (edit if needed)' : 'Distance in inches'}</label>
            <input id="res" type="number" step={test.unit === 's' ? '0.01' : '1'} inputMode="decimal" value={sw.result} onChange={e => sw.setResult(e.target.value)} />
          </div>
          {isForty && (
            <div className="field">
              <label htmlFor="spl">20-yard split in seconds</label>
              <input id="spl" type="number" step="0.01" inputMode="decimal" value={sw.split} onChange={e => sw.setSplit(e.target.value)} />
            </div>
          )}
          <button className="btn btn-red" style={{ width: '100%' }} onClick={save}>Save result</button>
          {msg && <p role="status" style={{ marginBottom: 0 }}>{msg}</p>}
        </details>

        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 18 }}>Parent email list</h3>
          <p className="small" style={{ margin: '4px 0 12px' }}>Paste into BCC.</p>
          {!emails ? <button className="btn btn-ghost" style={{ width: '100%' }} onClick={loadEmails}>Load email list</button> : (
            <>
              <p style={{ margin: '0 0 10px' }}>{emails.filter(r => r.email).length} of {emails.length} sign-ups have an email.</p>
              <div className="btn-row" style={{ marginTop: 0 }}>
                <button className="btn btn-red" onClick={() => copy(emails)}>Copy all</button>
                <button className="btn btn-ghost" onClick={() => copy(emails.filter(r => r.status === 'confirmed'))}>Confirmed only</button>
                <button className="btn btn-ghost" onClick={() => copy(emails.filter(r => r.updates_ok))}>Future programs</button>
              </div>
            </>
          )}
          {emailMsg && <p role="status" className="small" style={{ marginBottom: 0, wordBreak: 'break-word' }}>{emailMsg}</p>}
        </div>
        {!LIVE && <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => { resetDemo(); onSaved(); setMsg('Preview data reset.') }}>Reset preview data</button>}
      </section>
    </>
  )
}
