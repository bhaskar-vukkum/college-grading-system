import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'

/* ---------------------------------------------------------------- */
/* Product — the faculty sheet                                       */
/* ---------------------------------------------------------------- */

const rows = [
  { name: 'Ananya Sharma', roll: 'CS-2024-041', ca1: 18, ca2: 17, exam: 52, total: 87, grade: 'A' },
  { name: 'Rohan Mehta', roll: 'CS-2024-052', ca1: 16, ca2: 15, exam: 48, total: 79, grade: 'B+' },
  { name: 'Kavya Nair', roll: 'CS-2024-047', ca1: 19, ca2: 18, exam: 55, total: 92, grade: 'A+', active: true },
  { name: 'Arjun Rao', roll: 'CS-2024-063', ca1: 14, ca2: 13, exam: 44, total: 71, grade: 'B' },
  { name: 'Meera Iyer', roll: 'CS-2024-058', ca1: 12, ca2: 14, exam: 38, total: 64, grade: 'B\u2212' },
  { name: 'Devansh Patel', roll: 'CS-2024-069', ca1: 17, ca2: 16, exam: 51, total: 84, grade: 'A\u2212' },
]

export function Product() {
  return (
    <section className="section" id="product">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Product</p>
            <h2 className="h2" style={{ marginTop: 18 }}>
              Enter marks once. Publish the same numbers.
            </h2>
          </div>
          <p className="lead">
            Faculty work in one sheet: continuous assessment, the exam and the
            grade it produces. The student&rsquo;s record reads from it, so
            nothing is retyped and nothing drifts.
          </p>
        </div>

        <div
          className="entry-frame"
          role="img"
          aria-label="The GradeFlow faculty sheet for CS 401 Compilers and optimization: six students with continuous assessment, exam, total and grade, and a publish action."
        >
          <div className="entry-bar">
            <div className="entry-title">
              <strong>CS 401 &middot; Compilers and optimization</strong>
              <span className="mono">Mid-term and exam</span>
            </div>
            <div className="entry-bar-right">
              <span className="win-chip">48 students</span>
              <span className="btn btn--primary btn--sm">
                Publish results
                <ArrowRight size={15} strokeWidth={1.7} />
              </span>
            </div>
          </div>

          <table className="entry-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col" className="num col-ca">
                  CA 1
                </th>
                <th scope="col" className="num col-ca">
                  CA 2
                </th>
                <th scope="col" className="num col-exam">
                  Exam
                </th>
                <th scope="col" className="num">
                  Total
                </th>
                <th scope="col" className="num col-grade">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.roll} className={row.active ? 'is-active' : undefined}>
                  <td>
                    <span className="entry-student">
                      <span className="entry-avatar">
                        {row.name.split(' ').map((part) => part[0]).join('')}
                      </span>
                      <span>
                        {row.name}
                        <span className="entry-roll"> &middot; {row.roll}</span>
                      </span>
                    </span>
                  </td>
                  <td className="num col-ca">{row.ca1}</td>
                  <td className="num col-ca">{row.ca2}</td>
                  <td className="num col-exam">{row.exam}</td>
                  <td className="num">{row.total}</td>
                  <td className="grade-cell col-grade">{row.grade}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}>
                  Class average 79.5 &middot; 46 of 48 graded &middot; last saved
                  09:41
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */
/* Feature cards                                                     */
/* ---------------------------------------------------------------- */

function LineViz() {
  return (
    <svg className="viz-line" viewBox="0 0 120 46" aria-hidden="true">
      <path
        d="M4 32 L60 24 L116 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="4" cy="32" r="2.2" fill="currentColor" />
      <circle cx="60" cy="24" r="2.2" fill="currentColor" />
      <circle cx="116" cy="10" r="2.2" fill="currentColor" />
    </svg>
  )
}

