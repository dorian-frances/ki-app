import { type ReactNode } from 'react'
import { motion } from 'motion/react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const variants = {
  primary: 'bg-gradient-to-r from-ki-terra to-ki-sand text-white shadow-lg shadow-ki-terra/30',
  secondary: 'bg-ki-card text-white border border-ki-terra-light/30',
  ghost: 'bg-transparent text-ki-terra-light',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, disabled, onClick, type = 'button' }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`font-extrabold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}
