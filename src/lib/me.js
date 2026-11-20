// Which athlete this phone belongs to, set once by the family's private link (#me/<token>).
import { lookupCard, passLesson, logPractice } from './store.js'

const MKEY = 'sws_me_v1'
const PKEY = 'sws_players_v1'

export const getMe = () => { try { return JSON.parse(localStorage.getItem(MKEY)) } catch { return null } }

export async function claimCard(token) {
  const rows = await lookupCard(token)
  if (!rows || !rows.length) throw new Error('That link did not match an athlete. Ask Coach Gabe for a new one.')
  const me = { id: rows[0].id, name: rows[0].display_name, token }
  try {
    localStorage.setItem(MKEY, JSON.stringify(me))
    // Make the athlete the active player in Tools and Speed School.
    const st = JSON.parse(localStorage.getItem(PKEY)) || { list: ['Me'], cur: 'Me' }
    const list = st.list.includes(me.name) ? st.list : [me.name, ...st.list.filter(n => n !== 'Me' || st.list.length > 1)].slice(0, 8)
    localStorage.setItem(PKEY, JSON.stringify({ list, cur: me.name }))
  } catch { /* storage blocked: the link still opened the card */ }
  return me
}

export function unlinkCard() { try { localStorage.removeItem(MKEY) } catch { /* ignore */ } }

// Only the linked athlete's own results go to their card, never a sibling's turn on the same phone.
const forMe = player => { const me = getMe(); return me && player === me.name ? me : null }

export async function syncLesson(player, lesson) {
  const me = forMe(player)
  if (!me) return false
  await passLesson(me.token, lesson)
  return true
}

export async function syncPractice(player, kind, value) {
  const me = forMe(player)
  if (!me) return false
  try { await logPractice(me.token, kind, value); return true } catch (e) { console.warn('Practice not saved to Speed Card:', e.message); return false }
}

export const isMine = player => !!forMe(player)
