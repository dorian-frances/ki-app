import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { signInAnonymously } from '../lib/game-actions'
import { supabase } from '../config/supabase'

interface PlayerIdentity {
  sessionUserId: string | null
  playerId: string | null
  gameId: string | null
  isAdmin: boolean
  setPlayerInfo: (info: { playerId: string; gameId: string; isAdmin: boolean }) => void
  isLoading: boolean
}

const PlayerContext = createContext<PlayerIdentity>({
  sessionUserId: null,
  playerId: null,
  gameId: null,
  isAdmin: false,
  setPlayerInfo: () => {},
  isLoading: true,
})

const STORAGE_KEY = 'ki_player'

function saveToStorage(info: { playerId: string; gameId: string; isAdmin: boolean }) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info))
}

function loadFromStorage(): { playerId: string; gameId: string; isAdmin: boolean } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      // 1. Restore or create anonymous session
      const session = await signInAnonymously()
      if (!session) {
        setIsLoading(false)
        return
      }
      setSessionUserId(session.user.id)

      // 2. Try to restore from sessionStorage
      const stored = loadFromStorage()
      if (stored) {
        setPlayerId(stored.playerId)
        setGameId(stored.gameId)
        setIsAdmin(stored.isAdmin)
        setIsLoading(false)
        return
      }

      // 3. No stored info — look for an active game for this user
      const { data: players } = await supabase
        .from('players')
        .select('id, game_id, is_admin, games!inner(status)')
        .eq('user_id', session.user.id)
        .in('games.status', ['lobby', 'playing'])
        .order('created_at', { ascending: false })
        .limit(1)

      if (players && players.length > 0) {
        const p = players[0]
        const info = { playerId: p.id, gameId: p.game_id, isAdmin: p.is_admin }
        setPlayerId(info.playerId)
        setGameId(info.gameId)
        setIsAdmin(info.isAdmin)
        saveToStorage(info)
      }

      setIsLoading(false)
    }

    init().catch((e) => {
      console.error(e)
      setIsLoading(false)
    })
  }, [])

  const setPlayerInfo = (info: { playerId: string; gameId: string; isAdmin: boolean }) => {
    setPlayerId(info.playerId)
    setGameId(info.gameId)
    setIsAdmin(info.isAdmin)
    saveToStorage(info)
  }

  return (
    <PlayerContext.Provider value={{ sessionUserId, playerId, gameId, isAdmin, setPlayerInfo, isLoading }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
