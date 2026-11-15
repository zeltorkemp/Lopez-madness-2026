// Speed Work Sundays: emails a branded confirmation to the parent and an alert to the coach
// for each new sign-up. Called by a database trigger (and a 10-minute retry job) with { id }.
// Safe without a shared secret: it only acts on a real sws_rsvps row, and only once
// (notified_at is claimed atomically before sending).
// Sends FROM the Gmail account itself (passes SPF/DKIM/DMARC everywhere, incl. Yahoo/AOL),
// with Reply-To info@speedworksundays.com. Sending as info@ through Gmail fails DKIM at Yahoo.
// { id, resend: 'parent' } re-sends only the parent confirmation for an already-processed row.
import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.14'
import { parentEmail } from './template.js'

const ALERT_TO = 'info@speedworksundays.com'
const SITE = 'https://www.speedworksundays.com'
const TIME: Record<string, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' }
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

function coachEmail(r: any, counts: { confirmed: number; waitlist: number }) {
  const subject = `New sign-up: ${r.athlete_name}${r.age ? ` (${r.age})` : ''}${r.status === 'waitlist' ? ' [waitlist]' : ''}`
  const lines = [
    `Athlete: ${r.athlete_name}${r.age ? `, age ${r.age}` : ''}${r.sport ? `, ${r.sport}` : ''}`,
    `Status: ${r.status}`,
    `Parent: ${r.parent_name || ''}`,
    `Email: ${r.parent_email || 'none given'}`,
    `Cell: ${r.parent_contact || 'none given'}`,
    `Time preference: ${r.time_pref ? TIME[r.time_pref] || r.time_pref : 'not given'}`,
    `Emergency contact: ${r.emergency_contact || ''}`,
    `Speed Board name OK: ${r.photo_ok ? 'yes' : 'no'}  |  Future programs: ${r.updates_ok ? 'yes' : 'no'}`,
    ``,
    `Spots: ${counts.confirmed} of 20 filled, ${counts.waitlist} on the waitlist.`,
    `Coach page: ${SITE}/#coach`,
  ]
  return { subject, text: lines.join('\n') }
}

Deno.serve(async req => {
  let id: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    id = body.id
    const resendParent = body.resend === 'parent'
    if (!id) return new Response('missing id', { status: 400 })

    let r: any
    if (resendParent) {
      const { data } = await db.from('sws_rsvps').select('*').eq('id', id).not('notified_at', 'is', null).limit(1)
      r = data?.[0]
    } else {
      const { data: rows, error } = await db.from('sws_rsvps')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', id).is('notified_at', null).select('*')
      if (error) throw error
      r = rows?.[0]
    }
    if (!r) return new Response('nothing to send', { status: 200 })

    const user = Deno.env.get('GMAIL_USER'), pass = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!user || !pass) {
      await db.from('sws_rsvps').update({ notified_at: null }).eq('id', id)
      return new Response('email not configured', { status: 503 })
    }
    const FROM = `Coach Gabe | Speed Work Sundays <${user}>`
    const mail = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass: pass.replace(/\s+/g, '') } })

    const { data: all } = await db.from('sws_rsvps').select('status')
    const counts = { confirmed: (all || []).filter(x => x.status === 'confirmed').length, waitlist: (all || []).filter(x => x.status === 'waitlist').length }

    const sent: string[] = []
    if (r.parent_email) {
      const m = parentEmail(r)
      await mail.sendMail({ from: FROM, replyTo: ALERT_TO, to: r.parent_email, subject: m.subject, text: m.text, html: m.html })
      sent.push('parent')
    }
    if (!resendParent) {
      const c = coachEmail(r, counts)
      // Straight to the Gmail inbox: routing it through info@ loops back to the sender and Gmail hides it.
      await mail.sendMail({ from: FROM, to: user, replyTo: r.parent_email || undefined, subject: c.subject, text: c.text })
      sent.push('coach')
    }

    await db.from('sws_rsvps').update({ notify_result: `${resendParent ? 'resent' : 'sent'}: ${sent.join(', ')} from ${user}` }).eq('id', id)
    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    const msg = String((e as Error)?.message || e).slice(0, 300)
    if (id) { try { await db.from('sws_rsvps').update({ notify_result: `error: ${msg}` }).eq('id', id) } catch { /* ignore */ } }
    return new Response(msg, { status: 500 })
  }
})
