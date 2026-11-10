import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { DetailList, Stat } from '../../components/dashboard/Bits'

export default function FacultyProfile() {
  const { record } = useOutletContext()
  const courses = record.courses || []
  const assignments = record.assignments || []
  const pending = assignments.filter((item) => item.status !== 'Published').length

  const initials = record.name
    ?.split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="page">
      <section className="panel profile-head">
        <span className="avatar-xl" aria-hidden="true">
          {initials}
        </span>
        <div className="profile-id">
          <h2 className="profile-name">{record.name}</h2>
          <p className="profile-meta">
            {record.id} &middot; {record.designation}
          </p>
          <div className="chips">
            <span className="chip">{record.department}</span>
            <span className="chip">{record.office}</span>
          </div>
        </div>
      </section>

      <section className="stats">
        <Stat label="Courses held" value={courses.length} detail="This term" />
        <Stat label="Assigned exams" value={assignments.length} detail="Mid-term and end-semester" />
        <Stat label="Still open" value={pending} detail="Grading or awaiting marks" />
      </section>

      <div className="page-grid">
        <section className="panel">
          <h3 className="panel-title">Record details</h3>
          <DetailList
            rows={[
              { label: 'Staff ID', value: record.id },
              { label: 'Email', value: record.email },
              { label: 'Phone', value: record.phone },
              { label: 'Department', value: record.department },
              { label: 'Designation', value: record.designation },
              { label: 'Office', value: record.office },
              { label: 'Joined', value: record.joined },
            ]}
          />
        </section>

        <aside className="panel">
          <h3 className="panel-title">Courses you hold</h3>
          <ul className="course-list">
            {courses.length === 0 && <li className="course-empty">No courses assigned yet.</li>}
            {courses.map((course) => (
              <li key={course.code} className="course-row">
                <span className="course-code">{course.code}</span>
                <span className="course-name">{course.title}</span>
                <span className="mono course-meta">{course.students} students</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
