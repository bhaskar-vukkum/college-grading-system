/**
 * Demo records: 15 students across three branches and 4 faculty.
 *
 * These are the same documents the seed script writes to Firestore
 * (scripts/seed-firestore.mjs). Until the database rules allow access, the app
 * reads them from src/lib/db.js's local store so every screen has real data.
 * Generated deterministically: same numbers on every run.
 */

const STUDENT_NAMES = [
  'Ananya Sharma',
  'Rohan Mehta',
  'Kavya Nair',
  'Arjun Rao',
  'Meera Iyer',
  'Devansh Patel',
  'Ishita Banerjee',
  'Kabir Malhotra',
  'Sneha Reddy',
  'Aditya Kulkarni',
  'Priya Venkatesh',
  'Nikhil Joshi',
  'Tara Menon',
  'Yash Chauhan',
  'Riya Deshmukh',
]

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mathematics',
]
export const STUDENT_YEARS = ['1st year', '2nd year', '3rd year', '4th year']
const STUDENT_YEAR_BY_INDEX = [0, 1, 2, 1, 2, 0, 2, 0, 1, 0, 1, 2, 1, 2, 0]

export function normalizeYear(value) {
  const text = String(value || '').trim().toLowerCase()
  const year = text.match(/[1-4]/)?.[0]
  if (year) return STUDENT_YEARS[Number(year) - 1]
  const words = ['first', 'second', 'third', 'fourth']
  const index = words.findIndex((word) => text.includes(word))
  return index < 0 ? '' : STUDENT_YEARS[index]
}

const COURSE_POOL = [
  { code: 'CS 401', title: 'Compilers and optimization', credits: 4 },
  { code: 'CS 402', title: 'Distributed systems', credits: 4 },
  { code: 'CS 403', title: 'Numerical methods', credits: 3 },
  { code: 'CS 411', title: 'Machine learning', credits: 4 },
  { code: 'HS 208', title: 'Technical writing', credits: 2 },
  { code: 'CS 405', title: 'Compilers lab', credits: 2 },
  { code: 'CS 412', title: 'Machine learning lab', credits: 2 },
  { code: 'CS 406', title: 'Distributed systems lab', credits: 2 },
  { code: 'EC 401', title: 'Electronic circuits', credits: 4 },
  { code: 'EC 402', title: 'Signals and systems', credits: 4 },
]

const DEPARTMENT_COURSES = {
  'Computer Science': COURSE_POOL.filter((course) => course.code.startsWith('CS ') && course.code !== 'CS 403'),
  'Information Technology': COURSE_POOL.filter((course) => ['CS 403', 'HS 208'].includes(course.code)),
  'Electronics and Communication': COURSE_POOL.filter((course) => course.code.startsWith('EC ')),
}

const COURSE_YEARS = {
  'CS 401': ['1st year', '2nd year'],
  'CS 411': ['3rd year'],
  'CS 402': ['2nd year'],
  'CS 406': ['2nd year'],
  'CS 405': ['2nd year'],
  'CS 412': ['3rd year'],
  'CS 403': ['1st year'],
  'HS 208': ['2nd year'],
  'EC 401': ['1st year', '2nd year'],
  'EC 402': ['3rd year'],
}

const GRADE_POINTS = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, P: 5 }

function gradeFor(total) {
  if (total >= 90) return 'A+'
  if (total >= 80) return 'A'
  if (total >= 70) return 'B+'
  if (total >= 60) return 'B'
  if (total >= 50) return 'C'
  return 'P'
}

