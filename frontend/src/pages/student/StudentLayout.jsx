import React from 'react'
import { Outlet } from 'react-router-dom'
import { BookOpen, ClipboardList, FileText, Settings, User } from 'lucide-react'
import Shell from '../../components/dashboard/Shell'
import { usePortal } from '../../lib/usePortal'

export const STUDENT_ITEMS = [
  { to: 'profile', label: 'Profile', sub: 'Your record and the details the college holds', icon: User },
  { to: 'marks', label: 'My marks', sub: 'Course marks, credits and the semester GPA', icon: ClipboardList },
  { to: 'material', label: 'Study material', sub: 'Notes and reading shared by your faculty', icon: BookOpen },
  { to: 'transcript', label: 'Transcript', sub: 'The whole record, term by term', icon: FileText },
  { to: 'settings', label: 'Settings', sub: 'Account and notification preferences', icon: Settings },
]

export default function StudentLayout() {
  const { record, source } = usePortal('student')

  if (!record) {
    return (
      <div className="dash-loading">
        <span className="dash-loading-dot" aria-hidden="true" />
        Opening your record…
      </div>
    )
  }

  return (
    <Shell record={record} items={STUDENT_ITEMS} source={source}>
      <Outlet context={{ record, source }} />
    </Shell>
  )
}
