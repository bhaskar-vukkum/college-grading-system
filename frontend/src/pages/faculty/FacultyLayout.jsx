import React from 'react'
import { Outlet } from 'react-router-dom'
import { BarChart3, ClipboardCheck, PenLine, User, Users } from 'lucide-react'
import Shell from '../../components/dashboard/Shell'
import { usePortal } from '../../lib/usePortal'

export const FACULTY_ITEMS = [
  { to: 'profile', label: 'My profile', sub: 'Your post, branch and the courses you hold', icon: User },
  { to: 'assigned', label: 'Assigned exams', sub: 'Exams assigned to your branch, and grading progress', icon: ClipboardCheck },
  { to: 'grade', label: 'Enter marks', sub: 'Add exams, enter marks and publish results', icon: PenLine },
  { to: 'results', label: 'Class results', sub: 'Branch averages, grade spread and pending marks', icon: BarChart3 },
  { to: 'students', label: 'Students', sub: 'Everyone enrolled in your branch', icon: Users },
]

export default function FacultyLayout() {
  const { record, source, syncError, updateRecord } = usePortal('faculty')

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
      {syncError && <p className="portal-sync-warning" role="alert">{syncError}</p>}
      <Outlet context={{ record, source, updateRecord }} />
    </Shell>
  )
}
