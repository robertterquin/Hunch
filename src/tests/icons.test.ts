import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import phosphorIcons from '../assets/phosphor-icons.json'

describe('bundled icons', () => {
  it('includes every ph: icon used in src, so none are fetched from the Iconify API', () => {
    const files = readdirSync('src', { recursive: true }).filter((f) => /\.(tsx?|jsx?)$/.test(String(f)))
    const used = new Set(files.flatMap((f) => readFileSync(join('src', String(f)), 'utf8').match(/\bph:[a-z0-9-]+/g) ?? []))
    const bundled = new Set(Object.keys({ ...phosphorIcons.icons, ...('aliases' in phosphorIcons ? phosphorIcons.aliases : {}) }))
    const missing = [...used].map((n) => n.slice(3)).filter((n) => !bundled.has(n))

    expect(used.size).toBeGreaterThan(0)
    expect(missing, 'run `npm run icons` to bundle new icons').toEqual([])
  })
})
