import type { ReactNode } from 'react'

interface SupportPageProps {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function SupportPage({ title, description, actions, children, className = '' }: SupportPageProps) {
  return <div className={`page-stack support-page${className ? ` ${className}` : ''}`}><header className="page-heading"><div><h1>{title}</h1>{description && <p className="page-intro">{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</header>{children}</div>
}
