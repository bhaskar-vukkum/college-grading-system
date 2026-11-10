import React from 'react'

export function Stat({ label, value, unit, detail }) {
  return (
    <div className="stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">
        {value}
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </p>
      {detail ? <p className="stat-detail">{detail}</p> : null}
    </div>
  )
}

export function DetailList({ rows }) {
  return (
    <dl className="details">
      {rows.map((row) => (
        <div className="details-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function GradeChip({ grade }) {
  const strong = grade === 'A+' || grade === 'A'
  return <span className={`grade-chip${strong ? ' is-strong' : ''}`}>{grade}</span>
}

export function EmptyState({ title, body }) {
  return (
    <div className="empty">
      <span className="empty-mark" aria-hidden="true" />
      <p className="empty-title">{title}</p>
      <p className="empty-body">{body}</p>
    </div>
  )
}
