// Program details. Edit here; the whole site updates.
export const PROGRAM = {
  name: 'Speed Work Sundays',
  tagline: 'Get timed. Get faster. See the difference.',
  ages: '8–14',
  location: 'Buffaloe Road Athletic Park track',
  locationMapUrl: 'https://maps.google.com/?q=Buffaloe+Road+Athletic+Park+Raleigh+NC',
  time: 'about 1 hour',
  timeNote: 'Time picked by family vote at sign-up',
  timeOptions: [
    { id: 'morning', label: 'Morning', hint: 'around 9 AM' },
    { id: 'afternoon', label: 'Afternoon', hint: 'around 2 PM' },
    { id: 'evening', label: 'Evening', hint: 'around 5 PM' },
    { id: 'any', label: 'Any time works' },
  ],
  startDate: null, // e.g. '2027-01-10' (first Sunday). When set, the homepage shows a live countdown.
  startLabel: 'Starting January 2027', // shown until startDate is set
  weeks: 10,
  cap: 20,
  coach: 'Coach Gabe Lopez',
  contact: 'info@speedworksundays.com',
  siteUrl: 'https://www.speedworksundays.com',
  cashApp: '$SpeedWorkSundays',
  cashAppUrl: 'https://cash.app/$SpeedWorkSundays',
}

// Show sample athletes on the Speed Board until real results are logged.
// Set to false to hide them even before Week 1.
export const SHOW_SAMPLE_BOARD = true

export const FUND = {
  goal: 660, // sum of the items below (prices checked Nov 2026)
  raised: 0, // update as donations come in
  items: [
    { name: 'Laser timing gates', cost: 529, note: 'Exact times to 0.001s instead of stopwatch guesses. Shows the time right on the gate.' },
    { name: '4 speed parachutes', cost: 52, note: 'Resistance for acceleration days, about $13 each.' },
    { name: '2 agility ladder + cone kits', cost: 40, note: 'Two stations so kids are not standing in line.' },
    { name: 'Mini hurdles + bands kit', cost: 39, note: 'Footwork, knee drive and partner-resisted starts.' },
    { name: 'Guest coaches', cost: null, note: 'Stretch goal: track and college athletes for a session.' },
  ],
}

// Demo mode: on until Supabase env vars are set in Vercel.
export const LIVE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

// Goal calculator bands (fraction improvement from Week 1 to Week 10).
// Conservative starting values. Recalibrate after Week 5 with real athlete results.
export const GOAL_BANDS = {
  dash:    { low: 0.03, high: 0.06, stretch: 0.08 },
  forty:   { low: 0.03, high: 0.06, stretch: 0.08 },
  shuttle: { low: 0.03, high: 0.06, stretch: 0.08 },
  jump:    { low: 0.04, high: 0.08, stretch: 0.12 },
}
