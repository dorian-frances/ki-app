import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { signInAnonymously } from '../lib/game-actions'

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

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    signInAnonymously()
      .then((session) => {
        if (session) {
          setSessionUserId(session.user.id)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const setPlayerInfo = (info: { playerId: string; gameId: string; isAdmin: boolean }) => {
    setPlayerId(info.playerId)
    setGameId(info.gameId)
    setIsAdmin(info.isAdmin)
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
