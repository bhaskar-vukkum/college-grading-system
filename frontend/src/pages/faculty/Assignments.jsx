import React, { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { listRecords } from '../../lib/db'
import { entryFor, publishedEntryFor, rosterFor, yearForAssignment } from '../../lib/portal'
import { EmptyState } from '../../components/dashboard/Bits'

const STATUS = {
  Open: { tone: 'open', label: 'Open' },
  Grading: { tone: 'grading', label: 'Grading' },
  Published: { tone: 'done', label: 'Published' },
}

export default function FacultyAssigned() {
  const { record, source } = useOutletContext()
  const assignments = record.assignments || []
  const department = record.department
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    listRecords('student', { requireRemote: source === 'firebase' }).then(({ records }) => {
      if (!alive) return
      setStudents(records)
      setLoading(false)
    })
      .catch((loadError) => {
        setError(loadError.message)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [source])

  const rows = assignments.map((assignment) => {
    const roster = rosterFor(
      students,
      assignment.code,
      department,
      yearForAssignment(assignment)
    )
    const graded = roster.filter((student) => entryFor(student, assignment.id)).length
    const published = roster.filter((student) => publishedEntryFor(student, assignment)).length
    const status =
      roster.length > 0 && published === roster.length
        ? 'Published'
        : graded > 0
          ? 'Grading'
          : 'Open'
    return { ...assignment, roster: roster.length, graded, published, status }
  })

  if (loading) {
    return (
      <div className="page">
        <p className="grade-loading">
          <Loader2 size={16} className="spin" /> Loading your exams…
        </p>
      </div>
    )
  }

  if (error) {
    return <div className="page"><p className="portal-sync-warning" role="alert">{error}</p></div>
  }

  if (assignments.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No exams yet"
          body="Add an exam from Enter marks to start grading every student in your branch."
        />
      </div>
    )
  }

  return (
    <div className="page">
      <section className="panel panel-table">
        <div className="panel-head">
          <h3 className="panel-title">Assigned exams</h3>
          <span className="mono">{assignments.length} this term</span>
        </div>

        <div className="table-scroll">
          <table className="assign-table">
            <thead>
              <tr>
                <th scope="col">Course and exam</th>
                <th scope="col">Year</th>
                <th scope="col">Due</th>
                <th scope="col">Graded</th>
                <th scope="col">Published</th>
                <th scope="col">Status</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const status = STATUS[item.status] || STATUS.Open
                const percent = item.roster ? Math.round((item.graded / item.roster) * 100) : 0
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="course">
                        <span className="course-code">{item.code}</span>
                        <span className="course-name">{item.exam}</span>
                      </span>
                    </td>
                    <td>{yearForAssignment(item)}</td>
                    <td className="mono-cell">{item.due}</td>
                    <td>
                      <span className="progress">
                        <span className="progress-track">
                          <span className="progress-fill" style={{ width: `${percent}%` }} />
                        </span>
                        <span className="progress-label">
                          {item.graded}/{item.roster}
                        </span>
                      </span>
                    </td>
                    <td className="mono-cell">
                      {item.published}/{item.roster}
                    </td>
                    <td>
                      <span className={`status-chip is-${status.tone}`}>{status.label}</span>
                    </td>
                    <td className="row-action">
                      <Link to={`../grade?exam=${item.id}`} relative="path" className="row-link">
                        Enter marks
                        <ArrowRight size={14} strokeWidth={1.8} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
