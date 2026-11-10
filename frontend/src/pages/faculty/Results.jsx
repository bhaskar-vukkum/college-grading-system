import React, { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { listRecords } from '../../lib/db'
import { GRADE_ORDER, summarise } from '../../lib/grades'
import { markFor, rosterFor } from '../../lib/portal'
import { EmptyState } from '../../components/dashboard/Bits'

export default function FacultyResults() {
  const { record } = useOutletContext()
  const courses = record.courses || []
  const [students, setStudents] = useState([])
  const [course, setCourse] = useState(courses[0]?.code || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    listRecords('student').then(({ records }) => {
      if (!alive) return
      setStudents(records)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const roster = useMemo(() => rosterFor(students, course), [students, course])
  const published = roster
    .map((student) => ({ student, mark: markFor(student, course) }))
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

  if (courses.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No course to report on"
          body="Class results appear once you hold a course with students in it."
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="filter-chips" role="group" aria-label="Course">
        {courses.map((entry) => (
          <button
            key={entry.code}
            type="button"
            className={`filter-chip${course === entry.code ? ' is-active' : ''}`}
            onClick={() => setCourse(entry.code)}
          >
            {entry.code} &middot; {entry.title}
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
          <p className="stat-detail">{stats.count} results published</p>
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
          <p className="stat-detail">
            {stats.passed} of {roster.length} on this course
          </p>
        </div>
      </section>

      <div className="page-grid">
        <section className="panel">
          <h3 className="panel-title">Grade spread</h3>
          {stats.count === 0 ? (
            <p className="panel-sub">Nothing published for this course yet.</p>
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
            {roster.length === 0 && <li className="course-empty">No students on this course.</li>}
            {roster
              .filter((student) => !markFor(student, course))
              .slice(0, 6)
              .map((student) => (
                <li key={student.id} className="pending-row">
                  <span className="course-name">{student.name}</span>
                  <span className="course-code">{student.id}</span>
                </li>
              ))}
            {roster.length > 0 && roster.every((student) => markFor(student, course)) && (
              <li className="course-empty">Every student has a grade.</li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  )
}
