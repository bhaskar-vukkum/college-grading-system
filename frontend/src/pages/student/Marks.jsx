import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, GradeChip, Stat } from '../../components/dashboard/Bits'

export default function StudentMarks() {
  const { record } = useOutletContext()
  const marks = record.marks || []

  if (marks.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No marks published yet"
          body="Your courses show up here as each faculty member publishes the result for the term. Check back after the mid-term window."
        />
      </div>
    )
  }

  const totalCredits = marks.reduce((sum, mark) => sum + mark.credits, 0)
  const average = Math.round(marks.reduce((sum, mark) => sum + mark.total, 0) / marks.length)

  return (
    <div className="page">
      <section className="stats">
        <Stat label="Semester GPA" value={Number(record.gpa).toFixed(2)} unit="/ 10" detail="Weighted by credits" />
        <Stat label="Credits" value={totalCredits} detail={`${marks.length} courses`} />
        <Stat label="Average" value={average} unit="%" detail="Across all courses" />
      </section>

      <section className="panel panel-table">
        <div className="panel-head">
          <h3 className="panel-title">Course marks</h3>
          <span className="mono">{record.semester} · {record.year}</span>
        </div>

        <div className="table-scroll">
          <table className="marks-table">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col" className="num">Credits</th>
                <th scope="col" className="num">Internal</th>
                <th scope="col" className="num">Exam</th>
                <th scope="col" className="num">Total</th>
                <th scope="col" className="num">Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => (
                <tr key={mark.code}>
                  <td>
                    <span className="course">
                      <span className="course-code">{mark.code}</span>
                      <span className="course-name">{mark.title}</span>
                    </span>
                  </td>
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
            <tfoot>
              <tr>
                <td>Semester total</td>
                <td className="num">{totalCredits}</td>
                <td className="num" colSpan={2} />
                <td className="num num-total">{marks.reduce((sum, mark) => sum + mark.total, 0)}</td>
                <td className="num">GPA {Number(record.gpa).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
