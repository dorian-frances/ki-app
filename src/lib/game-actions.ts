import { supabase } from '../config/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export async function createGame(userName: string, avatar: string, totalRounds: number) {
  const { data, error } = await supabase.rpc('create_game', {
    p_user_name: userName,
    p_avatar: avatar,
    p_total_rounds: totalRounds,
  })
  if (error) throw error
  return data as unknown as { game_id: string; player_id: string; code: string }
}

export async function joinGame(code: string, userName: string, avatar: string) {
  const { data, error } = await supabase.rpc('join_game', {
    p_code: code,
    p_user_name: userName,
    p_avatar: avatar,
  })
  if (error) throw error
  return data as unknown as { game_id: string; player_id: string }
}

export async function startNextRound(gameId: string, channel: RealtimeChannel) {
  const { data, error } = await supabase.rpc('start_next_round', {
    p_game_id: gameId,
  })
  if (error) throw error
  const result = data as unknown as { round_id: string; round_number: number; questioner_id: string }

  channel.send({
    type: 'broadcast',
    event: 'round_started',
    payload: result,
  })

  return result
}

export async function submitQuestion(roundId: string, question: string, channel: RealtimeChannel) {
  const { error } = await supabase.rpc('submit_question', {
    p_round_id: roundId,
    p_question: question,
  })
  if (error) throw error

  channel.send({
    type: 'broadcast',
    event: 'question_submitted',
    payload: { roundId, question },
  })
}

export async function submitAnswer(roundId: string, playerId: string, answerText: string, channel: RealtimeChannel) {
  const { error } = await supabase
    .from('answers')
    .insert({ round_id: roundId, player_id: playerId, answer_text: answerText })
  if (error) throw error

  // Notify that an answer was submitted (just increment count)
  channel.send({
    type: 'broadcast',
    event: 'answer_submitted',
    payload: { playerId },
  })
}

export async function prepareAndRevealFirstDraw(roundId: string, channel: RealtimeChannel) {
  const { error: prepError } = await supabase.rpc('prepare_draws', {
    p_round_id: roundId,
  })
  if (prepError) throw prepError

  return revealNextDraw(roundId, channel)
}

export async function revealNextDraw(roundId: string, channel: RealtimeChannel) {
  const { data, error } = await supabase.rpc('reveal_next_draw', {
    p_round_id: roundId,
  })
  if (error) throw error
  const result = data as unknown as { draw_id: string; draw_order: number; answer_text: string; done: boolean }

  if (!result.done) {
    channel.send({
      type: 'broadcast',
      event: 'draw_revealed',
      payload: result,
    })
  }

  return result
}

export async function submitVote(drawId: string, voterId: string, votedPlayerId: string, channel: RealtimeChannel) {
  const { error } = await supabase
    .from('votes')
    .insert({ draw_id: drawId, voter_id: voterId, voted_player_id: votedPlayerId })
  if (error) throw error

  channel.send({
    type: 'broadcast',
    event: 'vote_submitted',
    payload: { voterId },
  })
}

export async function scoreDraw(drawId: string, channel: RealtimeChannel) {
  const { data, error } = await supabase.rpc('score_draw', {
    p_draw_id: drawId,
  })
  if (error) throw error
  const result = data as unknown as { author_id: string; correct_guesses: number; wrong_guesses: number; impostor_points: number }

  // Fetch votes for this draw to include in results
  const { data: votes } = await supabase
    .from('votes')
    .select('voter_id, voted_player_id, is_correct')
    .eq('draw_id', drawId)

  channel.send({
    type: 'broadcast',
    event: 'draw_scored',
    payload: { ...result, votes: votes || [], drawId },
  })

  return result
}

export async function broadcastScoresUpdate(channel: RealtimeChannel, gameId: string) {
  // Fetch updated player scores
  const { data: players } = await supabase
    .from('players')
    .select('id, user_name, avatar, score')
    .eq('game_id', gameId)
    .order('score', { ascending: false })

  channel.send({
    type: 'broadcast',
    event: 'scores_update',
    payload: { players: players || [] },
  })
}

export async function broadcastGameOver(channel: RealtimeChannel, gameId: string) {
  await supabase
    .from('games')
    .update({ status: 'finished' })
    .eq('id', gameId)

  channel.send({
    type: 'broadcast',
    event: 'game_over',
    payload: {},
  })
}

export async function broadcastPhaseChange(channel: RealtimeChannel, phase: string, data?: Record<string, unknown>) {
  channel.send({
    type: 'broadcast',
    event: 'phase_change',
    payload: { phase, ...data },
  })
}

export async function fetchGameState(gameId: string) {
  const [gameRes, playersRes, roundRes] = await Promise.all([
    supabase.from('games').select('*').eq('id', gameId).single(),
    supabase.from('players').select('*').eq('game_id', gameId).order('created_at'),
    supabase.from('rounds').select('*').eq('game_id', gameId).order('round_number', { ascending: false }).limit(1),
  ])

  return {
    game: gameRes.data,
    players: playersRes.data || [],
    currentRound: roundRes.data?.[0] || null,
  }
}

export async function signInAnonymously() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return session

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.session
}
