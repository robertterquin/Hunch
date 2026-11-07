// Renders out/<page>.html to shots/<page>.png with headless Chrome (full page, fonts loaded).
// usage: node shoot.mjs <page> [width=1440] [scale=1.5]
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const [page, width = '1440', scale = '1.5', fixedHeight] = process.argv.slice(2) // fixedHeight: capture just that viewport (phones)
const port = 9400 + Math.floor(Math.random() * 400)
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'v2-'))}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page') } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0; const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); pending.get(m.id)?.(m.result) }
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })) })
await send('Emulation.setDeviceMetricsOverride', { width: Number(width), height: Number(fixedHeight ?? 900), deviceScaleFactor: Number(scale), mobile: false })
await send('Page.navigate', { url: `file://${join(here, 'out', `${page}.html`)}` })
await sleep(800)
await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true })
await sleep(400)
const { result } = await send('Runtime.evaluate', { expression: 'JSON.stringify([document.documentElement.scrollWidth, document.documentElement.scrollHeight])', returnByValue: true })
const [w, h] = fixedHeight ? [Number(width), Number(fixedHeight)] : JSON.parse(result.value)
const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !fixedHeight, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } })
mkdirSync(join(here, 'shots'), { recursive: true })
writeFileSync(join(here, 'shots', `${page}.png`), Buffer.from(data, 'base64'))
console.log(`${page}: ${w}x${h}`)
ws.close(); chrome.kill()
