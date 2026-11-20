import { TESTS } from '../data/program.js'
import { improvement, lastValue } from './stats.js'

export const AGE_GROUPS = [
  { id: 'all', label: 'All ages', test: () => true },
  { id: '8-10', label: '8–10', test: a => a.age <= 10 },
  { id: '11-12', label: '11–12', test: a => a.age >= 11 && a.age <= 12 },
  { id: '13-14', label: '13–14', test: a => a.age >= 13 },
]

// Every badge is earned against your own Week 1, so any athlete can collect them.
export const BADGES = [
  { id: 'ghost', icon: '👻', label: 'Ghost Buster', desc: 'Beat your Week 1 forty by 0.40s or more' },
  { id: 'rocket', icon: '🚀', label: 'Rocket', desc: '40-yard dash 8% faster than Week 1' },
  { id: 'quick', icon: '⚡', label: 'Quick Start', desc: '20-yard split 8% faster than Week 1' },
  { id: 'cuts', icon: '🔁', label: 'Sharp Cuts', desc: '5-10-5 shuttle 7% faster than Week 1' },
  { id: 'springs', icon: '🦘', label: 'Springs', desc: 'Broad jump 12% farther than Week 1' },
  { id: 'all', icon: '⭐', label: 'All-Around', desc: 'Improved on all four tests' },
  { id: 'pr', icon: '🔥', label: 'PR Breaker', desc: 'Set a personal record at the latest test' },
  { id: 'scholar', icon: '🧠', label: 'Speed Scholar', desc: 'Passed all three Speed School lessons' },
  { id: 'champ', icon: '🏆', label: 'Test Champ', desc: 'Most improved in your age group on any test' },
]
const byId = Object.fromEntries(BADGES.map(b => [b.id, b]))

const ageGroupOf = a => AGE_GROUPS.slice(1).find(g => g.test(a))?.id

function isPr(testId, vals = []) {
  const t = TESTS.find(x => x.id === testId)
  const filled = vals.filter(v => v != null)
  if (filled.length < 2) return false
  const last = filled[filled.length - 1]
  const prev = filled.slice(0, -1)
  return t.lowerIsBetter ? last < Math.min(...prev) : last > Math.max(...prev)
}

export function badgesFor(athlete, athletes = []) {
  const r = athlete.results || {}
  const gain = id => improvement(id, r[id])
  const out = []
  const f0 = r.forty?.[0], f1 = lastValue(r.forty || [])
  if (f0 != null && f1 != null && f0 - f1 >= 0.4) out.push('ghost')
  if (gain('forty') >= 8) out.push('rocket')
  if (gain('dash') >= 8) out.push('quick')
  if (gain('shuttle') >= 7) out.push('cuts')
  if (gain('jump') >= 12) out.push('springs')
  if (TESTS.every(t => gain(t.id) > 0)) out.push('all')
  if (TESTS.some(t => isPr(t.id, r[t.id]))) out.push('pr')
  if ((athlete.lessons || 0) >= 3) out.push('scholar')
  const group = athletes.filter(a => a.results && ageGroupOf(a) === ageGroupOf(athlete))
  const champOf = TESTS.filter(t => {
    const best = Math.max(...group.map(a => improvement(t.id, a.results[t.id])))
    return best > 0 && gain(t.id) === best
  })
  if (champOf.length) out.push('champ')
  return out.map(id => ({ ...byId[id], ...(id === 'champ' ? { desc: `Most improved in ages ${AGE_GROUPS.find(g => g.id === ageGroupOf(athlete))?.label}: ${champOf.map(t => t.name).join(', ')}` } : {}) }))
}

// Whole-squad totals for the team goal meter.
export function squadStats(athletes) {
  let seconds = 0, inches = 0, prs = 0, badges = 0
  for (const a of athletes) {
    const r = a.results || {}
    for (const t of TESTS) {
      const v = r[t.id] || []
      const first = v[0], last = lastValue(v)
      if (first == null || last == null) continue
      if (t.id === 'dash') continue // the split is inside the 40, so don't count it twice
      if (t.lowerIsBetter) seconds += Math.max(0, first - last)
      else inches += Math.max(0, last - first)
      if (isPr(t.id, v)) prs++
    }
    badges += badgesFor(a, athletes).length
  }
  return { seconds: Math.round(seconds * 100) / 100, inches: Math.round(inches), prs, badges }
}
