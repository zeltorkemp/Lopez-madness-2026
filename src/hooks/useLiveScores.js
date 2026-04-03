import { useState, useEffect, useCallback } from 'react'
import { FIRST_ROUND, KNOWN_RESULTS } from '../data/brackets.js'

const NAME_MAP = {
  'Duke': 'Duke', 'Siena': 'Siena',
  'Ohio St': 'Ohio State', 'TCU': 'TCU',
  "St. John's": "St. John's", 'St. Johns': "St. John's",
  'N Iowa': 'Northern Iowa', 'Kansas': 'Kansas',
  'Cal Baptist': 'Cal Baptist', 'Louisville': 'Louisville',
  'S Florida': 'South Florida', 'Michigan St': 'Michigan State',
  'NDSU': 'N. Dakota St.', 'UCLA': 'UCLA', 'UCF': 'UCF',
  'UConn': 'UConn', 'Furman': 'Furman',
  'Arizona': 'Arizona', 'LIU': 'Long Island',
  'Villanova': 'Villanova', 'Utah St': 'Utah State',
  'Wisconsin': 'Wisconsin', 'High Point': 'High Point',
  'Arkansas': 'Arkansas', "Hawai'i": "Hawai'i",
  'BYU': 'BYU', 'NC State': 'NC State', 'Texas': 'Texas',
  'Gonzaga': 'Gonzaga', 'Kennesaw St': 'Kennesaw St.',
  'Miami': 'Miami FL', 'Missouri': 'Missouri',
  'Purdue': 'Purdue', 'Queens': 'Queens NC',
  'Michigan': 'Michigan', 'Howard': 'Howard', 'UMBC': 'UMBC',
  'Georgia': 'Georgia', 'Saint Louis': 'Saint Louis', 'SLU': 'Saint Louis',
  'Texas Tech': 'Texas Tech', 'Akron': 'Akron',
  'Alabama': 'Alabama', 'Hofstra': 'Hofstra',
  'Tennessee': 'Tennessee', 'Miami OH': 'Miami OH',
  'Virginia': 'Virginia', 'Wright St': 'Wright State',
  'Kentucky': 'Kentucky', 'Santa Clara': 'Santa Clara',
  'Iowa St': 'Iowa State', 'Iowa State': 'Iowa State',
  'Tennessee St': 'Tennessee St.',
  'Florida': 'Florida', 'Lehigh': 'Lehigh',
  'Clemson': 'Clemson', 'Iowa': 'Iowa',
  'Vanderbilt': 'Vanderbilt', 'McNeese': 'McNeese',
  'Nebraska': 'Nebraska', 'Troy': 'Troy',
  'UNC': 'UNC', 'N Carolina': 'UNC',
  'VCU': 'VCU', 'Illinois': 'Illinois', 'Penn': 'Penn',
  "Saint Mary's": "Saint Mary's", 'SMC': "Saint Mary's",
  'Texas A&M': 'Texas A&M', 'TAMU': 'Texas A&M',
  'Houston': 'Houston', 'Idaho': 'Idaho',
}

function norm(name) { return NAME_MAP[name] || name || null }

const SECOND_ROUND_MATCHUPS = [
  [0,1],[2,3],[4,5],[6,7],
  [8,9],[10,11],[12,13],[14,15],
  [16,17],[18,19],[20,21],[22,23],
  [24,25],[26,27],[28,29],[30,31],
]
const SWEET16_MATCHUPS = [[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15]]
const ELITE8_MATCHUPS = [[0,1],[2,3],[4,5],[6,7]]

const DEFAULT = {
  firstRound: [...KNOWN_RESULTS.firstRound],
  secondRound: [...KNOWN_RESULTS.secondRound],
  sweet16: new Array(8).fill(null),
  eliteEight: new Array(4).fill(null),
  finalFour: new Array(2).fill(null),
  champion: null,
  liveScores: {},
  lastRound: 2,
}

export function useLiveScores() {
  const [bracketResults, setBracketResults] = useState(DEFAULT)
  const [liveGames, setLiveGames] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const games = data.games || []
      setLiveGames(games)
      setLastUpdated(data.updated)
      setError(null)

      const firstRound = [...KNOWN_RESULTS.firstRound]
      const secondRound = [...KNOWN_RESULTS.secondRound]
      const sweet16 = new Array(8).fill(null)
      const eliteEight = new Array(4).fill(null)
      const finalFour = new Array(2).fill(null)
      let champion = null
      const liveScores = {}
      let lastRound = 2

      games.forEach(g => {
        if (g.completed && g.round > lastRound) lastRound = g.round
        const homeN = norm(g.homeTeam)
        const awayN = norm(g.awayTeam)
        const winnerN = norm(g.winner)

        if (g.round === 1) {
          const match = FIRST_ROUND.find(fr =>
            (fr.top.name === homeN || fr.top.name === awayN) &&
            (fr.bottom.name === homeN || fr.bottom.name === awayN)
          )
          if (match) {
            if (g.completed && winnerN) firstRound[match.id - 1] = winnerN
            if (g.inProgress || g.completed) {
              liveScores[match.id] = { homeTeam: homeN, awayTeam: awayN, homeScore: g.homeScore, awayScore: g.awayScore, inProgress: g.inProgress, completed: g.completed, clock: g.clock, period: g.period }
            }
          }
        }

        if (g.round === 2 && g.completed && winnerN) {
          for (let i = 0; i < 16; i++) {
            const [a, b] = SECOND_ROUND_MATCHUPS[i]
            const r1a = firstRound[a], r1b = firstRound[b]
            if (r1a && r1b && (r1a === homeN || r1a === awayN) && (r1b === homeN || r1b === awayN)) {
              secondRound[i] = winnerN; break
            }
          }
        }

        if (g.round === 3 && winnerN) {
          if (g.inProgress || g.completed) {
            for (let i = 0; i < 8; i++) {
              const [a, b] = SWEET16_MATCHUPS[i]
              const r2a = secondRound[a], r2b = secondRound[b]
              if (r2a && r2b && (r2a === homeN || r2a === awayN) && (r2b === homeN || r2b === awayN)) {
                if (g.completed) sweet16[i] = winnerN
                liveScores[`s16_${i}`] = { homeTeam: homeN, awayTeam: awayN, homeScore: g.homeScore, awayScore: g.awayScore, inProgress: g.inProgress, completed: g.completed, clock: g.clock, period: g.period }
                break
              }
            }
          }
        }

        if (g.round === 4 && g.completed && winnerN) {
          for (let i = 0; i < 4; i++) {
            const [a, b] = ELITE8_MATCHUPS[i]
            const s16a = sweet16[a], s16b = sweet16[b]
            if (s16a && s16b && (s16a === homeN || s16a === awayN) && (s16b === homeN || s16b === awayN)) {
              eliteEight[i] = winnerN; break
            }
          }
        }

        if (g.round === 5 && g.completed && winnerN) {
          const i = eliteEight.findIndex(t => t === homeN || t === awayN)
          if (i >= 0) finalFour[Math.floor(i / 2)] = winnerN
        }

        if (g.round === 6 && g.completed && winnerN) champion = winnerN
      })

      setBracketResults({ firstRound, secondRound, sweet16, eliteEight, finalFour, champion, liveScores, lastRound })
    } catch (err) {
      console.warn('ESPN fetch failed:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScores()
    const interval = setInterval(fetchScores, 30000)
    return () => clearInterval(interval)
  }, [fetchScores])

  return { bracketResults, liveGames, lastUpdated, loading, error, refetch: fetchScores }
}
