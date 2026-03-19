import { useState, useEffect, useCallback } from 'react'
import { FIRST_ROUND, ESPN_ALIASES } from '../data/brackets.js'

const DEFAULT_RESULTS = {
  firstRound: new Array(32).fill(null),
  eliteEight: new Array(8).fill(null),
  finalFour: new Array(4).fill(null),
  champion: null,
  liveScores: {},
}

function normalize(espnName) {
  if (!espnName) return null
  return ESPN_ALIASES[espnName] || espnName
}

function matchGame(espnGame, bracketGames) {
  const home = normalize(espnGame.homeTeam)
  const away = normalize(espnGame.awayTeam)
  return bracketGames.find(g => {
    const top = g.top.name
    const bot = g.bottom.name
    return (top === home || top === away) && (bot === home || bot === away)
  })
}

export function useLiveScores() {
  const [bracketResults, setBracketResults] = useState(DEFAULT_RESULTS)
  const [liveGames, setLiveGames] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('API error ' + res.status)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Unknown error')

      setLiveGames(data.games || [])
      setLastUpdated(data.updated)
      setError(null)

      const firstRound = new Array(32).fill(null)
      const liveScores = {}

      ;(data.games || []).forEach(espnGame => {
        try {
          const match = matchGame(espnGame, FIRST_ROUND)
          if (!match) return
          const idx = match.id - 1
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
          if (espnGame.completed && espnGame.winner) {
            firstRound[idx] = normalize(espnGame.winner)
          }
        } catch (e) {
          // skip bad game entry
        }
      })

      setBracketResults({ ...DEFAULT_RESULTS, firstRound, liveScores })
    } catch (err) {
      console.warn('Score fetch failed (non-fatal):', err.message)
      setError(err.message)
      // Keep default results — don't crash
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScores()
    const interval = setInterval(fetchScores, 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchScores])

  return { bracketResults, liveGames, lastUpdated, loading, error, refetch: fetchScores }
}
