/**
 * Sign-in and registration on top of the record store.
 *
 * Real Firebase Auth is not wired: accounts live as documents in `students` /
 * `faculty`, and the password is checked against a salted SHA-256 hash kept in
 * that document. Replacing this with signInWithEmailAndPassword later means
 * swapping the two functions at the bottom; nothing in the UI changes.
 */

import { hashPassword, lookupAccount, saveAccount } from './db'
import { DEMO_PASSWORD } from './seedData'

const DELAY = 420
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class AuthError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

export { DEMO_PASSWORD }

export async function signIn({ role, identifier, password }) {
  if (!identifier.trim()) throw new AuthError('Enter your ID or email', 'identifier')
  if (!password) throw new AuthError('Enter your password', 'password')

  const found = await lookupAccount(role, identifier)
  await wait(DELAY)

  if (!found) {
    return {
      status: 'needs-registration',
      profile: {
        role,
        identifier: identifier.trim(),
        name: '',
        email: identifier.includes('@') ? identifier.trim() : '',
        viaGoogle: false,
      },
    }
  }

  if (found.record.passwordHash) {
    const candidate = await hashPassword(found.record.id, password)
    if (candidate !== found.record.passwordHash) {
      throw new AuthError('That password does not match this ID', 'password')
    }
  }

  return { status: 'signed-in', record: found.record, source: found.source }
}

export async function signInWithGoogle({ role }) {
  await wait(700)
  return {
    status: 'needs-registration',
    profile: {
      role,
      identifier: '',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@college.edu',
      viaGoogle: true,
    },
  }
}

export async function register({ role, values, password }) {
  const id = values.identifier.trim().toUpperCase()

  const existing = await lookupAccount(role, id)
  if (existing) {
    throw new AuthError('That ID already has a record — sign in instead', 'identifier')
  }

  const record = {
    ...values,
    id,
    identifier: id,
    role,
    passwordHash: await hashPassword(id, password),
    createdAt: new Date().toISOString(),
    ...(role === 'student' ? { marks: [], credits: 0, gpa: 0 } : { courses: [], assignments: [] }),
  }

  const saved = await saveAccount(record)
  await wait(DELAY)

  return { status: 'signed-in', record, source: saved.source }
}
