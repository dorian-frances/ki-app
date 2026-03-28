import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Avatar, { AVATARS } from '../ui/Avatar'
import { joinGame } from '../../lib/game-actions'
import { usePlayer } from '../../contexts/PlayerContext'

export default function JoinGameForm({ initialCode }: { initialCode?: string }) {
  const navigate = useNavigate()
  const { setPlayerInfo } = usePlayer()
  const [code, setCode] = useState(initialCode ?? '')
  const [userName, setUserName] = useState('')
  const [avatar, setAvatar] = useState('🐱')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!userName.trim()) {
      setError('Entre ton nom !')
      return
    }
    if (!code.trim()) {
      setError('Entre le code de la partie !')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await joinGame(code.trim().toUpperCase(), userName.trim(), avatar)
      setPlayerInfo({ playerId: result.player_id, gameId: result.game_id, isAdmin: false })
      navigate(`/game/${code.trim().toUpperCase()}`)
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
        label="Code de la partie"
        placeholder="Ex: KI7X2P"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        className="tracking-widest text-center text-xl"
      />

      <Input
        label="Ton nom"
        placeholder="Ex: Jean-Michel"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        maxLength={20}
      />

      <div>
        <label className="block text-sm font-bold text-ki-terra-light mb-2">Ton avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <Avatar key={a} emoji={a} size="sm" selected={avatar === a} onClick={() => setAvatar(a)} />
          ))}
        </div>
      </div>

      {error && <p className="text-ki-terra text-sm font-bold">{error}</p>}

      <Button onClick={handleJoin} disabled={loading} className="w-full" size="lg">
        {loading ? 'Connexion...' : 'Rejoindre'}
      </Button>
    </motion.div>
  )
}
