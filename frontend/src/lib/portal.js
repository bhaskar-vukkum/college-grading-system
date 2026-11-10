import { saveAccount } from './db'
import { normalizeYear, STUDENT_YEARS } from './seedData'
import { clampMark, computeGpa, gradeFor, MAX_EXTERNAL, MAX_INTERNAL } from './grades'

/** Students who take a course: their record carries a row for it. */
export function rosterFor(students, code, department, year) {
  const branch = department?.trim().toLowerCase()
  if (department !== undefined && !branch) return []
  return students
    .filter((student) => {
      const matchesBranch =
        department !== undefined
          ? student.department?.trim().toLowerCase() === branch
          : (student.marks || []).some((mark) => mark.code === code)
      return matchesBranch && (!year || yearForStudent(student) === normalizeYear(year))
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function yearForStudent(student) {
  const year = normalizeYear(student?.year)
  if (year) return year

  const semester = Number(String(student?.semester || '').match(/\d+/)?.[0])
  return semester >= 1 && semester <= 8
    ? STUDENT_YEARS[Math.floor((semester - 1) / 2)]
    : ''
}

export function yearForAssignment(assignment) {
  const year = normalizeYear(assignment?.year)
  if (year) return year

  return {
    'CS401-MID': '1st year',
    'CS401-END': '2nd year',
    'CS411-MID': '3rd year',
    'CS402-MID': '2nd year',
    'CS406-LAB': '2nd year',
    'CS405-LAB': '2nd year',
    'CS412-LAB': '3rd year',
    'CS403-MID': '1st year',
    'CS403-END': '1st year',
    'HS208-END': '2nd year',
    'EC401-INTRO': '1st year',
    'EC401-MID': '2nd year',
    'EC402-MID': '3rd year',
  }[assignment?.id] || ''
}

export function publishedEntryFor(student, assignment) {
  const entry = entryFor(student, assignment.id)
  return entry?.published && typeof entry.total === 'number' ? entry : null
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
  const complete = entry.internal !== '' && entry.external !== ''
  const internal = entry.internal === '' ? '' : clampMark(entry.internal, MAX_INTERNAL)
  const external = entry.external === '' ? '' : clampMark(entry.external, MAX_EXTERNAL)
  const total = complete ? internal + external : null
  const grade = complete ? gradeFor(total) : ''

  const entries = {
    ...(student.entries || {}),
    [assignment.id]: {
      code: assignment.code,
      title: assignment.title,
      credits: assignment.credits,
      exam: assignment.exam,
      year: yearForAssignment(assignment) || yearForStudent(student),
      internal,
      external,
      total,
      grade,
      published: publish && complete,
    },
  }

  let marks = [...(student.marks || [])]
  if (publish && complete) {
    const row = {
      code: assignment.code,
      title: assignment.title,
      credits: assignment.credits,
      internal,
      external,
      total,
      grade,
      exam: assignment.exam,
      year: yearForAssignment(assignment) || yearForStudent(student),
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
    if (entry.internal === '' && entry.external === '') continue

    const updated = applyEntry(student, assignment, entry, publish)
    const result = await saveAccount(updated, { requireRemote: savedSource === 'firebase' })
    savedSource = result.source
    written += 1
  }

  return { written, source: savedSource }
}
