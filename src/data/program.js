export const TESTS = [
  { id: 'dash', name: '20-Yard Dash', short: '20 YD', unit: 's', lowerIsBetter: true, skill: 'Acceleration' },
  { id: 'shuttle', name: '5-10-5 Shuttle', short: '5-10-5', unit: 's', lowerIsBetter: true, skill: 'Change of direction' },
  { id: 'jump', name: 'Broad Jump', short: 'JUMP', unit: 'in', lowerIsBetter: false, skill: 'Explosive power' },
]

export const TEST_WEEKS = [1, 5, 10]

export const WEEKS = [
  { n: 1, title: 'Baseline Day', focus: 'Testing', blurb: 'Learn the warm-up and get your first official times in all three tests.', drills: ['wall', 'askip'], test: true },
  { n: 2, title: 'Run Tall', focus: 'Foundations', blurb: 'Posture and arm action. Fast arms make fast legs.', drills: ['wall', 'askip', 'arms'] },
  { n: 3, title: 'Own the Start', focus: 'Foundations', blurb: 'Two-point and falling starts. Win the first three steps.', drills: ['falling', 'askip', 'arms'] },
  { n: 4, title: 'Push the Ground', focus: 'Foundations', blurb: 'Big pushes out of the start with sled-style partner resists.', drills: ['falling', 'partner', 'wall'] },
  { n: 5, title: 'Midpoint Retest', focus: 'Testing', blurb: 'Same three tests. See your first gains on your Speed Card.', drills: ['askip'], test: true },
  { n: 6, title: 'Brake and Cut', focus: 'Agility', blurb: 'Stopping under control so you can change direction faster.', drills: ['decel', 'ladder'] },
  { n: 7, title: 'React', focus: 'Agility', blurb: 'Start on a signal, not on your own. Game speed.', drills: ['react', 'ladder', 'decel'] },
  { n: 8, title: 'Shuttle Master', focus: 'Agility', blurb: 'Clean 5-10-5 footwork: low hips, plant, push.', drills: ['decel', 'react', 'falling'] },
  { n: 9, title: 'Top Speed', focus: 'Max velocity', blurb: 'Flying sprints and relay races. Hold your speed.', drills: ['flying', 'askip'] },
  { n: 10, title: 'Speed Day', focus: 'Testing', blurb: 'Final testing, Most Improved awards, and a family relay.', drills: ['askip'], test: true },
]

export const SESSION = [
  { min: 10, name: 'Dynamic warm-up' },
  { min: 10, name: 'Sprint mechanics drills' },
  { min: 15, name: 'Starts and acceleration' },
  { min: 15, name: 'Agility or top speed' },
  { min: 10, name: 'Relay games + cooldown' },
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
  flying: { name: 'Flying 10s', cue: 'Build up for 15, then run your fastest 10 yards.', reps: '4 reps, full rest', home: false },
}
