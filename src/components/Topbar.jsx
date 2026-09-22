import { Link } from 'react-router-dom'

export default function Topbar({ children }) {
  return (
    <div className="topbar">
      <img src="/logo.jpg" alt="logo" />
      <h1>
        FERIA DE INFORMÁTICA <span>GAMING EDITION</span>
      </h1>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/ranking">Ranking</Link>
        {children}
      </nav>
    </div>
  )
}
