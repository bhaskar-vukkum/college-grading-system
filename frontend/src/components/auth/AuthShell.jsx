import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../Logo'

const EASE = [0.22, 1, 0.36, 1]

const ART = {
  student: {
    src: '/login-student.webp',
    alt: 'A student writing at a desk set in an open hillside field',
  },
  faculty: {
    src: '/login-faculty.webp',
    alt: 'A teacher working through equations on a blackboard in an open field',
  },
}

export default function AuthShell({ role, children }) {
  return (
    <div className={`auth-split${role === 'faculty' ? ' is-faculty' : ''}`}>
      <motion.div layout="position" transition={{ duration: 0.6, ease: EASE }} className="auth-art">
        {Object.entries(ART).map(([key, art]) => (
          <motion.img
            key={key}
            src={art.src}
            alt={key === role ? art.alt : ''}
            aria-hidden={key === role ? undefined : 'true'}
            width={1100}
            height={1473}
            draggable={false}
            animate={{ opacity: key === role ? 1 : 0, scale: key === role ? 1 : 1.05 }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        ))}
        <span className="auth-art-grain" aria-hidden="true" />
      </motion.div>

      <motion.div layout="position" transition={{ duration: 0.6, ease: EASE }} className="auth-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-brand" aria-label="GradeFlow home">
            <Logo />
          </Link>
          <Link to="/" className="auth-back">
            <ArrowLeft size={15} strokeWidth={1.8} />
            Back to the site
          </Link>
        </div>

        <div className="auth-panel-scroll">
          <div className="auth-panel-inner">{children}</div>
        </div>
      </motion.div>
    </div>
  )
}
