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
  if (!report) return <SupportPage title="Report not found" description="It may have been deleted or isn’t available in this session."><section className="panel empty-panel"><Link className="button button-primary" to="/saved">Back to Saved</Link></section></SupportPage>
  return <>
    <SupportPage title={reportTitle(report)} description={`Saved ${formatDate(report.createdAt)}`} actions={<><Link className="button button-quiet" to="/saved"><Icon icon="ph:arrow-left" width={16} height={16} aria-hidden="true" />Saved</Link><Link className="button button-secondary" to={`/compare?ids=${report.id}`}>Compare</Link><button className="button button-danger-outline" type="button" onClick={() => setIsDeleteDialogOpen(true)}>Delete</button></>}><AnalysisReportView report={report} onToggleChecklist={(checklistId) => toggleChecklistItem(report.id, checklistId)} /></SupportPage>
    <ConfirmDialog open={isDeleteDialogOpen} title="Delete this report?" description="This permanently removes the report and its checklist progress." confirmLabel="Delete" danger onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={() => { setIsDeleteDialogOpen(false); void deleteReport(report.id) }} />
  </>
}
