#!/usr/bin/env node
/**
 * Writes the demo records to Firestore through the REST API.
 *
 *   npm run seed
 *
 * Needs the database rules to allow writes for now:
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /{document=**} { allow read, write: if true; }
 *     }
 *   }
 * (Firebase console → Firestore → Rules, or `firebase deploy --only firestore:rules`
 * with firestore.rules.demo.) Replace those rules with authenticated ones before
 * the app carries real student data.
 */

import { createHash } from 'node:crypto'
import { DEMO_PASSWORD, FACULTY_RECORDS, STUDENTS } from '../src/lib/seedData.js'

const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyDhSFA1OdS0gQBFl43JkF0fT75jtXpbWig'
const PROJECT = process.env.FIREBASE_PROJECT || 'college-grading-system-2b09e'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

const hash = (id, password) =>
  createHash('sha256').update(`${String(id).toLowerCase()}:${password}`).digest('hex')

function encode(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } }
  return { mapValue: { fields: encodeObject(value) } }
}

function encodeObject(object) {
  const fields = {}
  for (const [key, value] of Object.entries(object)) fields[key] = encode(value)
  return fields
}

async function put(collection, document) {
  const url = `${BASE}/${collection}/${encodeURIComponent(document.id)}?key=${API_KEY}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fields: encodeObject(document) }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(`${response.status} ${body.error?.status || ''} ${body.error?.message || ''}`.trim())
  }
}

async function main() {
  const passwordHash = hash('placeholder', DEMO_PASSWORD)
  void passwordHash

  const jobs = [
    ...STUDENTS.map((student) => ({
      collection: 'students',
      id: student.id,
      document: { ...student, passwordHash: hash(student.id, DEMO_PASSWORD) },
    })),
    ...FACULTY_RECORDS.map((faculty) => ({
      collection: 'faculty',
      id: faculty.id,
      document: { ...faculty, passwordHash: hash(faculty.id, DEMO_PASSWORD) },
    })),
  ]

  let written = 0
  for (const job of jobs) {
    try {
      await put(job.collection, job.document)
      written += 1
      process.stdout.write(`  ok   ${job.collection}/${job.id}\n`)
    } catch (error) {
      process.stdout.write(`  fail ${job.collection}/${job.id} — ${error.message}\n`)
      if (error.message.includes('403')) {
        console.log(
          '\nFirestore refused the write. Open Firebase console → Firestore → Rules and use the\n' +
            'temporary rules in firestore.rules.demo, then run `npm run seed` again.\n' +
            'The app keeps working from its local store until then.'
        )
        process.exitCode = 1
        return
      }
    }
  }

  console.log(`\nSeeded ${written} of ${jobs.length} records into ${PROJECT}.`)
  console.log(`Demo password for every seeded account: ${DEMO_PASSWORD}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
