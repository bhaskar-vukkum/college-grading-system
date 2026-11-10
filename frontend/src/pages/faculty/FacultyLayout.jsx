import React from 'react'
import { Outlet } from 'react-router-dom'
import { BarChart3, ClipboardCheck, PenLine, User, Users } from 'lucide-react'
import Shell from '../../components/dashboard/Shell'
import { usePortal } from '../../lib/usePortal'

export const FACULTY_ITEMS = [
  { to: 'profile', label: 'My profile', sub: 'Your post, your office and the courses you hold', icon: User },
  { to: 'assigned', label: 'Assigned exams', sub: 'Exams assigned to you, and how far the grading has run', icon: ClipboardCheck },
  { to: 'grade', label: 'Enter marks', sub: 'Type marks for a course and publish the result', icon: PenLine },
  { to: 'results', label: 'Class results', sub: 'Averages, grade spread and who is still pending', icon: BarChart3 },
  { to: 'students', label: 'Students', sub: 'Everyone enrolled in the courses you teach', icon: Users },
]

export default function FacultyLayout() {
  const { record, source } = usePortal('faculty')

  if (!record) {
    return (
      <div className="dash-loading">
        <span className="dash-loading-dot" aria-hidden="true" />
        Opening your record…
      </div>
    )
  }

  return (
    <Shell
      record={record}
      items={FACULTY_ITEMS}
      source={source}
      context={[record.designation, record.department].filter(Boolean).join(' · ')}
    >
      <Outlet context={{ record, source }} />
    </Shell>
  )
}
