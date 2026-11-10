import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

export default function LogoutOverlay({ open, seconds, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="logout-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="logout-scrim" aria-hidden="true" />
          <motion.div
            className="logout-card"
            role="alertdialog"
            aria-live="assertive"
            aria-label="Signing out"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span className="logout-icon" aria-hidden="true">
              <LogOut size={18} strokeWidth={1.8} />
            </span>

            <div className="logout-body">
              <p className="logout-title">
                Signing out in{' '}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={seconds}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="logout-count"
                  >
                    {seconds}
                  </motion.span>
                </AnimatePresence>
              </p>
              <p className="logout-sub">Your record stays saved — you can sign back in any time.</p>
            </div>

            <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
              Stay signed in
            </button>

            <span className="logout-bar" aria-hidden="true">
              <motion.span
                key={seconds}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 0.9, ease: 'linear' }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
