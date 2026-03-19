import { useState, useEffect, useCallback } from 'react'
import { FIRST_ROUND, ESPN_ALIASES } from '../data/brackets.js'

// Normalize ESPN team name to our bracket name
function normalize(espnName) {
  if (!espnName) return null
  return ESPN_ALIASES[espnName] || espnName
}

// Try to match an ESPN game to one of our 32 first round matchups
function matchGame(espnGame, bracketGames) {
  const home = normalize(espnGame.homeTeam)
  const away = normalize(espnGame.awayTeam)

  return bracketGames.find(g => {
    const top = g.top.name
    const bot = g.bottom.name
    return (
      (top === home || top === away) &&
      (bot === home || bot === away)
    )
  })
}

export function useLiveScores() {
  const [liveGames, setLiveGames] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Derived: map live ESPN results to our bracket game IDs
  const [bracketResults, setBracketResults] = useState({
    firstRound: new Array(32).fill(null),
    liveScores: {}, // gameId -> { homeTeam, awayTeam, homeScore, awayScore, inProgress, clock, period }
  })

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      if (!data.success) throw new Error(data.error || 'Unknown error')

      setLiveGames(data.games)
      setLastUpdated(data.updated)
      setError(null)

      // Map ESPN results to our bracket
      const firstRound = new Array(32).fill(null)
      const liveScores = {}

      data.games.forEach(espnGame => {
        const match = matchGame(espnGame, FIRST_ROUND)
        if (!match) return

        const idx = match.id - 1

        // Store live score info
        liveScores[match.id] = {
          homeTeam: normalize(espnGame.homeTeam),
          awayTeam: normalize(espnGame.awayTeam),
          homeScore: espnGame.homeScore,
          awayScore: espnGame.awayScore,
          inProgress: espnGame.inProgress,
          completed: espnGame.completed,
          clock: espnGame.clock,
          period: espnGame.period,
        }

        // If completed, record winner
        if (espnGame.completed && espnGame.winner) {
          firstRound[idx] = normalize(espnGame.winner)
        }
      })

      setBracketResults({ firstRound, liveScores })
    } catch (err) {
      console.error('Score fetch failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScores()
    // Poll every 60 seconds during tournament
    const interval = setInterval(fetchScores, 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchScores])

  return { bracketResults, liveGames, lastUpdated, loading, error, refetch: fetchScores }
}
