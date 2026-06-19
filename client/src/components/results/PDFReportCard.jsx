export default function PDFReportCard({ onDownload }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/18 bg-cyan-300/[.055] p-6 shadow-[0_26px_70px_rgba(34,211,238,.08),inset_0_1px_0_rgba(255,255,255,.06)]">
      <div className="pointer-events-none absolute right-0 top-0 size-48 bg-[radial-gradient(circle,rgba(34,211,238,.18),transparent_65%)]" aria-hidden="true" />
      <div className="relative grid grid-cols-[64px_minmax(0,1fr)_auto] gap-5 max-lg:grid-cols-[56px_minmax(0,1fr)] max-sm:grid-cols-1">
        <span className="grid size-16 place-items-center rounded-3xl border border-cyan-300/25 bg-[#071116]/75">
          <img className="size-10" src="/icons/pdf-report.svg" alt="" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-[-.03em] text-white">PDF Analysis Report</h2>
          <p className="mt-3 max-w-[720px] text-[15px] leading-7 text-[#a9bac1]">
            Download a detailed report containing the final prediction, fake probability, authenticity score, frame-level results, original frame vs heatmap comparison, and final explanation.
          </p>
        </div>
        <div className="flex items-center gap-3 max-lg:col-span-2 max-sm:col-span-1 max-sm:grid">
          <a className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[.045] px-5 text-sm font-bold text-slate-100 transition-all duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/10" href="/report">
            Preview Report
          </a>
          <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-extrabold text-[#021014] shadow-[0_16px_38px_rgba(34,211,238,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200" type="button" onClick={onDownload}>
            Download PDF
          </button>
        </div>
      </div>
    </section>
  )
}
