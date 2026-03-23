export const REGIONS = ['East', 'West', 'Midwest', 'South']

export const REGION_COLORS = {
  East: '#00c8ff',
  West: '#ff6b00',
  Midwest: '#00ff9d',
  South: '#b966ff',
}

export const ESPN_ALIASES = {
  'Duke': 'Duke', 'Siena': 'Siena',
  'Ohio St': 'Ohio State', 'Ohio State': 'Ohio State',
  'TCU': 'TCU', "St. John's": "St. John's",
  'N Iowa': 'Northern Iowa', 'Northern Iowa': 'Northern Iowa',
  'Kansas': 'Kansas', 'Cal Baptist': 'Cal Baptist',
  'Louisville': 'Louisville', 'S Florida': 'South Florida', 'South Florida': 'South Florida',
  'Michigan St': 'Michigan State', 'Michigan State': 'Michigan State',
  'N Dakota St': 'N. Dakota St.', 'North Dakota St': 'N. Dakota St.',
  'UCLA': 'UCLA', 'UCF': 'UCF', 'UConn': 'UConn', 'Connecticut': 'UConn', 'Furman': 'Furman',
  'Arizona': 'Arizona', 'LIU': 'Long Island', 'Long Island': 'Long Island',
  'Villanova': 'Villanova', 'Utah St': 'Utah State', 'Utah State': 'Utah State',
  'Wisconsin': 'Wisconsin', 'High Point': 'High Point', 'Arkansas': 'Arkansas',
  "Hawai'i": "Hawai'i", 'Hawaii': "Hawai'i",
  'BYU': 'BYU', 'NC State': 'NC State', 'Texas': 'Texas', 'Gonzaga': 'Gonzaga',
  'Kennesaw St': 'Kennesaw St.', 'Kennesaw State': 'Kennesaw St.',
  'Miami': 'Miami FL', 'Miami FL': 'Miami FL', 'Missouri': 'Missouri',
  'Purdue': 'Purdue', 'Queens': 'Queens NC', 'Queens NC': 'Queens NC',
  'Michigan': 'Michigan', 'UMBC': 'UMBC', 'Howard': 'Howard', 'Georgia': 'Georgia',
  'Saint Louis': 'Saint Louis', 'SLU': 'Saint Louis',
  'Texas Tech': 'Texas Tech', 'Akron': 'Akron', 'Alabama': 'Alabama', 'Hofstra': 'Hofstra',
  'Tennessee': 'Tennessee', 'Miami OH': 'Miami OH', 'Miami (OH)': 'Miami OH',
  'Virginia': 'Virginia', 'Wright St': 'Wright State', 'Wright State': 'Wright State',
  'Kentucky': 'Kentucky', 'Santa Clara': 'Santa Clara',
  'Iowa St': 'Iowa State', 'Iowa State': 'Iowa State',
  'Tennessee St': 'Tennessee St.', 'Tennessee State': 'Tennessee St.',
  'Florida': 'Florida', 'Lehigh': 'Lehigh', 'Clemson': 'Clemson', 'Iowa': 'Iowa',
  'Vanderbilt': 'Vanderbilt', 'McNeese': 'McNeese', 'McNeese St': 'McNeese',
  'Nebraska': 'Nebraska', 'Troy': 'Troy', 'UNC': 'UNC', 'North Carolina': 'UNC',
  'VCU': 'VCU', 'Illinois': 'Illinois', 'Penn': 'Penn',
  "Saint Mary's": "Saint Mary's", 'Texas A&M': 'Texas A&M',
  'Houston': 'Houston', 'Idaho': 'Idaho',
}

