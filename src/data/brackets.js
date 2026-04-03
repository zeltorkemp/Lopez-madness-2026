export const REGIONS = ['East','West','Midwest','South']
export const REGION_COLORS = {East:'#00c8ff',West:'#ff6b00',Midwest:'#00ff9d',South:'#b966ff'}

export const FIRST_ROUND = [
  {id:1,region:'East',top:{seed:1,name:'Duke'},bottom:{seed:16,name:'Siena'}},
  {id:2,region:'East',top:{seed:8,name:'Ohio State'},bottom:{seed:9,name:'TCU'}},
  {id:3,region:'East',top:{seed:5,name:"St. John's"},bottom:{seed:12,name:'Northern Iowa'}},
  {id:4,region:'East',top:{seed:4,name:'Kansas'},bottom:{seed:13,name:'Cal Baptist'}},
  {id:5,region:'East',top:{seed:6,name:'Louisville'},bottom:{seed:11,name:'South Florida'}},
  {id:6,region:'East',top:{seed:3,name:'Michigan State'},bottom:{seed:14,name:'N. Dakota St.'}},
  {id:7,region:'East',top:{seed:7,name:'UCLA'},bottom:{seed:10,name:'UCF'}},
  {id:8,region:'East',top:{seed:2,name:'UConn'},bottom:{seed:15,name:'Furman'}},
  {id:9,region:'West',top:{seed:1,name:'Arizona'},bottom:{seed:16,name:'Long Island'}},
  {id:10,region:'West',top:{seed:8,name:'Villanova'},bottom:{seed:9,name:'Utah State'}},
  {id:11,region:'West',top:{seed:5,name:'Wisconsin'},bottom:{seed:12,name:'High Point'}},
  {id:12,region:'West',top:{seed:4,name:'Arkansas'},bottom:{seed:13,name:"Hawai'i"}},
  {id:13,region:'West',top:{seed:6,name:'BYU'},bottom:{seed:11,name:'NC State'}},
  {id:14,region:'West',top:{seed:3,name:'Gonzaga'},bottom:{seed:14,name:'Kennesaw St.'}},
  {id:15,region:'West',top:{seed:7,name:'Miami FL'},bottom:{seed:10,name:'Missouri'}},
  {id:16,region:'West',top:{seed:2,name:'Purdue'},bottom:{seed:15,name:'Queens NC'}},
  {id:17,region:'Midwest',top:{seed:1,name:'Michigan'},bottom:{seed:16,name:'UMBC'}},
  {id:18,region:'Midwest',top:{seed:8,name:'Georgia'},bottom:{seed:9,name:'Saint Louis'}},
  {id:19,region:'Midwest',top:{seed:5,name:'Texas Tech'},bottom:{seed:12,name:'Akron'}},
  {id:20,region:'Midwest',top:{seed:4,name:'Alabama'},bottom:{seed:13,name:'Hofstra'}},
  {id:21,region:'Midwest',top:{seed:6,name:'Tennessee'},bottom:{seed:11,name:'Miami OH'}},
  {id:22,region:'Midwest',top:{seed:3,name:'Virginia'},bottom:{seed:14,name:'Wright State'}},
  {id:23,region:'Midwest',top:{seed:7,name:'Kentucky'},bottom:{seed:10,name:'Santa Clara'}},
  {id:24,region:'Midwest',top:{seed:2,name:'Iowa State'},bottom:{seed:15,name:'Tennessee St.'}},
  {id:25,region:'South',top:{seed:1,name:'Florida'},bottom:{seed:16,name:'Lehigh'}},
  {id:26,region:'South',top:{seed:8,name:'Clemson'},bottom:{seed:9,name:'Iowa'}},
  {id:27,region:'South',top:{seed:5,name:'Vanderbilt'},bottom:{seed:12,name:'McNeese'}},
  {id:28,region:'South',top:{seed:4,name:'Nebraska'},bottom:{seed:13,name:'Troy'}},
  {id:29,region:'South',top:{seed:6,name:'UNC'},bottom:{seed:11,name:'VCU'}},
  {id:30,region:'South',top:{seed:3,name:'Illinois'},bottom:{seed:14,name:'Penn'}},
  {id:31,region:'South',top:{seed:7,name:"Saint Mary's"},bottom:{seed:10,name:'Texas A&M'}},
  {id:32,region:'South',top:{seed:2,name:'Houston'},bottom:{seed:15,name:'Idaho'}},
]

export const PLAYERS = [
  {
    id:'dad',name:'Dad',emoji:'🙎🏻‍♂️',color:'#00c8ff',champion:'Duke',
    finalFour:['Duke','Arizona','Michigan','Houston'],
    eliteEight:['Duke','Michigan State','Arizona','Gonzaga','Michigan','Virginia','Houston','Illinois'],
    firstRound:['Duke','Ohio State',"St. John's",'Kansas','Louisville','Michigan State','UCLA','UConn','Arizona','Villanova','Wisconsin','Arkansas','BYU','Gonzaga','Missouri','Purdue','Michigan','Georgia','Texas Tech','Alabama','Tennessee','Virginia','Kentucky','Iowa State','Florida','Clemson','Vanderbilt','Nebraska','UNC','Illinois','Texas A&M','Houston'],
  },
  {
    id:'kannon-kai',name:'Kannon & Kai',emoji:'👦🏻👦🏻',color:'#ff6b00',champion:'Michigan',
    finalFour:['Michigan State','Arizona','Michigan','Illinois'],
    eliteEight:['Duke','Michigan State','Arizona','Gonzaga','Michigan','Virginia','Houston','Illinois'],
    firstRound:['Duke','TCU',"St. John's",'Kansas','Louisville','Michigan State','UCLA','UConn','Arizona','Utah State','Wisconsin','Arkansas','BYU','Gonzaga','Miami FL','Purdue','Michigan','Saint Louis','Texas Tech','Alabama','Tennessee','Virginia','Kentucky','Iowa State','Florida','Iowa','Vanderbilt','Nebraska','UNC','Illinois',"Saint Mary's",'Houston'],
  },
]

export const SCORING = {firstRound:1,secondRound:2,sweet16:3,eliteEight:4,finalFour:5,champion:8}

// Hardcoded results as fallback (R1 + R2 complete)
export const KNOWN_RESULTS = {
  firstRound:['Duke','TCU',"St. John's",'Kansas','Louisville','Michigan State','UCLA','UConn','Arizona','Utah State','High Point','Arkansas','Texas','Gonzaga','Missouri','Purdue','Michigan','Saint Louis','Texas Tech','Alabama','Tennessee','Virginia','Kentucky','Iowa State','Florida','Iowa','Vanderbilt','Nebraska','VCU','Illinois','Texas A&M','Houston'],
  secondRound:['Duke','Michigan State',"St. John's",'UConn','Arizona','Arkansas','Texas','Purdue','Michigan','Alabama','Tennessee','Iowa State','Iowa','Nebraska','Illinois','Houston'],
}
