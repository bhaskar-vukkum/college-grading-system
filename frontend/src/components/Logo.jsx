import React from 'react'
import { GraduationCap } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <span className="brand">
      <GraduationCap size={21} strokeWidth={1.6} className="brand-mark" aria-hidden="true" />
      {!compact && <span>GradeFlow</span>}
    </span>
  )
}
