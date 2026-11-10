import React, { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { listRecords } from '../../lib/db'
import { GRADE_ORDER, summarise } from '../../lib/grades'
import { publishedEntryFor, rosterFor, yearForAssignment } from '../../lib/portal'
import { EmptyState } from '../../components/dashboard/Bits'

export default function FacultyResults() {
  const { record, source } = useOutletContext()
  const assignments = record.assignments || []
  const department = record.department
  const [students, setStudents] = useState([])
  const [examId, setExamId] = useState(assignments[0]?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const assignment = assignments.find((item) => item.id === examId) || assignments[0]

  useEffect(() => {
    let alive = true
    listRecords('student', { requireRemote: source === 'firebase' })
      .then(({ records }) => {
        if (!alive) return
        setStudents(records)
        setLoading(false)
      })
      .catch((loadError) => {
        if (!alive) return
        setError(loadError.message)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [source])

  useEffect(() => {
    if (!assignments.some((item) => item.id === examId)) {
      setExamId(assignments[0]?.id || '')
    }
  }, [assignments, examId])

  const roster = useMemo(
    () =>
      assignment
        ? rosterFor(students, assignment.code, department, yearForAssignment(assignment))
        : [],
    [students, department, assignment]
  )

  const published = roster
    .map((student) => ({ student, mark: publishedEntryFor(student, assignment) }))
    .filter((row) => row.mark)
  const stats = summarise(published.map((row) => row.mark))
  const peak = Math.max(1, ...stats.spread.map((entry) => entry.count))

  if (loading) {
    return (
      <div className="page">
        <p className="grade-loading">
          <Loader2 size={16} className="spin" /> Working out the class…
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
          title="No exam results yet"
          body="Results are calculated from the marks published for each exam."
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="filter-chips" role="group" aria-label="Exam">
        {assignments.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`filter-chip${assignment?.id === item.id ? ' is-active' : ''}`}
            onClick={() => setExamId(item.id)}
          >
            {item.code} · {item.exam} · {yearForAssignment(item)}
          </button>
        ))}
      </div>

      <section className="stats">
        <div className="stat">
          <p className="stat-label">Class average</p>
          <p className="stat-value">
            {stats.count ? stats.average : '—'}
            <span className="stat-unit">{stats.count ? '/ 100' : ''}</span>
          </p>
          <p className="stat-detail">{stats.count} published results</p>
        </div>
        <div className="stat">
          <p className="stat-label">Highest</p>
          <p className="stat-value">{stats.count ? stats.highest : '—'}</p>
          <p className="stat-detail">Lowest {stats.count ? stats.lowest : '—'}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Passed</p>
          <p className="stat-value">
            {stats.count ? stats.passRate : '—'}
            <span className="stat-unit">{stats.count ? '%' : ''}</span>
          </p>
          <p className="stat-detail">{stats.passed} of {roster.length} students</p>
        </div>
      </section>

      <div className="page-grid">
        <section className="panel">
          <h3 className="panel-title">Grade spread</h3>
          {stats.count === 0 ? (
            <p className="panel-sub">No marks have been published for this exam.</p>
          ) : (
            <ul className="spread">
              {GRADE_ORDER.map((grade) => {
                const entry = stats.spread.find((row) => row.grade === grade)
                const count = entry ? entry.count : 0
                return (
                  <li key={grade} className="spread-row">
                    <span className="spread-grade">{grade}</span>
                    <span className="spread-track">
                      <span className="spread-fill" style={{ width: `${(count / peak) * 100}%` }} />
                    </span>
                    <span className="spread-count">{count}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="panel">
          <h3 className="panel-title">Still to publish</h3>
          <ul className="pending-list">
            {roster.length === 0 && <li className="course-empty">No students in this year and branch.</li>}
            {roster
              .filter((student) => !publishedEntryFor(student, assignment))
              .slice(0, 6)
              .map((student) => (
                <li key={student.id} className="pending-row">
                  <span className="course-name">{student.name}</span>
                  <span className="course-code">{student.id}</span>
                </li>
              ))}
            {roster.length > 0 && roster.every((student) => publishedEntryFor(student, assignment)) && (
              <li className="course-empty">Every student has a published grade.</li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  )
}
