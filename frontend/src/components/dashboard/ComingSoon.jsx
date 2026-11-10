import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ComingSoon({ title, body, backTo = 'profile', backLabel = 'Back to your profile' }) {
  return (
    <section className="soon">
      <div className="soon-art" aria-hidden="true">
        <span className="soon-frame" />
        <span className="soon-bar" style={{ '--i': 0 }} />
        <span className="soon-bar" style={{ '--i': 1 }} />
        <span className="soon-bar" style={{ '--i': 2 }} />
        <span className="soon-dot" />
      </div>

      <p className="mono soon-label">In progress</p>
      <h2 className="soon-title">{title}</h2>
      <p className="soon-body">{body}</p>

      <Link to={`../${backTo}`} relative="path" className="btn btn--ghost btn--sm soon-back">
        {backLabel}
        <ArrowRight size={15} strokeWidth={1.7} />
      </Link>
    </section>
  )
}
