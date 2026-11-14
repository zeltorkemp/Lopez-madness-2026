// Program details. Edit here; the whole site updates.
export const PROGRAM = {
  name: 'Speed Work Sundays',
  tagline: 'Get timed. Get faster. See the difference.',
  ages: '8–14',
  location: 'Buffaloe Road Athletic Park track',
  locationMapUrl: 'https://maps.google.com/?q=Buffaloe+Road+Athletic+Park+Raleigh+NC',
  time: 'Time TBA', // e.g. '1:00–2:00 PM'
  startDate: null, // e.g. '2027-01-10' (first Sunday). When set, the homepage shows a live countdown.
  startLabel: 'Starting January 2027', // shown until startDate is set
  weeks: 10,
  cap: 20,
  coach: 'Coach Gabe Lopez',
  contact: '', // e.g. 'coach@lopezmadness.com'
  cashApp: '', // e.g. '$SpeedWorkSundays'
}

export const FUND = {
  goal: 600, // demo goal, update when real
  raised: 185, // demo figure
  items: [
    { name: 'Laser timing gates', note: 'Accurate times, no stopwatch guessing', est: 'Goal item' },
    { name: 'Resistance parachutes', note: 'Acceleration strength', est: '' },
    { name: 'Speed ladders + cones', note: 'Footwork and agility', est: '' },
    { name: 'Guest coaches', note: 'Track and college athletes', est: '' },
  ],
}

// Demo mode: on until Supabase env vars are set in Vercel.
export const LIVE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
