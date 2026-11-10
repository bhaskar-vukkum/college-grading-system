import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import ComingSoon from './components/dashboard/ComingSoon'
import './App.css'
import './dash.css'

const StudentLayout = lazy(() => import('./pages/student/StudentLayout'))
const StudentProfile = lazy(() => import('./pages/student/Profile'))
const StudentMarks = lazy(() => import('./pages/student/Marks'))
const FacultyLayout = lazy(() => import('./pages/faculty/FacultyLayout'))
const FacultyProfile = lazy(() => import('./pages/faculty/Profile'))
const FacultyAssigned = lazy(() => import('./pages/faculty/Assignments'))

function PortalLoading() {
  return (
    <div className="dash-loading">
      <span className="dash-loading-dot" aria-hidden="true" />
      Opening your record…
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PortalLoading />}>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<Auth />} />

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="marks" element={<StudentMarks />} />
          <Route
            path="material"
            element={
              <ComingSoon
                title="Study material"
                body="Notes, problem sets and reading lists, one folder per course, will sit here. Faculty upload each item; you keep it for the term."
              />
            }
          />
          <Route
            path="transcript"
            element={
              <ComingSoon
                title="Transcript"
                body="The full record across every semester, in one printable sheet with credits, grades and the running GPA. It will export as a PDF the college signs."
              />
            }
          />
          <Route
            path="settings"
            element={
              <ComingSoon
                title="Settings"
                body="Password changes, notification choices and the email your record is sent to. Until sign-in moves to Firebase Auth, these are read-only."
              />
            }
          />
        </Route>

        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<FacultyProfile />} />
          <Route path="assigned" element={<FacultyAssigned />} />
          <Route
            path="grade"
            element={
              <ComingSoon
                title="Enter marks"
                body="Pick an assigned exam, type internal and exam marks against your student list, and publish in one action. Nothing is retyped into a second sheet."
                backTo="assigned"
                backLabel="Back to assigned exams"
              />
            }
          />
          <Route
            path="results"
            element={
              <ComingSoon
                title="Class results"
                body="The grade spread for a course once marks are in: how many passed, where the class average sits, and who is still pending."
                backTo="assigned"
                backLabel="Back to assigned exams"
              />
            }
          />
          <Route
            path="students"
            element={
              <ComingSoon
                title="Students"
                body="Everyone enrolled in the courses you teach, with their roll number, marks so far and the exams still open."
                backTo="assigned"
                backLabel="Back to assigned exams"
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
