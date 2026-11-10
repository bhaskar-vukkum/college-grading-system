import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { register } from '../../lib/auth'
import { DEPARTMENTS } from '../../lib/seedData'
import { PasswordField, PasswordRules, SelectField, TextField } from './Field'

const EASE = [0.22, 1, 0.36, 1]

const YEARS = ['1st year', '2nd year', '3rd year', '4th year']
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']
const DESIGNATIONS = ['Assistant professor', 'Associate professor', 'Professor', 'Lab instructor', 'Visiting faculty']

const field = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra })

const SCHEMA = {
  student: [
    {
      label: 'You',
      sub: 'Your name and the roll number the college issued.',
      fields: [
        field('name', 'Full name', { placeholder: 'Ananya Sharma', autoComplete: 'name' }),
        field('identifier', 'Roll number', { placeholder: 'CS-2024-041', spellCheck: false }),
        field('email', 'College email', { type: 'email', placeholder: 'you@college.edu', autoComplete: 'email' }),
        field('phone', 'Phone', { type: 'tel', placeholder: '98421 33041', autoComplete: 'tel' }),
      ],
    },
    {
      label: 'Course',
      sub: 'Where you sit in the college this term.',
      fields: [
        { key: 'department', label: 'Branch', type: 'select', options: DEPARTMENTS },
        { key: 'year', label: 'Year', type: 'select', options: YEARS },
        { key: 'semester', label: 'Semester', type: 'select', options: SEMESTERS },
      ],
    },
    { label: 'Password', type: 'password', sub: 'The password you will sign in with.' },
    { label: 'Review', type: 'review', sub: 'One last look before the record is created.' },
  ],
  faculty: [
    {
      label: 'You',
      sub: 'Your name and the staff ID the college issued.',
      fields: [
        field('name', 'Full name', { placeholder: 'Ramesh Iyer', autoComplete: 'name' }),
        field('identifier', 'Staff ID', { placeholder: 'FAC-408', spellCheck: false }),
        field('email', 'College email', { type: 'email', placeholder: 'you@college.edu', autoComplete: 'email' }),
        field('phone', 'Phone', { type: 'tel', placeholder: '98421 33408', autoComplete: 'tel' }),
      ],
    },
    {
      label: 'Post',
      sub: 'The branch and post you hold.',
      fields: [
        { key: 'department', label: 'Branch', type: 'select', options: DEPARTMENTS },
        { key: 'designation', label: 'Designation', type: 'select', options: DESIGNATIONS },
        field('office', 'Office', { placeholder: 'CS Block · 214' }),
        field('joined', 'Joined the college', { placeholder: '2019', inputMode: 'numeric' }),
      ],
    },
    { label: 'Password', type: 'password', sub: 'The password you will sign in with.' },
    { label: 'Review', type: 'review', sub: 'One last look before the record is created.' },
  ],
}

const strong = (value) => value.length >= 8 && /\d/.test(value) && /[A-Z]/.test(value)

