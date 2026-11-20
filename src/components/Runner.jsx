import React from 'react'

// Stick-figure sprinter facing right. Angles in radians from straight down; positive = forward.
// legs/arms: [[upper, bend], [upper, bend]]. lean tilts the torso forward from vertical.
export const TH = 20, SH = 20, TORSO = 24, UA = 13, FA = 12

export function pose(x, y, { lean, legs, arms }) {
  const sh = { x: x + TORSO * Math.sin(lean), y: y - TORSO * Math.cos(lean) }
  const head = { x: sh.x + 9 * Math.sin(lean), y: sh.y - 9 * Math.cos(lean) }
  const leg = ([t, k]) => {
    const knee = { x: x + TH * Math.sin(t), y: y + TH * Math.cos(t) }
    const s = t - k
    const ankle = { x: knee.x + SH * Math.sin(s), y: knee.y + SH * Math.cos(s) }
    const toe = { x: ankle.x + 7 * Math.cos(s - 0.25), y: ankle.y - 7 * Math.sin(s - 0.25) }
    return { knee, ankle, toe }
  }
  const arm = ([u, f]) => {
    const elbow = { x: sh.x + UA * Math.sin(u), y: sh.y + UA * Math.cos(u) }
    const hand = { x: elbow.x + FA * Math.sin(u + f), y: elbow.y + FA * Math.cos(u + f) }
    return { elbow, hand }
  }
  return { hip: { x, y }, sh, head, legs: legs.map(leg), arms: arms.map(arm) }
}

// Running cycle at phase p (radians). Used by the speed formula lesson.
export function gait(p) {
  const leg = q => {
    const t = 0.15 + 0.62 * Math.sin(q)
    const k = 0.25 + 1.35 * Math.max(0, Math.cos(q - 0.4))
    return [t, k]
  }
  const arm = q => [-0.75 * Math.sin(q), 1.35]
  return { lean: 0.18, legs: [leg(p), leg(p + Math.PI)], arms: [arm(p), arm(p + Math.PI)] }
}

export const lerpPose = (a, b, k) => ({
  lean: a.lean + (b.lean - a.lean) * k,
  legs: a.legs.map((l, i) => l.map((v, j) => v + (b.legs[i][j] - v) * k)),
  arms: a.arms.map((l, i) => l.map((v, j) => v + (b.arms[i][j] - v) * k)),
})

export function Figure({ x, y, p, color = '#FF3B30', ghost = false, w = 5 }) {
  const P = pose(x, y, p)
  const line = (a, b, key, c = color) => <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c} strokeWidth={w} strokeLinecap="round" />
  const back = ghost ? color : '#8E2A24'
  return (
    <g opacity={ghost ? 0.45 : 1}>
      {line(P.hip, P.legs[1].knee, 'bl1', back)}{line(P.legs[1].knee, P.legs[1].ankle, 'bl2', back)}{line(P.legs[1].ankle, P.legs[1].toe, 'bl3', back)}
      {line(P.sh, P.arms[1].elbow, 'ba1', back)}{line(P.arms[1].elbow, P.arms[1].hand, 'ba2', back)}
      {line(P.hip, P.sh, 'torso')}
      <circle cx={P.head.x} cy={P.head.y} r={7.5} fill={color} />
      {line(P.hip, P.legs[0].knee, 'fl1')}{line(P.legs[0].knee, P.legs[0].ankle, 'fl2')}{line(P.legs[0].ankle, P.legs[0].toe, 'fl3')}
      {line(P.sh, P.arms[0].elbow, 'fa1')}{line(P.arms[0].elbow, P.arms[0].hand, 'fa2')}
    </g>
  )
}
