// Guard: opens the built site in headless Chrome at phone sizes and fails on the
// problems the Nov 2026 UX audit found, so they cannot ship again:
//   1. a page wider than the screen (pushes the tab bar off screen, cuts text off)
//   2. the first phone screen with no visible sign-up button
//   3. sign-up form rules (parent cell required, no pre-checked email box, waiver
//      not in a scroll box, session length above the form)
//   4. the sign-up confirmation landing off screen, and siblings losing parent info
//   5. white text on a red button below WCAG AA contrast (4.5:1)
//
// It builds in demo mode (no database) and refuses to run against a live build,
// so it can never create a real sign-up.
//
// Usage: npm test            (needs Google Chrome; set CHROME_PATH if it is not found)
import { existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build, preview } from 'vite'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = fileURLToPath(new URL('../.check-dist', import.meta.url))
const WIDTHS = [360, 375, 390]
const ROUTES = ['home', 'join', 'board', 'tools', 'learn', 'plan', 'coach']
const FIRST_SCREENS = [[360, 640], [375, 660], [375, 812], [390, 664]]
const FONTS = [{ family: 'Archivo Black', weight: 400 }, { family: 'Chakra Petch', weight: 700 }, { family: 'Inter', weight: 400 }]

const failures = []
const fail = msg => { failures.push(msg); console.error(`  FAIL ${msg}`) }
const ok = msg => console.log(`  ok   ${msg}`)
const expect = (cond, msg) => (cond ? ok(msg) : fail(msg))

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)
  return candidates.find(p => existsSync(p))
}

/* ---------- functions that run inside the page ---------- */
const center = e => e.scrollIntoView({ block: 'center', inline: 'nearest' })
const pageState = async fonts => {
  // Ask for each font so one that this tab has not used yet still loads (or shows as missing).
  const loaded = await Promise.all(fonts.map(f => document.fonts.load(`${f.weight} 16px "${f.family}"`).catch(() => [])))
  return { demo: !!document.querySelector('.demo-banner'), missing: fonts.filter((f, i) => loaded[i].length === 0).map(f => f.family) }
}
const pageWidth = () => document.documentElement.scrollWidth
const sheetWidths = () => { const e = document.querySelector('.sheet'); return { sw: e.scrollWidth, cw: e.clientWidth, doc: document.documentElement.scrollWidth } }
const firstScreen = () => {
  const r = e => e.getBoundingClientRect()
  const cta = document.querySelector('main a.btn-red[href="#join"]')
  return { top: r(cta).top, bottom: r(cta).bottom, headerBottom: r(document.querySelector('header.topbar')).bottom, tabTop: r(document.querySelector('nav.tabbar')).top }
}
const formRules = () => {
  const form = document.querySelector('form')
  const updates = [...form.querySelectorAll('label.check')].find(l => l.textContent.toLowerCase().includes('extra sessions'))
  const waiver = form.querySelector('.waiver')
  const lengthAbove = [...document.querySelectorAll('main *')].some(e => e.children.length === 0 && e.textContent.toLowerCase().includes('60 min') && (form.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING))
  return {
    cellRequired: form.querySelector('#pp').required,
    updatesChecked: updates.querySelector('input').checked,
    waiverScrolls: waiver.scrollHeight > waiver.clientHeight + 1,
    lengthAbove,
    ecRequired: !!form.querySelector('#ec')?.required,
  }
}
const confirmation = () => {
  const r = e => e.getBoundingClientRect()
  const el = document.querySelector('.success')
  return { top: r(el).top, bottom: r(el).bottom, headerBottom: r(document.querySelector('header.topbar')).bottom, tabTop: r(document.querySelector('nav.tabbar')).top, focused: el.contains(document.activeElement), text: el.innerText }
}
const formValues = () => ({
  athlete: document.querySelector('#an').value, parent: document.querySelector('#pn').value, email: document.querySelector('#pe').value, cell: document.querySelector('#pp').value,
  waiver: document.querySelector('label.check input[required]').checked, sig: document.querySelector('#sig').value,
})
const redButtons = route => {
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const lum = s => { const [r, g, b] = s.match(/[\d.]+/g).map(Number); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) }
  return [...document.querySelectorAll('.btn-red')].map(e => {
    const cs = getComputedStyle(e); const a = lum(cs.color), b = lum(cs.backgroundColor)
    return { route, text: e.innerText.trim().slice(0, 30), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }
  })
}

// Demo mode: blank the database settings so nothing in this run can reach it.
process.env.VITE_SUPABASE_URL = ''
process.env.VITE_SUPABASE_ANON_KEY = ''

