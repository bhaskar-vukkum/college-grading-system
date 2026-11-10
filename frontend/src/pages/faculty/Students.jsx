import React, { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import { listRecords } from '../../lib/db'
import { facultyStudents, markFor } from '../../lib/portal'
import { EmptyState } from '../../components/dashboard/Bits'

export default function FacultyStudents() {
  const { record } = useOutletContext()
  const courses = record.courses || []

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    listRecords('student').then(({ records }) => {
      if (!alive) return
      setStudents(facultyStudents(records, courses))
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [courses])

  const rows = useMemo(() => {
    const scoped =
      course === 'all'
        ? students
        : students.filter((student) => (student.marks || []).some((mark) => mark.code === course))

    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? scoped.filter(
          (student) =>
            student.name.toLowerCase().includes(needle) ||
            student.id.toLowerCase().includes(needle)
        )
      : scoped

    return filtered.map((student) => {
      const marks = courses
        .map((entry) => ({ course: entry, mark: markFor(student, entry.code) }))
        .filter((row) => row.mark && (course === 'all' || row.course.code === course))

      const published = marks.filter((row) => row.mark)
      const average = published.length
        ? Math.round(published.reduce((sum, row) => sum + row.mark.total, 0) / published.length)
        : null

      return { student, marks, average }
    })
  }, [students, courses, course, query])

  if (loading) {
    return (
      <div className="page">
        <p className="grade-loading">
          <Loader2 size={16} className="spin" /> Loading your students…
        </p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No students on your courses yet"
          body="Students appear here as soon as their record carries one of the courses you hold."
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="list-toolbar">
        <div className="filter-chips" role="group" aria-label="Filter by course">
          <button
            type="button"
            className={`filter-chip${course === 'all' ? ' is-active' : ''}`}
            onClick={() => setCourse('all')}
          >
            All courses
          </button>
          {courses.map((entry) => (
            <button
              key={entry.code}
              type="button"
              className={`filter-chip${course === entry.code ? ' is-active' : ''}`}
              onClick={() => setCourse(entry.code)}
            >
              {entry.code}
            </button>
          ))}
        </div>

        <label className="search">
          <Search size={15} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            placeholder="Find a student"
            aria-label="Find a student"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <section className="panel panel-table">
        <div className="panel-head">
          <h3 className="panel-title">Your students</h3>
          <span className="mono">{rows.length} in view</span>
        </div>

        <div className="table-scroll">
          <table className="students-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Department</th>
                <th scope="col">Marks published by you</th>
                <th scope="col" className="num">
                  Average
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ student, marks, average }) => (
                <tr key={student.id}>
                  <td>
                    <span className="student-cell">
                      <span className="student-avatar" aria-hidden="true">
                        {student.name
                          .split(' ')
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <span className="course">
                        <span className="course-name">{student.name}</span>
                        <span className="course-code">{student.id}</span>
                      </span>
                    </span>
                  </td>
                  <td className="mono-cell">{student.department}</td>
                  <td>
                    <span className="mark-chips">
                      {marks.map(({ course: entry, mark }) => (
                        <span key={entry.code} className="mark-chip">
                          {entry.code}
                          <b>{mark.grade}</b>
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="num num-total">{average === null ? '—' : average}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
