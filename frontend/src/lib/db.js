/**
 * Record store — Firestore REST.
 *
 * Talks to the Firestore REST API directly so the portal does not carry the
 * Firestore SDK. This project's database is locked (`PERMISSION_DENIED` for read
 * and write), so every call falls back to a local store seeded with the demo
 * records in seedData.js. Apply firestore.rules.demo and run `npm run seed` and
 * the same code starts reading the real documents.
 */

import { firebaseConfig } from '../firebase'
import { DEMO_PASSWORD, FACULTY_RECORDS, STUDENTS } from './seedData'

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`
const KEY = firebaseConfig.apiKey
const COLLECTIONS = { student: 'students', faculty: 'faculty' }
const LOCAL_KEY = 'gradeflow.records.v2'
const TIMEOUT = 5000
const REMOTE_FLAG = 'gradeflow.remote.v2'

/** Stops hammering a database we already know refuses us, across reloads too. */
let remoteUsable = (() => {
  try {
    return sessionStorage.getItem(REMOTE_FLAG) !== 'blocked'
  } catch {
    return true
  }
})()

function blockRemote() {
  remoteUsable = false
  try {
    sessionStorage.setItem(REMOTE_FLAG, 'blocked')
  } catch {
    /* ignore */
  }
}

function allowRemote() {
  remoteUsable = true
  try {
    sessionStorage.removeItem(REMOTE_FLAG)
  } catch {
    /* ignore */
  }
}

/* --- typed values ---------------------------------------------------- */

function decodeFields(fields) {
  const record = {}
  for (const [key, value] of Object.entries(fields || {})) record[key] = decodeValue(value)
  return record
}

function decodeValue(value) {
  if (!value) return null
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('timestampValue' in value) return value.timestampValue
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue)
  if ('mapValue' in value) return decodeFields(value.mapValue.fields)
  return null
}

function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } }
  return { mapValue: { fields: encodeFields(value) } }
}

function encodeFields(object) {
  const fields = {}
  for (const [key, value] of Object.entries(object)) fields[key] = encodeValue(value)
  return fields
}

/* --- transport -------------------------------------------------------- */

async function request(url, options = {}) {
  if (!remoteUsable) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (response.status === 404) return null
    if (!response.ok) {
      blockRemote()
      return null
    }
    return await response.json()
  } catch {
    blockRemote()
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function findRemote(role, identifier) {
  if (!remoteUsable) return null
  const name = COLLECTIONS[role]
  const key = identifier.trim()
  if (!key) return null

  for (const id of [key.toUpperCase(), key]) {
    const document = await request(`${BASE}/${name}/${encodeURIComponent(id)}?key=${KEY}`)
    if (document?.fields) return decodeFields(document.fields)
  }

  const body = {
    structuredQuery: {
      from: [{ collectionId: name }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'email' },
          op: 'EQUAL',
          value: { stringValue: key.toLowerCase() },
        },
      },
      limit: 1,
    },
  }

  const result = await request(`${BASE}:runQuery?key=${KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (Array.isArray(result) && result[0]?.document?.fields) {
    return decodeFields(result[0].document.fields)
  }
  return null
}

/* --- local store ------------------------------------------------------- */

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(records) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(records))
  } catch {
    /* storage full or blocked: the session still carries the record */
  }
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function hashPassword(id, password) {
  return sha256(`${String(id).trim().toLowerCase()}:${password}`)
}

let seeding = null

async function localRecords() {
  const existing = readLocal()
  if (existing && Object.keys(existing).length > 0) return existing
  if (!seeding) {
    seeding = (async () => {
      const records = {}
      for (const student of STUDENTS) {
        records[student.id] = {
          ...student,
          passwordHash: await hashPassword(student.id, DEMO_PASSWORD),
        }
      }
      for (const faculty of FACULTY_RECORDS) {
        records[faculty.id] = {
          ...faculty,
          passwordHash: await hashPassword(faculty.id, DEMO_PASSWORD),
        }
      }
      writeLocal(records)
      return records
    })()
  }
  return seeding
}

/* --- public API --------------------------------------------------------- */

/**
 * One cheap read to learn whether the database answers, run when a page mounts
 * so a sign-in never waits on a probe it could have done earlier.
 */
export async function probeRemote() {
  if (!remoteUsable) return false
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1600)
  try {
    const response = await fetch(`${BASE}/students?key=${KEY}&pageSize=1`, {
      signal: controller.signal,
    })
    if (response.ok) {
      allowRemote()
      return true
    }
    blockRemote()
    return false
  } catch {
    blockRemote()
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function lookupAccount(role, identifier) {  const remote = await findRemote(role, identifier)
  if (remote) return { record: remote, source: 'firebase' }

  const records = await localRecords()
  const key = identifier.trim()
  const byId = records[key] || records[key.toUpperCase()]
  if (byId && byId.role === role) return { record: byId, source: 'local' }

  const byEmail = Object.values(records).find(
    (record) => record.role === role && record.email?.toLowerCase() === key.toLowerCase()
  )
  if (byEmail) return { record: byEmail, source: 'local' }

  return null
}

export async function getRecord(role, id) {
  const remote = await findRemote(role, id)
  if (remote) return { record: remote, source: 'firebase' }

  const records = await localRecords()
  const record = records[id] || records[id.toUpperCase()]
  return record ? { record, source: 'local' } : null
}

export async function saveAccount(record) {
  const name = COLLECTIONS[record.role]
  if (remoteUsable) {
    const url = `${BASE}/${name}/${encodeURIComponent(record.id)}?key=${KEY}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fields: encodeFields(JSON.parse(JSON.stringify(record))) }),
        signal: controller.signal,
      })
      if (response.ok) {
        allowRemote()
        return { source: 'firebase' }
      }
      blockRemote()
    } catch {
      blockRemote()
    } finally {
      clearTimeout(timer)
    }
  }

  const records = await localRecords()
  records[record.id] = record
  writeLocal(records)
  return { source: 'local' }
}

export async function listRecords(role) {
  if (remoteUsable) {
    const result = await request(`${BASE}/${COLLECTIONS[role]}?key=${KEY}`)
    if (result?.documents) {
      return {
        records: result.documents.map((entry) => decodeFields(entry.fields)),
        source: 'firebase',
      }
    }
  }
  const records = await localRecords()
  return {
    records: Object.values(records).filter((record) => record.role === role),
    source: 'local',
  }
}

export function dataSource() {
  return remoteUsable ? 'firebase' : 'local'
}
