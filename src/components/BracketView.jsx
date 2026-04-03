import React,{useState} from 'react'
import {PLAYERS,FIRST_ROUND,REGION_COLORS} from '../data/brackets.js'
import {SectionHeader} from './Leaderboard.jsx'

const REGIONS=['East','West','Midwest','South']
const DEFAULT={firstRound:new Array(32).fill(null),liveScores:{}}

export default function BracketView({bracketResults}){
  const[region,setRegion]=useState('East')
  const r=bracketResults||DEFAULT
  const games=FIRST_ROUND.filter(g=>g.region===region)
  const color=REGION_COLORS[region]
  const played=games.filter(g=>r.firstRound[g.id-1]!=null).length

  return(
    <div style={{padding:'28px 20px 100px',maxWidth:'640px',margin:'0 auto'}}>
      <SectionHeader label="PICKS" title="Bracket" subtitle="Side by side pick comparison"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'20px'}}>
        {REGIONS.map(reg=>(
          <button key={reg} onClick={()=>setRegion(reg)} style={{background:region===reg?REGION_COLORS[reg]+'20':'var(--surface)',border:`1px solid ${region===reg?REGION_COLORS[reg]:'var(--border)'}`,borderRadius:'8px',padding:'10px 4px',cursor:'pointer',fontFamily:"'Bebas Neue',cursive",fontSize:'15px',letterSpacing:'1px',color:region===reg?REGION_COLORS[reg]:'var(--muted)',transition:'all 0.2s'}}>{reg}</button>
        ))}
      </div>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'8px',padding:'12px 16px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:color,letterSpacing:'2px'}}>{region.toUpperCase()} REGION</span>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--muted)',letterSpacing:'1px'}}>{played}/{games.length} played</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 44px 1fr',gap:'6px',marginBottom:'8px',padding:'0 2px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:PLAYERS[0].color,letterSpacing:'2px'}}>{PLAYERS[0].emoji} DAD</div>
        <div/>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:PLAYERS[1].color,letterSpacing:'2px',textAlign:'right'}}>BOYS {PLAYERS[1].emoji}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'5px',marginBottom:'24px'}}>
        {games.map((game,idx)=>{
          const result=r.firstRound[game.id-1]
          const live=(r.liveScores||{})[game.id]
          return <GameRow key={game.id} game={game} result={result} live={live} dadPick={PLAYERS[0].firstRound[game.id-1]} kidsPick={PLAYERS[1].firstRound[game.id-1]} color={color} idx={idx}/>
        })}
      </div>
      {/* Final Four pick */}
      <div style={{background:'var(--surface)',border:`1px solid ${color}33`,borderRadius:'var(--radius)',padding:'16px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:color,letterSpacing:'2px',marginBottom:'12px'}}>🏆 FINAL FOUR PICK</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'10px',alignItems:'center'}}>
          {PLAYERS.map((p,i)=>{
            const ff=p.finalFour[REGIONS.indexOf(region)]
            return(<React.Fragment key={p.id}>
              <div style={{background:`${p.color}0a`,border:`1px solid ${p.color}22`,borderRadius:'8px',padding:'12px',textAlign:i===0?'left':'right'}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:p.color,letterSpacing:'1px',marginBottom:'4px'}}>{p.name.toUpperCase()}</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'18px',color:'#fff',letterSpacing:'1px'}}>{ff||'—'}</div>
              </div>
              {i===0&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'18px',color:'var(--muted)',textAlign:'center'}}>VS</div>}
            </React.Fragment>)
          })}
        </div>
      </div>
    </div>
  )
}

function GameRow({game,result,live,dadPick,kidsPick,color,idx}){
  const agree=dadPick===kidsPick
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 44px 1fr',gap:'5px',animation:`fadeUp 0.3s ease ${idx*0.03}s both`}}>
      <PickCell pick={dadPick} game={game} result={result} isCorrect={result&&dadPick===result} color={PLAYERS[0].color} align="left"/>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'3px',padding:'4px 2px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:color,letterSpacing:'0.5px'}}>G{game.id}</div>
        {agree&&<div style={{fontSize:'9px'}}>🤝</div>}
        {live?.inProgress&&<div style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 5px var(--green)',animation:'pulse 1s infinite'}}/>}
        {result&&!live?.inProgress&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:'var(--green)'}}>F</div>}
      </div>
      <PickCell pick={kidsPick} game={game} result={result} isCorrect={result&&kidsPick===result} color={PLAYERS[1].color} align="right"/>
    </div>
  )
}

function PickCell({pick,game,result,isCorrect,color,align}){
  const ps=pick===game.top.name?game.top.seed:game.bottom.seed
  const os=pick===game.top.name?game.bottom.seed:game.top.seed
  const isUpset=ps>os
  const bg=result?(isCorrect?'rgba(0,255,157,0.07)':'rgba(255,45,122,0.05)'):(`${color}07`)
  const border=result?(isCorrect?'rgba(0,255,157,0.25)':'rgba(255,45,122,0.15)'):(`${color}1a`)
  return(
    <div style={{background:bg,border:`1px solid ${border}`,borderRadius:'6px',padding:'8px 10px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'5px',flexDirection:align==='right'?'row-reverse':'row'}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:'13px',color:result?(isCorrect?'var(--green)':'var(--pink)'):'var(--text)',textAlign:align,letterSpacing:'0.3px',lineHeight:1.2}}>{pick}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:'var(--muted)',textAlign:align,marginTop:'2px'}}>
            {ps} seed{isUpset&&<span style={{color,marginLeft:'3px'}}>↑</span>}
          </div>
        </div>
        {result&&<span style={{fontSize:'11px',flexShrink:0}}>{isCorrect?'✅':'❌'}</span>}
      </div>
    </div>
  )
}