export function Features() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">What it keeps straight</p>
            <h2 className="h2" style={{ marginTop: 18 }}>
              Three things a record has to get right
            </h2>
          </div>
          <p className="lead">
            Credits, grades and the terms behind them. The portal holds the same
            facts for the student who reads them and the faculty member who sets
            them.
          </p>
        </div>

        <div className="cards">
          <article className="card">
            <div className="card-viz" aria-hidden="true">
              <div className="viz-row">
                <span className="viz-code">CS 401</span>
                <span className="viz-grade">A</span>
              </div>
              <div className="viz-row">
                <span className="viz-code">CS 402</span>
                <span className="viz-grade">A&minus;</span>
              </div>
              <div className="viz-row">
                <span className="viz-code">CS 403</span>
                <span className="viz-grade">B+</span>
              </div>
            </div>
            <span className="card-index">01</span>
            <h3>Marks you can read</h3>
            <p>
              Course marks, credits and results, shown with the grading that
              produced them.
            </p>
          </article>

          <article className="card">
            <div className="card-viz" aria-hidden="true">
              <LineViz />
              <div className="viz-terms">
                <span>AUT 25</span>
                <span>SPR 26</span>
                <span>AUT 26</span>
              </div>
            </div>
            <span className="card-index">02</span>
            <h3>Semesters in a row</h3>
            <p>
              Follow your GPA term by term and see how this one moved it.
            </p>
          </article>

          <article className="card">
            <div className="card-viz" aria-hidden="true">
              <div className="viz-chips">
                <span className="viz-chip is-on">Student</span>
                <span className="viz-chip">Faculty</span>
              </div>
              <div className="viz-row">
                <span className="viz-code">One record</span>
                <span className="viz-grade">CS 401 &middot; A</span>
              </div>
            </div>
            <span className="card-index">03</span>
            <h3>One record, two roles</h3>
            <p>
              Students and faculty read the same sheet instead of keeping
              separate copies of it.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */
/* The dealt moment: a colour line climbs the panel                  */
/* ---------------------------------------------------------------- */

