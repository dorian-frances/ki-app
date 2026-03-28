import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Avatar, { AVATARS } from '../ui/Avatar'
import { createGame } from '../../lib/game-actions'
import { usePlayer } from '../../contexts/PlayerContext'

export default function CreateGameForm() {
  const navigate = useNavigate()
  const { setPlayerInfo } = usePlayer()
  const [userName, setUserName] = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const [rounds, setRounds] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!userName.trim()) {
      setError('Entre ton nom !')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await createGame(userName.trim(), avatar, rounds)
      setPlayerInfo({ playerId: result.player_id, gameId: result.game_id, isAdmin: true })
      navigate(`/game/${result.code}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <Input
        label="Ton nom"
        placeholder="Ex: Jean-Michel"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        maxLength={20}
      />

      <div>
        <label className="block text-sm font-bold text-ki-purple-light mb-2">Ton avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <Avatar key={a} emoji={a} size="sm" selected={avatar === a} onClick={() => setAvatar(a)} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-ki-purple-light mb-1">Nombre de manches</label>
        <div className="flex items-center gap-3">
          {[1, 3, 5, 7, 10].map((n) => (
            <button
              key={n}
              onClick={() => setRounds(n)}
              className={`px-4 py-2 rounded-xl font-extrabold transition-all ${
                rounds === n
                  ? 'bg-ki-purple text-white'
                  : 'bg-ki-card text-white/60 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-ki-pink text-sm font-bold">{error}</p>}

      <Button onClick={handleCreate} disabled={loading} className="w-full" size="lg">
        {loading ? 'Creation...' : 'Creer la partie'}
      </Button>
    </motion.div>
  )
}
