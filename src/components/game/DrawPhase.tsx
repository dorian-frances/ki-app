import { useState } from 'react'
import { motion } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import { usePlayer } from '../../contexts/PlayerContext'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'
import { submitVote } from '../../lib/game-actions'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface DrawPhaseProps {
  channel?: RealtimeChannel | null
}

export default function DrawPhase({ channel: channelProp }: DrawPhaseProps = {}) {
  const { state, dispatch } = useGameState()
  const { playerId } = usePlayer()
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasVoted = state.myVote !== null

  // Everyone is voteable (questioner participates too)
  const voteablePlayers = state.players

  const handleVote = async () => {
    if (!selectedPlayer || !state.currentDraw || !playerId || !channelProp) return
    setLoading(true)
    try {
      await submitVote(state.currentDraw.id, playerId, selectedPlayer, channelProp)
      dispatch({ type: 'MY_VOTE_SUBMITTED', votedPlayerId: selectedPlayer })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-5"
      >
        {/* Revealed answer */}
        <div className="text-center">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
            Reponse #{state.currentDraw?.draw_order}
          </p>
          <motion.div
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="bg-gradient-to-br from-ki-terra/30 to-ki-terra/20 border border-ki-terra-light/20 rounded-2xl p-6"
          >
            <p className="text-xl font-black text-ki-sand">
              "{state.currentAnswerText}"
            </p>
          </motion.div>
        </div>

        {/* Voting area */}
        {hasVoted ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🗳️</div>
            <p className="font-bold text-white/50">Vote enregistre ! En attente des autres...</p>
            <p className="text-sm text-white/30 mt-2">
              {state.voteCount}/{state.totalExpectedVotes} votes
            </p>
          </div>
        ) : (
          <>
            <p className="text-center font-bold text-white/70">Qui a ecrit cette reponse ?</p>
            <div className="grid grid-cols-2 gap-2">
              {voteablePlayers.map((player) => (
                <motion.button
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                    selectedPlayer === player.id
                      ? 'bg-ki-terra border-2 border-ki-terra shadow-lg shadow-ki-terra/20'
                      : 'bg-ki-card/60 border-2 border-transparent hover:border-ki-terra-light/30'
                  }`}
                >
                  <Avatar emoji={player.avatar} size="sm" />
                  <span className="font-bold text-sm truncate">{player.user_name}</span>
                </motion.button>
              ))}
            </div>
            <Button
              onClick={handleVote}
              disabled={!selectedPlayer || loading}
              className="w-full"
            >
              {loading ? 'Envoi...' : 'Voter'}
            </Button>
          </>
        )}
      </motion.div>
    </Card>
  )
}