export function Moment() {
  const panelRef = useRef(null)
  const inkRefs = useRef([])
  const paperRefs = useRef([])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const ink = inkRefs.current.filter(Boolean)
    const paper = paperRefs.current.filter(Boolean)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      panel.style.setProperty('--flood', '1')
      ink.forEach((el) => {
        el.style.opacity = '0'
      })
      paper.forEach((el) => el.classList.add('is-lit'))
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = panel.getBoundingClientRect()
      const vh = window.innerHeight
      const span = Math.max(1, vh * 0.72)
      const p = Math.min(1, Math.max(0, (vh - rect.top) / span))
      panel.style.setProperty('--flood', p.toFixed(4))

      const edge = rect.height * (1 - p)
      panel.classList.toggle('is-done', p >= 0.985)

      ink.forEach((el) => {
        const box = el.getBoundingClientRect()
        const bottom = box.bottom - rect.top
        let o = 1
        if (edge <= bottom) o = 0
        else if (edge < bottom + 24) o = (edge - bottom) / 24
        el.style.opacity = o.toFixed(3)
      })

      paper.forEach((el) => {
        const top = el.getBoundingClientRect().top - rect.top
        el.classList.toggle('is-lit', edge <= top + 4)
      })
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="moment" data-moment="line-carries-colour" id="record">
      <div className="moment-panel" ref={panelRef}>
        <div className="moment-layer moment-layer--ink">
          <p className="eyebrow" ref={(el) => { inkRefs.current[0] = el }}>
            One record
          </p>
          <h2 className="h2" ref={(el) => { inkRefs.current[1] = el }}>
            Published once, read the same way
          </h2>
          <p className="lead" ref={(el) => { inkRefs.current[2] = el }}>
            Faculty enter the marks. The student&rsquo;s record shows the same
            credits, the same scale and the same date, because it is the same
            record. Nobody retypes a grade into a second system.
          </p>
          <p className="mono moment-foot" ref={(el) => { inkRefs.current[3] = el }}>
            Semester 5 &middot; Autumn 2026 &middot; 19 credits
          </p>
        </div>

        <div className="moment-flood" aria-hidden="true">
          <div className="moment-layer">
            <p className="eyebrow" data-lit ref={(el) => { paperRefs.current[0] = el }}>
              One record
            </p>
            <h2 className="h2" data-lit ref={(el) => { paperRefs.current[1] = el }}>
              Published once, read the same way
            </h2>
            <p className="lead" data-lit ref={(el) => { paperRefs.current[2] = el }}>
              Faculty enter the marks. The student&rsquo;s record shows the same
              credits, the same scale and the same date, because it is the same
              record. Nobody retypes a grade into a second system.
            </p>
            <p className="mono moment-foot" data-lit ref={(el) => { paperRefs.current[3] = el }}>
              Semester 5 &middot; Autumn 2026 &middot; 19 credits
            </p>
          </div>
        </div>

        <span className="moment-line" aria-hidden="true" />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */
/* FAQ                                                               */
/* ---------------------------------------------------------------- */

const faqItems = [
  {
    id: 1,
    q: 'What is GradeFlow?',
    a: 'A college grading platform that holds course marks, semester GPA and the transcript record in one place, for students and faculty.',
  },
  {
    id: 2,
    q: 'Who can access the platform?',
    a: 'Students, faculty members and administrators who have been issued login credentials. Access follows the role on the account.',
  },
  {
    id: 3,
    q: 'How do students check their grades?',
    a: 'Sign in and open the record. Each course shows the credits, the grade and whether the result has been published for that term.',
  },
  {
    id: 4,
    q: 'Can faculty members manage grades?',
    a: 'Faculty accounts reach the grading sheet for the courses they teach, where marks are entered and the results are published.',
  },
  {
    id: 5,
    q: 'Is my academic information secure?',
    a: 'Records sit behind authenticated accounts, so a student sees their own record and faculty see the courses assigned to them.',
  },
  {
    id: 6,
    q: 'When does a result appear?',
    a: 'A grade shows on the record once faculty publish the course. Until then the row stays pending, with the marks that have been entered so far.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(1)

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="faq-grid">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2" style={{ marginTop: 18 }}>
              Before your first sign-in
            </h2>
            <p className="lead" style={{ marginTop: 16, fontSize: 17 }}>
              Five things worth knowing about access, marks and who sees what.
            </p>

            <aside className="faq-aside">
              <p className="mono">If a mark looks wrong</p>
              <p className="faq-aside-text">
                Results are published by the department that runs the course.
                Raise the mark with the course faculty before the term is
                closed.
              </p>
            </aside>
          </div>

          <div className="faq-list">
            {faqItems.map((item) => {
              const isOpen = open === item.id
              return (
                <div key={item.id} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${item.id}`}
                    onClick={() => setOpen(isOpen ? 0 : item.id)}
                  >
                    <span className="faq-q">{item.q}</span>
                    <Plus size={18} strokeWidth={1.6} className="faq-icon" aria-hidden="true" />
                  </button>
                  <div className="faq-answer" id={`faq-${item.id}`}>
                    <p>{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */
/* Footer                                                            */
/* ---------------------------------------------------------------- */

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-cta">
          <p className="eyebrow">Start here</p>
          <h2 className="h1">Open your record</h2>
          <div className="close-actions">
            <Link to="/signin" className="btn btn--primary">
              Sign in to your portal
              <ArrowRight size={17} strokeWidth={1.7} />
            </Link>
            <a href="#faq" className="btn btn--ghost">
              Read the questions first
            </a>
          </div>
        </div>

        <div className="footer-row">
          <p className="footer-statement">
            The record your college keeps, readable by the people in it.
          </p>
          <nav className="footer-links" aria-label="Footer">
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
            <Link to="/signin">Sign in</Link>
          </nav>
        </div>

        <div className="footer-legal">
          <span>&copy; 2026 GradeFlow</span>
          <span>Built by Bhaskar</span>
        </div>
      </div>
    </footer>
  )
}
