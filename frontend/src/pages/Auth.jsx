import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AuthShell from '../components/auth/AuthShell'
import LoginPanel from '../components/auth/LoginPanel'
import RegisterPanel from '../components/auth/RegisterPanel'
import { readSession, saveSession } from '../lib/session'
import { probeRemote } from '../lib/db'
import '../auth.css'

const EASE = [0.22, 1, 0.36, 1]

export default function Auth() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [view, setView] = useState('login')
  const [pending, setPending] = useState(null)

  useEffect(() => {
    const previous = document.title
    document.title = 'Sign in · GradeFlow'
    probeRemote()
    return () => {
      document.title = previous
    }
  }, [])

  // Already signed in? Straight to the portal.
  useEffect(() => {
    const session = readSession()
    if (session) navigate(`/${session.role}`, { replace: true })
  }, [navigate])

  const artRole = view === 'register' && pending ? pending.role : role

  const handleResult = (result) => {
    if (result.status === 'needs-registration') {
      setPending(result.profile)
      setView('register')
      return
    }
    saveSession(result.record, result.source)
    navigate(`/${result.record.role}`, { replace: true })
  }

  return (
    <main className="auth-page" id="main">
      <AuthShell role={artRole}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {view === 'login' && (
              <LoginPanel role={role} onRoleChange={setRole} onResult={handleResult} />
            )}

            {view === 'register' && pending && (
              <RegisterPanel
                profile={pending}
                onComplete={handleResult}
                onCancel={() => setView('login')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </AuthShell>
    </main>
  )
}
