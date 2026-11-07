// Concept D mockup: small DOM additions the CSS alone cannot show. Runs inside the app iframe.
(() => {
  const d = document
  const svgs = {}
  const ph = (n) => (svgs[n] ??= fetch(`https://api.iconify.design/ph/${n}.svg?width=22&height=22`).then((r) => r.text()))
  const severity = {
    'Training or registration fee mentioned': ['currency-circle-dollar-duotone', 'high'],
    'Recruiter uses a personal email': ['envelope-simple-duotone', 'medium'],
    'Company identity is unclear': ['buildings-duotone', 'medium'],
    'Role details are unclear': ['briefcase-duotone', 'medium'],
    'Compensation does not match the role details': ['money-duotone', 'medium'],
    'Urgency pressure detected': ['timer-duotone', 'medium'],
    'Hiring is limited to a chat app': ['chat-circle-dots-duotone', 'medium'],
    'Sensitive documents requested early': ['identification-card-duotone', 'high'],
  }
  const apply = () => {
    d.querySelectorAll('.score-block:not([data-mock])').forEach((sb) => {
      sb.dataset.mock = '1'
      const n = Number(sb.querySelector('strong').textContent); const r = 34; const c = 2 * Math.PI * r
      sb.innerHTML = `<svg class="score-ring" viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="${r}"/><circle class="value" cx="40" cy="40" r="${r}" stroke-dasharray="${(c * n) / 100} ${c}"/></svg><div class="score-ring-label"><strong>${n}</strong><span>of 100</span></div><small>Risk estimate</small>`
    })
    d.querySelectorAll('.flag-card').forEach((fc) => {
      // React rewrites className on expand, so re-add the severity class on every pass
      const sev = severity[fc.querySelector('.flag-title strong')?.textContent]?.[1] ?? 'medium'
      if (!fc.classList.contains(`sev-${sev}`)) fc.classList.add(`sev-${sev}`)
      const sm = fc.querySelector('.flag-title small'); if (!sm.textContent.startsWith('+')) sm.textContent = `+${parseInt(sm.textContent, 10)} pts`
    })
    d.querySelectorAll('.saved-report-card:not([data-mock])').forEach((card) => {
      card.dataset.mock = '1'
      const level = [...card.querySelector('.risk-pill').classList].find((c) => c.startsWith('risk-pill-')).slice(10)
      const score = card.querySelector('.saved-report-meta span:nth-child(2)').textContent.split('/')[0]
      card.querySelector('.select-report').insertAdjacentHTML('afterend', `<div class="score-chip ${level}"><strong>${score}</strong><span>/100</span></div>`)
    })
    d.querySelectorAll('.guide-card:not([data-mock])').forEach(async (card) => {
      card.dataset.mock = '1'
      const [icon, sev] = severity[card.querySelector('strong').textContent] ?? []
      if (!icon) return
      const tile = card.querySelector('.guide-icon'); tile.classList.add(sev); tile.innerHTML = await ph(icon)
      tile.insertAdjacentHTML('afterend', `<span class="sev-tag ${sev}">${sev === 'high' ? 'High-risk signal' : 'Caution signal'}</span>`)
    })
    if (d.querySelector('.app-main') && !d.querySelector('.mock-footer')) {
      d.querySelector('.app-main').insertAdjacentHTML('afterend', '<footer class="mock-footer"><span>Hunch flags warning signals; it can’t prove a listing is safe or fake. Always verify with your school.</span><nav><a href="/guide">Scam Guide</a><a href="/checklist">Checklist</a><a href="/settings">Privacy</a></nav></footer>')
    }
  }
  apply()
  new MutationObserver(apply).observe(d.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] })
})()
