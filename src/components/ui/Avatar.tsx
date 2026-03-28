const AVATARS = ['🦊', '🐱', '🐸', '🦁', '🐻', '🐼', '🐨', '🐯', '🦄', '🐙', '🦋', '🐳', '🎭', '👻', '🤖', '🎃']

interface AvatarProps {
  emoji: string
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl',
}

export default function Avatar({ emoji, size = 'md', selected, onClick }: AvatarProps) {
  return (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-ki-card border-2 transition-all ${
        selected ? 'border-ki-pink scale-110 shadow-lg shadow-ki-pink/30' : 'border-ki-purple-light/20'
      } ${onClick ? 'cursor-pointer hover:border-ki-purple-light/50' : ''}`}
    >
      {emoji}
    </div>
  )
}

export { AVATARS }
