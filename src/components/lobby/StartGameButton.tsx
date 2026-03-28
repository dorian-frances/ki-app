import Button from '../ui/Button'

interface StartGameButtonProps {
  isAdmin: boolean
  playerCount: number
  loading: boolean
  onStart: () => void
}

export default function StartGameButton({ isAdmin, playerCount, loading, onStart }: StartGameButtonProps) {
  if (!isAdmin) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse text-ki-purple-light font-bold">
          En attente du lancement par l'admin...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={onStart}
        disabled={playerCount < 1 || loading}
        className="w-full animate-pulse-glow"
        size="lg"
      >
        {loading ? 'Lancement...' : 'Lancer la partie !'}
      </Button>
      <p className="text-center text-sm text-white/40 font-bold">
        {playerCount} joueur{playerCount > 1 ? 's' : ''} connect{playerCount > 1 ? 'es' : 'e'}
      </p>
    </div>
  )
}
