import { motion } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'

export default function VoteResultOverlay() {
  const { state } = useGameState()
  const { drawResults, players } = state

  if (!drawResults) return null

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="space-y-5 text-center"
      >
        {/* Answer recall */}
        <p className="text-lg font-bold text-ki-yellow">"{drawResults.answerText}"</p>

        {/* All votes revealed (including impostor's) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Votes</p>
          {drawResults.votes.map((vote, i) => {
            const voter = players.find(p => p.id === vote.voterId)
            const voted = players.find(p => p.id === vote.votedPlayerId)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center justify-center gap-3 text-sm"
              >
                <div className="flex items-center gap-2 min-w-[100px] justify-end">
                  <span className="font-bold">{voter?.user_name}</span>
                  <Avatar emoji={voter?.avatar ?? '🎭'} size="sm" />
                </div>
                <span className="text-white/30">→</span>
                <div className="flex items-center gap-2 min-w-[100px] justify-start">
                  <Avatar emoji={voted?.avatar ?? '🎭'} size="sm" />
                  <span className="text-white/70">{voted?.user_name}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </Card>
  )
}
