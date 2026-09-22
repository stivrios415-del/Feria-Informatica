import { Link } from 'react-router-dom'
import { useRef } from 'react'
import './Home.css'

export default function Home() {
  const logoRef = useRef(null)

  function handleMouseMove(e) {
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = (-y / (rect.height / 2)) * 18
    const rotateY = (x / (rect.width / 2)) * 18
    if (logoRef.current) {
      logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06, 1.06, 1.06)`
    }
  }

  function handleTouchMove(e) {
    if (!e.touches.length) return
    const container = e.currentTarget
    const touch = e.touches[0]
    const rect = container.getBoundingClientRect()
    const x = touch.clientX - rect.left - rect.width / 2
    const y = touch.clientY - rect.top - rect.height / 2
    const rotateX = (-y / (rect.height / 2)) * 14
    const rotateY = (x / (rect.width / 2)) * 14
    if (logoRef.current) {
      logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`
    }
  }

  function resetTilt() {
    if (logoRef.current) {
      logoRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }
  }

  return (
    <div className="home">
      <header className="h-topbar">
        <a href="#" className="h-brand">
          <img
            src="/logo.jpg"
            alt="Logo"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/100x100/030712/00f0ff?text=FG'
            }}
          />
          <h1>
            FERIA <span>GAMING</span>
          </h1>
        </a>
        <nav className="h-nav">
          <Link to="/inscripcion">
            <i className="fa-solid fa-pen-to-square"></i> Inscripción
          </Link>
          <Link to="/ranking">
            <i className="fa-solid fa-trophy"></i> Ranking
          </Link>
        </nav>
      </header>

      <section className="h-hero">
        <div
          className="logo-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          onTouchMove={handleTouchMove}
          onTouchEnd={resetTilt}
        >
          <img
            ref={logoRef}
            className="logo"
            src="/logo.jpg"
            alt="Feria de Informática - Gaming Edition"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/300x300/030712/00f0ff?text=GAMING+EDITION'
            }}
          />
        </div>

        <div className="h-hero-copy">
          <span className="h-eyebrow">Feria escolar de tecnología</span>
          <h1>
            FERIA DE INFORMÁTICA <b>GAMING EDITION</b>
          </h1>
          <span className="h-rule" />
          <p className="lede">
            Inscripción de proyectos, evaluación de jueces en directo y ranking público
            actualizado en tiempo real — todo en un solo lugar.
          </p>

          <nav className="h-actions">
            <Link to="/inscripcion">
              <i className="fa-solid fa-pen-to-square"></i> Inscribir proyecto
            </Link>
            <Link to="/ranking" className="gold">
              <i className="fa-solid fa-trophy"></i> Ranking en vivo
            </Link>
            <Link to="/juez" className="magenta">
              <i className="fa-solid fa-gavel"></i> Acceso de jueces
            </Link>
            <Link to="/admin" className="green">
              <i className="fa-solid fa-gears"></i> Panel de control
            </Link>
          </nav>
        </div>
      </section>

      <p className="h-footer-note">
        <b>Criterios oficiales:</b>
        <span className="crit">Innovación 25%</span>
        <span className="crit">Funcionalidad 25%</span>
        <span className="crit">Diseño/UX 20%</span>
        <span className="crit">Impacto 15%</span>
        <span className="crit">Presentación 15%</span>
      </p>
    </div>
  )
}