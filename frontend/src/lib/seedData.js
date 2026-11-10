/**
 * Demo records: 15 students and 3 faculty.
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

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics and Communication']
const SECTIONS = ['A', 'B', 'C']
const ADVISORS = ['Ramesh Iyer', 'Meera Krishnan', 'Sunil Deshpande']

const COURSE_POOL = [
  { code: 'CS 401', title: 'Compilers and optimization', credits: 4 },
  { code: 'CS 402', title: 'Distributed systems', credits: 4 },
  { code: 'CS 403', title: 'Numerical methods', credits: 3 },
  { code: 'CS 411', title: 'Machine learning', credits: 4 },
  { code: 'HS 208', title: 'Technical writing', credits: 2 },
  { code: 'CS 405', title: 'Compilers lab', credits: 2 },
  { code: 'CS 412', title: 'Machine learning lab', credits: 2 },
  { code: 'CS 406', title: 'Distributed systems lab', credits: 2 },
]

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

function buildMarks(index) {
  const random = makeRandom(97 + index * 13)
  const start = (index * 3) % COURSE_POOL.length

  const marks = Array.from({ length: 6 }, (_, slot) => {
    const course = COURSE_POOL[(start + slot) % COURSE_POOL.length]
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
  const department = DEPARTMENTS[index % DEPARTMENTS.length]
  const year = 2 + (index % 3)
  const semester = year * 2 - 1
  const roll = `${department === 'Information Technology' ? 'IT' : department === 'Electronics and Communication' ? 'EC' : 'CS'}-2024-${pad(11 + index * 3)}`
  const { marks, credits, gpa } = buildMarks(index)

  return {
    id: roll,
    role: 'student',
    name,
    email: `${roll.toLowerCase()}@college.edu`,
    phone: `+91 9${String(84210100 + index * 137).slice(0, 8)}`,
    department,
    year: `${year}${year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} year`,
    semester: `Semester ${semester}`,
    section: SECTIONS[index % SECTIONS.length],
    advisor: ADVISORS[index % ADVISORS.length],
    enrolled: `2024`,
    marks,
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
      { code: 'CS 401', title: 'Compilers and optimization', semester: 'Semester 5', students: 48 },
      { code: 'CS 411', title: 'Machine learning', semester: 'Semester 7', students: 41 },
    ],
    assignments: [
      { id: 'CS401-MID', code: 'CS 401', title: 'Compilers and optimization', credits: 4, exam: 'Mid-term', due: '12 Jun 2026' },
      { id: 'CS401-END', code: 'CS 401', title: 'Compilers and optimization', credits: 4, exam: 'End-semester', due: '28 Nov 2026' },
      { id: 'CS411-MID', code: 'CS 411', title: 'Machine learning', credits: 4, exam: 'Mid-term', due: '12 Jun 2026' },
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
      { code: 'CS 402', title: 'Distributed systems', semester: 'Semester 6', students: 52 },
      { code: 'CS 406', title: 'Distributed systems lab', semester: 'Semester 6', students: 26 },
    ],
    assignments: [
      { id: 'CS402-MID', code: 'CS 402', title: 'Distributed systems', credits: 4, exam: 'Mid-term', due: '12 Jun 2026' },
      { id: 'CS406-LAB', code: 'CS 406', title: 'Distributed systems lab', credits: 2, exam: 'Lab record', due: '04 Dec 2026' },
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
    courses: [{ code: 'CS 403', title: 'Numerical methods', semester: 'Semester 3', students: 64 }],
    assignments: [
      { id: 'CS403-MID', code: 'CS 403', title: 'Numerical methods', credits: 3, exam: 'Mid-term', due: '12 Jun 2026' },
      { id: 'CS403-END', code: 'CS 403', title: 'Numerical methods', credits: 3, exam: 'End-semester', due: '28 Nov 2026' },
    ],
    createdAt: '2026-07-14T09:00:00.000Z',
  },
]

export const STUDENTS = Array.from({ length: STUDENT_NAMES.length }, (_, index) => student(index))

export const FACULTY_RECORDS = FACULTY

export const DEMO_PASSWORD = 'gradeflow'

export const DEMO_HINT = 'CS-2024-011 · FAC-408 · password gradeflow'
