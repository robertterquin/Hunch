import type { ReactNode } from 'react'

interface SupportPageProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function SupportPage({ eyebrow, title, description, actions, children, className = '' }: SupportPageProps) {
  return <div className={`page-stack support-page${className ? ` ${className}` : ''}`}><section className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</section>{children}</div>
}
