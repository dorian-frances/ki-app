import { motion, AnimatePresence } from 'motion/react'
import type { Player } from '../../types/database'
import Avatar from '../ui/Avatar'

interface PlayerListProps {
  players: Player[]
  adminId?: string | null
}

export default function PlayerList({ players, adminId }: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-ki-purple-light uppercase tracking-wider">
        Joueurs ({players.length})
      </h3>
      <AnimatePresence>
        {players.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 bg-ki-card/60 rounded-xl px-4 py-3"
          >
            <Avatar emoji={player.avatar} size="sm" />
            <span className="font-extrabold flex-1">{player.user_name}</span>
            {player.id === adminId && (
              <span className="text-xs font-bold bg-ki-yellow/20 text-ki-yellow px-2 py-0.5 rounded-lg">
                Admin
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
