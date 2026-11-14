import React, { useEffect, useRef, useState } from 'react'
import { LIVE } from '../config.js'
import { TESTS, TEST_WEEKS } from '../data/program.js'
import { logTime, resetDemo } from '../lib/store.js'

export default function Coach({ athletes: all, onSaved }) {
  const athletes = LIVE ? all.filter(a => !a.sample) : all
  const [athleteId, setAthleteId] = useState('')
  const [testId, setTestId] = useState('forty')
  const [split, setSplit] = useState('')
  const [weekIndex, setWeekIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [manual, setManual] = useState('')
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')
  const startAt = useRef(0)
  const raf = useRef(0)

  const test = TESTS.find(t => t.id === testId)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const tick = () => { setElapsed((performance.now() - startAt.current) / 1000); raf.current = requestAnimationFrame(tick) }
  const isForty = testId === 'forty'
  const now = () => ((performance.now() - startAt.current) / 1000).toFixed(2)
  // 40s: START -> SPLIT (runner crosses 20) -> STOP. Other timed tests: START -> STOP.
  const toggle = () => {
    if (!running) { startAt.current = performance.now(); setElapsed(0); setSplit(''); setManual(''); setRunning(true); setMsg(''); raf.current = requestAnimationFrame(tick); return }
    if (isForty && !split) { setSplit(now()); return }
    cancelAnimationFrame(raf.current); setRunning(false); setManual(now())
  }
  const btnLabel = !running ? 'START' : isForty && !split ? 'SPLIT at 20' : 'STOP'

  const save = async () => {
    const value = Number(manual)
    const splitVal = Number(split)
    if (!athleteId || !value) { setMsg('Pick an athlete and enter a result.'); return }
    if (isForty && split && !(splitVal > 0 && splitVal < value)) { setMsg('The 20-yard split has to be less than the 40 time.'); return }
    try {
      await logTime({ athleteId, testId, weekIndex, value, pin })
      if (isForty && splitVal) await logTime({ athleteId, testId: 'dash', weekIndex, value: splitVal, pin })
      const a = athletes.find(x => x.id === athleteId)
      setMsg(`Saved ${a?.name}: ${test.name} ${value}${test.unit === 's' ? 's' : ' in'}${isForty && splitVal ? `, 20-yard split ${splitVal}s` : ''} (Week ${TEST_WEEKS[weekIndex]})`)
      setManual(''); setSplit(''); setElapsed(0); onSaved()
    } catch {
      setMsg(LIVE ? 'Not saved. Check the coach PIN.' : 'Not saved.')
    }
  }

  return (
    <section className="section">
      <h2>Coach Timing<small>{LIVE ? 'Log results at the track. Saves straight to the Speed Board.' : 'Preview mode: results save on this device so you can try it.'}</small></h2>
      <div className="card">
        <div className="field"><label htmlFor="ath">Athlete</label>
          <select id="ath" value={athleteId} onChange={e => setAthleteId(e.target.value)}>
            <option value="">{athletes.length ? 'Pick an athlete' : 'No athletes added yet'}</option>
            {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="field"><label htmlFor="tst">Test</label>
            <select id="tst" value={testId} onChange={e => { setTestId(e.target.value); setManual(''); setSplit('') }}>
              {TESTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="wk">Test day</label>
            <select id="wk" value={weekIndex} onChange={e => setWeekIndex(Number(e.target.value))}>
              {TEST_WEEKS.map((w, i) => <option key={w} value={i}>Week {w}</option>)}
            </select>
          </div>
        </div>

        {test.unit === 's' && (
          <>
            <div className="stopwatch" aria-live="off">{elapsed.toFixed(2)}</div>
            <button className={`btn huge ${running ? 'btn-ghost' : 'btn-red'}`} onClick={toggle}>{btnLabel}</button>
            {isForty && <p className="small" style={{ margin: '8px 0 0', textAlign: 'center' }}>Stand off to the side where you can see the 20 and 40 cones. Tap SPLIT at 20, STOP at 40. With a helper, have them time the 20 and type it below.</p>}
          </>
        )}

        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="res">{test.unit === 's' ? 'Time in seconds (edit if needed)' : 'Distance in inches'}</label>
          <input id="res" type="number" step={test.unit === 's' ? '0.01' : '1'} inputMode="decimal" value={manual} onChange={e => setManual(e.target.value)} />
        </div>
        {isForty && (
          <div className="field">
            <label htmlFor="spl">20-yard split in seconds (saves to the 20-Yard Split)</label>
            <input id="spl" type="number" step="0.01" inputMode="decimal" value={split} onChange={e => setSplit(e.target.value)} />
          </div>
        )}
        {LIVE && <div className="field"><label htmlFor="pin">Coach PIN</label><input id="pin" type="password" value={pin} onChange={e => setPin(e.target.value)} /></div>}
        <button className="btn btn-red" style={{ width: '100%' }} onClick={save}>Save result</button>
        {msg && <p role="status" style={{ marginBottom: 0 }}>{msg}</p>}
      </div>
      {!LIVE && <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => { resetDemo(); onSaved(); setMsg('Preview data reset.') }}>Reset preview data</button>}
    </section>
  )
}
