import { useState } from 'react'
import { motion } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import { usePlayer } from '../../contexts/PlayerContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import { submitAnswer } from '../../lib/game-actions'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface AnswerPhaseProps {
  channel?: RealtimeChannel | null
}

export default function AnswerPhase({ channel: channelProp }: AnswerPhaseProps = {}) {
  const { state, dispatch } = useGameState()
  const { playerId } = usePlayer()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdmin = state.players.find(p => p.id === playerId)?.is_admin ?? false
  const hasAnswered = state.myAnswer !== null

  const handleSubmit = async () => {
    if (!answer.trim() || !state.currentRound || !playerId || !channelProp) return
    setLoading(true)
    try {
      await submitAnswer(state.currentRound.id, playerId, answer.trim(), channelProp)
      dispatch({ type: 'MY_ANSWER_SUBMITTED', answer: answer.trim() })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Player already answered
  if (hasAnswered) {
    return (
      <Card>
        <div className="text-center space-y-4 py-6">
          <div className="text-4xl">✅</div>
          <h2 className="text-lg font-black">Reponse envoyee !</h2>
          <p className="text-white/50">En attente des autres joueurs...</p>
          {isAdmin && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-3 flex-1 max-w-[200px] bg-ki-card rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-ki-terra to-ki-terra rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.answerCount / Math.max(state.totalExpectedAnswers, 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white/50">
                {state.answerCount}/{state.totalExpectedAnswers}
              </span>
            </div>
          )}
        </div>
      </Card>
    )
  }

  // Player needs to answer
  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-2xl font-black text-center text-ki-sand">
          "{state.currentRound?.question}"
        </p>
        <Input
          placeholder="Ta reponse..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          maxLength={200}
        />
        <Button onClick={handleSubmit} disabled={!answer.trim() || loading} className="w-full">
          {loading ? 'Envoi...' : 'Envoyer'}
        </Button>
      </motion.div>
    </Card>
  )
}
