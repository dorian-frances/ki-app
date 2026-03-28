import { useEffect, useState } from 'react'
import { animate } from 'motion'

interface ScoreCounterProps {
  from: number
  to: number
  duration?: number
  className?: string
}

export default function ScoreCounter({ from, to, duration = 1.5, className = '' }: ScoreCounterProps) {
  const [display, setDisplay] = useState(from)

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      onUpdate: (v) => setDisplay(Math.round(v)),
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [from, to, duration])

  return <span className={className}>{display}</span>
}
