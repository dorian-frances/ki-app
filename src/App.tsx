import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './contexts/PlayerContext'
import { GameProvider } from './contexts/GameContext'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/join/:code" element={<HomePage />} />
            <Route path="/game/:code" element={<GamePage />} />
          </Routes>
        </GameProvider>
      </PlayerProvider>
    </BrowserRouter>
  )
}
