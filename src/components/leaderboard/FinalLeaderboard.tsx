import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'

export default function FinalLeaderboard() {
  const { state } = useGameState()
  const [showConfetti, setShowConfetti] = useState(false)

  const sorted = [...state.players].sort((a, b) => b.score - a.score)
  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="space-y-6">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#f4f1de', '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#e9a08b'][i % 6],
              }}
              initial={{ y: -20, opacity: 1, scale: 1 }}
              animate={{
                y: window.innerHeight + 20,
                opacity: 0,
                rotate: Math.random() * 720,
                x: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}

      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-3xl font-black text-center bg-gradient-to-r from-ki-sand via-ki-terra to-ki-terra-light bg-clip-text text-transparent"
      >
        Fin de partie !
      </motion.h2>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 h-52">
        {/* 2nd place */}
        {podium[1] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <Avatar emoji={podium[1].avatar} size="lg" />
            <span className="font-extrabold text-sm mt-1 truncate max-w-[80px]">{podium[1].user_name}</span>
            <span className="text-ki-terra-light font-black">{podium[1].score} pts</span>
            <div className="w-20 h-24 bg-gradient-to-t from-ki-terra/40 to-ki-terra/20 rounded-t-lg mt-1 flex items-center justify-center">
              <span className="text-3xl">🥈</span>
            </div>
          </motion.div>
        )}

        {/* 1st place */}
        {podium[0] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Avatar emoji={podium[0].avatar} size="lg" />
            </motion.div>
            <span className="font-extrabold text-sm mt-1 truncate max-w-[80px]">{podium[0].user_name}</span>
            <span className="text-ki-sand font-black">{podium[0].score} pts</span>
            <div className="w-20 h-32 bg-gradient-to-t from-ki-sand/40 to-ki-sand/20 rounded-t-lg mt-1 flex items-center justify-center">
              <span className="text-3xl">🥇</span>
            </div>
          </motion.div>
        )}

        {/* 3rd place */}
        {podium[2] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center"
          >
            <Avatar emoji={podium[2].avatar} size="lg" />
            <span className="font-extrabold text-sm mt-1 truncate max-w-[80px]">{podium[2].user_name}</span>
            <span className="text-ki-terra font-black">{podium[2].score} pts</span>
            <div className="w-20 h-16 bg-gradient-to-t from-ki-terra/40 to-ki-terra/20 rounded-t-lg mt-1 flex items-center justify-center">
              <span className="text-3xl">🥉</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <Card>
          <AnimatePresence>
            {rest.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ki-card/30"
              >
                <span className="w-8 text-center text-lg font-black text-white/40">#{i + 4}</span>
                <Avatar emoji={player.avatar} size="sm" />
                <span className="font-extrabold flex-1 truncate">{player.user_name}</span>
                <span className="font-black text-lg">{player.score}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}
