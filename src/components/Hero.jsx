import React,{useEffect,useState} from 'react'
import {PLAYERS,FIRST_ROUND} from '../data/brackets.js'

function calcScore(player,results){
  const r=results||{firstRound:new Array(32).fill(null)}
  let score=0,correct=0,total=0
  ;(r.firstRound||[]).forEach((res,i)=>{if(res!=null){total++;if(player.firstRound[i]===res){score++;correct++}}})
  ;(r.secondRound||[]).forEach((res,i)=>{if(res!=null){total++;const[a,b]=[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[20,21],[22,23],[24,25],[26,27],[28,29],[30,31]][i];if(player.firstRound[a]===res||player.firstRound[b]===res){score+=2;correct++}}})
  return{score,correct,total,pct:total>0?Math.round((correct/total)*100):0}
}

export default function Hero({bracketResults,setActiveTab}){
  const[vis,setVis]=useState(false)
  useEffect(()=>{setTimeout(()=>setVis(true),80)},[])
  const r=bracketResults||{firstRound:new Array(32).fill(null)}
  const gamesPlayed=(r.firstRound||[]).filter(x=>x!=null).length
  const r2Played=(r.secondRound||[]).filter(x=>x!=null).length
  const upsets=FIRST_ROUND.filter((g,i)=>{const w=r.firstRound[i];if(!w)return false;const ws=w===g.top.name?g.top.seed:g.bottom.seed,ls=w===g.top.name?g.bottom.seed:g.top.seed;return ws>ls})
  const scored=PLAYERS.map(p=>({...p,...calcScore(p,r)})).sort((a,b)=>b.score-a.score)
  const trans=`opacity:${vis?1:0};transform:${vis?'translateY(0)':'translateY(20px)'};transition:all 0.7s ease`

  return(
    <div style={{minHeight:'calc(100vh - 120px)',display:'flex',flexDirection:'column',padding:'20px 20px 80px'}}>
      {/* Title */}
      <div style={{textAlign:'center',paddingTop:'40px',marginBottom:'32px',opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(20px)',transition:'all 0.7s ease'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px',letterSpacing:'4px',color:'var(--blue)',marginBottom:'12px',opacity:0.7}}>// NCAA MARCH MADNESS 2026</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(52px,16vw,110px)',letterSpacing:'4px',lineHeight:0.9,background:'linear-gradient(180deg,#fff 30%,rgba(255,255,255,0.5) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>LOPEZ</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(52px,16vw,110px)',letterSpacing:'4px',lineHeight:0.9,background:'linear-gradient(180deg,var(--blue) 0%,rgba(0,200,255,0.4) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>MADNESS</div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:'13px',fontWeight:600,letterSpacing:'5px',color:'var(--text2)',marginTop:'8px',textTransform:'uppercase'}}>The Family Bracket Battle</div>
      </div>
      {/* Status */}
      <div style={{display:'flex',justifyContent:'center',marginBottom:'24px',opacity:vis?1:0,transition:'all 0.7s ease 0.2s'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'999px',padding:'8px 16px'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:gamesPlayed>0?'var(--green)':'var(--orange)',boxShadow:`0 0 8px ${gamesPlayed>0?'var(--green)':'var(--orange)'}`,animation:'pulse 1.5s infinite'}}/>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px',letterSpacing:'2px',color:gamesPlayed>0?'var(--green)':'var(--orange)'}}>
            {r2Played===16?'SWEET 16 SET':gamesPlayed===32?`R2: ${r2Played}/16 COMPLETE`:gamesPlayed>0?`${gamesPlayed}/32 R1 GAMES COMPLETE`:'AWAITING TIP-OFF'}
          </span>
        </div>
      </div>
      {/* Score cards */}
      <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px',opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(20px)',transition:'all 0.7s ease 0.3s'}}>
        {scored.map((p,rank)=>(
          <div key={p.id} style={{background:rank===0&&p.score>0?`linear-gradient(135deg,${p.color}12,var(--surface))`:'var(--surface)',border:`1px solid ${rank===0&&p.score>0?p.color+'44':'var(--border)'}`,borderRadius:'var(--radius)',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px',position:'relative',overflow:'hidden'}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'40px',lineHeight:1,color:rank===0&&p.score>0?p.color:'var(--muted)',minWidth:'28px',textAlign:'center'}}>{rank+1}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                <span style={{fontSize:'22px'}}>{p.emoji}</span>
                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:'22px',letterSpacing:'2px',color:p.color}}>{p.name}</span>
                {rank===0&&p.score>0&&<span style={{fontSize:'14px'}}>👑</span>}
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:'var(--muted)',letterSpacing:'1px'}}>🏆 {p.champion}</div>
              <div style={{marginTop:'8px',height:'2px',background:'var(--border)',borderRadius:'1px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${p.pct}%`,background:`linear-gradient(90deg,${p.color},${p.color}88)`,transition:'width 1s ease'}}/>
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:'var(--muted)',marginTop:'3px'}}>{p.correct}/{p.total} correct · {p.pct}%</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'52px',lineHeight:1,color:p.score>0?p.color:'var(--muted)'}}>{p.score}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',letterSpacing:'1px',color:'var(--muted)'}}>PTS</div>
            </div>
          </div>
        ))}
      </div>
      {/* Upsets */}
      {upsets.length>0&&(
        <div style={{marginBottom:'24px',opacity:vis?1:0,transition:'opacity 0.7s ease 0.5s'}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',letterSpacing:'3px',color:'var(--orange)',marginBottom:'10px'}}>🚨 UPSETS ({upsets.length})</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            {upsets.map((g,i)=>{
              const w=r.firstRound[g.id-1],ws=w===g.top.name?g.top.seed:g.bottom.seed,l=w===g.top.name?g.bottom.name:g.top.name,ls=w===g.top.name?g.bottom.seed:g.top.seed
              const dadCalled=PLAYERS[0].firstRound[g.id-1]===w,kidsCalled=PLAYERS[1].firstRound[g.id-1]===w
              return(<div key={i} style={{background:'rgba(255,107,0,0.08)',border:'1px solid rgba(255,107,0,0.25)',borderRadius:'8px',padding:'8px 12px'}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'14px',color:'var(--orange)',letterSpacing:'1px'}}>({ws}) {w} def. ({ls}) {l}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:'var(--muted)',marginTop:'2px'}}>
                  {dadCalled&&`${PLAYERS[0].emoji} called it! `}{kidsCalled&&`${PLAYERS[1].emoji} called it!`}{!dadCalled&&!kidsCalled&&'😬 nobody picked this'}
                </div>
              </div>)
            })}
          </div>
        </div>
      )}
      {/* Nav buttons */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',opacity:vis?1:0,transition:'all 0.7s ease 0.5s'}}>
        {[{label:'Standings',icon:'🏆',tab:'standings',color:'var(--blue)'},{label:'Bracket',icon:'📋',tab:'bracket',color:'var(--orange)'},{label:'Stats',icon:'📊',tab:'stats',color:'var(--green)'},{label:'Champion',icon:'🎯',tab:'standings',color:'var(--purple)'}].map(btn=>(
          <button key={btn.label} onClick={()=>setActiveTab(btn.tab)} style={{background:'var(--surface)',border:`1px solid ${btn.color}33`,borderRadius:'var(--radius)',padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=btn.color} onMouseLeave={e=>e.currentTarget.style.borderColor=btn.color+'33'}>
            <span style={{fontSize:'20px'}}>{btn.icon}</span>
            <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:'14px',color:btn.color,letterSpacing:'0.5px'}}>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
