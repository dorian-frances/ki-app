import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { useGameState, computeScores } from '../contexts/GameContext'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Player } from '../types/database'

export function useGameChannel(gameCode: string | undefined) {
  const { state, dispatch } = useGameState()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const answerCountRef = useRef(0)
  const voteCountRef = useRef(0)

  // Keep refs in sync with state (important after restore from DB on refresh)
  useEffect(() => {
    answerCountRef.current = state.answerCount
  }, [state.answerCount])

  useEffect(() => {
    voteCountRef.current = state.voteCount
  }, [state.voteCount])

  const gameId = state.game?.id

  useEffect(() => {
    if (!gameCode || !gameId) return

    const ch = supabase.channel(`game:${gameCode}`, {
      config: { broadcast: { self: true } },
    })

    ch.on('broadcast', { event: 'round_started' }, ({ payload }) => {
      answerCountRef.current = 0
      voteCountRef.current = 0
      dispatch({
        type: 'SET_ROUND',
        round: {
          id: payload.round_id,
          game_id: gameId,
          round_number: payload.round_number,
          question: null,
          questioner_id: payload.questioner_id,
          status: 'question',
          created_at: new Date().toISOString(),
        },
      })
    })

    ch.on('broadcast', { event: 'question_submitted' }, ({ payload }) => {
      dispatch({ type: 'SET_QUESTION', question: payload.question })
    })

    ch.on('broadcast', { event: 'answer_submitted' }, () => {
      answerCountRef.current += 1
      dispatch({ type: 'ANSWER_SUBMITTED', count: answerCountRef.current })
    })

    ch.on('broadcast', { event: 'draw_revealed' }, ({ payload }) => {
      voteCountRef.current = 0
      dispatch({
        type: 'DRAW_REVEALED',
        drawId: payload.draw_id,
        answerText: payload.answer_text,
        drawOrder: payload.draw_order,
      })
    })

    ch.on('broadcast', { event: 'vote_submitted' }, () => {
      voteCountRef.current += 1
      dispatch({ type: 'VOTE_SUBMITTED', count: voteCountRef.current })
    })

    ch.on('broadcast', { event: 'draw_scored' }, ({ payload }) => {
      dispatch({
        type: 'DRAW_SCORED',
        results: {
          drawId: payload.drawId,
          authorId: payload.author_id,
          answerText: payload.answer_text ?? '',
          correctGuesses: payload.correct_guesses,
          wrongGuesses: payload.wrong_guesses,
          impostorPoints: payload.impostor_points,
          votes: (payload.votes || []).map((v: { voter_id: string; voted_player_id: string; is_correct: boolean }) => ({
            voterId: v.voter_id,
            votedPlayerId: v.voted_player_id,
            isCorrect: v.is_correct,
          })),
        },
      })
    })

    ch.on('broadcast', { event: 'scores_update' }, ({ payload }) => {
      const serverPlayers = payload.players as Array<{ id: string; user_name: string; avatar: string; score: number }>
      const scores = computeScores(
        serverPlayers.map(p => ({ ...state.players.find(sp => sp.id === p.id)!, score: p.score })),
        state.scores
      )
      dispatch({ type: 'SCORES_UPDATE', scores })
    })

    ch.on('broadcast', { event: 'phase_change' }, ({ payload }) => {
      dispatch({ type: 'PHASE_CHANGE', phase: payload.phase, data: payload })
    })

    ch.on('broadcast', { event: 'game_over' }, () => {
      dispatch({ type: 'GAME_OVER' })
    })

    ch.on('broadcast', { event: 'game_restarted' }, ({ payload }) => {
      dispatch({ type: 'GAME_RESTARTED', newCode: payload.code, newGameId: payload.game_id })
    })

    ch.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
      (payload) => {
        const player = payload.new as Player
        dispatch({ type: 'PLAYER_JOINED', player })
      }
    )

    ch.subscribe()
    channelRef.current = ch
    setChannel(ch)

    return () => {
      supabase.removeChannel(ch)
      channelRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode, gameId])

  const getChannel = useCallback(() => channelRef.current, [])

  return { channel, getChannel }
}
