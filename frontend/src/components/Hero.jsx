import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import GradeWindow from './GradeWindow'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow" data-enter>
              College grade portal
            </p>

            <h1 className="h1" data-enter="2">
              The grade portal for students and faculty
            </h1>

            <p className="lead" data-enter="3">
              Course marks, semester GPA and the transcript, in one record.
              Faculty enter the marks once; students read the same numbers.
            </p>

            <div className="hero-actions" data-enter="4">
              <Link to="/signin" className="btn btn--primary">
                Sign in to your portal
                <ArrowRight size={17} strokeWidth={1.7} />
              </Link>
              <a href="#product" className="btn btn--ghost">
                See the grade book
              </a>
            </div>

            <p className="hero-proof" data-enter="4">
              <ShieldCheck size={16} strokeWidth={1.7} />
              One sign-in for students, faculty and administrators
            </p>
          </div>

          <div className="hero-art" data-enter="art">
            <GradeWindow />
            <div className="hero-card">
              <p className="hero-card-label">Semester GPA</p>
              <p className="hero-card-value">3.69</p>
              <div className="hero-card-row">
                <span>17 credits graded</span>
                <span className="hero-card-delta">+0.14</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
