// Data layer. Demo mode keeps everything on this device.
// Live mode (Supabase env vars set) writes to the database via REST.
import { LIVE, PROGRAM, SHOW_SAMPLE_BOARD } from '../config.js'
import { DEMO_ATHLETES } from '../data/demo.js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const local = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
  },
}

async function rest(path, options = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(options.headers || {}) },
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.status === 204 ? null : res.json()
}

const DEMO_BASELINE = 3 // reserved spots (Kai, Kannon, one more); live mode seeds these in the database

// Returns the saved row, including status: 'confirmed' or 'waitlist'.
// Live mode: the database decides the status (sws_signup in supabase/schema.sql).
export async function submitRsvp(rsvp) {
  if (LIVE) {
    const status = await rest('rpc/sws_signup', { method: 'POST', body: JSON.stringify({
      p_athlete_name: rsvp.athlete_name, p_age: rsvp.age, p_sport: rsvp.sport,
      p_parent_name: rsvp.parent_name, p_parent_contact: rsvp.parent_phone || '', p_parent_email: rsvp.parent_email,
      p_emergency_contact: rsvp.emergency_contact, p_signature_name: rsvp.signature_name,
      p_waiver: rsvp.waiver, p_waiver_version: rsvp.waiver_version,
      p_photo_ok: rsvp.photo_ok, p_updates_ok: rsvp.updates_ok, p_time_pref: rsvp.time_pref || null,
    }) })
    return { ...rsvp, status }
  }
  const all = local.get('sws_rsvps', [])
  const confirmed = DEMO_BASELINE + all.filter(r => r.status === 'confirmed').length
  const row = { ...rsvp, status: confirmed >= PROGRAM.cap ? 'waitlist' : 'confirmed', created_at: new Date().toISOString() }
  all.push(row)
  local.set('sws_rsvps', all)
  return row
}

export async function rsvpCount() {
  if (LIVE) return rest('rpc/sws_rsvp_counts', { method: 'POST', body: '{}' })
  const all = local.get('sws_rsvps', [])
  return {
    confirmed: DEMO_BASELINE + all.filter(r => r.status === 'confirmed').length,
    waitlist: all.filter(r => r.status === 'waitlist').length,
  }
}

export async function timePrefCounts() {
  if (LIVE) return rest('rpc/sws_time_pref_counts', { method: 'POST', body: '{}' })
  const all = local.get('sws_rsvps', [])
  const c = { morning: 0, afternoon: 0, evening: 0, any: 0 }
  all.forEach(r => { if (c[r.time_pref] != null) c[r.time_pref]++ })
  return c
}

// Coach-only: parent email list (PIN checked in the database).
export async function emailList(pin) {
  if (LIVE) return rest('rpc/sws_email_list', { method: 'POST', body: JSON.stringify({ p_pin: pin }) })
  return local.get('sws_rsvps', []).map(r => ({ parent_name: r.parent_name, athlete_name: r.athlete_name, email: r.parent_email, status: r.status, updates_ok: r.updates_ok }))
}

export async function getAthletes() {
  if (LIVE) {
    const rows = await rest('sws_athlete_results?select=*')
    const real = rows.map(r => {
      const results = r.results || {}
      const empty = !Object.values(results).some(v => (v || []).some(x => x != null))
      return { id: r.id, name: r.display_name, age: r.age, sport: r.sport, results, lessons: r.lessons || 0, practice: r.practice || null, empty }
    })
    const hasTimes = real.some(a => Object.values(a.results || {}).some(v => (v || []).some(x => x != null)))
    // Until the first real time is logged, show labeled sample athletes (plus any real roster).
    if (!hasTimes && SHOW_SAMPLE_BOARD) return [...real, ...DEMO_ATHLETES.map(a => ({ ...a, sample: true }))]
    return real
  }
  const logged = local.get('sws_logged', {})
  return DEMO_ATHLETES.map(a => {
    const extra = logged[a.id]
    if (!extra) return a
    const results = { ...a.results }
    for (const [test, byWeek] of Object.entries(extra)) {
      results[test] = [...results[test]]
      for (const [idx, v] of Object.entries(byWeek)) results[test][Number(idx)] = v
    }
    return { ...a, results }
  })
}

// weekIndex: 0 = week 1, 1 = week 5, 2 = week 10
export async function logTime({ athleteId, testId, weekIndex, value, pin }) {
  if (LIVE) {
    return rest('rpc/sws_log_result', { method: 'POST', body: JSON.stringify({ p_athlete: athleteId, p_test: testId, p_week_index: weekIndex, p_value: value, p_pin: pin }) })
  }
  const logged = local.get('sws_logged', {})
  logged[athleteId] = logged[athleteId] || {}
  logged[athleteId][testId] = logged[athleteId][testId] || {}
  logged[athleteId][testId][weekIndex] = value
  local.set('sws_logged', logged)
}

export function resetDemo() {
  local.set('sws_logged', {})
  local.set('sws_rsvps', [])
}

/* ---------- roster and private Speed Card links ---------- */
const rpc = (name, args) => rest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(args) })
const DEMO_TOKEN = 'demo00000000a1'

export async function buildRoster(pin) {
  if (LIVE) return rpc('sws_build_roster', { p_pin: pin })
  return 0
}
export async function getRoster(pin) {
  if (LIVE) return rpc('sws_roster', { p_pin: pin })
  return DEMO_ATHLETES.map((a, i) => ({ id: a.id, display_name: a.name, full_name: a.name, age: a.age, sport: a.sport, parent_name: 'Sample parent', parent_email: null, card_token: i === 0 ? DEMO_TOKEN : `demo${a.id}xxxxxxxx`, has_times: true }))
}
export async function updateAthlete(pin, { id, name, age, sport }) {
  if (LIVE) return rpc('sws_update_athlete', { p_pin: pin, p_id: id, p_name: name ?? null, p_age: age ?? null, p_sport: sport ?? null })
}
export async function lookupCard(token) {
  if (LIVE) return rpc('sws_me', { p_token: token })
  const i = token === DEMO_TOKEN ? 0 : DEMO_ATHLETES.findIndex(a => `demo${a.id}xxxxxxxx` === token)
  return i >= 0 ? [{ id: DEMO_ATHLETES[i].id, display_name: DEMO_ATHLETES[i].name }] : []
}
export async function passLesson(token, lesson) {
  if (LIVE) return rpc('sws_pass_lesson', { p_token: token, p_lesson: lesson })
}
export async function logPractice(token, kind, value) {
  if (LIVE) return rpc('sws_log_practice', { p_token: token, p_kind: kind, p_value: value })
}

