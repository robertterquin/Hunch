import { Icon } from '@iconify/react'
import { Link, useParams } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { guideEntries } from '../data/supportContent'

type GuideEntry = (typeof guideEntries)[number]

function GuideCard({ entry }: { entry: GuideEntry }) {
  return <Link className={`panel guide-card guide-${entry.severity}`} to={`/guide/${entry.id}`}>
    <h3><Icon icon={entry.icon} width={20} height={20} aria-hidden="true" />{entry.title}</h3>
    <p>{entry.summary}</p>
    {entry.example && <p className="quote"><mark className={`mark-${entry.severity}`}>{entry.example}</mark></p>}
  </Link>
}

export function GuidePage() {
  const { patternId } = useParams()
  const pattern = guideEntries.find((item) => item.id === patternId)

  if (pattern) return <SupportPage title={pattern.title} actions={<Link className="button button-quiet" to="/guide"><Icon icon="ph:arrow-left" width={16} height={16} aria-hidden="true" />Scam Guide</Link>}>
    <article className="panel panel-pad guide-detail">
      <span className={`tag tag-${pattern.severity === 'high' ? 'high-risk' : 'caution'}`}>{pattern.severity === 'high' ? 'High risk' : 'Caution'}</span>
      <p className="guide-lead">{pattern.description}</p>
      {pattern.example && <p className="quote"><mark className={`mark-${pattern.severity}`}>{pattern.example}</mark></p>}
      <h3>Why it matters</h3>
      <p>{pattern.rationale}</p>
      <h3>What to do</h3>
      <p>{pattern.safetyTip}</p>
      <p className="muted">Hunch points out warning signs in a post. It doesn’t accuse a company or prove fraud.</p>
      <Link className="button button-primary" to={`/analyze?fixture=${pattern.fixtureId}`}>Try a sample post</Link>
    </article>
  </SupportPage>

  return <SupportPage title="Scam Guide" description="The eight patterns Hunch looks for.">
    <section className="guide-group"><h2>High risk</h2><div className="guide-grid guide-grid-2">{guideEntries.filter((entry) => entry.severity === 'high').map((entry) => <GuideCard entry={entry} key={entry.id} />)}</div></section>
    <section className="guide-group"><h2>Caution</h2><div className="guide-grid">{guideEntries.filter((entry) => entry.severity !== 'high').map((entry) => <GuideCard entry={entry} key={entry.id} />)}</div></section>
  </SupportPage>
}
