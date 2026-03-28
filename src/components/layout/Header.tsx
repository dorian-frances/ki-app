interface HeaderProps {
  code?: string
  round?: number
  totalRounds?: number
  phase?: string
}

const phaseLabels: Record<string, string> = {
  lobby: 'Lobby',
  question: 'Question',
  answering: 'Reponses',
  draw_voting: 'Qui a ecrit ca ?',
  draw_results: 'Resultats',
  round_scores: 'Classement',
  game_over: 'Fin de partie',
}

export default function Header({ code, round, totalRounds, phase }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-black bg-gradient-to-r from-ki-purple-light to-ki-pink bg-clip-text text-transparent">
        KI
      </h1>
      <div className="flex items-center gap-3">
        {round != null && totalRounds != null && (
          <span className="text-sm font-bold text-ki-purple-light">
            {round}/{totalRounds}
          </span>
        )}
        {phase && phase !== 'lobby' && (
          <span className="text-xs font-bold bg-ki-purple/30 text-ki-purple-light px-2 py-1 rounded-lg">
            {phaseLabels[phase] || phase}
          </span>
        )}
        {code && (
          <span className="text-sm font-black bg-ki-card px-3 py-1 rounded-lg tracking-widest">
            {code}
          </span>
        )}
      </div>
    </div>
  )
}