/** Small deterministic generator so the demo data never shifts between runs. */
function makeRandom(seed) {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function studentYear(index) {
  return STUDENT_YEARS[STUDENT_YEAR_BY_INDEX[index] || 0]
}

function buildMarks(index, department, year) {
  const random = makeRandom(97 + index * 13)
  const courses = (DEPARTMENT_COURSES[department] || []).filter((course) =>
    (COURSE_YEARS[course.code] || []).includes(year)
  )
  const marks = courses.map((course) => {
    const internal = 17 + Math.floor(random() * 14) // /30
    const external = 32 + Math.floor(random() * 37) // /70
    const total = internal + external
    return {
      code: course.code,
      title: course.title,
      credits: course.credits,
      internal,
      external,
      total,
      grade: gradeFor(total),
    }
  })

  const credits = marks.reduce((sum, mark) => sum + mark.credits, 0)
  const points = marks.reduce((sum, mark) => sum + GRADE_POINTS[mark.grade] * mark.credits, 0)

  return { marks, credits, gpa: Math.round((points / credits) * 100) / 100 }
}

function pad(number) {
  return String(number).padStart(3, '0')
}

function student(index) {
  const name = STUDENT_NAMES[index]
  const department = DEPARTMENTS[index % 3]
  const year = studentYear(index)
  const semesterNumber = (STUDENT_YEARS.indexOf(year) * 2) + 1
  const roll = `${department === 'Information Technology' ? 'IT' : department === 'Electronics and Communication' ? 'EC' : 'CS'}-2024-${pad(11 + index * 3)}`
  const { marks, credits, gpa } = buildMarks(index, department, year)

  return {
    id: roll,
    role: 'student',
    name,
    email: `${roll.toLowerCase()}@college.edu`,
    phone: `+91 9${String(84210100 + index * 137).slice(0, 8)}`,
    department,
    year,
    semester: `Semester ${semesterNumber}`,
    enrolled: `2024`,
    marks,
    entries: {},
    credits,
    gpa,
    createdAt: '2026-07-14T09:00:00.000Z',
  }
}

const FACULTY = [
  {
    id: 'FAC-408',
    role: 'faculty',
    name: 'Ramesh Iyer',
    email: 'ramesh.iyer@college.edu',
    phone: '+91 98421 33408',
    department: 'Computer Science',
    designation: 'Associate professor',
    office: 'CS Block · 214',
    joined: '2014',
    courses: [
      { code: 'CS 401', title: 'Compilers and optimization', semester: 'Semester 5', students: 5 },
      { code: 'CS 411', title: 'Machine learning', semester: 'Semester 7', students: 5 },
    ],
    assignments: [
      { id: 'CS401-MID', code: 'CS 401', title: 'Compilers and optimization', credits: 4, exam: 'Mid-term', year: '1st year', due: '12 Jun 2026' },
      { id: 'CS401-END', code: 'CS 401', title: 'Compilers and optimization', credits: 4, exam: 'End-semester', year: '2nd year', due: '28 Nov 2026' },
      { id: 'CS411-MID', code: 'CS 411', title: 'Machine learning', credits: 4, exam: 'Mid-term', year: '3rd year', due: '12 Jun 2026' },
    ],
    createdAt: '2026-07-14T09:00:00.000Z',
  },
  {
    id: 'FAC-402',
    role: 'faculty',
    name: 'Meera Krishnan',
    email: 'meera.krishnan@college.edu',
    phone: '+91 98421 33402',
    department: 'Computer Science',
    designation: 'Professor',
    office: 'CS Block · 208',
    joined: '2009',
    courses: [
      { code: 'CS 402', title: 'Distributed systems', semester: 'Semester 6', students: 5 },
      { code: 'CS 406', title: 'Distributed systems lab', semester: 'Semester 6', students: 5 },
      { code: 'CS 405', title: 'Compilers lab', semester: 'Semester 5', students: 5 },
      { code: 'CS 412', title: 'Machine learning lab', semester: 'Semester 7', students: 5 },
    ],
    assignments: [
      { id: 'CS402-MID', code: 'CS 402', title: 'Distributed systems', credits: 4, exam: 'Mid-term', year: '2nd year', due: '12 Jun 2026' },
      { id: 'CS406-LAB', code: 'CS 406', title: 'Distributed systems lab', credits: 2, exam: 'Lab record', year: '2nd year', due: '04 Dec 2026' },
      { id: 'CS405-LAB', code: 'CS 405', title: 'Compilers lab', credits: 2, exam: 'Lab record', year: '2nd year', due: '04 Dec 2026' },
      { id: 'CS412-LAB', code: 'CS 412', title: 'Machine learning lab', credits: 2, exam: 'Lab record', year: '3rd year', due: '04 Dec 2026' },
    ],
    createdAt: '2026-07-14T09:00:00.000Z',
  },
  {
    id: 'FAC-315',
    role: 'faculty',
    name: 'Sunil Deshpande',
    email: 'sunil.deshpande@college.edu',
    phone: '+91 98421 33315',
    department: 'Information Technology',
    designation: 'Assistant professor',
    office: 'IT Block · 106',
    joined: '2019',
    courses: [
      { code: 'CS 403', title: 'Numerical methods', semester: 'Semester 3', students: 5 },
      { code: 'HS 208', title: 'Technical writing', semester: 'Semester 3', students: 5 },
    ],
    assignments: [
      { id: 'CS403-MID', code: 'CS 403', title: 'Numerical methods', credits: 3, exam: 'Mid-term', year: '1st year', due: '12 Jun 2026' },
      { id: 'CS403-END', code: 'CS 403', title: 'Numerical methods', credits: 3, exam: 'End-semester', year: '1st year', due: '28 Nov 2026' },
      { id: 'HS208-END', code: 'HS 208', title: 'Technical writing', credits: 2, exam: 'End-semester', year: '2nd year', due: '28 Nov 2026' },
    ],
    createdAt: '2026-07-14T09:00:00.000Z',
  },
  {
    id: 'FAC-217',
    role: 'faculty',
    name: 'Kiran Rao',
    email: 'kiran.rao@college.edu',
    phone: '+91 98421 33217',
    department: 'Electronics and Communication',
    designation: 'Assistant professor',
    office: 'ECE Block · 108',
    joined: '2021',
    courses: [
      { code: 'EC 401', title: 'Electronic circuits', semester: 'Semester 5', students: 5 },
      { code: 'EC 402', title: 'Signals and systems', semester: 'Semester 5', students: 5 },
    ],
    assignments: [
      { id: 'EC401-INTRO', code: 'EC 401', title: 'Electronic circuits', credits: 4, exam: 'Mid-term', year: '1st year', due: '12 Jun 2026' },
      { id: 'EC401-MID', code: 'EC 401', title: 'Electronic circuits', credits: 4, exam: 'Mid-term', year: '2nd year', due: '12 Jun 2026' },
      { id: 'EC402-MID', code: 'EC 402', title: 'Signals and systems', credits: 4, exam: 'Mid-term', year: '3rd year', due: '12 Jun 2026' },
    ],
    createdAt: '2026-07-14T09:00:00.000Z',
  },
]

function addPublishedEntries(record) {
  const assignments = FACULTY
    .filter((faculty) => faculty.department === record.department)
    .flatMap((faculty) => faculty.assignments)
    .filter((assignment) => assignment.year === record.year)

  const entries = Object.fromEntries(
    assignments.map((assignment) => {
      const mark = record.marks.find((item) => item.code === assignment.code)
      return [
        assignment.id,
        {
          code: assignment.code,
          title: assignment.title,
          credits: assignment.credits,
          exam: assignment.exam,
          year: assignment.year,
          internal: mark.internal,
          external: mark.external,
          total: mark.total,
          grade: mark.grade,
          published: true,
        },
      ]
    })
  )

  return { ...record, entries }
}

export const STUDENTS = Array.from({ length: STUDENT_NAMES.length }, (_, index) =>
  addPublishedEntries(student(index))
)

export const FACULTY_RECORDS = FACULTY

export const DEMO_PASSWORD = 'gradeflow'

export const DEMO_HINT = 'CS-2024-011 · FAC-408 · password gradeflow'
