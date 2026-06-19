const iconPaths = {
  shield: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.6-2.8 7.9-7 9.3-4.2-1.4-7-4.7-7-9.3V6l7-2.5Z" />
      <path d="m9.7 12.1 1.6 1.6 3.4-3.8" />
    </>
  ),
  heatmap: (
    <>
      <path d="M7 18c1.4-2 2.1-4.2 2.1-6.7A4.9 4.9 0 0 1 14 6.4c2.7 0 4.9 2.2 4.9 4.9 0 2.5.7 4.7 2.1 6.7" />
      <path d="M10 14.4c1.5.8 3.4.8 5 0" />
      <path d="M11.2 10.9h.1M16.7 10.9h.1" />
    </>
  ),
  pdf: (
    <>
      <path d="M7 3.5h7l3 3V20.5H7V3.5Z" />
      <path d="M14 3.5v4h4" />
      <path d="M9.5 13h5M9.5 16h4" />
    </>
  ),
}

export default function AuthTrustPoint({ icon = 'shield', title, description, delay = '' }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] ${delay}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/[.075] text-cyan-100">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {iconPaths[icon]}
        </svg>
      </span>
      <span>
        <strong className="block text-sm font-bold text-white">{title}</strong>
        {description && <span className="mt-1 block text-xs leading-5 text-[#8ea2aa]">{description}</span>}
      </span>
    </div>
  )
}