export default function RegisterPanel({ profile, onComplete, onCancel }) {
  const isStudent = profile.role === 'student'
  const steps = SCHEMA[profile.role]

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({
    name: profile.name || '',
    identifier: profile.identifier || '',
    email: profile.email || '',
    phone: '',
    department: '',
    year: '1st year',
    semester: 'Semester 1',
    designation: 'Assistant professor',
    office: '',
    joined: '',
    password: '',
    confirm: '',
  })

  const set = (key) => (event) => {
    const { value } = event.target
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const current = steps[step]

  const summary = useMemo(() => {
    if (isStudent) {
      return [
        { label: 'Name', value: values.name, step: 0 },
        { label: 'Roll number', value: values.identifier, step: 0 },
        { label: 'Email', value: values.email, step: 0 },
        { label: 'Phone', value: values.phone, step: 0 },
        { label: 'Branch', value: values.department, step: 1 },
        { label: 'Year', value: values.year, step: 1 },
        { label: 'Semester', value: values.semester, step: 1 },
        { label: 'Password', value: values.password ? '••••••••' : '', step: 2 },
      ]
    }
    return [
      { label: 'Name', value: values.name, step: 0 },
      { label: 'Staff ID', value: values.identifier, step: 0 },
      { label: 'Email', value: values.email, step: 0 },
      { label: 'Phone', value: values.phone, step: 0 },
      { label: 'Branch', value: values.department, step: 1 },
      { label: 'Designation', value: values.designation, step: 1 },
      { label: 'Office', value: values.office, step: 1 },
      { label: 'Joined', value: values.joined, step: 1 },
      { label: 'Password', value: values.password ? '••••••••' : '', step: 2 },
    ]
  }, [values, isStudent])

  const validate = (index) => {
    const next = {}
    const pass = steps[index]

    if (pass.fields) {
      for (const item of pass.fields) {
        const value = String(values[item.key] || '').trim()
        if (!value) {
          next[item.key] = `Enter your ${item.label.toLowerCase()}`
          continue
        }
        if (item.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          next[item.key] = 'That email is missing something'
        }
        if (item.type === 'tel' && value.replace(/\D/g, '').length < 10) {
          next[item.key] = 'Enter a 10-digit phone number'
        }
        if (item.key === 'identifier' && value.length < 4) {
          next[item.key] = 'That ID looks too short'
        }
      }
    }

    if (pass.type === 'password') {
      if (!strong(values.password)) next.password = 'Use 8 characters, a number and a capital letter'
      if (values.confirm !== values.password) next.confirm = 'The two passwords do not match'
    }

    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) document.getElementById(`reg-${first}`)?.focus()
    return Object.keys(next).length === 0
  }

  const go = (next) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const advance = async () => {
    if (!validate(step)) return
    if (step < steps.length - 1) {
      go(step + 1)
      return
    }
    setBusy(true)
    try {
      const result = await register({
        role: profile.role,
        password: values.password,
        values: {
          name: values.name.trim(),
          identifier: values.identifier.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          department: values.department,
          ...(isStudent
            ? { year: values.year, semester: values.semester, enrolled: '2026' }
            : { designation: values.designation, office: values.office.trim(), joined: values.joined.trim() }),
        },
      })
      onComplete(result)
    } catch (error) {
      setErrors({ [error.field || 'identifier']: error.message })
      document.getElementById(`reg-${error.field || 'identifier'}`)?.focus()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-form register">
      <div className="register-top">
        <button type="button" className="link-quiet register-back" onClick={onCancel}>
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back to sign in
        </button>
        <span className="mono register-count">
          Step {step + 1} of {steps.length}
        </span>
      </div>

      <header className="auth-head">
        <h1 className="auth-title">
          {isStudent ? 'Create your student record' : 'Create your faculty record'}
        </h1>
        <p className="auth-sub">
          {current.sub}
        </p>
      </header>

      <ol className="stepper" aria-label="Registration progress">
        {steps.map((entry, index) => {
          const state = index < step ? 'done' : index === step ? 'current' : 'todo'
          return (
            <li
              key={entry.label}
              className={`stepper-item is-${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="stepper-dot">
                {state === 'done' ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              <span className="stepper-label">{entry.label}</span>
            </li>
          )
        })}
      </ol>

      <div className="stepper-line" aria-hidden="true">
        <motion.span
          animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      </div>

      <form
        className="auth-fields"
        onSubmit={(event) => {
          event.preventDefault()
          advance()
        }}
        noValidate
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="step-body"
          >
            {current.fields && (
              <>
                {current.fields.map((item, index) =>
                  item.type === 'select' ? (
                    <SelectField
                      key={item.key}
                      id={`reg-${item.key}`}
                      label={item.label}
                      value={values[item.key]}
                      onChange={set(item.key)}
                      error={errors[item.key]}
                    >
                      <option value="">Choose one</option>
                      {item.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  ) : (
                    <TextField
                      key={item.key}
                      id={`reg-${item.key}`}
                      label={item.label}
                      type={item.type}
                      placeholder={item.placeholder}
                      autoComplete={item.autoComplete}
                      inputMode={item.inputMode}
                      spellCheck={item.spellCheck}
                      value={values[item.key]}
                      onChange={set(item.key)}
                      error={errors[item.key]}
                      autoFocus={index === 0 && step === 0}
                    />
                  )
                )}
              </>
            )}

            {current.type === 'password' && (
              <>
                <PasswordField
                  id="reg-password"
                  label="Create a password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={set('password')}
                  error={errors.password}
                  autoFocus
                />
                <PasswordRules value={values.password} />
                <PasswordField
                  id="reg-confirm"
                  label="Repeat the password"
                  placeholder="Same password again"
                  autoComplete="new-password"
                  value={values.confirm}
                  onChange={set('confirm')}
                  error={errors.confirm}
                />
              </>
            )}

            {current.type === 'review' && (
              <>
                <dl className="review">
                  {summary.map((row) => (
                    <div className="review-row" key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value || '—'}</dd>
                      <button
                        type="button"
                        className="link-quiet review-edit"
                        onClick={() => go(row.step)}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </dl>
                <p className="register-note">
                  This creates your {isStudent ? 'student' : 'faculty'} record in
                  GradeFlow{isStudent ? ', with your marks added as they publish' : ', with the courses assigned to you'}.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="register-actions">
          {step > 0 && (
            <button type="button" className="btn btn--ghost" onClick={() => go(step - 1)} disabled={busy}>
              Back
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? (
              <span className="btn-busy">
                <Loader2 size={17} className="spin" /> Creating your record…
              </span>
            ) : (
              <span className="btn-busy">
                {step === steps.length - 1 ? 'Create my record' : 'Continue'}
                <ArrowRight size={17} strokeWidth={1.7} />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
