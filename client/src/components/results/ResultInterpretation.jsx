export default function ResultInterpretation({ interpretation }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
      <h2 className="text-2xl font-bold tracking-[-.03em] text-white">Result Interpretation</h2>
      <p className="mt-4 max-w-[920px] text-[15px] leading-7 text-[#a9bac1]">{interpretation}</p>
    </section>
  )
}