export const FIRST_ROUND = [
  { id: 1,  region: 'East',    top: { seed: 1,  name: 'Duke' },          bottom: { seed: 16, name: 'Siena' } },
  { id: 2,  region: 'East',    top: { seed: 8,  name: 'Ohio State' },    bottom: { seed: 9,  name: 'TCU' } },
  { id: 3,  region: 'East',    top: { seed: 5,  name: "St. John's" },    bottom: { seed: 12, name: 'Northern Iowa' } },
  { id: 4,  region: 'East',    top: { seed: 4,  name: 'Kansas' },        bottom: { seed: 13, name: 'Cal Baptist' } },
  { id: 5,  region: 'East',    top: { seed: 6,  name: 'Louisville' },    bottom: { seed: 11, name: 'South Florida' } },
  { id: 6,  region: 'East',    top: { seed: 3,  name: 'Michigan State'}, bottom: { seed: 14, name: 'N. Dakota St.' } },
  { id: 7,  region: 'East',    top: { seed: 7,  name: 'UCLA' },          bottom: { seed: 10, name: 'UCF' } },
  { id: 8,  region: 'East',    top: { seed: 2,  name: 'UConn' },         bottom: { seed: 15, name: 'Furman' } },
  { id: 9,  region: 'West',    top: { seed: 1,  name: 'Arizona' },       bottom: { seed: 16, name: 'Long Island' } },
  { id: 10, region: 'West',    top: { seed: 8,  name: 'Villanova' },     bottom: { seed: 9,  name: 'Utah State' } },
  { id: 11, region: 'West',    top: { seed: 5,  name: 'Wisconsin' },     bottom: { seed: 12, name: 'High Point' } },
  { id: 12, region: 'West',    top: { seed: 4,  name: 'Arkansas' },      bottom: { seed: 13, name: "Hawai'i" } },
  { id: 13, region: 'West',    top: { seed: 6,  name: 'BYU' },           bottom: { seed: 11, name: 'NC State' } },
  { id: 14, region: 'West',    top: { seed: 3,  name: 'Gonzaga' },       bottom: { seed: 14, name: 'Kennesaw St.' } },
  { id: 15, region: 'West',    top: { seed: 7,  name: 'Miami FL' },      bottom: { seed: 10, name: 'Missouri' } },
  { id: 16, region: 'West',    top: { seed: 2,  name: 'Purdue' },        bottom: { seed: 15, name: 'Queens NC' } },
  { id: 17, region: 'Midwest', top: { seed: 1,  name: 'Michigan' },      bottom: { seed: 16, name: 'UMBC' } },
  { id: 18, region: 'Midwest', top: { seed: 8,  name: 'Georgia' },       bottom: { seed: 9,  name: 'Saint Louis' } },
  { id: 19, region: 'Midwest', top: { seed: 5,  name: 'Texas Tech' },    bottom: { seed: 12, name: 'Akron' } },
  { id: 20, region: 'Midwest', top: { seed: 4,  name: 'Alabama' },       bottom: { seed: 13, name: 'Hofstra' } },
  { id: 21, region: 'Midwest', top: { seed: 6,  name: 'Tennessee' },     bottom: { seed: 11, name: 'Miami OH' } },
  { id: 22, region: 'Midwest', top: { seed: 3,  name: 'Virginia' },      bottom: { seed: 14, name: 'Wright State' } },
  { id: 23, region: 'Midwest', top: { seed: 7,  name: 'Kentucky' },      bottom: { seed: 10, name: 'Santa Clara' } },
  { id: 24, region: 'Midwest', top: { seed: 2,  name: 'Iowa State' },    bottom: { seed: 15, name: 'Tennessee St.' } },
  { id: 25, region: 'South',   top: { seed: 1,  name: 'Florida' },       bottom: { seed: 16, name: 'Lehigh' } },
  { id: 26, region: 'South',   top: { seed: 8,  name: 'Clemson' },       bottom: { seed: 9,  name: 'Iowa' } },
  { id: 27, region: 'South',   top: { seed: 5,  name: 'Vanderbilt' },    bottom: { seed: 12, name: 'McNeese' } },
  { id: 28, region: 'South',   top: { seed: 4,  name: 'Nebraska' },      bottom: { seed: 13, name: 'Troy' } },
  { id: 29, region: 'South',   top: { seed: 6,  name: 'UNC' },           bottom: { seed: 11, name: 'VCU' } },
  { id: 30, region: 'South',   top: { seed: 3,  name: 'Illinois' },      bottom: { seed: 14, name: 'Penn' } },
  { id: 31, region: 'South',   top: { seed: 7,  name: "Saint Mary's" },  bottom: { seed: 10, name: 'Texas A&M' } },
  { id: 32, region: 'South',   top: { seed: 2,  name: 'Houston' },       bottom: { seed: 15, name: 'Idaho' } },
]

export const PLAYERS = [
  {
    id: 'dad',
    name: 'Dad',
    emoji: '🙎🏻‍♂️',
    color: '#00c8ff',
    champion: 'Duke',
    finalFour: ['Duke', 'Arizona', 'Michigan', 'Houston'],
    eliteEight: ['Duke', 'Michigan State', 'Arizona', 'Gonzaga', 'Michigan', 'Virginia', 'Houston', 'Illinois'],
    firstRound: [
      'Duke', 'Ohio State', "St. John's", 'Kansas', 'Louisville', 'Michigan State', 'UCLA', 'UConn',
      'Arizona', 'Villanova', 'Wisconsin', 'Arkansas', 'BYU', 'Gonzaga', 'Missouri', 'Purdue',
      'Michigan', 'Georgia', 'Texas Tech', 'Alabama', 'Tennessee', 'Virginia', 'Kentucky', 'Iowa State',
      'Florida', 'Clemson', 'Vanderbilt', 'Nebraska', 'UNC', 'Illinois', 'Texas A&M', 'Houston',
    ],
  },
  {
    id: 'kannon-kai',
    name: 'Kannon & Kai',
    emoji: '👦🏻👦🏻',
    color: '#ff6b00',
    champion: 'Michigan',
    finalFour: ['Michigan State', 'Arizona', 'Michigan', 'Illinois'],
    eliteEight: ['Duke', 'Michigan State', 'Arizona', 'Gonzaga', 'Michigan', 'Virginia', 'Houston', 'Illinois'],
    firstRound: [
      'Duke', 'TCU', "St. John's", 'Kansas', 'Louisville', 'Michigan State', 'UCLA', 'UConn',
      'Arizona', 'Utah State', 'Wisconsin', 'Arkansas', 'BYU', 'Gonzaga', 'Miami FL', 'Purdue',
      'Michigan', 'Saint Louis', 'Texas Tech', 'Alabama', 'Tennessee', 'Virginia', 'Kentucky', 'Iowa State',
      'Florida', 'Iowa', 'Vanderbilt', 'Nebraska', 'UNC', 'Illinois', "Saint Mary's", 'Houston',
    ],
  },
]

