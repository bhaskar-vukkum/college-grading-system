import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Check, Loader2, Save, Send } from 'lucide-react'
import { listRecords } from '../../lib/db'
import { gradeFor, MAX_EXTERNAL, MAX_INTERNAL } from '../../lib/grades'
import { entryFor, rosterFor, saveAssignment } from '../../lib/portal'
import Toast from '../../components/dashboard/Toast'
import { EmptyState } from '../../components/dashboard/Bits'

export default function FacultyGrade() {
  const { record } = useOutletContext()
  const assignments = record.assignments || []
  const [params, setParams] = useSearchParams()
  const activeId = params.get('exam') || assignments[0]?.id
  const assignment = assignments.find((item) => item.id === activeId) || assignments[0]

  const [students, setStudents] = useState([])
  const [draft, setDraft] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    if (!assignment) return
    setLoading(true)
    const { records } = await listRecords('student')
    setStudents(records)

    const next = {}
    for (const student of rosterFor(records, assignment.code)) {
      const entry = entryFor(student, assignment.id)
      next[student.id] = {
        internal: entry ? String(entry.internal) : '',
        external: entry ? String(entry.external) : '',
        published: Boolean(entry?.published),
      }
    }
    setDraft(next)
    setLoading(false)
  }, [assignment])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const roster = useMemo(
    () => (assignment ? rosterFor(students, assignment.code) : []),
    [students, assignment]
  )

  const rows = useMemo(
    () =>
      roster.map((student) => {
        const entry = draft[student.id] || { internal: '', external: '' }
        const internal = Number(entry.internal)
        const external = Number(entry.external)
        const complete = entry.internal !== '' && entry.external !== ''
        const total = (Number.isNaN(internal) ? 0 : internal) + (Number.isNaN(external) ? 0 : external)
        return { student, entry, complete, total, grade: complete ? gradeFor(total) : '—' }
      }),
    [roster, draft]
  )

  const complete = rows.filter((row) => row.complete)
  const average = complete.length
    ? Math.round(complete.reduce((sum, row) => sum + row.total, 0) / complete.length)
    : 0

  const update = (studentId, field, value) => {
    const digits = value.replace(/[^\d]/g, '').slice(0, 2)
    setDraft((current) => ({
      ...current,
      [studentId]: { ...current[studentId], [field]: digits },
    }))
  }

  const submit = async (publish) => {
    setBusy(publish ? 'publish' : 'draft')
    try {
      const result = await saveAssignment({ assignment, students, draft, publish })
      setToast(
        publish
          ? `Published ${result.written} results — students see them now`
          : `Saved ${result.written} drafts`
      )
      await load()
    } finally {
      setBusy('')
    }
  }

  if (assignments.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="No exam assigned to you"
          body="When the department assigns a mid-term or end-semester exam to one of your courses, it appears here and you can start entering marks."
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="exam-switch" role="tablist" aria-label="Assigned exams">
        {assignments.map((item) => {
          const isActive = item.id === assignment.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`exam-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setParams({ exam: item.id })}
            >
              <span className="exam-tab-code">{item.code}</span>
              <span>{item.exam}</span>
            </button>
          )
        })}
      </div>

      <section className="panel panel-table grade-panel">
        <div className="panel-head grade-head">
          <div>
            <h3 className="panel-title">
              {assignment.code} &middot; {assignment.exam}
            </h3>
            <p className="panel-sub">
              Internal out of {MAX_INTERNAL}, exam out of {MAX_EXTERNAL}. Totals and grades
              are worked out as you type.
            </p>
          </div>

          <div className="grade-summary">
            <span className="mono">
              {complete.length}/{rows.length} graded
            </span>
            <span className="mono">Average {average}</span>
          </div>
        </div>

        {loading ? (
          <p className="grade-loading">
            <Loader2 size={16} className="spin" /> Loading your students…
          </p>
        ) : rows.length === 0 ? (
          <p className="grade-loading">No student record carries this course yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="grade-table">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col" className="col-mark">
                    Internal /{MAX_INTERNAL}
                  </th>
                  <th scope="col" className="col-mark">
                    Exam /{MAX_EXTERNAL}
                  </th>
                  <th scope="col" className="num">
                    Total
                  </th>
                  <th scope="col" className="num">
                    Grade
                  </th>
                  <th scope="col">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ student, entry, complete: done, total, grade }) => (
                  <tr key={student.id}>
                    <td>
                      <span className="course">
                        <span className="course-name">{student.name}</span>
                        <span className="course-code">{student.id}</span>
                      </span>
                    </td>
                    <td className="col-mark">
                      <input
                        className="mark-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        placeholder="—"
                        aria-label={`Internal marks for ${student.name}`}
                        value={entry.internal}
                        onChange={(event) => update(student.id, 'internal', event.target.value)}
                      />
                    </td>
                    <td className="col-mark">
                      <input
                        className="mark-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        placeholder="—"
                        aria-label={`Exam marks for ${student.name}`}
                        value={entry.external}
                        onChange={(event) => update(student.id, 'external', event.target.value)}
                      />
                    </td>
                    <td className="num num-total">{done ? total : '—'}</td>
                    <td className="num">{done ? <span className="grade-chip">{grade}</span> : '—'}</td>
                    <td>
                      {entry.published ? (
                        <span className="status-chip is-done">Published</span>
                      ) : done ? (
                        <span className="status-chip is-grading">Draft</span>
                      ) : (
                        <span className="status-chip">Empty</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grade-actions">
          <p className="grade-note">
            {rows.length - complete.length > 0
              ? `${rows.length - complete.length} students still need a mark`
              : 'Every student has a mark in this exam'}
          </p>
          <div className="grade-buttons">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => submit(false)}
              disabled={Boolean(busy) || complete.length === 0}
            >
              {busy === 'draft' ? (
                <span className="btn-busy">
                  <Loader2 size={15} className="spin" /> Saving…
                </span>
              ) : (
                <span className="btn-busy">
                  <Save size={15} strokeWidth={1.8} /> Save draft
                </span>
              )}
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => submit(true)}
              disabled={Boolean(busy) || complete.length === 0}
            >
              {busy === 'publish' ? (
                <span className="btn-busy">
                  <Loader2 size={15} className="spin" /> Publishing…
                </span>
              ) : (
                <span className="btn-busy">
                  <Send size={15} strokeWidth={1.8} /> Publish results
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <Toast message={toast} />
    </div>
  )
}