let server, browser
try {
  await build({ root, logLevel: 'error', build: { outDir, emptyOutDir: true } })
  server = await preview({ root, logLevel: 'error', build: { outDir }, preview: { host: '127.0.0.1', port: 4319 } })
  const base = server.resolvedUrls.local[0].replace(/\/$/, '')

  const executablePath = findChrome()
  if (!executablePath) throw new Error('Google Chrome not found. Install it or set CHROME_PATH.')
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy
  browser = await chromium.launch({ executablePath, headless: true, ...(proxy ? { proxy: { server: proxy, bypass: '127.0.0.1,localhost' } } : {}) })

  // Scroll the control to the middle of the screen first, clear of the sticky header and tab bar.
  const tap = async locator => { await locator.evaluate(center); await locator.click() }
  const dbCalls = []
  async function open(width, height, route) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    const page = await context.newPage()
    await page.route(/supabase\.co/, r => { dbCalls.push(r.request().url()); return r.abort() })
    await page.goto(`${base}/#${route}`, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => document.fonts.status === 'loaded')
    const state = await page.evaluate(pageState, FONTS)
    if (!state.demo) throw new Error('This build is not in demo mode. Refusing to run against a live database.')
    if (state.missing.length) throw new Error(`Web fonts did not load (${state.missing.join(', ')}), so widths would be wrong. Check the network and run again.`)
    // The demo banner does not exist on the live site; hide it so sizes match what parents see.
    await page.addStyleTag({ content: '.demo-banner{display:none!important}' })
    return { context, page }
  }

  console.log('1. No page is wider than the screen')
  for (const width of WIDTHS) {
    const before = failures.length
    for (const route of ROUTES) {
      const { context, page } = await open(width, 740, route)
      const w = await page.evaluate(pageWidth)
      if (w > width) fail(`#${route} is ${w}px wide on a ${width}px phone`)
      if (route === 'board') {
        await page.locator('button.row').first().click()
        await page.waitForSelector('.sheet')
        const s = await page.evaluate(sheetWidths)
        if (s.sw > s.cw || s.doc > width) fail(`Speed Card is wider than a ${width}px phone (${Math.max(s.sw, s.doc)}px)`)
      }
      await context.close()
    }
    if (failures.length === before) ok(`all ${ROUTES.length} tabs and the Speed Card fit at ${width}px`)
  }

  console.log('2. First phone screen shows the sign-up button')
  for (const [width, height] of FIRST_SCREENS) {
    const { context, page } = await open(width, height, 'home')
    const m = await page.evaluate(firstScreen)
    expect(m.top >= m.headerBottom && m.bottom <= m.tabTop, `${width}x${height}: button fully visible (button ${Math.round(m.top)} to ${Math.round(m.bottom)}, tab bar starts at ${Math.round(m.tabTop)})`)
    await context.close()
  }

  console.log('3. Sign-up form rules')
  {
    const { context, page } = await open(375, 812, 'join')
    const f = await page.evaluate(formRules)
    expect(f.cellRequired, 'parent cell is required')
    expect(!f.updatesChecked, '"email me about extra sessions" starts unchecked')
    expect(!f.waiverScrolls, 'waiver is fully visible, not inside a scroll box')
    expect(f.lengthAbove, 'session length (60 min) is shown above the form')

    console.log('4. Confirmation is on screen after signing up (demo mode, saved on this device only)')
    await page.fill('#an', 'Sample Athlete')
    await page.fill('#age', '10')
    await page.selectOption('#sp', 'Football')
    await page.fill('#pn', 'Pat Parent')
    await page.fill('#pe', 'pat@example.com')
    await page.fill('#pp', '919-555-0100')
    await tap(page.locator('.timepick-grid label').nth(1))
    if (f.ecRequired) await page.fill('#ec', 'Same as above')
    await tap(page.locator('label.check input[required]'))
    await page.fill('#sig', 'Pat Parent')
    await tap(page.locator('form button.btn-red'))
    await page.waitForSelector('.success')
    await page.waitForTimeout(600)
    const s = await page.evaluate(confirmation)
    expect(s.top >= s.headerBottom && s.bottom <= s.tabTop, `"You're in!" card is fully on screen (card ${Math.round(s.top)} to ${Math.round(s.bottom)}, visible area ${Math.round(s.headerBottom)} to ${Math.round(s.tabTop)})`)
    expect(s.focused, 'focus moves to the confirmation so screen readers announce it')
    expect(s.text.includes('Sample') && s.text.toLowerCase().includes('inbox'), 'confirmation names the athlete and says to check the inbox')

    await tap(page.getByRole('button', { name: 'Add another athlete' }))
    await page.waitForSelector('form')
    const again = await page.evaluate(formValues)
    expect(again.athlete === '' && again.parent === 'Pat Parent' && again.email === 'pat@example.com' && again.cell === '919-555-0100', '"Add another athlete" keeps the parent details and clears the athlete')
    expect(!again.waiver && again.sig === '', 'waiver agreement and signature are asked again for each athlete')
    await context.close()
  }

  console.log('5. Red buttons meet WCAG AA contrast')
  {
    const all = []
    for (const route of ['home', 'join', 'tools', 'learn', 'coach']) {
      const { context, page } = await open(375, 812, route)
      all.push(...await page.evaluate(redButtons, route))
      await context.close()
    }
    const low = all.filter(b => b.ratio < 4.5)
    expect(all.length > 0 && low.length === 0, low.length ? `red buttons below 4.5:1: ${low.map(b => `"${b.text}" on #${b.route} (${b.ratio.toFixed(2)}:1)`).join(', ')}` : `all ${all.length} red buttons are 4.5:1 or better (lowest ${Math.min(...all.map(b => b.ratio)).toFixed(2)}:1)`)
  }

  expect(dbCalls.length === 0, `no database calls were attempted during the check${dbCalls.length ? ` (${dbCalls.length} blocked)` : ''}`)
} catch (e) {
  fail(e.message)
} finally {
  await browser?.close().catch(() => {})
  await new Promise(resolve => (server ? server.httpServer.close(resolve) : resolve()))
  rmSync(outDir, { recursive: true, force: true })
}

if (failures.length) { console.error(`\ncheck-ux: ${failures.length} problem${failures.length === 1 ? '' : 's'} found`); process.exit(1) }
console.log('\ncheck-ux: ok')
