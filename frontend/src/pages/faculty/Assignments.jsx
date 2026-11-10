import React from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { EmptyState } from '../../components/dashboard/Bits'

const STATUS = {
  Open: { tone: 'open', label: 'Open' },
  Grading: { tone: 'grading', label: 'Grading' },
  Published: { tone: 'done', label: 'Published' },
}

export default function FacultyAssigned() {
  const { record } = useOutletContext()
  const assignments = record.assignments || []

  if (assignments.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No exams assigned yet"
          body="When the department assigns a mid-term or end-semester exam to one of your courses, it appears here with the grading window."
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
                <th scope="col">Due</th>
                <th scope="col">Graded</th>
                <th scope="col">Status</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => {
                const status = STATUS[item.status] || STATUS.Open
                const done = item.students ? Math.round((item.submitted / item.students) * 100) : 0
                return (
                  <tr key={`${item.code}-${item.exam}`}>
                    <td>
                      <span className="course">
                        <span className="course-code">{item.code}</span>
                        <span className="course-name">{item.exam}</span>
                      </span>
                    </td>
                    <td className="mono-cell">{item.due}</td>
                    <td>
                      <span className="progress">
                        <span className="progress-track">
                          <span className="progress-fill" style={{ width: `${done}%` }} />
                        </span>
                        <span className="progress-label">
                          {item.submitted}/{item.students}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip is-${status.tone}`}>{status.label}</span>
                    </td>
                    <td className="row-action">
                      <Link to="../grade" relative="path" className="row-link">
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
