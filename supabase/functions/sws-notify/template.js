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

  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif"
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#FFFFFF">
<div style="display:none;max-height:0;overflow:hidden">${esc(wait ? "We'll reach out if a spot opens." : 'Everything you need before Week 1.')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td><a href="${SITE}"><img src="${SITE}/og.jpg" width="560" alt="Speed Work Sundays" style="display:block;width:100%;max-width:560px;height:auto;border:0"></a></td></tr>
  <tr><td style="padding:24px 4px 0;${font}">
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:1.5px;color:${wait ? '#B45309' : '#16A34A'}">${wait ? 'WAITLIST' : "YOU'RE IN"}</p>
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:800;color:#05080F">${esc(headline)}</h1>
    <p style="margin:0;font-size:16px;line-height:1.55;color:#33394A">Hi ${esc(first)}, ${esc(intro.charAt(0).toLowerCase() + intro.slice(1))}</p>
  </td></tr>
  <tr><td style="padding:20px 4px 0;${font}">
    ${rows.map(([k, v]) => `<p style="margin:0;padding:10px 0;border-top:1px solid #E6E8EE;font-size:15px;line-height:1.4;color:#05080F"><span style="display:block;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#8E9AB2;margin-bottom:2px">${k}</span>${esc(v)}</p>`).join('')}
  </td></tr>
  <tr><td style="padding:16px 4px 0;${font}">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1px;color:#8E9AB2">WHAT'S NEXT</p>
    ${steps.map((s, i) => `<p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#33394A"><b style="color:#FF3B30">${i + 1}.</b>&nbsp; ${esc(s)}</p>`).join('')}
  </td></tr>
  <tr><td style="padding:16px 4px 4px">
    <a href="${SITE}/#plan" style="display:inline-block;background:#FF3B30;color:#FFFFFF;${font};font-size:16px;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:999px">See the 10-week plan</a>
  </td></tr>
  <tr><td style="padding:20px 4px 24px;${font};font-size:15px;line-height:1.6;color:#33394A">
    Questions? Reply to this email or text me at <a href="sms:${PHONE.replace(/-/g, '')}" style="color:#05080F;white-space:nowrap">${PHONE.replace(/-/g, '&#8209;')}</a>.<br><br>
    Coach Gabe<br><span style="color:#8E9AB2">Speed Work Sundays</span>
  </td></tr>
</table></td></tr></table></body></html>`
  return { subject, text, html }
}
