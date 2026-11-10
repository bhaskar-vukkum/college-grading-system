import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecord, subscribeRecord } from './db'
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
  const [syncError, setSyncError] = useState('')

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
    let unsubscribe = () => {}
    getRecord(role, session.id, { requireRemote: session.source === 'firebase' })
      .then((found) => {
        if (!alive || !found) return
        setRecord(found.record)
        setSource(found.source)
        saveSession(found.record, found.source)
        if (found.source === 'firebase') {
          unsubscribe = subscribeRecord(
            role,
            session.id,
            (updated) => {
              if (!alive) return
              setRecord(updated)
              setSource('firebase')
              saveSession(updated, 'firebase')
              setSyncError('')
            },
            (error) => {
              if (!alive) return
              console.error('Unable to receive live Firebase record updates', error)
              setSyncError('Live Firebase updates are unavailable. Reload to try again.')
            }
          )
        }
      })
      .catch((error) => {
        if (!alive) return
        console.error('Unable to load the signed-in Firebase record', error)
        setSyncError('Your latest record could not be loaded. Reload to try again.')
      })

    return () => {
      alive = false
      unsubscribe()
    }
  }, [role, session, navigate])

  const updateRecord = useCallback(
    (updated) => {
      setRecord(updated)
      saveSession(updated, source)
    },
    [source]
  )

  return {
    record,
    source,
    syncError,
    updateRecord,
    signedIn: Boolean(session && session.role === role),
  }
}
