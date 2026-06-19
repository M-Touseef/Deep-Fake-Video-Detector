export default function AuthButton({ children, loading, loadingText }) {
  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-extrabold text-[#021014] shadow-[0_16px_38px_rgba(34,211,238,.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
      type="submit"
      disabled={loading}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-[#021014]/20 border-t-[#021014]" aria-hidden="true" />}
      {loading ? loadingText : children}
    </button>
  )
}
