import React from 'react'
import {PLAYERS,SCORING,FIRST_ROUND,KNOWN_RESULTS} from '../data/brackets.js'

const DEFAULT={firstRound:new Array(32).fill(null),secondRound:new Array(16).fill(null),sweet16:new Array(8).fill(null),eliteEight:new Array(4).fill(null),finalFour:new Array(2).fill(null),champion:null,liveScores:{}}

const R2_MATCHUPS=[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[20,21],[22,23],[24,25],[26,27],[28,29],[30,31]]
const S16_MATCHUPS=[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15]]

function calcScore(player,results){
  const r=results||DEFAULT
  let score=0,correct=0,total=0
  // R1
  ;(r.firstRound||[]).forEach((res,i)=>{if(res!=null){total++;if(player.firstRound[i]===res){score+=1;correct++}}})
  // R2
  ;(r.secondRound||[]).forEach((res,i)=>{if(res!=null){total++;const[a,b]=R2_MATCHUPS[i];if(player.firstRound[a]===res||player.firstRound[b]===res){score+=2;correct++}}})
  // S16
  ;(r.sweet16||[]).forEach((res,i)=>{if(res!=null){total++;const[a,b]=S16_MATCHUPS[i];const r2a=(r.secondRound||[])[a],r2b=(r.secondRound||[])[b];if(r2a===res&&(player.firstRound.some(p=>p===r2a))||r2b===res&&(player.firstRound.some(p=>p===r2b))){score+=3;correct++}}})
  // E8/F4/Champion
  ;(r.eliteEight||[]).forEach((res)=>{if(res!=null){total++;if((player.eliteEight||[]).includes(res)){score+=4;correct++}}})
  ;(r.finalFour||[]).forEach((res)=>{if(res!=null){total++;if((player.finalFour||[]).includes(res)){score+=5;correct++}}})
  if(r.champion){total++;if(player.champion===r.champion){score+=8;correct++}}
  return{score,correct,total,pct:total>0?Math.round((correct/total)*100):0}
}

export function SectionHeader({label,title,subtitle}){
  return(
    <div style={{marginBottom:'28px'}}>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',letterSpacing:'4px',color:'var(--blue)',marginBottom:'6px',opacity:0.7}}>// {label}</div>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(32px,8vw,48px)',letterSpacing:'3px',color:'#fff',lineHeight:1}}>{title}</div>
      {subtitle&&<div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:'13px',color:'var(--text2)',marginTop:'6px'}}>{subtitle}</div>}
      <div style={{height:'2px',width:'48px',background:'linear-gradient(90deg,var(--blue),transparent)',marginTop:'10px'}}/>
    </div>
  )
}

