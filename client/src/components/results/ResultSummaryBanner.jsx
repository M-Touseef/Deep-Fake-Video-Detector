export default function ResultSummaryBanner({ result }) {
  const isFake = result.finalPrediction === 'Fake'

  return (
    <section className={`relative overflow-hidden rounded-[30px] border p-7 shadow-[0_28px_80px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.06)] ${isFake ? 'border-red-300/20 bg-red-400/[.075]' : 'border-emerald-300/20 bg-emerald-300/[.065]'}`} aria-label="Final prediction summary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_8%,rgba(34,211,238,.14),transparent_30%),linear-gradient(120deg,rgba(255,255,255,.05),transparent_45%)]" aria-hidden="true" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_260px] gap-7 max-lg:grid-cols-1">
        <div>
          <span className={`inline-flex items-center rounded-full border px-3.5 py-2 text-[11px] font-black uppercase tracking-[.14em] ${isFake ? 'border-red-300/25 bg-red-400/15 text-red-100' : 'border-emerald-300/25 bg-emerald-300/15 text-emerald-100'}`}>
            Final Prediction: {result.finalPrediction}
          </span>
          <h2 className="mt-5 text-[clamp(34px,5vw,62px)] font-semibold leading-[1.02] tracking-[-.05em] text-white">
            {isFake ? 'Manipulation Detected' : 'No Strong Manipulation Detected'}
          </h2>
          <p className="mt-5 max-w-[780px] text-[15px] leading-7 text-[#b5c5cb]">{result.conclusion}</p>
        </div>

        <div className="grid rounded-[26px] border border-white/10 bg-[#071116]/72 p-5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Fake Probability</span>
          <strong className={`mt-4 text-[clamp(54px,8vw,82px)] font-semibold leading-none tracking-[-.07em] ${isFake ? 'text-red-100' : 'text-emerald-100'}`}>
            {result.fakeProbability}%
          </strong>
          <span className="mt-4 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-bold text-slate-200">Confidence: {result.confidenceLevel}</span>
        </div>
      </div>
    </section>
  )
}
