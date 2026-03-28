import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { GameState, GameAction, GamePhase, PlayerScore } from '../types/game'

const initialState: GameState = {
  game: null,
  players: [],
  currentRound: null,
  currentDraw: null,
  currentAnswerText: null,
  phase: 'lobby',
  scores: [],
  myAnswer: null,
  myVote: null,
  drawResults: null,
  answerCount: 0,
  voteCount: 0,
  totalExpectedAnswers: 0,
  totalExpectedVotes: 0,
}

function computeScores(players: GameState['players'], oldScores: PlayerScore[]): PlayerScore[] {
  const oldScoreMap = new Map(oldScores.map(s => [s.playerId, s]))
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return sorted.map((p, i) => {
    const old = oldScoreMap.get(p.id)
    return {
      playerId: p.id,
      userName: p.user_name,
      avatar: p.avatar,
      oldScore: old?.newScore ?? p.score,
      newScore: p.score,
      rank: i + 1,
      oldRank: old?.rank ?? i + 1,
    }
  })
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME':
      return {
        ...state,
        game: action.game,
        players: action.players,
        phase: action.game.status === 'finished' ? 'game_over' : (action.game.status === 'lobby' ? 'lobby' : state.phase),
      }

    case 'PLAYER_JOINED':
      if (state.players.some(p => p.id === action.player.id)) return state
      return { ...state, players: [...state.players, action.player] }

    case 'PLAYER_LEFT':
      return { ...state, players: state.players.filter(p => p.id !== action.playerId) }

    case 'PHASE_CHANGE':
      return { ...state, phase: action.data?.phase as GamePhase ?? action.phase }

    case 'SET_ROUND':
      return {
        ...state,
        currentRound: action.round,
        phase: action.round.status === 'question' ? 'question' : 'answering',
        myAnswer: null,
        myVote: null,
        answerCount: 0,
        voteCount: 0,
        drawResults: null,
        currentDraw: null,
        currentAnswerText: null,
        totalExpectedAnswers: state.players.length - 1, // questioner doesn't answer
        totalExpectedVotes: state.players.length - 1,   // questioner doesn't vote during draws
      }

    case 'SET_QUESTION':
      return {
        ...state,
        currentRound: state.currentRound
          ? { ...state.currentRound, question: action.question, status: 'answering' }
          : null,
        phase: 'answering',
      }

    case 'ANSWER_SUBMITTED':
      return { ...state, answerCount: action.count }

    case 'MY_ANSWER_SUBMITTED':
      return { ...state, myAnswer: action.answer }

    case 'DRAW_REVEALED':
      return {
        ...state,
        currentDraw: {
          id: action.drawId,
          round_id: state.currentRound?.id ?? '',
          answer_id: '',
          draw_order: action.drawOrder,
          status: 'voting',
        },
        currentAnswerText: action.answerText,
        phase: 'draw_voting',
        myVote: null,
        voteCount: 0,
      }

    case 'MY_VOTE_SUBMITTED':
      return { ...state, myVote: action.votedPlayerId }

    case 'VOTE_SUBMITTED':
      return { ...state, voteCount: action.count }

    case 'DRAW_SCORED':
      return {
        ...state,
        drawResults: action.results,
        phase: 'draw_results',
      }

    case 'SCORES_UPDATE': {
      // Update player scores from server
      const updatedPlayers = state.players.map(p => {
        const updated = action.scores.find(s => s.playerId === p.id)
        return updated ? { ...p, score: updated.newScore } : p
      })
      return {
        ...state,
        players: updatedPlayers,
        scores: action.scores,
        phase: 'round_scores',
      }
    }

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'game_over',
        game: state.game ? { ...state.game, status: 'finished' } : null,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: Dispatch<GameAction>
}>({
  state: initialState,
  dispatch: () => {},
})

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameState() {
  return useContext(GameContext)
}

export { computeScores }
