import { useState, useEffect, useCallback } from 'react'
import { FIRST_ROUND, ESPN_ALIASES, KNOWN_RESULTS } from '../data/brackets.js'

const DEFAULT_RESULTS = {
  firstRound: new Array(32).fill(null),
  secondRound: new Array(16).fill(null),
  eliteEight: new Array(4).fill(null),
  finalFour: new Array(2).fill(null),
  champion: null,
  liveScores: {},
}

function normalize(name) {
  if (!name) return null
  return ESPN_ALIASES[name] || name
}

export function useLiveScores() {
  const [bracketResults, setBracketResults] = useState({
    ...DEFAULT_RESULTS,
    firstRound: [...KNOWN_RESULTS.firstRound],
    secondRound: [...KNOWN_RESULTS.secondRound],
  })
  const [liveGames, setLiveGames] = useState([])
  const [lastUpdated, setLastUpdated] = useState('Updated through Round of 32')
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

      const firstRound = [...KNOWN_RESULTS.firstRound]
      const liveScores = {}

      games.forEach(g => {
        try {
          const home = normalize(g.homeTeam)
          const away = normalize(g.awayTeam)
          const match = FIRST_ROUND.find(fr => {
            return (fr.top.name === home || fr.top.name === away) &&
                   (fr.bottom.name === home || fr.bottom.name === away)
          })
          if (!match) return
          liveScores[match.id] = {
            homeTeam: home, awayTeam: away,
            homeScore: g.homeScore, awayScore: g.awayScore,
            inProgress: g.inProgress, completed: g.completed,
            clock: g.clock, period: g.period,
          }
          if (g.completed && g.winner) firstRound[match.id - 1] = normalize(g.winner)
        } catch (e) {}
      })

      setBracketResults(prev => ({ ...prev, firstRound, liveScores }))
    } catch (err) {
      console.warn('ESPN API failed, using hardcoded results:', err.message)
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    fetchScores()
    const interval = setInterval(fetchScores, 60000)
    return () => clearInterval(interval)
  }, [fetchScores])

  return { bracketResults, liveGames, lastUpdated, loading, error, refetch: fetchScores }
}
