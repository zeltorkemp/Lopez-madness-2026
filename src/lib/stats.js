import { TESTS } from '../data/program.js'

const testById = Object.fromEntries(TESTS.map(t => [t.id, t]))

const lastValue = arr => {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i]
  return null
}

// Percent improvement from first to latest result, positive = better.
export function improvement(testId, values) {
  const t = testById[testId]
  const first = values?.[0]
  const last = lastValue(values || [])
  if (first == null || last == null || first === 0) return 0
  const raw = t.lowerIsBetter ? (first - last) / first : (last - first) / first
  return Math.round(raw * 1000) / 10
}

export function overallImprovement(athlete) {
  const vals = TESTS.map(t => improvement(t.id, athlete.results[t.id]))
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export function fmt(testId, v) {
  if (v == null) return '–'
  const t = testById[testId]
  return t.unit === 's' ? `${v.toFixed(2)}s` : `${Math.round(v)}"`
}

// seconds over a distance in yards -> average mph (default 20 yards)
export function dashMph(seconds, yards = 20) {
  if (!seconds) return 0
  return Math.round(((yards * 3) / 5280 / (seconds / 3600)) * 10) / 10
}

export { testById, lastValue }
