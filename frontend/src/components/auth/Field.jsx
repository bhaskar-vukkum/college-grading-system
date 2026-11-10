import React, { forwardRef, useId, useState } from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'

export function Field({ id, label, error, aside, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const TextField = forwardRef(function TextField(
  { id, label, error, aside, ...props },
  ref
) {
  return (
    <Field id={id} label={label} error={error} aside={aside}>
      <input ref={ref} id={id} className="input" aria-invalid={Boolean(error)} {...props} />
    </Field>
  )
})

export const PasswordField = forwardRef(function PasswordField(
  { id, label, error, aside, ...props },
  ref
) {
  const [visible, setVisible] = useState(false)
  return (
    <Field id={id} label={label} error={error} aside={aside}>
      <div className="input-wrap">
        <input
          ref={ref}
          id={id}
          className="input input--password"
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          className="input-action"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
        </button>
      </div>
    </Field>
  )
})

export function SelectField({ id, label, error, children, ...props }) {
  const generated = useId()
  const fieldId = id || generated
  return (
    <Field id={fieldId} label={label} error={error}>
      <select id={fieldId} className="input select" aria-invalid={Boolean(error)} {...props}>
        {children}
      </select>
    </Field>
  )
}

export function PasswordRules({ value }) {
  const rules = [
    { label: 'At least 8 characters', pass: value.length >= 8 },
    { label: 'One number', pass: /\d/.test(value) },
    { label: 'One capital letter', pass: /[A-Z]/.test(value) },
  ]

  return (
    <ul className="rules">
      {rules.map((rule) => (
        <li key={rule.label} className={rule.pass ? 'is-pass' : undefined}>
          <span className="rules-mark" aria-hidden="true">
            <Check size={11} strokeWidth={2.6} />
          </span>
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
