import { initializeApp } from 'firebase/app'

// Firebase project for GradeFlow. Authentication is not wired yet: the sign-in
// page is a shell until the auth flow lands, but this app instance is ready for
// getAuth / getFirestore when it does.
export const firebaseConfig = {
  apiKey: 'AIzaSyDhSFA1OdS0gQBFl43JkF0fT75jtXpbWig',
  authDomain: 'college-grading-system-2b09e.firebaseapp.com',
  projectId: 'college-grading-system-2b09e',
  storageBucket: 'college-grading-system-2b09e.firebasestorage.app',
  messagingSenderId: '547674787345',
  appId: '1:547674787345:web:282745f6dc3130fc5febb0',
}

export const app = initializeApp(firebaseConfig)

// Next step, once the auth flow is ready:
//   import { getAuth } from 'firebase/auth'
//   export const auth = getAuth(app)