export const SCORING = { firstRound: 1, eliteEight: 2, finalFour: 4, champion: 8 }

// ─── DAY 1 RESULTS (Thursday March 19) ───────────────────────────────────────
// Day 2 (Friday March 20) games still in progress — will update via ESPN API
export const KNOWN_RESULTS = {
  // All 32 first round results
  firstRound: [
    'Duke',          // 1. (1) Duke 71, (16) Siena 65
    'TCU',           // 2. (9) TCU 66, (8) Ohio State 64 UPSET
    "St. John's",    // 3. (5) St. John's def. Northern Iowa
    'Kansas',        // 4. (4) Kansas 68, (13) Cal Baptist 60
    'Louisville',    // 5. (6) Louisville 83, (11) South Florida 79
    'Michigan State',// 6. (3) Michigan State 92, (14) N. Dakota St. 67
    'UCLA',          // 7. (7) UCLA def. UCF
    'UConn',         // 8. (2) UConn def. Furman
    'Arizona',       // 9.  (1) Arizona def. Long Island
    'Utah State',    // 10. (9) Utah State def. (8) Villanova UPSET
    'High Point',    // 11. (12) High Point 83, (5) Wisconsin 82 UPSET
    'Arkansas',      // 12. (4) Arkansas 97, (13) Hawai'i 78
    'Texas',         // 13. (11) Texas 79, (6) BYU 71 UPSET
    'Gonzaga',       // 14. (3) Gonzaga 73, (14) Kennesaw St. 64
    'Missouri',      // 15. (10) Missouri def. (7) Miami FL UPSET
    'Purdue',        // 16. (2) Purdue def. Queens NC
    'Michigan',      // 17. (1) Michigan 101, (16) Howard 80
    'Saint Louis',   // 18. (9) Saint Louis 102, (8) Georgia 77 UPSET
    'Texas Tech',    // 19. (5) Texas Tech def. Akron
    'Alabama',       // 20. (4) Alabama def. Hofstra
    'Tennessee',     // 21. (6) Tennessee 78, (11) Miami OH 56
    'Virginia',      // 22. (3) Virginia def. Wright State
    'Kentucky',      // 23. (7) Kentucky def. Santa Clara (OT)
    'Iowa State',    // 24. (2) Iowa State def. Tennessee St.
    'Florida',       // 25. (1) Florida def. Lehigh
    'Iowa',          // 26. (9) Iowa def. (8) Clemson UPSET
    'Vanderbilt',    // 27. (5) Vanderbilt 78, (12) McNeese 68
    'Nebraska',      // 28. (4) Nebraska 76, (13) Troy 47
    'VCU',           // 29. (11) VCU 82, (6) UNC 78 OT UPSET
    'Illinois',      // 30. (3) Illinois 105, (14) Penn 70
    'Texas A&M',     // 31. (10) Texas A&M 63, (7) Saint Mary's 50 UPSET
    'Houston',       // 32. (2) Houston 78, (15) Idaho 47
  ],
  // Second round / Round of 32 results — Sweet 16 is now set
  secondRound: [
    'Duke',          // Duke 81, TCU 58
    'Michigan State',// Michigan State 77, Louisville 69
    "St. John's",    // St. John's 67, Kansas 65 buzzer beater UPSET
    'UConn',         // UConn 73, UCLA 57
    'Arizona',       // Arizona def. Utah State
    'Arkansas',      // Arkansas 94, High Point 88
    'Texas',         // Texas 74, Gonzaga 68 UPSET
    'Purdue',        // Purdue 79, Missouri 69
    'Michigan',      // Michigan 95, Saint Louis 72
    'Alabama',       // Alabama dominated Texas Tech
    'Tennessee',     // Tennessee 79, Virginia 72
    'Iowa State',    // Iowa State def. Kentucky
    'Iowa',          // Iowa 73, Florida 72 last-second 3 UPSET Florida ELIMINATED
    'Nebraska',      // Nebraska 74, Vanderbilt 72
    'Illinois',      // Illinois 76, VCU 55
    'Houston',       // Houston 88, Texas A&M 57
  ],
  eliteEight: new Array(4).fill(null),
  finalFour: new Array(2).fill(null),
  champion: null,
}
