import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { useGameState } from '../../contexts/GameContext'
import LeaderboardRow from './LeaderboardRow'
import Card from '../ui/Card'

export default function Leaderboard() {
  const { state } = useGameState()
  const [showAnimation, setShowAnimation] = useState(false)
  const [sortedScores, setSortedScores] = useState(state.scores)

  useEffect(() => {
    // First show old order, then animate
    const oldOrder = [...state.scores].sort((a, b) => a.oldRank - b.oldRank)
    setSortedScores(oldOrder)

    // Start score counter animation after a short delay
    const t1 = setTimeout(() => setShowAnimation(true), 500)

    // Re-sort by new rank after counter animation completes
    const t2 = setTimeout(() => {
      setSortedScores([...state.scores].sort((a, b) => a.rank - b.rank))
    }, 2200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [state.scores])

  return (
    <Card>
      <div className="space-y-3">
        <h2 className="text-center text-xl font-black mb-4">
          Classement - Manche {state.currentRound?.round_number ?? '?'}
        </h2>
        <AnimatePresence>
          {sortedScores.map((score, i) => (
            <LeaderboardRow key={score.playerId} score={score} index={i} showAnimation={showAnimation} />
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}
