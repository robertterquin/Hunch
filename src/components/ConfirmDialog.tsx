import { useEffect, useId, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { CircleAlert, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel, danger = false }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCancelRef = useRef(onCancel)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.requestAnimationFrame(() => confirmRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onCancel()
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={handleBackdropClick}>
      <div className="confirm-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <div className="confirm-dialog-heading">
          <span className={`confirm-dialog-icon${danger ? ' is-danger' : ''}`}><CircleAlert size={19} aria-hidden="true" /></span>
          <div>
            <p className="eyebrow">Confirm action</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Close confirmation" title="Close confirmation"><X size={18} aria-hidden="true" /></button>
        </div>
        <p className="confirm-dialog-description" id={descriptionId}>{description}</p>
        <div className="confirm-dialog-actions">
          <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className={`button ${danger ? 'button-danger' : 'button-primary'}`} type="button" onClick={onConfirm} ref={confirmRef}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
