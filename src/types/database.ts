export type GameStatus = 'lobby' | 'playing' | 'finished'
export type RoundStatus = 'question' | 'answering' | 'drawing' | 'scoring' | 'completed'
export type DrawStatus = 'pending' | 'revealed' | 'voting' | 'completed'

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          code: string
          status: GameStatus
          current_round: number
          total_rounds: number
          admin_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      players: {
        Row: {
          id: string
          game_id: string
          user_id: string
          user_name: string
          avatar: string
          is_admin: boolean
          score: number
          question_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'score' | 'question_count'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      rounds: {
        Row: {
          id: string
          game_id: string
          round_number: number
          question: string | null
          questioner_id: string
          status: RoundStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rounds']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['rounds']['Insert']>
      }
      answers: {
        Row: {
          id: string
          round_id: string
          player_id: string
          answer_text: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['answers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['answers']['Insert']>
      }
      draws: {
        Row: {
          id: string
          round_id: string
          answer_id: string
          draw_order: number
          status: DrawStatus
        }
        Insert: Omit<Database['public']['Tables']['draws']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['draws']['Insert']>
      }
      votes: {
        Row: {
          id: string
          draw_id: string
          voter_id: string
          voted_player_id: string
          is_correct: boolean | null
          points_earned: number
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'is_correct' | 'points_earned'>
        Update: Partial<Database['public']['Tables']['votes']['Insert']>
      }
    }
    Functions: {
      create_game: {
        Args: { p_user_name: string; p_avatar?: string; p_total_rounds?: number }
        Returns: { game_id: string; player_id: string; code: string }
      }
      join_game: {
        Args: { p_code: string; p_user_name: string; p_avatar?: string }
        Returns: { game_id: string; player_id: string }
      }
      start_next_round: {
        Args: { p_game_id: string }
        Returns: { round_id: string; round_number: number; questioner_id: string }
      }
      submit_question: {
        Args: { p_round_id: string; p_question: string }
        Returns: void
      }
      prepare_draws: {
        Args: { p_round_id: string }
        Returns: void
      }
      reveal_next_draw: {
        Args: { p_round_id: string }
        Returns: { draw_id: string; draw_order: number; answer_text: string; done: boolean }
      }
      score_draw: {
        Args: { p_draw_id: string }
        Returns: { author_id: string; correct_guesses: number; wrong_guesses: number; impostor_points: number }
      }
    }
  }
}

export type Game = Database['public']['Tables']['games']['Row']
export type Player = Database['public']['Tables']['players']['Row']
export type Round = Database['public']['Tables']['rounds']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type Draw = Database['public']['Tables']['draws']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
