import { useState } from 'react'
import { motion } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import { usePlayer } from '../../contexts/PlayerContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import { submitQuestion } from '../../lib/game-actions'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface QuestionPhaseProps {
  channel?: RealtimeChannel | null
}

export default function QuestionPhase({ channel: channelProp }: QuestionPhaseProps = {}) {
  const { state } = useGameState()
  const { playerId } = usePlayer()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isQuestioner = state.currentRound?.questioner_id === playerId
  const questionerName = state.players.find(p => p.id === state.currentRound?.questioner_id)?.user_name ?? '...'

  const handleSubmit = async () => {
    if (!question.trim() || !state.currentRound || !channelProp) return
    setLoading(true)
    try {
      await submitQuestion(state.currentRound.id, question.trim(), channelProp)
      setSubmitted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (isQuestioner && !submitted) {
    return (
      <Card>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <div className="text-4xl animate-float">🎤</div>
          <h2 className="text-xl font-black">C'est a toi de poser une question !</h2>
          <p className="text-white/50 text-sm">Pose une question dont la reponse sera differente pour chaque joueur</p>
          <Input
            placeholder="Ex: Quel est ton film prefere ?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
          />
          <Button onClick={handleSubmit} disabled={!question.trim() || loading} className="w-full">
            {loading ? 'Envoi...' : 'Envoyer la question'}
          </Button>
        </motion.div>
      </Card>
    )
  }

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4 py-6"
      >
        <div className="text-4xl animate-float">🤔</div>
        <h2 className="text-xl font-black">{questionerName} prepare une question...</h2>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-ki-terra"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </Card>
  )
}
