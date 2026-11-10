import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyDhSFA1OdS0gQBFl43JkF0fT75jtXpbWig',
  authDomain: 'college-grading-system-2b09e.firebaseapp.com',
  projectId: 'college-grading-system-2b09e',
  storageBucket: 'college-grading-system-2b09e.firebasestorage.app',
  messagingSenderId: '547674787345',
  appId: '1:547674787345:web:282745f6dc3130fc5febb0',
}

export const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)
