import React, { useState, useMemo } from 'react'
import './App.css'

function calculateGrade(score) {
  const numericScore = parseFloat(score)
  if (isNaN(numericScore)) return { grade: 'N/A', point: 0, status: 'Invalid' }

  if (numericScore >= 90) return { grade: 'A+', point: 4.0, status: 'Pass' }
  if (numericScore >= 80) return { grade: 'A', point: 3.7, status: 'Pass' }
  if (numericScore >= 70) return { grade: 'B', point: 3.0, status: 'Pass' }
  if (numericScore >= 60) return { grade: 'C', point: 2.0, status: 'Pass' }
  if (numericScore >= 50) return { grade: 'D', point: 1.0, status: 'Pass' }
  return { grade: 'F', point: 0.0, status: 'Fail' }
}

const initialStudents = [
  {
    id: 1,
    rollNo: 'CS-2024-001',
    name: 'Alice Johnson',
    subject: 'Data Structures',
    creditHours: 3,
    score: 92,
    grade: 'A+',
    point: 4.0,
    status: 'Pass',
  },
  {
    id: 2,
    rollNo: 'CS-2024-002',
    name: 'Bob Smith',
    subject: 'Operating Systems',
    creditHours: 4,
    score: 78,
    grade: 'B',
    point: 3.0,
    status: 'Pass',
  },
  {
    id: 3,
    rollNo: 'CS-2024-003',
    name: 'Catherine Lee',
    subject: 'Database Systems',
    creditHours: 3,
    score: 85,
    grade: 'A',
    point: 3.7,
    status: 'Pass',
  },
  {
    id: 4,
    rollNo: 'CS-2024-004',
    name: 'David Brown',
    subject: 'Computer Networks',
    creditHours: 3,
    score: 45,
    grade: 'F',
    point: 0.0,
    status: 'Fail',
  },
]

export default function App() {
  const [students, setStudents] = useState(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('All')

  // Form State
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    subject: '',
    creditHours: 3,
    score: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddRecord = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.rollNo || !formData.subject || formData.score === '') {
      alert('Please fill out all fields.')
      return
    }

    const { grade, point, status } = calculateGrade(formData.score)
    const newRecord = {
      id: Date.now(),
      rollNo: formData.rollNo.trim(),
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      creditHours: Number(formData.creditHours) || 3,
      score: Number(formData.score),
      grade,
      point,
      status,
    }

    setStudents((prev) => [newRecord, ...prev])
    setFormData({
      rollNo: '',
      name: '',
      subject: '',
      creditHours: 3,
      score: '',
    })
  }

  const handleDelete = (id) => {
    setStudents((prev) => prev.filter((item) => item.id !== id))
  }

  const subjects = useMemo(() => {
    const unique = new Set(students.map((s) => s.subject))
    return ['All', ...Array.from(unique)]
  }, [students])

  const filteredStudents = useMemo(() => {
    return students.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = filterSubject === 'All' || item.subject === filterSubject
      return matchesSearch && matchesSubject
    })
  }, [students, searchTerm, filterSubject])

  // Analytics
  const stats = useMemo(() => {
    if (students.length === 0) {
      return { total: 0, avgGpa: '0.00', passRate: '0%', avgScore: '0' }
    }

    let totalPoints = 0
    let totalCredits = 0
    let passCount = 0
    let totalScore = 0

    students.forEach((s) => {
      totalPoints += s.point * s.creditHours
      totalCredits += s.creditHours
      totalScore += s.score
      if (s.status === 'Pass') passCount++
    })

    const avgGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
    const passRate = ((passCount / students.length) * 100).toFixed(0) + '%'
    const avgScore = (totalScore / students.length).toFixed(1)

    return {
      total: students.length,
      avgGpa,
      passRate,
      avgScore,
    }
  }, [students])

  const getGradeClass = (grade) => {
    if (grade.startsWith('A')) return 'grade-A'
    if (grade.startsWith('B')) return 'grade-B'
    if (grade.startsWith('C')) return 'grade-C'
    if (grade.startsWith('D')) return 'grade-D'
    return 'grade-F'
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <h1>College Grading System</h1>
          <p>Academic performance tracker, GPA computation, and student record management</p>
        </div>
        <span className="badge">React JSX</span>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Student Records</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Cumulative GPA</span>
          <span className="stat-value">{stats.avgGpa}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">{stats.avgScore}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Passing Rate</span>
          <span className="stat-value">{stats.passRate}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Form to Add Grades */}
        <section className="card">
          <h2 className="card-title">Add Student Grade</h2>
          <form onSubmit={handleAddRecord}>
            <div className="form-group">
              <label htmlFor="rollNo">Roll / Student ID</label>
              <input
                id="rollNo"
                type="text"
                name="rollNo"
                className="form-input"
                placeholder="e.g. CS-2024-005"
                value={formData.rollNo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Student Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Emily Davis"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject / Course</label>
              <input
                id="subject"
                type="text"
                name="subject"
                className="form-input"
                placeholder="e.g. Algorithms"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="creditHours">Credit Hours</label>
              <input
                id="creditHours"
                type="number"
                name="creditHours"
                min="1"
                max="6"
                className="form-input"
                value={formData.creditHours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="score">Marks / Score (0 - 100)</label>
              <input
                id="score"
                type="number"
                name="score"
                min="0"
                max="100"
                className="form-input"
                placeholder="e.g. 88"
                value={formData.score}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit Grade
            </button>
          </form>
        </section>

        {/* Student Records List */}
        <section className="card">
          <h2 className="card-title">Grading Records</h2>
          
          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj === 'All' ? 'All Subjects' : subj}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Credits</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Point</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.rollNo}</strong></td>
                      <td>{item.name}</td>
                      <td>{item.subject}</td>
                      <td>{item.creditHours}</td>
                      <td>{item.score}%</td>
                      <td>
                        <span className={`grade-pill ${getGradeClass(item.grade)}`}>
                          {item.grade}
                        </span>
                      </td>
                      <td>{item.point.toFixed(1)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No grading records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} College Grading System &bull; Frontend React JSX</p>
      </footer>
    </div>
  )
}
