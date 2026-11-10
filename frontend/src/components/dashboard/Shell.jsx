import React, { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Logo from '../Logo'
import { clearSession } from '../../lib/session'
import LogoutOverlay from './LogoutOverlay'

const COUNTDOWN = 3

const dateLabel = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
}).format(new Date())

export default function Shell({ record, items, source, context, children }) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [seconds, setSeconds] = useState(COUNTDOWN)
  const navigate = useNavigate()
  const location = useLocation()

  const active = items.find((item) => location.pathname.endsWith(`/${item.to}`)) || items[0]

  const initials =
    record.name
      ?.split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '—'

  useEffect(() => {
    if (!loggingOut) {
      setSeconds(COUNTDOWN)
      return undefined
    }
    if (seconds <= 0) {
      clearSession()
      navigate('/signin', { replace: true })
      return undefined
    }
    const timer = setTimeout(() => setSeconds((value) => value - 1), 900)
    return () => clearTimeout(timer)
  }, [loggingOut, seconds, navigate])

  return (
    <div className="dash">
      <aside className={`dash-side${open ? ' is-open' : ''}`} id="portal-nav">
        <div className="dash-side-head">
          <span className="dash-brand" aria-label="GradeFlow">
            <Logo />
          </span>
          <p className="dash-portal">
            {record.role === 'student' ? 'Student portal' : 'Faculty portal'}
          </p>
          {context ? <p className="dash-context">{context}</p> : null}
        </div>

        <nav className="dash-nav" aria-label="Portal sections">
          <p className="dash-nav-label">Portal</p>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `dash-link${isActive ? ' is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="dash-side-foot">
          <div className="dash-user">
            <span className="dash-avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="dash-user-text">
              <strong>{record.name}</strong>
              <small>{record.id}</small>
            </span>
          </div>
          <button
            type="button"
            className="dash-logout"
            onClick={() => setLoggingOut(true)}
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="dash-scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="dash-main">
        <header className="dash-top">
          <button
            type="button"
            className="dash-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="portal-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
          </button>

          <div className="dash-title-wrap">
            <h1 className="dash-title">{active.label}</h1>
            <p className="dash-sub">{active.sub}</p>
          </div>

          <div className="dash-top-right">
            <span className="dash-chip dash-date">{dateLabel}</span>
            <span
              className={`dash-source${source === 'firebase' ? ' is-live' : ''}`}
              title={
                source === 'firebase'
                  ? 'Reading and writing Firestore'
                  : 'Firestore refused the request, so this session reads the local records'
              }
            >
              {source === 'firebase' ? 'Firestore' : 'Local demo'}
            </span>
            <span className="dash-avatar dash-avatar--top" aria-hidden="true">
              {initials}
            </span>
          </div>
        </header>

        <div className="dash-body">{children}</div>
      </div>

      <LogoutOverlay
        open={loggingOut}
        seconds={seconds}
        onCancel={() => setLoggingOut(false)}
      />
    </div>
  )
}
