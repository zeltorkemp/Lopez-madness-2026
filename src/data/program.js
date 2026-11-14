export const TESTS = [
  { id: 'forty', name: '40-Yard Dash', short: '40 YD', unit: 's', lowerIsBetter: true, skill: 'Speed' },
  { id: 'dash', name: '20-Yard Split', short: '20 YD', unit: 's', lowerIsBetter: true, skill: 'Acceleration, timed inside the 40' },
  { id: 'shuttle', name: '5-10-5 Shuttle', short: '5-10-5', unit: 's', lowerIsBetter: true, skill: 'Change of direction' },
  { id: 'jump', name: 'Broad Jump', short: 'JUMP', unit: 'in', lowerIsBetter: false, skill: 'Explosive power' },
]

export const TEST_WEEKS = [1, 5, 10]

// Every session also includes: jump block, a small top-speed dose (non-test weeks), and a race finish.
export const WEEKS = [
  { n: 1, title: 'Baseline Day', focus: 'Testing', blurb: 'Learn the warm-up and get your first official times: the 40 (with a 20-yard split), 5-10-5 shuttle and broad jump.', drills: ['wall', 'askip', 'pogo'], home: ['bridge', 'balance'], test: true },
  { n: 2, title: 'Run Tall', focus: 'Foundations', blurb: 'Posture and arm action. Fast arms make fast legs.', drills: ['wall', 'askip', 'arms', 'pogo', 'flying'], home: ['bridge', 'arms'] },
  { n: 3, title: 'Own the Start', focus: 'Acceleration', blurb: 'Two-point and falling starts. Win the first three steps.', drills: ['falling', 'askip', 'skiph', 'flying'], home: ['lunge', 'pogo'] },
  { n: 4, title: 'Push the Ground', focus: 'Acceleration', blurb: 'Big pushes out of the start with partner-resisted sprints.', drills: ['falling', 'partner', 'skiph', 'flying'], home: ['lunge', 'bridge'] },
  { n: 5, title: 'Midpoint Retest', focus: 'Testing', blurb: 'Same tests, same rules. See your first gains on your Speed Card.', drills: ['askip', 'pogo'], home: ['balance', 'bridge'], test: true },
  { n: 6, title: 'Brake and Cut', focus: 'Agility', blurb: 'Stopping under control so you can change direction faster.', drills: ['decel', 'ladder', 'bound', 'flying'], home: ['balance', 'lunge'] },
  { n: 7, title: 'React', focus: 'Agility', blurb: 'Start on a signal, not on your own. Game speed.', drills: ['react', 'ladder', 'pogo', 'flying'], home: ['react', 'bridge'] },
  { n: 8, title: 'Shuttle Master', focus: 'Agility', blurb: 'Clean 5-10-5 footwork: low hips, plant, push.', drills: ['decel', 'react', 'bound', 'flying'], home: ['lunge', 'balance'] },
  { n: 9, title: 'Top Speed', focus: 'Max velocity', blurb: 'Longer flying sprints and relay races. Hold your speed.', drills: ['flying', 'askip', 'bound'], home: ['pogo', 'bridge'] },
  { n: 10, title: 'Speed Day', focus: 'Testing', blurb: 'Final testing, Most Improved awards, and a family relay.', drills: ['askip', 'pogo'], home: [], test: true },
]

export const SESSION = [
  { min: 10, name: 'Dynamic warm-up' },
  { min: 5, name: 'Jump block (pogos, skips, bounds)' },
  { min: 10, name: 'Sprint mechanics' },
  { min: 15, name: 'Main focus of the week' },
  { min: 8, name: 'Top speed (flying sprints)' },
  { min: 12, name: 'Races + cooldown' },
]

export const DRILLS = {
  wall: { name: 'Wall Drive', cue: 'Lean into a wall, drive one knee up, switch fast.', reps: '3 x 5 each leg', home: true },
  askip: { name: 'A-Skip', cue: 'Knee up, toe up, punch the ground under your hips.', reps: '2 x 20 yards', home: true },
  arms: { name: 'Seated Arm Swings', cue: 'Cheek to pocket. Elbows at 90. Go fast.', reps: '3 x 10 seconds', home: true },
  falling: { name: 'Falling Start', cue: 'Stand tall, lean until you fall, then explode for 10 yards.', reps: '4 reps, full rest', home: true },
  partner: { name: 'Partner Resist', cue: 'Partner holds a band at your hips. Push, push, push.', reps: '4 x 10 yards', home: false },
  decel: { name: 'Sprint and Stick', cue: 'Sprint 5 yards, stop in 2 steps, hold the landing.', reps: '2 x 5', home: true },
  ladder: { name: 'Ladder In-Outs', cue: 'Quick feet, quiet feet. Eyes up.', reps: '3 trips', home: false },
  react: { name: 'Clap Starts', cue: 'Go on the clap, not before. Win the race to the cone.', reps: '6 starts', home: true },
  flying: { name: 'Flying 10s', cue: 'Build up for 15 yards, then run your fastest 10.', reps: '2 to 3 reps, full rest', home: false },
  pogo: { name: 'Pogo Hops', cue: 'Stiff ankles, bounce off the ground like it is hot.', reps: '3 x 15', home: true },
  skiph: { name: 'Skips for Height', cue: 'Drive the knee and arms up. Float, then land soft.', reps: '2 x 15 yards', home: true },
  bound: { name: 'Bounds', cue: 'Big push, big air, land and go again.', reps: '3 x 5 bounds', home: false },
  lunge: { name: 'Reverse Lunges', cue: 'Step back, front knee over the toes, stand up strong.', reps: '2 x 8 each leg', home: true },
  bridge: { name: 'Glute Bridges', cue: 'Squeeze and lift the hips, hold 2 seconds at the top.', reps: '2 x 12', home: true },
  balance: { name: 'Single-Leg Balance', cue: 'Stand on one foot, eyes up. Too easy? Close your eyes.', reps: '3 x 20 seconds each leg', home: true },
}
