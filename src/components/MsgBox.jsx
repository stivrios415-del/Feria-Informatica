// type: '' | 'ok' | 'err'
export default function MsgBox({ text, type }) {
  if (!text) return null
  return <div className={`msg ${type}`}>{text}</div>
}
