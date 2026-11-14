// Data layer. Demo mode keeps everything on this device.
// Live mode (Supabase env vars set) writes to the database via REST.
import { LIVE, PROGRAM } from '../config.js'
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
      p_parent_name: rsvp.parent_name, p_parent_contact: rsvp.parent_contact,
      p_waiver: rsvp.waiver, p_photo_ok: rsvp.photo_ok, p_updates_ok: rsvp.updates_ok,
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

export async function getAthletes() {
  if (LIVE) {
    const rows = await rest('sws_athlete_results?select=*')
    return rows.map(r => ({ id: r.id, name: r.display_name, age: r.age, sport: r.sport, results: r.results }))
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
