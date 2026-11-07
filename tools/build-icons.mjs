// Bundles only the Phosphor icons used in src/ so the app never fetches icons from the Iconify API at runtime.
// Run after adding or changing an icon: npm run icons
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'src/assets/phosphor-icons.json'
const files = readdirSync('src', { recursive: true }).filter((f) => /\.(tsx?|jsx?)$/.test(f))
const names = [...new Set(files.flatMap((f) => readFileSync(join('src', f), 'utf8').match(/\bph:[a-z0-9-]+/g) ?? []))]
  .map((n) => n.slice(3))
  .sort()

const res = await fetch(`https://api.iconify.design/ph.json?icons=${names.join(',')}`)
if (!res.ok) throw new Error(`Iconify API ${res.status}`)
const data = await res.json()
if (data.not_found?.length) throw new Error(`Unknown Phosphor icons: ${data.not_found.join(', ')}`)

writeFileSync(OUT, `${JSON.stringify(data)}\n`)
console.log(`Wrote ${names.length} icons to ${OUT}`)
