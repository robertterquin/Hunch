"""Builds the v2 mockups: inlines the top bar and Phosphor icons into src/*.html -> out/*.html.
Run: python3 build.py   (needs network once to fetch icons from the Iconify API)"""
import json, pathlib, re, shutil, urllib.request

root = pathlib.Path(__file__).parent
src, out = root / 'src', root / 'out'
out.mkdir(exist_ok=True)
shutil.copy(src / 'hunch-v2.css', out / 'hunch-v2.css')
shutil.copy(root.parents[2] / 'src/assets/hunch-logo.svg', out / 'hunch-logo.svg')

NAV = [('analyze', 'Analyze', 'file-magnifying-glass'), ('saved', 'Saved', 'shield-check'), ('guide', 'Scam Guide', 'book-open-text'), ('checklist', 'Checklist', 'check-square'), ('settings', 'Settings', 'gear-six')]

def bar(active, signed_in=False):
    links = ''.join(f'<a class="{"on" if k == active else ""}" href="{k}.html">{label}</a>' for k, label, _ in NAV)
    end = '<span class="avatar">J</span>' if signed_in else '<a class="btn btn-ghost" style="height:36px">Sign in</a>'
    return f'<header class="bar"><a class="brand" href="analyze.html"><img src="hunch-logo.svg" alt="Hunch" height="34"></a><nav class="nav">{links}</nav><div class="bar-end">{end}</div></header>'

pages = {p.name: p.read_text() for p in src.glob('*.html')}
for name, html in pages.items():
    pages[name] = re.sub(r'\{\{bar:(\w+)(:in)?\}\}', lambda m: bar(m.group(1), bool(m.group(2))), html)

names = sorted({m for h in pages.values() for m in re.findall(r'\{\{i:([a-z0-9-]+)', h)})
req = urllib.request.Request(f'https://api.iconify.design/ph.json?icons={",".join(names)}', headers={'User-Agent': 'curl/8.0'})
data = json.load(urllib.request.urlopen(req))
assert not data.get('not_found'), data.get('not_found')

def svg(m):
    n, size = m.group(1), m.group(2) or '20'
    body = data['icons'][n]['body']
    return f'<svg class="i" width="{size}" height="{size}" viewBox="0 0 256 256" aria-hidden="true">{body}</svg>'

for name, html in pages.items():
    (out / name).write_text(re.sub(r'\{\{i:([a-z0-9-]+)(?::(\d+))?\}\}', svg, html))
print(f'built {len(pages)} pages, {len(names)} icons')
