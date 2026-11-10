import { saveAccount } from './db'
import { clampMark, computeGpa, gradeFor, MAX_EXTERNAL, MAX_INTERNAL } from './grades'

/** Students who take a course: their record carries a row for it. */
export function rosterFor(students, code, department) {
  const branch = department?.trim().toLowerCase()
  if (department !== undefined && !branch) return []
  return students
    .filter((student) =>
      department !== undefined
        ? student.department?.trim().toLowerCase() === branch
        : (student.marks || []).some((mark) => mark.code === code)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Everyone enrolled in the faculty member's department. */
export function facultyStudents(students, department) {
  const branch = department?.trim().toLowerCase()
  if (!branch) return []
  return students
    .filter((student) => student.department?.trim().toLowerCase() === branch)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function entryFor(student, assignmentId) {
  return (student.entries || {})[assignmentId] || null
}

export function markFor(student, code) {
  return (student.marks || []).find((mark) => mark.code === code) || null
}

/**
 * Writes one exam entry onto a student record. A draft keeps the entry only; a
 * publish also folds the total and grade into the student's marks and rebuilds
 * the GPA, which is what the student portal reads.
 */
export function applyEntry(student, assignment, entry, publish) {
  const internal = clampMark(entry.internal, MAX_INTERNAL)
  const external = clampMark(entry.external, MAX_EXTERNAL)
  const total = internal + external
  const grade = gradeFor(total)

  const entries = {
    ...(student.entries || {}),
    [assignment.id]: {
      code: assignment.code,
      title: assignment.title,
      credits: assignment.credits,
      exam: assignment.exam,
      internal,
      external,
      total,
      grade,
      published: publish,
    },
  }

  let marks = [...(student.marks || [])]
  if (publish) {
    const row = {
      code: assignment.code,
      title: assignment.title,
      credits: assignment.credits,
      internal,
      external,
      total,
      grade,
      exam: assignment.exam,
    }
    const index = marks.findIndex((mark) => mark.code === assignment.code)
    if (index >= 0) marks[index] = { ...marks[index], ...row }
    else marks = [...marks, row]
  }

  const credits = marks.reduce((sum, mark) => sum + (mark.credits || 0), 0)

  return { ...student, entries, marks, credits, gpa: computeGpa(marks) }
}

/** Saves drafts or published results for every student with a complete entry. */
export async function saveAssignment({ assignment, students, draft, publish, source }) {
  let written = 0
  let savedSource = source || 'local'

  for (const student of students) {
    const entry = draft[student.id]
    if (!entry) continue
    if (entry.internal === '' || entry.external === '') continue

    const updated = applyEntry(student, assignment, entry, publish)
    const result = await saveAccount(updated, { requireRemote: savedSource === 'firebase' })
    savedSource = result.source
    written += 1
  }

  return { written, source: savedSource }
}
