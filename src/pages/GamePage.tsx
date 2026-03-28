import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Header from '../components/layout/Header'
import PlayerList from '../components/lobby/PlayerList'
import QRCodeDisplay from '../components/lobby/QRCodeDisplay'
import StartGameButton from '../components/lobby/StartGameButton'
import QuestionPhase from '../components/game/QuestionPhase'
import AnswerPhase from '../components/game/AnswerPhase'
import DrawPhase from '../components/game/DrawPhase'
import VoteResultOverlay from '../components/game/VoteResultOverlay'
import Leaderboard from '../components/leaderboard/Leaderboard'
import FinalLeaderboard from '../components/leaderboard/FinalLeaderboard'
import Button from '../components/ui/Button'
import { useGameState } from '../contexts/GameContext'
import { usePlayer } from '../contexts/PlayerContext'
import { useGameChannel } from '../hooks/useGameChannel'
import {
  fetchGameState,
  startNextRound,
  prepareAndRevealFirstDraw,
  revealNextDraw,
  scoreDraw,
  broadcastScoresUpdate,
  broadcastGameOver,
} from '../lib/game-actions'
import type { RealtimeChannel } from '@supabase/supabase-js'

export default function GamePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useGameState()
  const { gameId, playerId, isAdmin, isLoading: playerLoading } = usePlayer()
  const { channel } = useGameChannel(code)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Load initial game state — wait for player identity to be restored first
  useEffect(() => {
    if (playerLoading) return

    if (!gameId) {
      navigate(`/?code=${code}`)
      return
    }

    fetchGameState(gameId, playerId).then(({ game, players, currentRound, myAnswer, myVote, answerCount, voteCount, activeDraw }) => {
      if (game) {
        dispatch({ type: 'SET_GAME', game, players })
        if (currentRound) {
          dispatch({ type: 'SET_ROUND', round: currentRound })

          // Restore answer state
          if (myAnswer) {
            dispatch({ type: 'MY_ANSWER_SUBMITTED', answer: myAnswer })
          }
          if (answerCount > 0) {
            dispatch({ type: 'ANSWER_SUBMITTED', count: answerCount })
          }

          // Restore active draw (voting phase)
          if (activeDraw) {
            dispatch({
              type: 'DRAW_REVEALED',
              drawId: activeDraw.id,
              answerText: activeDraw.answer_text,
              drawOrder: activeDraw.draw_order,
            })
            if (voteCount > 0) {
              dispatch({ type: 'VOTE_SUBMITTED', count: voteCount })
            }
            if (myVote) {
              dispatch({ type: 'MY_VOTE_SUBMITTED', votedPlayerId: myVote })
            }
          }
        }
      }
      setLoading(false)
    })
  }, [playerLoading, gameId, playerId, code, navigate, dispatch])

  // Admin action: start game / next round
  const handleStartRound = useCallback(async () => {
    if (!gameId || !channel) return
    setActionLoading(true)
    try {
      await startNextRound(gameId, channel)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }, [gameId, channel])

  // Admin action: close answers and start draws
  const handleStartDraws = useCallback(async () => {
    if (!state.currentRound || !channel) return
    setActionLoading(true)
    try {
      await prepareAndRevealFirstDraw(state.currentRound.id, channel)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }, [state.currentRound, channel])

  // Admin action: score current draw and show results
  const handleScoreDraw = useCallback(async () => {
    if (!state.currentDraw || !channel) return
    setActionLoading(true)
    try {
      await scoreDraw(state.currentDraw.id, channel)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }, [state.currentDraw, channel])

  // Admin action: reveal next draw or show round scores
  const handleNextDraw = useCallback(async () => {
    if (!state.currentRound || !channel || !gameId) return
    setActionLoading(true)
    try {
      const result = await revealNextDraw(state.currentRound.id, channel)
      if (result.done) {
        // All draws completed, show round scores
        await broadcastScoresUpdate(channel, gameId)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }, [state.currentRound, channel, gameId])

  // Admin action: next round or end game
  const handleNextRound = useCallback(async () => {
    if (!gameId || !channel || !state.game) return
    setActionLoading(true)
    try {
      if (state.game.current_round >= state.game.total_rounds) {
        await broadcastGameOver(channel, gameId)
      } else {
        await startNextRound(gameId, channel)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }, [gameId, channel, state.game])

  if (loading || playerLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-xl font-bold text-ki-purple-light">Chargement...</div>
        </div>
      </PageShell>
    )
  }

  if (!state.game) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <p className="text-white/50 font-bold">Partie introuvable</p>
          <Button onClick={() => navigate('/')} variant="ghost" className="mt-4">
            Retour
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Header
        code={state.game.code}
        round={state.game.current_round || undefined}
        totalRounds={state.game.total_rounds}
        phase={state.phase}
      />

      {/* Lobby */}
      {state.phase === 'lobby' && (
        <div className="space-y-6">
          <QRCodeDisplay code={state.game.code} />
          <PlayerList players={state.players} adminId={state.game.admin_id} />
          <StartGameButton
            isAdmin={isAdmin}
            playerCount={state.players.length}
            loading={actionLoading}
            onStart={handleStartRound}
          />
        </div>
      )}

      {/* Active game phases */}
      {state.phase !== 'lobby' && state.phase !== 'game_over' && (
        <div className="space-y-4">
          <GamePhaseWithChannel phase={state.phase} channel={channel} />

          {/* Admin controls */}
          {isAdmin && (
            <AdminControls
              phase={state.phase}
              loading={actionLoading}
              answerCount={state.answerCount}
              totalExpectedAnswers={state.totalExpectedAnswers}
              voteCount={state.voteCount}
              totalExpectedVotes={state.totalExpectedVotes}
              onStartDraws={handleStartDraws}
              onScoreDraw={handleScoreDraw}
              onNextDraw={handleNextDraw}
              onNextRound={handleNextRound}
            />
          )}
        </div>
      )}

      {/* Game over */}
      {state.phase === 'game_over' && <FinalLeaderboard />}
    </PageShell>
  )
}

function GamePhaseWithChannel({ phase, channel }: { phase: string; channel: RealtimeChannel | null }) {
  switch (phase) {
    case 'question':
      return <QuestionPhase channel={channel} />
    case 'answering':
      return <AnswerPhase channel={channel} />
    case 'draw_voting':
      return <DrawPhase channel={channel} />
    case 'draw_results':
      return <VoteResultOverlay />
    case 'round_scores':
      return <Leaderboard />
    default:
      return <div className="text-center text-white/50 py-10">Chargement...</div>
  }
}

// Admin control buttons depending on current phase
function AdminControls({
  phase,
  loading,
  answerCount,
  totalExpectedAnswers,
  voteCount,
  totalExpectedVotes,
  onStartDraws,
  onScoreDraw,
  onNextDraw,
  onNextRound,
}: {
  phase: string
  loading: boolean
  answerCount: number
  totalExpectedAnswers: number
  voteCount: number
  totalExpectedVotes: number
  onStartDraws: () => void
  onScoreDraw: () => void
  onNextDraw: () => void
  onNextRound: () => void
}) {
  switch (phase) {
    case 'answering':
      return answerCount >= totalExpectedAnswers ? (
        <Button onClick={onStartDraws} disabled={loading} className="w-full" variant="secondary">
          {loading ? 'Preparation...' : 'Reveler les reponses'}
        </Button>
      ) : null

    case 'draw_voting':
      return voteCount >= totalExpectedVotes ? (
        <Button onClick={onScoreDraw} disabled={loading} className="w-full" variant="secondary">
          {loading ? 'Calcul...' : 'Voir les resultats'}
        </Button>
      ) : null

    case 'draw_results':
      return (
        <Button onClick={onNextDraw} disabled={loading} className="w-full" variant="secondary">
          {loading ? 'Chargement...' : 'Suivant'}
        </Button>
      )

    case 'round_scores':
      return (
        <Button onClick={onNextRound} disabled={loading} className="w-full" size="lg">
          {loading ? 'Chargement...' : 'Manche suivante'}
        </Button>
      )

    default:
      return null
  }
}
