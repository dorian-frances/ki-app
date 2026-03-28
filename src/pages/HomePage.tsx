import { useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import PageShell from '../components/layout/PageShell'
import CreateGameForm from '../components/home/CreateGameForm'
import JoinGameForm from '../components/home/JoinGameForm'
import { usePlayer } from '../contexts/PlayerContext'

export default function HomePage() {
  const { code: paramCode } = useParams<{ code: string }>()
  const [searchParams] = useSearchParams()
  const initialCode = paramCode ?? searchParams.get('code') ?? ''
  const [mode, setMode] = useState<'create' | 'join'>(initialCode ? 'join' : 'create')
  const { isLoading } = usePlayer()

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-xl font-bold text-ki-terra-light">Chargement...</div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-black bg-gradient-to-r from-ki-terra-light via-ki-terra to-ki-sand bg-clip-text text-transparent"
        >
          KI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 mt-2 font-bold"
        >
          Devine qui a ecrit quoi !
        </motion.p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-3 rounded-xl font-extrabold transition-all ${
            mode === 'create'
              ? 'bg-ki-terra text-white'
              : 'bg-ki-card text-white/40 hover:text-white/60'
          }`}
        >
          Creer
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 py-3 rounded-xl font-extrabold transition-all ${
            mode === 'join'
              ? 'bg-ki-terra text-white'
              : 'bg-ki-card text-white/40 hover:text-white/60'
          }`}
        >
          Rejoindre
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'create' ? (
          <motion.div key="create" exit={{ opacity: 0, y: -10 }}>
            <CreateGameForm />
          </motion.div>
        ) : (
          <motion.div key="join" exit={{ opacity: 0, y: -10 }}>
            <JoinGameForm initialCode={initialCode} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
