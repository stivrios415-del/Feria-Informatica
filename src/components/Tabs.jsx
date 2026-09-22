export default function Tabs({ items, active, onChange }) {
  return (
    <div className="tabs">
      {items.map((item) => (
        <button
          key={item.value}
          className={active === item.value ? 'active' : ''}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
