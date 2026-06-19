export default function AuthFormCard({ eyebrow, title, subtitle, children }) {
  return (
    <section className="w-full animate-[pulse_.55s_ease-out_1] rounded-[30px] border border-white/10 bg-white/[.045] p-7 shadow-[0_28px_80px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl max-sm:p-5">
      <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
        <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
        {eyebrow}
      </div>
      <h1 className="text-[clamp(34px,5vw,56px)] font-semibold leading-[1.04] tracking-[-.045em] text-white">{title}</h1>
      <p className="mt-4 text-[15px] leading-7 text-[#a9bac1]">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </section>
  )
}
