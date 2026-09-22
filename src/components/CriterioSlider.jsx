import { ESCALA_MIN, ESCALA_MAX } from '../lib/criterios'

export default function CriterioSlider({ criterio, value, onChange, disabled }) {
  return (
    <div className="criterio-row">
      <label>
        {criterio.label}{' '}
        <small style={{ color: 'var(--text-dim)' }}>
          ({Math.round(criterio.peso * 100)}%)
        </small>
      </label>
      <input
        type="range"
        min={ESCALA_MIN}
        max={ESCALA_MAX}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="val">{value}</div>
    </div>
  )
}
