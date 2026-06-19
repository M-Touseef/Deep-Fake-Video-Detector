export default function AuthInput({ id, label, error, ...props }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-slate-400">{label}</span>
      <input
        className={`min-h-12 w-full rounded-2xl border bg-[#071116]/80 px-4 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-cyan-300/60 focus:bg-[#091820] focus:shadow-[0_0_0_4px_rgba(34,211,238,.08)] ${error ? 'border-red-300/45' : 'border-white/10'}`}
        id={id}
        {...props}
      />
      {error && <span className="mt-2 block text-xs font-semibold text-red-200">{error}</span>}
    </label>
  )
}
