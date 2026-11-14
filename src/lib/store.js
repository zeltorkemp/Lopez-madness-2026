// Data layer. Demo mode keeps everything on this device.
// Live mode (Supabase env vars set) writes to the database via REST.
import { LIVE } from '../config.js'
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

export async function submitRsvp(rsvp) {
  if (LIVE) return rest('rsvps', { method: 'POST', body: JSON.stringify(rsvp) })
  const all = local.get('sws_rsvps', [])
  all.push({ ...rsvp, created_at: new Date().toISOString() })
  local.set('sws_rsvps', all)
  return rsvp
}

export async function rsvpCount() {
  if (LIVE) {
    const rows = await rest('rsvp_count?select=count')
    return rows?.[0]?.count ?? 0
  }
  return 7 + local.get('sws_rsvps', []).length // demo baseline
}

export async function getAthletes() {
  if (LIVE) {
    const rows = await rest('athlete_results?select=*')
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
    return rest('rpc/log_result', { method: 'POST', body: JSON.stringify({ p_athlete: athleteId, p_test: testId, p_week_index: weekIndex, p_value: value, p_pin: pin }) })
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
