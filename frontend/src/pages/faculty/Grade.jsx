import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Loader2, Plus, Save, Send, X } from 'lucide-react'
import { listRecords, saveAccount } from '../../lib/db'
import { gradeFor, MAX_EXTERNAL, MAX_INTERNAL } from '../../lib/grades'
import { entryFor, rosterFor, saveAssignment, yearForAssignment } from '../../lib/portal'
import { STUDENT_YEARS } from '../../lib/seedData'
import Toast from '../../components/dashboard/Toast'
import { EmptyState } from '../../components/dashboard/Bits'

export default function FacultyGrade() {
  const { record, source, updateRecord } = useOutletContext()
  const assignments = record.assignments || []
  const department = record.department
  const [params, setParams] = useSearchParams()
  const activeId = params.get('exam') || assignments[0]?.id
  const assignment = assignments.find((item) => item.id === activeId) || assignments[0]

  const [students, setStudents] = useState([])
  const [draft, setDraft] = useState({})
  const [recordSource, setRecordSource] = useState(source)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('ok')
  const [showExamForm, setShowExamForm] = useState(false)
  const [examForm, setExamForm] = useState({
    code: '',
    title: '',
    exam: '',
    year: STUDENT_YEARS[0],
    credits: '3',
  })
  const [examError, setExamError] = useState('')
  const [showMissingPrompt, setShowMissingPrompt] = useState(false)
  const [savePrompt, setSavePrompt] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { records, source: loadedSource } = await listRecords('student', {
        requireRemote: source === 'firebase',
      })
      setStudents(records)
      setRecordSource(source === 'firebase' ? source : loadedSource)

      const next = {}
      if (assignment) {
        for (const student of rosterFor(
          records,
          assignment.code,
          department,
          yearForAssignment(assignment)
        )) {
          const entry = entryFor(student, assignment.id)
          next[student.id] = {
            internal: entry?.internal === undefined ? '' : String(entry.internal),
            external: entry?.external === undefined ? '' : String(entry.external),
            published: Boolean(entry?.published),
          }
        }
      }
      setDraft(next)
    } catch (error) {
      setToastTone('error')
      setToast(`Could not load branch students: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [assignment, department, source])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const roster = useMemo(
    () =>
      assignment
        ? rosterFor(students, assignment.code, department, yearForAssignment(assignment))
        : [],
    [students, assignment, department]
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
  const missing = rows.filter((row) => !row.complete)
  const changedRows = rows.filter(({ student, entry }) => {
    const saved = entryFor(student, assignment?.id)
    const savedInternal = saved?.internal === undefined ? '' : String(saved.internal)
    const savedExternal = saved?.external === undefined ? '' : String(saved.external)
    return entry.internal !== savedInternal || entry.external !== savedExternal
  })
  const needsPublish = rows.filter(
    ({ student, complete: isComplete }) =>
      isComplete && !entryFor(student, assignment?.id)?.published
  )
  const average = complete.length
    ? Math.round(complete.reduce((sum, row) => sum + row.total, 0) / complete.length)
    : 0

  const update = (studentId, field, value) => {
    const digits = value.replace(/[^\d]/g, '').slice(0, 2)
    const maximum = field === 'internal' ? MAX_INTERNAL : MAX_EXTERNAL
    const bounded = digits === '' ? '' : String(Math.min(Number(digits), maximum))
    setDraft((current) => ({
      ...current,
      [studentId]: { ...current[studentId], [field]: bounded },
    }))
  }

  const submit = async (publish) => {
    if (!changedRows.length && (!publish || !needsPublish.length)) return
    if (publish && complete.length < rows.length) {
      setShowMissingPrompt(true)
      return
    }

    setSavePrompt(publish ? 'publish' : 'draft')
  }

  const confirmSave = async () => {
    const publish = savePrompt === 'publish'
    setSavePrompt('')
    setBusy(publish ? 'publish' : 'draft')
    try {
      const result = await saveAssignment({
        assignment,
        students,
        draft,
        publish,
        source: recordSource,
      })
      setToastTone('ok')
      setToast(
        publish
          ? `Published ${result.written} results — students see them now`
          : `Saved ${result.written} drafts`
      )
      await load()
    } catch (error) {
      setToastTone('error')
      setToast(error.message || 'Could not save these marks.')
    } finally {
      setBusy('')
    }
  }

  const createExam = async (event) => {
    event.preventDefault()
    const code = examForm.code.trim().toUpperCase()
    const title = examForm.title.trim()
    const exam = examForm.exam.trim()
    const credits = Number(examForm.credits)
    if (!code || !title || !exam || !STUDENT_YEARS.includes(examForm.year) || !Number.isInteger(credits) || credits < 1 || credits > 10) {
      setExamError('Enter a course code, subject, exam, year and valid credits.')
      return
    }

    setBusy('exam')
    setExamError('')
    try {
      const id = `${code.replace(/[^A-Z0-9]+/g, '')}-${Date.now().toString(36).toUpperCase()}`
      const newAssignment = {
        id,
        code,
        title,
        credits,
        exam,
        year: examForm.year,
        due: 'Not set',
      }
      const courses = [...(record.courses || [])]
      const courseIndex = courses.findIndex((item) => item.code === code)
      const semester = `Semester ${(STUDENT_YEARS.indexOf(examForm.year) * 2) + 1}`
      const course = { code, title, semester, students: rosterFor(students, code, department, examForm.year).length }
      if (courseIndex >= 0) courses[courseIndex] = { ...courses[courseIndex], ...course }
      else courses.push(course)

      const updated = {
        ...record,
        courses,
        assignments: [...assignments, newAssignment],
      }
      await saveAccount(updated, { requireRemote: source === 'firebase' })
      updateRecord(updated)
      setExamForm({ code: '', title: '', exam: '', year: STUDENT_YEARS[0], credits: '3' })
      setShowExamForm(false)
      setParams({ exam: id })
      setToastTone('ok')
      setToast(`${exam} added for ${code}. Enter marks for your branch students.`)
    } catch (error) {
      setExamError(error.message || 'Could not save this exam.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="page">
      <div className="grade-page-head">
        <p className="panel-sub">Create exams and grade every student in your branch.</p>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setShowExamForm((open) => !open)}
          disabled={!department}
        >
          <Plus size={15} /> Add exam
        </button>
      </div>

      {!department && (
        <p className="portal-sync-warning" role="status">
          Set your branch on your profile before adding an exam or viewing students.
        </p>
      )}

      {showExamForm && (
        <section className="panel exam-create">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Add an exam</h3>
              <p className="panel-sub">
                This exam will be available to {examForm.year} students in {department}.
              </p>
            </div>
            <button
              type="button"
              className="exam-close"
              onClick={() => setShowExamForm(false)}
              aria-label="Close add exam form"
            >
              <X size={17} />
            </button>
          </div>
          <form className="exam-create-form" onSubmit={createExam}>
            <label>
              <span>Course code</span>
              <input
                value={examForm.code}
                onChange={(event) => setExamForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="CS 420"
                required
              />
            </label>
            <label>
              <span>Subject</span>
              <input
                value={examForm.title}
                onChange={(event) => setExamForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Database systems"
                required
              />
            </label>
            <label>
              <span>Exam name</span>
              <input
                value={examForm.exam}
                onChange={(event) => setExamForm((current) => ({ ...current, exam: event.target.value }))}
                placeholder="Mid-term"
                required
              />
            </label>
            <label>
              <span>Year</span>
              <select
                value={examForm.year}
                onChange={(event) => setExamForm((current) => ({ ...current, year: event.target.value }))}
                required
              >
                {STUDENT_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            <label>
              <span>Course credits</span>
              <input
                type="number"
                min="1"
                max="10"
                value={examForm.credits}
                onChange={(event) => setExamForm((current) => ({ ...current, credits: event.target.value }))}
                required
              />
            </label>
            {examError && <p className="field-error" role="alert">{examError}</p>}
            <div className="exam-create-actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowExamForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary btn--sm" disabled={busy === 'exam'}>
                {busy === 'exam' ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}
                Create exam
              </button>
            </div>
          </form>
        </section>
      )}

      {assignments.length === 0 ? (
        <EmptyState
          title={department ? 'No exams yet' : 'Set your branch first'}
          body={
            department
              ? 'Add an exam to start entering marks for your branch students.'
              : 'Choose a branch on your profile to get a student roster.'
          }
        />
      ) : (
      <>
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
              <span>{item.exam} · {yearForAssignment(item)}</span>
            </button>
          )
        })}
      </div>

      <section className="panel panel-table grade-panel">
        <div className="panel-head grade-head">
          <div>
            <h3 className="panel-title">
              {assignment?.code} &middot; {assignment?.exam} &middot; {yearForAssignment(assignment)}
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
        <p className="grade-loading">
          No students are registered in {yearForAssignment(assignment)} of this branch yet.
        </p>
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
            {changedRows.length
              ? `${changedRows.length} unsaved change${changedRows.length === 1 ? '' : 's'}`
            : needsPublish.length
              ? `${needsPublish.length} complete draft${needsPublish.length === 1 ? '' : 's'} ready to publish`
              : 'All marks are saved'}
          </p>
          <div className="grade-buttons">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setSavePrompt('draft')}
              disabled={Boolean(busy) || changedRows.length === 0}
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
              disabled={Boolean(busy) || (changedRows.length === 0 && needsPublish.length === 0)}
            >
              {busy === 'publish' ? (
                <span className="btn-busy">
                  <Loader2 size={15} className="spin" /> Saving…
                </span>
              ) : (
                <span className="btn-busy">
                  <Send size={15} strokeWidth={1.8} /> Save marks
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
      </>
      )}

      <Toast message={toast} tone={toastTone} />
      {showMissingPrompt && (
        <div className="grade-dialog-backdrop">
          <section className="grade-dialog" role="alertdialog" aria-modal="true" aria-labelledby="missing-marks-title">
            <h3 id="missing-marks-title">Marks are missing</h3>
            <p>
              {missing.length} student{missing.length === 1 ? ' does' : 's do'} not have both marks.
              Please enter marks for every student before publishing.
            </p>
            <ul>
              {missing.map(({ student }) => <li key={student.id}>{student.name} · {student.id}</li>)}
            </ul>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowMissingPrompt(false)}>
              Return to marks
            </button>
          </section>
        </div>
      )}
      {savePrompt && (
        <div className="grade-dialog-backdrop">
          <section className="grade-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-marks-title">
            <h3 id="confirm-marks-title">
              {savePrompt === 'publish' ? 'Save and publish marks?' : 'Save mark changes?'}
            </h3>
            <p>
              {savePrompt === 'publish'
                ? `This updates results for ${complete.length} ${yearForAssignment(assignment)} students. Their marks, average and GPA will recalculate.`
                : `Save these draft changes for ${changedRows.length} students? Student results will not update until you publish.`}
            </p>
            <div className="exam-create-actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setSavePrompt('')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={confirmSave}
                disabled={Boolean(busy)}
              >
                {busy ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                Confirm save
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
