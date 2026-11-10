import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Loader2, Save } from 'lucide-react'
import { DetailList, Stat } from '../../components/dashboard/Bits'
import { saveAccount } from '../../lib/db'
import { DEPARTMENTS } from '../../lib/seedData'

export default function FacultyProfile() {
  const { record, source, updateRecord } = useOutletContext()
  const [department, setDepartment] = useState(record.department || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
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

  const saveDepartment = async (event) => {
    event.preventDefault()
    if (!department) {
      setError('Choose a branch before saving.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const updated = { ...record, department }
      await saveAccount(updated, { requireRemote: source === 'firebase' })
      updateRecord(updated)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

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

      {!record.department && (
        <section className="panel branch-setup">
          <h3 className="panel-title">Choose your branch</h3>
          <p className="panel-sub">
            Your student roster is matched by branch. Set your department to see
            the students assigned to you.
          </p>
          <form className="branch-setup-form" onSubmit={saveDepartment}>
            <label htmlFor="faculty-department">Branch</label>
            <select
              id="faculty-department"
              className="branch-select"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">Choose a branch</option>
              {DEPARTMENTS.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
              Save branch
            </button>
            {error && <p className="field-error" role="alert">{error}</p>}
          </form>
        </section>
      )}

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
              { label: 'Branch', value: record.department },
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
