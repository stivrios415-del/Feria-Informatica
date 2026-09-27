import { puntosMaxCriterio } from '../lib/criterios'

export default function CriterioSlider({ criterio, value, onChange, disabled }) {
  const max = puntosMaxCriterio(criterio)
  const pct = (value / max) * 100

  return (
    <div className="criterio-row">
      <label>
        {criterio.label}{' '}
        <small style={{ color: 'var(--text-dim)' }}>
          ({Math.round(criterio.peso * 100)}% · hasta {max} pts)
        </small>
      </label>
      <input
        type="range"
        min={0}
        max={max}
        step={0.5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` }}
      />
      <div className="val">{value}</div>
    </div>
  )
}
