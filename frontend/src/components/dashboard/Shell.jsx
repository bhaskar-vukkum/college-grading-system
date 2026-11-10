import React, { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Logo from '../Logo'
import { clearSession } from '../../lib/session'

export default function Shell({ record, items, source, children }) {
  const [open, setOpen] = useState(false)
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

  const logout = () => {
    clearSession()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="dash">
      <aside className={`dash-side${open ? ' is-open' : ''}`} id="portal-nav">
        <div className="dash-side-head">
          <Link to="/" className="dash-brand" aria-label="GradeFlow home">
            <Logo />
          </Link>
          <span className="dash-portal">
            {record.role === 'student' ? 'Student portal' : 'Faculty portal'}
          </span>
        </div>

        <nav className="dash-nav" aria-label="Portal sections">
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
          <button type="button" className="dash-logout" onClick={logout}>
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
            <span
              className={`dash-source${source === 'firebase' ? ' is-live' : ''}`}
              title={
                source === 'firebase'
                  ? 'Reading from Firestore'
                  : 'Firestore refused the request, so this session reads the local demo records'
              }
            >
              {source === 'firebase' ? 'Firestore' : 'Local demo'}
            </span>
            {record.role === 'student' && record.semester ? (
              <span className="dash-chip">{record.semester}</span>
            ) : null}
          </div>
        </header>

        <div className="dash-body">{children}</div>
      </div>
    </div>
  )
}
