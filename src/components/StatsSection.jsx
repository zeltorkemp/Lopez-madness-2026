import React from 'react'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,RadarChart,PolarGrid,PolarAngleAxis,Radar,Legend} from 'recharts'
import {PLAYERS,FIRST_ROUND,REGION_COLORS} from '../data/brackets.js'
import {SectionHeader} from './Leaderboard.jsx'

const REGIONS=['East','West','Midwest','South']
const DEFAULT={firstRound:new Array(32).fill(null),secondRound:new Array(16).fill(null)}
const R2=[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[20,21],[22,23],[24,25],[26,27],[28,29],[30,31]]

function getUpsets(player){return FIRST_ROUND.filter((g,i)=>{const p=player.firstRound[i];if(!p)return false;const ps=p===g.top.name?g.top.seed:g.bottom.seed,os=p===g.top.name?g.bottom.seed:g.top.seed;return ps>os}).length}
function getAgree(){return FIRST_ROUND.filter((_,i)=>PLAYERS[0].firstRound[i]===PLAYERS[1].firstRound[i]).length}

const TT=({active,payload,label})=>{
  if(!active||!payload?.length)return null
  return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 14px'}}>
    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--text2)',marginBottom:'6px',letterSpacing:'1px'}}>{label}</div>
    {payload.map(e=><div key={e.name} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px',color:e.color,letterSpacing:'1px'}}>{e.name}: {e.value}%</div>)}
  </div>)
}

export default function StatsSection({bracketResults}){
  const r=bracketResults||DEFAULT
  const r1Played=(r.firstRound||[]).filter(x=>x!=null).length
  const r2Played=(r.secondRound||[]).filter(x=>x!=null).length

  const regionData=REGIONS.map(region=>{
    const games=FIRST_ROUND.filter(g=>g.region===region)
    const played=games.filter(g=>r.firstRound[g.id-1]!=null).length
    const obj={region:region.slice(0,4)}
    PLAYERS.forEach(p=>{
      const correct=games.filter(g=>r.firstRound[g.id-1]!=null&&p.firstRound[g.id-1]===r.firstRound[g.id-1]).length
      obj[p.name]=played>0?Math.round((correct/played)*100):0
    })
    return obj
  })

  const radarData=REGIONS.map(region=>{
    const obj={region:region.slice(0,4)}
    PLAYERS.forEach(p=>{obj[p.name]=FIRST_ROUND.filter(g=>{if(g.region!==region)return false;const pick=p.firstRound[g.id-1];if(!pick)return false;const ps=pick===g.top.name?g.top.seed:g.bottom.seed,os=pick===g.top.name?g.bottom.seed:g.top.seed;return ps>os}).length})
    return obj
  })

  const h2h=FIRST_ROUND.map((g,i)=>{
    const res=r.firstRound[i];if(!res)return null
    return{dadRight:PLAYERS[0].firstRound[i]===res,kidsRight:PLAYERS[1].firstRound[i]===res}
  }).filter(Boolean)
  const dadOnly=h2h.filter(x=>x.dadRight&&!x.kidsRight).length
  const kidsOnly=h2h.filter(x=>!x.dadRight&&x.kidsRight).length
  const both=h2h.filter(x=>x.dadRight&&x.kidsRight).length
  const neither=h2h.filter(x=>!x.dadRight&&!x.kidsRight).length

  return(
    <div style={{padding:'28px 20px 100px',maxWidth:'640px',margin:'0 auto'}}>
      <SectionHeader label="ANALYTICS" title="Stats" subtitle="Deep dive into the bracket battle"/>
      {/* Quick stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
        {[
          {label:'Games Agree',value:getAgree(),suffix:'/32',color:'var(--green)',icon:'🤝'},
          {label:'Scored',value:r1Played+r2Played,suffix:` games`,color:'var(--blue)',icon:'📊'},
          {label:"Dad's Upsets",value:getUpsets(PLAYERS[0]),suffix:' picks',color:PLAYERS[0].color,icon:'⚡'},
          {label:"Boys' Upsets",value:getUpsets(PLAYERS[1]),suffix:' picks',color:PLAYERS[1].color,icon:'🔥'},
        ].map(s=>(
          <div key={s.label} style={{background:'var(--surface)',border:`1px solid ${s.color}22`,borderRadius:'var(--radius)',padding:'16px'}}>
            <div style={{fontSize:'18px',marginBottom:'6px'}}>{s.icon}</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'32px',color:s.color,lineHeight:1}}>{s.value}<span style={{fontSize:'14px',color:'var(--muted)'}}>{s.suffix}</span></div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:'var(--muted)',marginTop:'4px',letterSpacing:'1px',textTransform:'uppercase'}}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Head to head */}
      {h2h.length>0&&(
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'20px',marginBottom:'20px'}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--blue)',letterSpacing:'3px',marginBottom:'16px'}}>// HEAD TO HEAD ({h2h.length} games)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px'}}>
            {[{label:`${PLAYERS[0].emoji} Only`,value:dadOnly,color:PLAYERS[0].color},{label:`${PLAYERS[1].emoji} Only`,value:kidsOnly,color:PLAYERS[1].color},{label:'Both ✅',value:both,color:'var(--green)'},{label:'Both ❌',value:neither,color:'var(--muted)'}].map(s=>(
              <div key={s.label} style={{textAlign:'center',background:'var(--bg2)',borderRadius:'8px',padding:'12px 6px'}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'28px',color:s.color,lineHeight:1}}>{s.value}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'7px',color:'var(--muted)',marginTop:'4px',letterSpacing:'0.5px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Accuracy by region */}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'20px',marginBottom:'20px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--blue)',letterSpacing:'3px',marginBottom:'16px'}}>// ACCURACY BY REGION</div>
        {r1Played>0?(
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={regionData} barCategoryGap="25%">
              <XAxis dataKey="region" tick={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,fill:'var(--muted)'}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip content={<TT/>} cursor={{fill:'rgba(255,255,255,0.02)'}}/>
              {PLAYERS.map(p=><Bar key={p.id} dataKey={p.name} fill={p.color} radius={[3,3,0,0]}/>)}
            </BarChart>
          </ResponsiveContainer>
        ):(
          <div style={{height:'140px',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px'}}>
            <div style={{fontSize:'28px',opacity:0.3}}>📊</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--muted)',letterSpacing:'2px'}}>AWAITING RESULTS</div>
          </div>
        )}
      </div>
      {/* Upset radar */}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'20px'}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'var(--orange)',letterSpacing:'3px',marginBottom:'16px'}}>// UPSET PICKS BY REGION</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)"/>
            <PolarAngleAxis dataKey="region" tick={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,fill:'var(--text2)'}}/>
            {PLAYERS.map(p=><Radar key={p.id} name={p.name} dataKey={p.name} stroke={p.color} fill={p.color} fillOpacity={0.15} strokeWidth={2}/>)}
            <Legend wrapperStyle={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px'}}/>
            <Tooltip content={<TT/>}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
