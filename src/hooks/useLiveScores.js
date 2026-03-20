import { useState, useEffect, useCallback } from 'react'
import { FIRST_ROUND, ESPN_ALIASES, KNOWN_RESULTS } from '../data/brackets.js'

const DEFAULT_RESULTS = {
  firstRound: new Array(32).fill(null),
  eliteEight: new Array(8).fill(null),
  finalFour: new Array(4).fill(null),
  champion: null,
  liveScores: {},
}

function normalize(name) {
  if (!name) return null
  return ESPN_ALIASES[name] || name
}

function matchGame(espnGame) {
  const home = normalize(espnGame.homeTeam)
  const away = normalize(espnGame.awayTeam)
  return FIRST_ROUND.find(g => {
    const t = g.top.name, b = g.bottom.name
    return (t === home || t === away) && (b === home || b === away)
  })
}

export function useLiveScores() {
  // Start with known hardcoded results immediately
  const [bracketResults, setBracketResults] = useState({
    ...DEFAULT_RESULTS,
    firstRound: [...KNOWN_RESULTS.firstRound],
    liveScores: {},
  })
  const [liveGames, setLiveGames] = useState([])
  const [lastUpdated, setLastUpdated] = useState('Hardcoded Day 1 results')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('API ' + res.status)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const games = data.games || []
      setLiveGames(games)
      setLastUpdated(data.updated)
      setError(null)

      // Merge ESPN live/final results on top of known results
      const firstRound = [...KNOWN_RESULTS.firstRound]
      const liveScores = {}

      games.forEach(g => {
        try {
          const match = matchGame(g)
          if (!match) return
          const idx = match.id - 1
          liveScores[match.id] = {
            homeTeam: normalize(g.homeTeam),
            awayTeam: normalize(g.awayTeam),
            homeScore: g.homeScore,
            awayScore: g.awayScore,
            inProgress: g.inProgress,
            completed: g.completed,
            clock: g.clock,
            period: g.period,
          }
          if (g.completed && g.winner) firstRound[idx] = normalize(g.winner)
        } catch (e) {}
      })

      setBracketResults({ ...DEFAULT_RESULTS, firstRound, liveScores })
    } catch (err) {
      console.warn('ESPN API failed, using hardcoded results:', err.message)
      setError(err.message)
      // Keep hardcoded results on API failure
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScores()
    const interval = setInterval(fetchScores, 60000)
    return () => clearInterval(interval)
  }, [fetchScores])

  return { bracketResults, liveGames, lastUpdated, loading, error, refetch: fetchScores }
}
