import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import Logo from './Logo'

const links = [
  { label: 'Product', id: 'product' },
  { label: 'How it works', id: 'how' },
  { label: 'FAQ', id: 'faq' },
]

export default function Navbar({ variant = 'site' }) {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => {
      setStuck(window.scrollY > 8)
      if (variant !== 'site') return
      const probe = window.scrollY + 200
      let current = ''
      for (const link of links) {
        const el = document.getElementById(link.id)
        if (el && probe >= el.getBoundingClientRect().top + window.scrollY) {
          current = link.id
        }
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const go = (id) => {
    setOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`nav${variant === 'auth' ? ' nav--auth' : ''}${stuck ? ' is-stuck' : ''}`}>
      <div className="wrap">
        <div className="nav-inner">
          <Link to="/" className="brand-link" aria-label="GradeFlow home">
            <Logo />
          </Link>

          {variant === 'site' && (
            <nav className="nav-links" aria-label="Sections">
              {links.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className={`nav-link${active === link.id ? ' is-active' : ''}`}
                  onClick={() => go(link.id)}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}

          <div className="nav-right">
            {variant === 'site' ? (
              <Link to="/signin" className="btn btn--primary btn--sm">
                Sign in
                <ArrowRight size={16} strokeWidth={1.7} />
              </Link>
            ) : (
              <Link to="/" className="btn btn--ghost btn--sm">
                Back to the site
              </Link>
            )}
            {variant === 'site' && (
              <button
                type="button"
                className="nav-toggle"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X size={18} strokeWidth={1.7} /> : <Menu size={18} strokeWidth={1.7} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {open && variant === 'site' && (
        <div className="nav-drawer">
          <div className="wrap">
            {links.map((link) => (
              <button key={link.id} type="button" onClick={() => go(link.id)}>
                {link.label}
              </button>
            ))}
            <Link to="/signin">Sign in</Link>
          </div>
        </div>
      )}
    </header>
  )
}
