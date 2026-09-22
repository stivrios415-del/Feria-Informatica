import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inscripcion from './pages/Inscripcion'
import Juez from './pages/Juez'
import Admin from './pages/Admin'
import Ranking from './pages/Ranking'
import Visitantes from './pages/Visitantes'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inscripcion" element={<Inscripcion />} />
      <Route path="/juez" element={<Juez />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/registro-visitantes" element={<Visitantes />} />
    </Routes>
  )
}