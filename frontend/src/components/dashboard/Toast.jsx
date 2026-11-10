import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

export default function Toast({ message, tone = 'ok' }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`toast${tone === 'error' ? ' is-error' : ''}`}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <span className="toast-mark" aria-hidden="true">
            <Check size={12} strokeWidth={3} />
          </span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
