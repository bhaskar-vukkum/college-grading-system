import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { DetailList, Stat } from '../../components/dashboard/Bits'
import { yearForStudent } from '../../lib/portal'

export default function StudentProfile() {
  const { record } = useOutletContext()
  const marks = record.marks || []
  const initials = record.name
    ?.split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const gpa = Number(record.gpa) > 0 ? Number(record.gpa).toFixed(2) : '—'

  return (
    <div className="page">
      <section className="panel profile-head">
        <span className="avatar-xl" aria-hidden="true">
          {initials}
        </span>
        <div className="profile-id">
          <h2 className="profile-name">{record.name}</h2>
          <p className="profile-meta">
            {record.id} &middot; {record.department}
          </p>
          <div className="chips">
            <span className="chip">{yearForStudent(record) || 'Year not set'}</span>
            <span className="chip">{record.semester}</span>
          </div>
        </div>
      </section>

      <section className="stats">
        <Stat label="Semester GPA" value={gpa} unit={gpa === '—' ? '' : '/ 10'} detail="Weighted by credits" />
        <Stat label="Credits earned" value={record.credits || 0} detail={marks.length ? 'This semester' : 'No results yet'} />
        <Stat label="Courses" value={marks.length} detail={marks.length ? 'With a published grade' : 'Awaiting publication'} />
      </section>

      <div className="page-grid">
        <section className="panel">
          <h3 className="panel-title">Record details</h3>
          <DetailList
            rows={[
              { label: 'Roll number', value: record.id },
              { label: 'Email', value: record.email },
              { label: 'Phone', value: record.phone },
              { label: 'Branch', value: record.department },
              { label: 'Year', value: yearForStudent(record) || 'Not set' },
              { label: 'Semester', value: record.semester },
              { label: 'Enrolled', value: record.enrolled },
            ]}
          />
        </section>

        <aside className="panel panel-note">
          <p className="mono">How this record works</p>
          <p>
            Every mark here is set by the course faculty and published for the
            term. Your department office can correct a detail; it cannot change a
            published grade.
          </p>
        </aside>
      </div>
    </div>
  )
}
