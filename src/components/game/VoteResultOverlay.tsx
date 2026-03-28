import { motion } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'

export default function VoteResultOverlay() {
  const { state } = useGameState()
  const { drawResults, players } = state

  if (!drawResults) return null

  const author = players.find(p => p.id === drawResults.authorId)
  const totalInspectors = drawResults.correctGuesses + drawResults.wrongGuesses

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

        {/* Author reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="py-4"
        >
          <p className="text-sm text-white/50 mb-2">C'etait...</p>
          <div className="flex items-center justify-center gap-3">
            <Avatar emoji={author?.avatar ?? '🎭'} size="lg" />
            <span className="text-2xl font-black">{author?.user_name ?? '???'}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-ki-green/20 rounded-xl p-3">
            <p className="text-2xl font-black text-ki-green">{drawResults.correctGuesses}</p>
            <p className="text-xs text-white/50">ont trouve</p>
          </div>
          <div className="bg-ki-pink/20 rounded-xl p-3">
            <p className="text-2xl font-black text-ki-pink">{drawResults.wrongGuesses}</p>
            <p className="text-xs text-white/50">se sont trompes</p>
          </div>
        </motion.div>

        {/* Impostor score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-ki-card rounded-xl p-3"
        >
          <p className="text-sm text-white/50">{author?.user_name} marque</p>
          <p className={`text-xl font-black ${drawResults.impostorPoints >= 0 ? 'text-ki-green' : 'text-ki-pink'}`}>
            {drawResults.impostorPoints > 0 ? '+' : ''}{drawResults.impostorPoints} pts
          </p>
          <p className="text-xs text-white/30">
            {drawResults.wrongGuesses}/{totalInspectors} n'ont pas trouve
          </p>
        </motion.div>

        {/* Who voted for whom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="space-y-1"
        >
          <p className="text-xs text-white/40 uppercase tracking-wider">Votes</p>
          {drawResults.votes
            .filter(v => v.voterId !== drawResults.authorId)
            .map((vote, i) => {
              const voter = players.find(p => p.id === vote.voterId)
              const voted = players.find(p => p.id === vote.votedPlayerId)
              return (
                <div key={i} className="flex items-center justify-center gap-2 text-sm">
                  <span className="font-bold">{voter?.user_name}</span>
                  <span className="text-white/30">→</span>
                  <span className={vote.isCorrect ? 'text-ki-green font-bold' : 'text-white/50'}>
                    {voted?.user_name}
                  </span>
                  {vote.isCorrect && <span>✅</span>}
                </div>
              )
            })}
        </motion.div>
      </motion.div>
    </Card>
  )
}
