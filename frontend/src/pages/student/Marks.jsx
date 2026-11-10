import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, GradeChip, Stat } from '../../components/dashboard/Bits'
import { computeGpa } from '../../lib/grades'
import { yearForStudent } from '../../lib/portal'

export default function StudentMarks() {
  const { record } = useOutletContext()
  const marks = record.marks || []
  const examMarks = Object.entries(record.entries || {})
    .filter(([, entry]) => entry?.published && entry.code && typeof entry.total === 'number')
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => a.code.localeCompare(b.code) || String(a.exam || '').localeCompare(b.exam || ''))
  const courseMarks = marks.length
    ? marks
    : Array.from(
        examMarks.reduce((latest, mark) => latest.set(mark.code, mark), new Map()).values()
      )
  const examCourseCodes = new Set(examMarks.map((mark) => mark.code))
  const rows = [
    ...examMarks,
    ...courseMarks
      .filter((mark) => !examCourseCodes.has(mark.code))
      .map((mark) => ({ ...mark, exam: mark.exam || 'Course result', id: mark.code })),
  ]

  if (rows.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No marks published yet"
          body="Your courses show up here as each faculty member publishes the result for the term. Check back after the mid-term window."
        />
      </div>
    )
  }

  const totalCredits = courseMarks.reduce((sum, mark) => sum + (mark.credits || 0), 0)
  const average = Math.round(
    courseMarks.reduce((sum, mark) => sum + mark.total, 0) / courseMarks.length
  )
  const gpa = computeGpa(courseMarks).toFixed(2)

  return (
    <div className="page">
      <section className="stats">
        <Stat label="Semester GPA" value={gpa} unit="/ 10" detail="Latest result per course, weighted by credits" />
        <Stat label="Credits" value={totalCredits} detail={`${courseMarks.length} courses`} />
        <Stat label="Average" value={average} unit="%" detail="Latest result per course" />
      </section>

      <section className="panel panel-table">
        <div className="panel-head">
          <h3 className="panel-title">Published exam marks</h3>
          <span className="mono">{record.semester} · {yearForStudent(record)}</span>
        </div>

        <div className="table-scroll">
          <table className="marks-table">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Exam</th>
                <th scope="col" className="num">Credits</th>
                <th scope="col" className="num">Internal</th>
                <th scope="col" className="num">External</th>
                <th scope="col" className="num">Total</th>
                <th scope="col" className="num">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((mark) => (
                <tr key={mark.id}>
                  <td>
                    <span className="course">
                      <span className="course-code">{mark.code}</span>
                      <span className="course-name">{mark.title}</span>
                    </span>
                  </td>
                  <td>{mark.exam || 'Course result'}</td>
                  <td className="num">{mark.credits}</td>
                  <td className="num">{mark.internal}<span className="num-of">/30</span></td>
                  <td className="num">{mark.external}<span className="num-of">/70</span></td>
                  <td className="num num-total">{mark.total}</td>
                  <td className="num">
                    <GradeChip grade={mark.grade} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
