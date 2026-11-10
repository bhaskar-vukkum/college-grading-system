import React from 'react'
import { LayoutGrid, BookOpen, FileText, Settings } from 'lucide-react'
import Logo from './Logo'

const courses = [
  { code: 'CS 401', name: 'Compilers and optimization', credits: 4, grade: 'A', posted: true },
  { code: 'CS 402', name: 'Distributed systems', credits: 4, grade: 'A\u2212', posted: true },
  { code: 'CS 403', name: 'Numerical methods', credits: 3, grade: 'B+', posted: true },
  { code: 'CS 411', name: 'Machine learning', credits: 4, grade: 'A', posted: true },
  { code: 'HS 208', name: 'Technical writing', credits: 2, grade: 'B', posted: true },
  { code: 'CS 405', name: 'Compilers lab', credits: 2, grade: 'P', posted: false },
]

export default function GradeWindow() {
  return (
    <div
      className="win"
      role="img"
      aria-label="The GradeFlow student record: seven courses with credits, grades and publication status."
    >
      <div className="win-bar">
        <div className="win-bar-left">
          <Logo />
          <span className="win-sep" />
          <span>Student record</span>
        </div>
        <span className="win-chip">Autumn 2026</span>
      </div>

      <div className="win-body">
        <div className="win-rail">
          <span className="rail-item is-active">
            <LayoutGrid size={14} strokeWidth={1.7} />
            Overview
          </span>
          <span className="rail-item">
            <BookOpen size={14} strokeWidth={1.7} />
            Courses
          </span>
          <span className="rail-item">
            <FileText size={14} strokeWidth={1.7} />
            Transcript
          </span>
          <span className="rail-item">
            <Settings size={14} strokeWidth={1.7} />
            Settings
          </span>
        </div>

        <div className="win-main">
          <div className="win-head">
            <div>
              <p className="win-title">Ananya Sharma</p>
              <p className="win-sub">CS-2024-041 &middot; B.Tech CSE &middot; Semester 5</p>
            </div>
            <span className="mono">19 credits</span>
          </div>

          <table className="win-table">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col" className="col-credits">
                  Credits
                </th>
                <th scope="col" className="col-grade">
                  Grade
                </th>
                <th scope="col" className="col-status">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.code}>
                  <td>
                    <span className="course">
                      <span className="course-code">{course.code}</span>
                      <span className="course-name">{course.name}</span>
                    </span>
                  </td>
                  <td className="col-credits">{course.credits}</td>
                  <td className="col-grade grade">{course.grade}</td>
                  <td className="col-status">
                    <span className={`status${course.posted ? '' : ' is-pending'}`}>
                      {course.posted ? 'Posted' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
