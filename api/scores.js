// api/scores.js - Vercel Serverless Function
// Fetches live NCAA Tournament scores from ESPN's public API
// and maps them to our bracket data

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')

  try {
    // ESPN public API - no key required
    const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100'
    const response = await fetch(url)
    const data = await response.json()

    const games = data?.events || []

    const results = games.map(event => {
      const competition = event.competitions?.[0]
      if (!competition) return null

      const competitors = competition.competitors || []
      const home = competitors.find(c => c.homeAway === 'home')
      const away = competitors.find(c => c.homeAway === 'away')

      const status = competition.status?.type
      const completed = status?.completed || false
      const inProgress = status?.state === 'in'
      const clock = competition.status?.displayClock
      const period = competition.status?.period

      const homeTeam = home?.team?.shortDisplayName || home?.team?.displayName || ''
      const awayTeam = away?.team?.shortDisplayName || away?.team?.displayName || ''
      const homeScore = parseInt(home?.score || 0)
      const awayScore = parseInt(away?.score || 0)

      let winner = null
      if (completed) {
        winner = homeScore > awayScore ? homeTeam : awayTeam
      }

      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        completed,
        inProgress,
        clock: inProgress ? clock : null,
        period: inProgress ? period : null,
        winner,
        note: competition.notes?.[0]?.headline || '',
        date: event.date,
      }
    }).filter(Boolean)

    res.status(200).json({ success: true, games: results, updated: new Date().toISOString() })
  } catch (err) {
    console.error('Score fetch error:', err)
    res.status(500).json({ success: false, error: err.message, games: [] })
  }
}
