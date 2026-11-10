import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Info, Loader2 } from 'lucide-react'
import { signIn, signInWithGoogle } from '../../lib/auth'
import { PasswordField, TextField } from './Field'
import GoogleMark from './GoogleMark'

const EASE = [0.22, 1, 0.36, 1]

function RoleSwitch({ role, onChange }) {
  const options = [
    { id: 'student', label: 'Student' },
    { id: 'faculty', label: 'Faculty' },
  ]

  return (
    <div className="role-switch" role="tablist" aria-label="Sign in as">
      {options.map((option) => {
        const active = role === option.id
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`role-switch-btn${active ? ' is-active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {active && (
              <motion.span
                layoutId="role-pill"
                className="role-switch-pill"
                transition={{ duration: 0.45, ease: EASE }}
              />
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function LoginPanel({ role, onRoleChange, onResult }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState('')
  const [help, setHelp] = useState(false)

  const idRef = useRef(null)
  const pwdRef = useRef(null)

  const run = async (task, field) => {
    setError(null)
    setBusy(field)
    try {
      onResult(await task())
    } catch (err) {
      setError({ field: err.field, message: err.message })
      requestAnimationFrame(() => {
        if (err.field === 'identifier') idRef.current?.focus()
        else pwdRef.current?.focus()
      })
    } finally {
      setBusy('')
    }
  }

  const submit = (event) => {
    event.preventDefault()
    run(() => signIn({ role, identifier, password }), 'password')
  }

  return (
    <div className="auth-form">
      <RoleSwitch role={role} onChange={onRoleChange} />

      <header className="auth-head">
        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-sub">
          {role === 'student'
            ? 'Student portal · marks, GPA and transcript'
            : 'Faculty portal · courses and grade sheets'}
        </p>
      </header>

      <form className="auth-fields" onSubmit={submit} noValidate>
        <TextField
          id="identifier"
          ref={idRef}
          label={role === 'student' ? 'Student ID or email' : 'Faculty ID or email'}
          placeholder={role === 'student' ? 'CS-2024-041' : 'FAC-408'}
          autoComplete="username"
          spellCheck={false}
          value={identifier}
          error={error?.field === 'identifier' ? error.message : ''}
          onChange={(event) => setIdentifier(event.target.value)}
          disabled={Boolean(busy)}
        />

        <PasswordField
          id="password"
          ref={pwdRef}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          error={error?.field === 'password' ? error.message : ''}
          onChange={(event) => setPassword(event.target.value)}
          disabled={Boolean(busy)}
          aside={
            <button type="button" className="link-quiet" onClick={() => setHelp(true)}>
              Forgot password?
            </button>
          }
        />

        <label className="check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span className="check-box" aria-hidden="true" />
          <span>Keep me signed in on this device</span>
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={Boolean(busy)}>
          {busy === 'password' ? (
            <span className="btn-busy">
              <Loader2 size={17} className="spin" /> Checking…
            </span>
          ) : (
            <span className="btn-busy">
              Sign in
              <ArrowRight size={17} strokeWidth={1.7} />
            </span>
          )}
        </button>
      </form>

      <div className="auth-or" role="separator" aria-label="or">
        <span>Or continue with</span>
      </div>

      <button
        type="button"
        className="btn btn--google"
        onClick={() => run(() => signInWithGoogle({ role }), 'google')}
        disabled={Boolean(busy)}
      >
        {busy === 'google' ? (
          <span className="btn-busy">
            <Loader2 size={17} className="spin" /> Opening Google…
          </span>
        ) : (
          <span className="btn-busy">
            <GoogleMark />
            Continue with Google
          </span>
        )}
      </button>

      <div className="auth-help">
        <button
          type="button"
          className="link-quiet"
          aria-expanded={help}
          onClick={() => setHelp((value) => !value)}
        >
          Need help signing in?
        </button>
        {help && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="auth-help-note"
          >
            <Info size={14} strokeWidth={1.7} aria-hidden="true" />
            Accounts are issued by the department that runs your course. If your
            ID is refused, ask that office to reset it.
          </motion.p>
        )}
      </div>

      <p className="auth-preview">
        Demo records · CS-2024-011 · FAC-408 · password gradeflow
      </p>
    </div>
  )
}
