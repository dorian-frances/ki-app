import { useGameState } from '../../contexts/GameContext'
import QuestionPhase from './QuestionPhase'
import AnswerPhase from './AnswerPhase'
import DrawPhase from './DrawPhase'
import VoteResultOverlay from './VoteResultOverlay'
import Leaderboard from '../leaderboard/Leaderboard'
import FinalLeaderboard from '../leaderboard/FinalLeaderboard'

export default function PhaseRouter() {
  const { state } = useGameState()

  switch (state.phase) {
    case 'question':
      return <QuestionPhase />
    case 'answering':
      return <AnswerPhase />
    case 'draw_voting':
      return <DrawPhase />
    case 'draw_results':
      return <VoteResultOverlay />
    case 'round_scores':
      return <Leaderboard />
    case 'game_over':
      return <FinalLeaderboard />
    default:
      return <div className="text-center text-white/50 py-10">Chargement...</div>
  }
}
