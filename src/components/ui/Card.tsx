import { type ReactNode } from 'react'
import { motion } from 'motion/react'

interface CardProps {
  animate?: boolean
  className?: string
  children: ReactNode
}

export default function Card({ animate = true, className = '', children }: CardProps) {
  if (!animate) {
    return (
      <div className={`bg-ki-card/80 backdrop-blur-sm border border-ki-purple-light/10 rounded-2xl p-6 ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-ki-card/80 backdrop-blur-sm border border-ki-purple-light/10 rounded-2xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
