import type { Game, Player, Round, Draw } from './database'

export type GamePhase =
  | 'lobby'
  | 'question'
  | 'answering'
  | 'draw_reveal'
  | 'draw_voting'
  | 'draw_results'
  | 'round_scores'
  | 'game_over'

export interface PlayerScore {
  playerId: string
  userName: string
  avatar: string
  oldScore: number
  newScore: number
  rank: number
  oldRank: number
}

export interface DrawResult {
  drawId: string
  authorId: string
  answerText: string
  correctGuesses: number
  wrongGuesses: number
  impostorPoints: number
  votes: Array<{
    voterId: string
    votedPlayerId: string
    isCorrect: boolean
  }>
}

export interface GameState {
  game: Game | null
  players: Player[]
  currentRound: Round | null
  currentDraw: Draw | null
  currentAnswerText: string | null
  phase: GamePhase
  scores: PlayerScore[]
  myAnswer: string | null
  myVote: string | null
  drawResults: DrawResult | null
  answerCount: number
  voteCount: number
  totalExpectedAnswers: number
  totalExpectedVotes: number
}

export type GameAction =
  | { type: 'SET_GAME'; game: Game; players: Player[] }
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'PHASE_CHANGE'; phase: GamePhase; data?: Record<string, unknown> }
  | { type: 'SET_ROUND'; round: Round }
  | { type: 'SET_QUESTION'; question: string }
  | { type: 'ANSWER_SUBMITTED'; count: number }
  | { type: 'MY_ANSWER_SUBMITTED'; answer: string }
  | { type: 'DRAW_REVEALED'; drawId: string; answerText: string; drawOrder: number }
  | { type: 'MY_VOTE_SUBMITTED'; votedPlayerId: string }
  | { type: 'VOTE_SUBMITTED'; count: number }
  | { type: 'DRAW_SCORED'; results: DrawResult }
  | { type: 'SCORES_UPDATE'; scores: PlayerScore[] }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' }

export interface BroadcastPayload {
  type: string
  [key: string]: unknown
}
