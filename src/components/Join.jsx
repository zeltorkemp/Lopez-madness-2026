import React, { useState } from 'react'
import { PROGRAM, FUND, LIVE } from '../config.js'
import { submitRsvp } from '../lib/store.js'

const EMPTY = { athlete_name: '', age: '', sport: '', parent_name: '', parent_contact: '', waiver: false, photo_ok: false }

export default function Join() {
  const [f, setF] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async e => {
    e.preventDefault()
    if (!f.waiver) return
    setStatus('sending')
    try {
      await submitRsvp({ ...f, age: f.age ? Number(f.age) : null })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <section className="section">
        <h2>Reserve a spot<small>Free. {PROGRAM.cap} athletes max so every kid gets coached.</small></h2>
        {status === 'done' ? (
          <div className="success" role="status">
            <h3 style={{ fontSize: 26 }}>You're on the list!</h3>
            <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>{f.athlete_name.split(' ')[0] || 'Your athlete'} is reserved for {PROGRAM.name}. We'll send the start date and what to bring.{!LIVE && ' (Preview mode: sign-ups open soon, this one was saved on this device only.)'}</p>
            <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => { setF(EMPTY); setStatus('idle') }}>Add another athlete</button>
          </div>
        ) : (
          <form className="card" onSubmit={submit}>
            <div className="field"><label htmlFor="an">Athlete name</label><input id="an" required value={f.athlete_name} onChange={set('athlete_name')} autoComplete="off" /></div>
            <div className="grid-2">
              <div className="field"><label htmlFor="age">Age</label><input id="age" type="number" min="6" max="17" inputMode="numeric" required value={f.age} onChange={set('age')} /></div>
              <div className="field"><label htmlFor="sp">Main sport</label>
                <select id="sp" value={f.sport} onChange={set('sport')} required>
                  <option value="">Pick one</option>
                  {['Football', 'Flag Football', 'Soccer', 'Basketball', 'Baseball', 'Softball', 'Track', 'Lacrosse', 'Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label htmlFor="pn">Parent or guardian name</label><input id="pn" required value={f.parent_name} onChange={set('parent_name')} autoComplete="name" /></div>
            <div className="field"><label htmlFor="pc">Parent phone or email</label><input id="pc" required value={f.parent_contact} onChange={set('parent_contact')} autoComplete="email" /></div>
            <label className="check"><input type="checkbox" required checked={f.waiver} onChange={set('waiver')} /> I'm the parent or guardian and I agree to the participation waiver.</label>
            <label className="check"><input type="checkbox" checked={f.photo_ok} onChange={set('photo_ok')} /> OK to show my athlete's first name and last initial on the Speed Board.</label>
            <button className="btn btn-red" style={{ width: '100%' }} disabled={status === 'sending'}>{status === 'sending' ? 'Saving…' : 'Reserve my spot'}</button>
            {status === 'error' && <p role="alert" style={{ color: '#FF8A80' }}>Something went wrong. Please try again.</p>}
          </form>
        )}
      </section>

      <section className="section card">
        <h2 style={{ fontSize: 24 }}>Want to help?</h2>
        <p style={{ color: '#CBD6EA', lineHeight: 1.5, margin: '6px 0 12px' }}>The clinic is free. 100% of donations go to equipment, and every purchase is posted on the site.</p>
        {FUND.items.map(i => (
          <div className="drill" key={i.name}><b>{i.name}</b><p>{i.note}</p></div>
        ))}
        <div className="test-tile" style={{ marginTop: 12, textAlign: 'center' }}>
          <span className="small">Cash App</span>
          <div className="display" style={{ fontSize: 30 }}>{PROGRAM.cashApp || 'Coming soon'}</div>
        </div>
      </section>

      <section className="section">
        <h2>Questions</h2>
        <div className="card">
          {[
            ['Does my kid need to be fast already?', 'No. The scoreboard is improvement, so every athlete can win Most Improved.'],
            ['Is it really free?', 'Yes. Donations are optional and only buy equipment.'],
            ['What if it rains?', 'We post updates here by Saturday night.'],
            ['Can parents stay?', 'Please do. We may ask you to help with timing.'],
          ].map(([q, a]) => <div className="drill" key={q}><b>{q}</b><p>{a}</p></div>)}
        </div>
      </section>
    </>
  )
}
