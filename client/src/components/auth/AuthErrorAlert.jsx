export default function AuthErrorAlert({ message, tone = 'error' }) {
  if (!message) return null

  const styles = tone === 'success'
    ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
    : 'border-red-300/25 bg-red-400/10 text-red-100'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${styles}`} role="alert">
      {message}
    </div>
  )
}
