const footerColumns = [
  {
    title: 'Project',
    links: [
      { label: 'Home', href: '#top' },
      { label: 'Upload Video', href: '/upload' },
      { label: 'Detection Process', href: '#detection-flow' },
      { label: 'Result Dashboard', href: '#case-analysis' },
      { label: 'PDF Report', href: '#features' },
    ],
  },
  {
    title: 'System Features',
    links: [
      { label: 'Video Upload', href: '#features' },
      { label: 'Frame Extraction', href: '#features' },
      { label: 'Face Detection', href: '#features' },
      { label: 'AI Analysis', href: '#features' },
      { label: 'Heatmap Explanation', href: '#features' },
      { label: 'PDF Report Generation', href: '#features' },
    ],
  },
]

export default function FooterSection() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[.07] bg-[#03080b] text-slate-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(33,216,238,.075),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />

      <div className="relative mx-auto w-[min(1240px,calc(100%-48px))] pt-20 max-md:w-[min(680px,calc(100%-30px))] max-md:pt-16">
        <div className="grid grid-cols-[1.5fr_.75fr_1fr_1fr] gap-12 pb-16 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-10">
          <div className="max-w-[390px]">
            <a className="inline-flex items-center gap-3" href="#top" aria-label="VerifAI video forensics home">
              <span className="grid size-12 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/[.065] shadow-[inset_0_0_20px_rgba(33,216,238,.06)]">
                <img className="size-9 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,.3)]" src="/images/verifai-logo.svg" alt="" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[17px] font-black uppercase tracking-[.14em] text-white">Verif<span className="text-cyan-300">AI</span></span>
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[.12em] text-slate-500">AI Video Forensics</span>
              </span>
            </a>
            <p className="mt-6 text-[13px] leading-6 text-[#83969e]">
              An AI-based video analysis system that detects deepfake manipulation, explains suspicious facial regions using heatmaps, and generates downloadable PDF reports.
            </p>

            <div className="mt-7 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[.16em] text-cyan-200/55">
              <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.7)]" />
              Academic research system
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`${column.title} footer navigation`}>
              <h2 className="text-[11px] font-bold uppercase tracking-[.18em] text-white/75">{column.title}</h2>
              <ul className="mt-6 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a className="group inline-flex items-center gap-2 text-xs text-[#81949c] transition-colors hover:text-cyan-200" href={link.href}>
                      <span className="h-px w-0 bg-cyan-300 transition-all duration-300 group-hover:w-3" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[.18em] text-white/75">Academic Info</h2>
            <div className="mt-6 border-l border-cyan-300/20 pl-4">
              <p className="text-xs font-semibold text-slate-200">Final Year Project</p>
              <p className="mt-2 text-xs text-[#81949c]">BS Software Engineering</p>
              <p className="mt-2 text-xs leading-5 text-[#81949c]">University of Central Punjab, Lahore</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-y border-white/[.06] py-5">
          <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-amber-300/20 bg-amber-300/[.06] text-[10px] font-bold text-amber-200">i</span>
          <p className="max-w-[900px] text-[11px] leading-5 text-[#71858d]">
            This system is designed to assist in video authenticity analysis. Results should be interpreted with confidence scores and heatmap explanations.
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 py-7 max-md:flex-col max-md:items-start">
          <p className="text-[10px] leading-5 text-[#60747c]">© 2026 Deepfake Detection System. Developed as a Final Year Project for academic and research purposes.</p>
          <a className="inline-flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#71858d] transition-colors hover:text-cyan-200" href="#top">
            Back to top
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
