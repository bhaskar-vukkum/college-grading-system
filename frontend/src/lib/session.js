const KEY = 'gradeflow.session.v1'

export function saveSession(record, source) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ id: record.id, role: record.role, record, source, at: Date.now() })
    )
  } catch {
    /* ignore */
  }
}

export function readSession() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
