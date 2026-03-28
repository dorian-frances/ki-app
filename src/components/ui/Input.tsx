import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-ki-terra-light mb-1">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-ki-card border border-ki-terra-light/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-ki-terra focus:ring-2 focus:ring-ki-terra/30 transition-all font-bold ${className}`}
        {...props}
      />
    </div>
  )
})
Input.displayName = 'Input'

export default Input
