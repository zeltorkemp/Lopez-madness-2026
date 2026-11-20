// Guard: on iPhone Safari, "vh" counts the space under the address bar, so a
// fixed overlay or a max-height in vh can start above the visible screen.
// Any rule that sets max-height in vh, or sizes a fixed element in vh, must also set a dvh value.
// Usage: node scripts/check-css.mjs [path/to/styles.css]
import { readFileSync } from 'node:fs'
const file = process.argv[2] || new URL('../src/styles.css', import.meta.url)
const css = readFileSync(file, 'utf8')
const bad = []
for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const [sel, body] = [m[1].trim(), m[2]]
  const fixed = /position:\s*fixed/.test(body)
  const needs = /max-height:\s*[\d.]+vh/.test(body) || (fixed && /(^|[;\s])height:\s*[\d.]+vh/.test(body))
  if (needs && !/[\d.]+dvh/.test(body)) bad.push(sel)
}
if (bad.length) { console.error(`check-css: add a dvh value next to vh in: ${bad.join(', ')}`); process.exit(1) }
console.log('check-css: ok')
