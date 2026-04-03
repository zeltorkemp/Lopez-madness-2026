// api/scores.js — Vercel Serverless Function
// Fetches ALL NCAA Tournament games from ESPN by date range

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=15')

  try {
    const dates = [
      '20260317', '20260318',
      '20260319', '20260320',
      '20260321', '20260322',
      '20260326', '20260327',
      '20260328', '20260329',
      '20260404', '20260406',
    ]
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    if (!dates.includes(today)) dates.push(today)

    const responses = await Promise.allSettled(
      dates.map(date =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=50&dates=${date}`)
          .then(r => r.json())
          .catch(() => ({ events: [] }))
      )
    )

    const seen = new Set()
    const allGames = []

    for (const result of responses) {
      if (result.status !== 'fulfilled') continue
      const events = result.value?.events || []
      for (const event of events) {
        if (seen.has(event.id)) continue
        seen.add(event.id)
        const comp = event.competitions?.[0]
        if (!comp) continue
        const competitors = comp.competitors || []
        const home = competitors.find(c => c.homeAway === 'home')
        const away = competitors.find(c => c.homeAway === 'away')
        if (!home || !away) continue
        const status = comp.status?.type
        const completed = status?.completed || false
        const inProgress = status?.state === 'in'
        const homeTeam = home.team?.shortDisplayName || ''
        const awayTeam = away.team?.shortDisplayName || ''
        const homeScore = parseInt(home.score || 0)
        const awayScore = parseInt(away.score || 0)
        let winner = null
        if (completed) {
          const w = competitors.find(c => c.winner)
          winner = w ? (w.team?.shortDisplayName || '') : (homeScore > awayScore ? homeTeam : awayTeam)
        }
        const note = comp.notes?.[0]?.headline || ''
        const round = note.includes('First Round') ? 1
          : note.includes('Second Round') ? 2
          : note.includes('Sweet 16') || note.includes('Regional Semifinal') ? 3
          : note.includes('Elite Eight') || note.includes('Regional Final') ? 4
          : note.includes('Final Four') || note.includes('National Semifinal') ? 5
          : note.includes('Championship') ? 6 : 0
        allGames.push({ id: event.id, shortName: event.shortName, homeTeam, awayTeam, homeScore, awayScore, completed, inProgress, clock: inProgress ? comp.status?.displayClock : null, period: inProgress ? comp.status?.period : null, winner, round, note, date: event.date })
      }
    }

    allGames.sort((a, b) => {
      if (a.inProgress && !b.inProgress) return -1
      if (!a.inProgress && b.inProgress) return 1
      return new Date(a.date) - new Date(b.date)
    })

    res.status(200).json({ success: true, games: allGames, total: allGames.length, live: allGames.filter(g => g.inProgress).length, completed: allGames.filter(g => g.completed).length, updated: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, games: [] })
  }
}