export default function Leaderboard({bracketResults}){
  const r=bracketResults||DEFAULT
  const scored=PLAYERS.map(p=>({...p,...calcScore(p,r)})).sort((a,b)=>b.score-a.score)
  const r1=( r.firstRound||[]).filter(x=>x!=null).length
  const r2=(r.secondRound||[]).filter(x=>x!=null).length
  const s16=(r.sweet16||[]).filter(x=>x!=null).length
  const status=s16>0?'SWEET 16 IN PROGRESS':r2===16?'SWEET 16 SET':r1===32?'ROUND OF 32 COMPLETE':'ROUND OF 64 IN PROGRESS'

  return(
    <div style={{padding:'28px 20px 100px',maxWidth:'640px',margin:'0 auto'}}>
      <SectionHeader label="STANDINGS" title="Leaderboard" subtitle={`R1: ${r1}/32 · R2: ${r2}/16 · S16: ${s16}/8`}/>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'8px',padding:'12px 16px'}}>
        <div style={{width:'7px',height:'7px',borderRadius:'50%',background:r2===16?'var(--green)':'var(--orange)',boxShadow:`0 0 8px ${r2===16?'var(--green)':'var(--orange)'}`,animation:'pulse 1.5s infinite',flexShrink:0}}/>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px',letterSpacing:'2px',color:r2===16?'var(--green)':'var(--orange)'}}>{status}</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'28px'}}>
        {scored.map((p,rank)=><PlayerCard key={p.id} player={p} rank={rank}/>)}
      </div>
      {/* Champion picks */}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'20px',marginBottom:'20px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--purple)',letterSpacing:'3px',marginBottom:'16px'}}>🎯 CHAMPION PICKS</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'12px',alignItems:'center'}}>
          {PLAYERS.map((p,i)=>{
            const allR2=(r.secondRound||[]).filter(x=>x)
            const stillAlive=allR2.length===0||allR2.includes(p.champion)
            return(<React.Fragment key={p.id}>
              <div style={{background:`${p.color}0a`,border:`1px solid ${p.color}22`,borderRadius:'10px',padding:'14px 12px',textAlign:'center'}}>
                <div style={{fontSize:'22px',marginBottom:'6px'}}>{p.emoji}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:p.color,letterSpacing:'1px',marginBottom:'4px'}}>{p.name.toUpperCase()}</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'20px',letterSpacing:'1.5px',color:stillAlive?'#fff':'var(--muted)',textDecoration:!stillAlive?'line-through':'none'}}>{p.champion}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:stillAlive?'var(--green)':'var(--pink)',marginTop:'4px',letterSpacing:'1px'}}>{stillAlive?'STILL ALIVE ✅':'ELIMINATED ❌'}</div>
              </div>
              {i===0&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'22px',color:'var(--muted)',textAlign:'center'}}>VS</div>}
            </React.Fragment>)
          })}
        </div>
      </div>
      {/* Scoring */}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px 20px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',letterSpacing:'3px',color:'var(--muted)',marginBottom:'12px'}}>SCORING</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'6px'}}>
          {[['R64','1'],['R32','2'],['S16','3'],['E8','4'],['🏆','8']].map(([r,p])=>(
            <div key={r} style={{textAlign:'center',background:'var(--bg2)',borderRadius:'8px',padding:'8px 2px'}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'18px',color:'var(--blue)',lineHeight:1}}>{p}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:'var(--muted)',marginTop:'2px'}}>{r}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayerCard({player,rank}){
  const isLeading=rank===0&&player.score>0
  return(
    <div style={{background:isLeading?`linear-gradient(135deg,${player.color}0e,var(--surface))`:'var(--surface)',border:`1px solid ${isLeading?player.color+'44':'var(--border)'}`,borderRadius:'var(--radius)',padding:'18px 20px',position:'relative',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'44px',color:isLeading?player.color:'var(--muted)',lineHeight:1,minWidth:'32px'}}>{rank+1}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
            <span style={{fontSize:'22px'}}>{player.emoji}</span>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:'24px',letterSpacing:'2px',color:player.color}}>{player.name}</span>
            {isLeading&&<span>👑</span>}
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:'var(--muted)',letterSpacing:'1px'}}>🏆 {player.champion}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'52px',lineHeight:1,color:player.score>0?player.color:'var(--muted)'}}>{player.score}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:'var(--muted)',letterSpacing:'1px'}}>POINTS</div>
        </div>
      </div>
      <div style={{marginTop:'14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:'var(--muted)',letterSpacing:'1px'}}>{player.correct} CORRECT / {player.total} PLAYED</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:player.pct>60?'var(--green)':player.pct>40?'var(--yellow)':'var(--text2)',letterSpacing:'1px'}}>{player.pct}%</span>
        </div>
        <div style={{height:'3px',background:'var(--border)',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.min(player.score*2,100)}%`,background:`linear-gradient(90deg,${player.color},${player.color}88)`,transition:'width 1.2s ease',borderRadius:'2px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',animation:'shimmer 2s infinite'}}/>
          </div>
        </div>
      </div>
    </div>
  )
}
