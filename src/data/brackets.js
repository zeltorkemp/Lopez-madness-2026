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
  firstRound: [
    'Duke',          // 1. Duke def. Siena 71-65
    'TCU',           // 2. TCU def. Ohio State 66-64 🚨 UPSET
    "St. John's",    // 3. TBD (Friday)
    'Kansas',        // 4. TBD (Friday)
    'Louisville',    // 5. Louisville def. South Florida
    'Michigan State',// 6. Michigan State def. N. Dakota St. 92-67
    null,            // 7. TBD (Friday)
    null,            // 8. TBD (Friday)
    null,            // 9. TBD (Friday)
    null,            // 10. TBD (Friday)
    'High Point',    // 11. High Point def. Wisconsin 83-82 🚨 UPSET
    null,            // 12. TBD (Friday)
    'Texas',         // 13. Texas def. BYU 79-71 🚨 UPSET (Texas won First Four vs NC State)
    'Gonzaga',       // 14. Gonzaga def. Kennesaw St. 73-64
    null,            // 15. TBD (Friday)
    null,            // 16. TBD (Friday)
    'Michigan',      // 17. Michigan def. Howard 101-80
    'Saint Louis',   // 18. Saint Louis def. Georgia 102-77 🚨 UPSET
    null,            // 19. TBD (Friday)
    null,            // 20. TBD (Friday)
    null,            // 21. TBD (Friday)
    null,            // 22. TBD (Friday)
    null,            // 23. TBD (Friday)
    null,            // 24. TBD (Friday)
    'Florida',       // 25. Florida def. Lehigh
    null,            // 26. TBD (Friday)
    'Vanderbilt',    // 27. Vanderbilt def. McNeese 78-68
    'Nebraska',      // 28. Nebraska def. Troy (first ever NCAA tourney win!)
    'VCU',           // 29. VCU def. UNC 82-78 OT 🚨 UPSET
    'Illinois',      // 30. Illinois def. Penn 105-70
    'Texas A&M',     // 31. Texas A&M def. Saint Mary's 🚨 UPSET (Dad called it!)
    'Houston',       // 32. Houston def. Idaho 78-47
  ],
  eliteEight: new Array(8).fill(null),
  finalFour: new Array(4).fill(null),
  champion: null,
}
