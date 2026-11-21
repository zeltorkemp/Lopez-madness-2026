import React, { useEffect, useRef, useState } from 'react'
import { PROGRAM, FUND, LIVE } from '../config.js'
import { submitRsvp, rsvpCount } from '../lib/store.js'
import { WAIVER, WAIVER_VERSION } from '../data/waiver.js'

const SPORTS = ['Football', 'Flag Football', 'Soccer', 'Basketball', 'Baseball', 'Softball', 'Track', 'Lacrosse', 'Other']
const EMPTY = { athlete_name: '', age: '', sport: '', sport2: '', parent_name: '', parent_email: '', parent_phone: '', emergency_contact: '', signature_name: '', waiver: false, photo_ok: false, updates_ok: false, time_pref: '' }
// Kept when a parent adds a sibling, so they only re-enter the athlete, the waiver and the signature.
const PARENT_KEYS = ['parent_name', 'parent_email', 'parent_phone', 'emergency_contact', 'time_pref', 'updates_ok']

export default function Join() {
  const [f, setF] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [saved, setSaved] = useState(null)
  const [counts, setCounts] = useState(null)
  useEffect(() => { rsvpCount().then(setCounts).catch(() => setCounts(null)) }, [status])
  const full = counts ? counts.confirmed >= PROGRAM.cap : false
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const start = PROGRAM.startLabel.replace(/^Starting/, 'starting')

  // The form is far taller than the confirmation that replaces it, so without this the
  // page would be left showing whatever sits below (the equipment fund), not "You're in!".
  const doneRef = useRef(null)
  useEffect(() => {
    if (status !== 'done' || !doneRef.current) return
    doneRef.current.scrollIntoView({ block: 'start' })
    doneRef.current.focus({ preventScroll: true })
  }, [status])

  const addAnother = () => {
    setF({ ...EMPTY, ...Object.fromEntries(PARENT_KEYS.map(k => [k, f[k]])) })
    setStatus('idle')
    requestAnimationFrame(() => { const el = document.getElementById('an'); if (el) { el.scrollIntoView({ block: 'center' }); el.focus({ preventScroll: true }) } })
  }

  const submit = async e => {
    e.preventDefault()
    if (!f.waiver || !f.time_pref) return
    setStatus('sending')
    try {
      const { sport2, ...rest } = f
      const sport = sport2 && sport2 !== f.sport ? `${f.sport} & ${sport2}` : f.sport
      // The parent's cell is required, so a blank emergency contact means "call the parent".
      const emergency_contact = f.emergency_contact.trim() || `Parent: ${f.parent_name.trim()}, ${f.parent_phone.trim()}`
      const row = await submitRsvp({ ...rest, emergency_contact, sport, age: f.age ? Number(f.age) : null, waiver_version: WAIVER_VERSION })
      setSaved(row)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <section className="section">
        <h2>{full ? 'Join the waitlist' : 'Reserve a spot'}<small>{full
          ? `All ${PROGRAM.cap} spots are taken${counts?.waitlist ? ` and ${counts.waitlist} ${counts.waitlist === 1 ? 'family is' : 'families are'} waiting` : ''}. Join the waitlist: you're first in line if a spot opens or we add a second session.`
          : `Free. ${PROGRAM.cap} athletes max so every kid gets coached. Pick the Sunday time that works for your family below.`}</small></h2>
        <dl className="facts">
          <div><dt>Who</dt><dd>Ages {PROGRAM.ages}, any sport</dd></div>
          <div><dt>When</dt><dd>Sundays, {start}</dd></div>
          <div><dt>Length</dt><dd>{PROGRAM.sessionLength}</dd></div>
          <div><dt>Cost</dt><dd>Free</dd></div>
          <div><dt>Where</dt><dd><a href={PROGRAM.locationMapUrl} target="_blank" rel="noreferrer">{PROGRAM.location}</a></dd></div>
          <div><dt>Bring</dt><dd>Water, sneakers or turf cleats</dd></div>
        </dl>
        {status === 'done' ? (
          <div className="success" role="status" tabIndex={-1} ref={doneRef}>
            <h3 style={{ fontSize: 26 }}>{saved?.status === 'waitlist' ? "You're on the waitlist" : "You're in!"}</h3>
            <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>{saved?.status === 'waitlist'
              ? `${f.athlete_name.split(' ')[0] || 'Your athlete'} is on the waitlist. We'll reach out first if a spot opens or a second session is added.`
              : `${f.athlete_name.split(' ')[0] || 'Your athlete'} has a spot in ${PROGRAM.name}. We'll email the start date, time and what to bring.`}</p>
            <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>Check your inbox: a confirmation is on its way to <b>{f.parent_email}</b>.{!LIVE && ' (Preview mode: this was saved on this device only, and no email is sent.)'}</p>
            <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={addAnother}>Add another athlete</button>
          </div>
        ) : (
          <form className="card" onSubmit={submit}>
            <div className="field"><label htmlFor="an">Athlete name</label><input id="an" required value={f.athlete_name} onChange={set('athlete_name')} autoComplete="off" /></div>
            <div className="grid-2">
              <div className="field"><label htmlFor="age">Age</label><input id="age" type="number" min="6" max="17" inputMode="numeric" required value={f.age} onChange={set('age')} placeholder="8 to 14" /></div>
              <div className="field"><label htmlFor="sp">Main sport</label>
                <select id="sp" value={f.sport} onChange={set('sport')} required>
                  <option value="">Pick one</option>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label htmlFor="sp2">Second sport <span className="small">(optional)</span></label>
              <select id="sp2" value={f.sport2} onChange={set('sport2')}>
                <option value="">None</option>
                {SPORTS.filter(s => s !== f.sport).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field"><label htmlFor="pn">Parent or guardian name</label><input id="pn" required value={f.parent_name} onChange={set('parent_name')} autoComplete="name" /></div>
            <div className="field"><label htmlFor="pe">Parent email</label><input id="pe" type="email" required value={f.parent_email} onChange={set('parent_email')} autoComplete="email" inputMode="email" placeholder="you@email.com" /></div>
            <div className="field"><label htmlFor="pp">Parent cell</label><input id="pp" type="tel" required value={f.parent_phone} onChange={set('parent_phone')} autoComplete="tel" inputMode="tel" aria-describedby="pp-hint" /><span className="small" id="pp-hint">For day-of updates and emergencies.</span></div>
            <fieldset className="field timepick">
              <legend>Which time of day works best on Sundays?</legend>
              <div className="timepick-grid">
                {PROGRAM.timeOptions.map(o => (
                  <label key={o.id} className={f.time_pref === o.id ? 'on' : ''}>
                    <input type="radio" name="time_pref" value={o.id} required checked={f.time_pref === o.id} onChange={set('time_pref')} />
                    <b>{o.label}</b>{o.hint && <span>{o.hint}</span>}
                  </label>
                ))}
              </div>
              <span className="small">The final time will be confirmed by email before Week 1.</span>
            </fieldset>
            <div className="field"><label htmlFor="ec">Emergency contact, if not you <span className="small">(optional)</span></label><input id="ec" value={f.emergency_contact} onChange={set('emergency_contact')} placeholder="Name and phone" /></div>
            <div className="field">
              <label id="wv-label">Participation waiver</label>
              <div className="waiver" role="region" aria-labelledby="wv-label">
                {WAIVER.map(w => <p key={w.title}><b>{w.title}.</b> {w.body}</p>)}
              </div>
            </div>
            <label className="check"><input type="checkbox" required checked={f.waiver} onChange={set('waiver')} /> I'm the parent or legal guardian, I've read the waiver above, and I agree to it for myself and my child.</label>
            <div className="field"><label htmlFor="sig">Type your full name to sign</label><input id="sig" required value={f.signature_name} onChange={set('signature_name')} autoComplete="name" /></div>
            <label className="check"><input type="checkbox" checked={f.photo_ok} onChange={set('photo_ok')} /> OK to show my athlete's first name and last initial on the Speed Board.</label>
            <label className="check"><input type="checkbox" checked={f.updates_ok} onChange={set('updates_ok')} /> Also email me about extra sessions and future programs.</label>
            <button className="btn btn-red" style={{ width: '100%' }} disabled={status === 'sending'}>{status === 'sending' ? 'Saving…' : full ? 'Join the waitlist' : 'Reserve my spot'}</button>
            {status === 'error' && <p role="alert" style={{ color: 'var(--red)', lineHeight: 1.45 }}>That did not save, so no spot is held yet. Check your connection and try again, or email {PROGRAM.contact}.</p>}
          </form>
        )}
      </section>

      <section className="section card">
        <h2 style={{ fontSize: 24 }}>Want to help?</h2>
        <p style={{ color: 'var(--soft)', lineHeight: 1.5, margin: '6px 0 12px' }}>The clinic is free. 100% of donations go to equipment, and every purchase is posted on the site.</p>
        {FUND.raised > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, margin: '4px 0 8px' }}><span className="mono">${FUND.raised} raised</span><span className="small">goal ${FUND.goal}</span></div>
            <div className="meter" style={{ marginBottom: 8 }}><i style={{ width: `${Math.min(100, (FUND.raised / FUND.goal) * 100)}%` }} /></div>
          </>
        ) : <p className="small" style={{ margin: '0 0 8px' }}>The wish list, ${FUND.goal} in all:</p>}
        {FUND.items.map(i => (
          <div className="drill" key={i.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><b>{i.name}</b><span className="mono" style={{ fontWeight: 700 }}>{i.cost ? `$${i.cost}` : 'Stretch'}</span></div>
            <p>{i.note}</p>
          </div>
        ))}
        <div className="test-tile" style={{ marginTop: 12, textAlign: 'center' }}>
          <span className="small">Cash App</span>
          <div className="display cashtag">{PROGRAM.cashApp || 'Coming soon'}</div>
          {PROGRAM.cashAppUrl && <a className="btn btn-red" href={PROGRAM.cashAppUrl} target="_blank" rel="noreferrer" style={{ width: '100%', marginTop: 12 }}>Donate on Cash App</a>}
        </div>
      </section>

      <section className="section">
        <h2>Questions</h2>
        <div className="card">
          {[
            ['How long is each session?', `${PROGRAM.sessionLength[0].toUpperCase()}${PROGRAM.sessionLength.slice(1)}, every Sunday for ${PROGRAM.weeks} weeks.`],
            ['Does my kid need to be fast already?', 'No. The scoreboard is improvement, so every athlete can win Most Improved.'],
            ['Is it really free?', 'Yes. Donations are optional and only buy equipment.'],
            ['What if it rains?', 'We post updates here by Saturday night.'],
            ['Can parents stay?', 'Please do. We may ask you to help with timing.'],
            ['Other questions?', `Email ${PROGRAM.contact} and Coach Gabe will get back to you.`],
          ].map(([q, a]) => <div className="drill" key={q}><b>{q}</b><p>{a}</p></div>)}
        </div>
      </section>
    </>
  )
}
