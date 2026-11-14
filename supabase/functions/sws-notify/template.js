// Branded HTML for the parent confirmation email. Table layout + inline styles so it renders in Gmail, Apple Mail and Outlook.
const SITE = 'https://www.speedworksundays.com'
const PHONE = '239-898-3084'
const TIME = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' }
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function parentEmail(r) {
  const first = (r.parent_name || '').trim().split(/\s+/)[0] || 'there'
  const kid = (r.athlete_name || 'Your athlete').trim()
  const kidFirst = kid.split(/\s+/)[0]
  const wait = r.status === 'waitlist'
  const subject = wait ? `${kidFirst} is on the Speed Work Sundays waitlist` : `${kidFirst} is in: Speed Work Sundays`
  const headline = wait ? `${kidFirst} is on the waitlist.` : `${kidFirst} is in.`
  const badge = wait ? { text: 'WAITLIST', bg: '#FFD34D', fg: '#1F1300' } : { text: "YOU'RE IN", bg: '#16A34A', fg: '#FFFFFF' }
  const intro = wait
    ? `All 20 spots are full right now. If a spot opens or we add a second session, you'll be the first to know.`
    : `Welcome to Speed Work Sundays, a free 10-week speed clinic for ages 8 to 14. ${kidFirst} gets timed in Week 1, again in Week 5, and again in Week 10, so you'll see real improvement.`
  const pref = r.time_pref ? TIME[r.time_pref] || r.time_pref : 'Not picked'
  const rows = [
    ['Athlete', `${kid}${r.age ? `, age ${r.age}` : ''}`],
    ['Starts', 'January 2027, Sundays'],
    ['Time', wait ? 'Confirmed by email' : `Confirmed by email before Week 1 (you picked ${pref.toLowerCase()})`],
    ['Where', 'Buffaloe Road Athletic Park track'],
    ['Bring', 'Water, sneakers or turf cleats'],
  ]
  const steps = wait
    ? ['Watch this inbox. I reach out the moment a spot opens.', 'Try the at-home sprint timer and drills on the site.']
    : ['I email the final Sunday time and start date before Week 1.', 'Week 1 is test day: 40-yard dash, 5-10-5 shuttle and broad jump.', `${kidFirst}’s times go on a personal Speed Card at speedworksundays.com.`]

  const text = `Hi ${first},\n\n${headline} ${intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nWhat's next:\n${steps.map(s => `- ${s}`).join('\n')}\n\nSee the 10-week plan: ${SITE}/#plan\n\nQuestions? Reply to this email or text me at ${PHONE}.\n\nCoach Gabe\nSpeed Work Sundays`

  const font = "font-family:Arial,Helvetica,sans-serif"
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EEF0F4">
<div style="display:none;max-height:0;overflow:hidden">${esc(headline)} ${esc(wait ? "We'll reach out if a spot opens." : 'Here is everything you need before Week 1.')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F4"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:14px;overflow:hidden">
  <tr><td style="background:#05080F"><a href="${SITE}"><img src="${SITE}/og.jpg" width="560" alt="Speed Work Sundays" style="display:block;width:100%;max-width:560px;height:auto;border:0"></a></td></tr>
  <tr><td style="padding:28px 28px 8px;${font}">
    <span style="display:inline-block;background:${badge.bg};color:${badge.fg};font-size:12px;font-weight:bold;letter-spacing:2px;padding:6px 12px;border-radius:999px">${badge.text}</span>
    <h1 style="margin:16px 0 8px;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-size:30px;line-height:1.15;color:#05080F;text-transform:uppercase">${esc(headline)}</h1>
    <p style="margin:0 0 6px;font-size:16px;line-height:1.55;color:#33394A">Hi ${esc(first)}, ${esc(intro.charAt(0).toLowerCase() + intro.slice(1))}</p>
  </td></tr>
  <tr><td style="padding:16px 28px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #FF3B30;background:#F6F7F9;border-radius:0 10px 10px 0">
      ${rows.map(([k, v], i) => `<tr><td style="padding:${i ? 8 : 14}px 14px ${i === rows.length - 1 ? 14 : 8}px;${font};font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#8E9AB2;width:76px;vertical-align:top">${k}</td><td style="padding:${i ? 8 : 14}px 14px ${i === rows.length - 1 ? 14 : 8}px 0;${font};font-size:15px;line-height:1.4;color:#05080F">${esc(v)}</td></tr>`).join('')}
    </table>
  </td></tr>
  <tr><td style="padding:20px 28px 4px;${font}">
    <p style="margin:0 0 10px;font-size:13px;font-weight:bold;letter-spacing:2px;color:#FF3B30">WHAT'S NEXT</p>
    ${steps.map((s, i) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 10px"><tr><td style="width:30px;vertical-align:top;${font};font-size:16px;font-weight:bold;color:#FF3B30">0${i + 1}</td><td style="${font};font-size:15px;line-height:1.5;color:#33394A">${esc(s)}</td></tr></table>`).join('')}
  </td></tr>
  <tr><td align="center" style="padding:16px 28px 28px">
    <a href="${SITE}/#plan" style="display:inline-block;background:#FF3B30;color:#FFFFFF;${font};font-size:16px;font-weight:bold;text-decoration:none;padding:15px 30px;border-radius:999px">See the 10-week plan</a>
  </td></tr>
  <tr><td style="background:#05080F;padding:20px 28px;${font};font-size:14px;line-height:1.6;color:#C9D2E3">
    <b style="color:#FFFFFF">Coach Gabe Lopez</b><br>
    Questions? Reply to this email or text <a href="sms:${PHONE.replace(/-/g, '')}" style="color:#FFD34D;text-decoration:none;white-space:nowrap">${PHONE.replace(/-/g, '&#8209;')}</a><br>
    <a href="${SITE}" style="color:#FF3B30;text-decoration:none;font-weight:bold">speedworksundays.com</a>
  </td></tr>
</table>
<p style="${font};font-size:12px;color:#8E9AB2;margin:14px 0 0">You're getting this because you signed up at speedworksundays.com.</p>
</td></tr></table></body></html>`
  return { subject, text, html }
}
