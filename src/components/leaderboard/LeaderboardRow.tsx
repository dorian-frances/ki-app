import { motion } from 'motion/react'
import Avatar from '../ui/Avatar'
import ScoreCounter from './ScoreCounter'
import type { PlayerScore } from '../../types/game'

interface LeaderboardRowProps {
  score: PlayerScore
  index: number
  showAnimation: boolean
}

const rankEmojis: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardRow({ score, index, showAnimation }: LeaderboardRowProps) {
  const moved = score.rank !== score.oldRank
  const movedUp = score.rank < score.oldRank
  const pointsDiff = score.newScore - score.oldScore

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        layout: { type: 'spring', damping: 25, stiffness: 200, delay: index * 0.05 },
        opacity: { delay: index * 0.05 },
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        moved && showAnimation
          ? movedUp
            ? 'bg-ki-sage/10 border border-ki-sage/30'
            : 'bg-ki-terra/10 border border-ki-terra/30'
          : 'bg-ki-card/60'
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center">
        {rankEmojis[score.rank] ? (
          <span className="text-xl">{rankEmojis[score.rank]}</span>
        ) : (
          <span className="text-lg font-black text-white/40">#{score.rank}</span>
        )}
      </div>

      {/* Avatar + Name */}
      <Avatar emoji={score.avatar} size="sm" />
      <span className="font-extrabold flex-1 truncate">{score.userName}</span>

      {/* Score change indicator */}
      {showAnimation && pointsDiff !== 0 && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-black ${pointsDiff > 0 ? 'text-ki-sage' : 'text-ki-terra'}`}
        >
          {pointsDiff > 0 ? '+' : ''}{pointsDiff}
        </motion.span>
      )}

      {/* Score */}
      <div className="font-black text-lg min-w-[40px] text-right">
        {showAnimation ? (
          <ScoreCounter from={score.oldScore} to={score.newScore} />
        ) : (
          score.newScore
        )}
      </div>
    </motion.div>
  )
}
