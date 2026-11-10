import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecord } from './db'
import { readSession, saveSession } from './session'

/**
 * Loads the signed-in record for a role: the cached session first so the shell
 * paints immediately, then the record from the store so the name and marks are
 * whatever is actually saved (Firestore when it is reachable).
 */
export function usePortal(role) {
  const navigate = useNavigate()
  const session = useMemo(() => readSession(), [])
  const [record, setRecord] = useState(session?.record || null)
  const [source, setSource] = useState(session?.source || 'local')

  useEffect(() => {
    if (!session) {
      navigate('/signin', { replace: true })
      return undefined
    }
    if (session.role !== role) {
      navigate(`/${session.role}`, { replace: true })
      return undefined
    }

    let alive = true
    getRecord(role, session.id)
      .then((found) => {
        if (!alive || !found) return
        setRecord(found.record)
        setSource(found.source)
        saveSession(found.record, found.source)
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [role, session, navigate])

  return { record, source, signedIn: Boolean(session && session.role === role) }
}
