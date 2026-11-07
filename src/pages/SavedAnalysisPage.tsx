import { Icon } from '@iconify/react'
import { Link, useParams } from 'react-router-dom'
import { AnalysisReportView } from '../components/AnalysisReportView'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SupportPage } from '../components/support/SupportPage'
import { formatDate, reportTitle } from '../data/supportContent'
import { useAppState } from '../app/stateContext'
import { useState } from 'react'

export function SavedAnalysisPage() {
  const { analysisId } = useParams()
  const { savedReports, deleteReport, toggleChecklistItem } = useAppState()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const report = savedReports.find((item) => item.id === analysisId)
  if (!report) return <SupportPage eyebrow="Saved > Report" title="Report not found" description="This private report may have been deleted or is not available in the current session."><section className="panel empty-panel"><Icon icon="ph:warning-circle-duotone" width={28} height={28} aria-hidden="true" /><h2>That report is unavailable.</h2><Link className="button button-primary" to="/saved">Back to Saved</Link></section></SupportPage>
  return <>
    <SupportPage eyebrow="Saved > Report" title={reportTitle(report)} description={`Saved ${formatDate(report.createdAt)}`} actions={<Link className="button button-secondary" to="/saved"><Icon icon="ph:arrow-left" width={16} height={16} aria-hidden="true" />Back to Saved</Link>}><div className="detail-actions"><button className="button button-secondary" type="button" onClick={() => setIsDeleteDialogOpen(true)}><Icon icon="ph:trash" width={16} height={16} aria-hidden="true" />Delete report</button><Link className="button button-secondary" to={`/compare?ids=${report.id}`}><Icon icon="ph:check-square" width={16} height={16} aria-hidden="true" />Compare reports</Link></div><AnalysisReportView report={report} onToggleChecklist={(checklistId) => toggleChecklistItem(report.id, checklistId)} /></SupportPage>
    <ConfirmDialog open={isDeleteDialogOpen} title="Delete this report?" description="This private report and its saved checklist progress will be permanently removed." confirmLabel="Delete report" danger onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={() => { setIsDeleteDialogOpen(false); void deleteReport(report.id) }} />
  </>
}
