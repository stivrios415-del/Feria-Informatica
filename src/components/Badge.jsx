export default function Badge({ estado, children }) {
  return <span className={`badge ${estado}`}>{children ?? estado}</span>
}
