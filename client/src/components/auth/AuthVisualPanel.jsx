import AuthTrustPoint from './AuthTrustPoint'

const dashboardCards = [
  ['Analysis History', '24 Records'],
  ['PDF Reports', 'Ready'],
  ['Latest Scan', 'Fake Detected'],
  ['Heatmaps', 'Generated'],
]

export default function AuthVisualPanel() {
  return (
    <aside className="relative hidden min-h-[680px] overflow-hidden rounded-[34px] border border-white/10 bg-[#071116] shadow-[0_30px_90px_rgba(0,0,0,.44),inset_0_1px_0_rgba(255,255,255,.06)] lg:block">
      <img className="absolute inset-0 h-full w-full object-cover opacity-75" src="/images/auth-forensic-access.png" alt="" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,11,.18),rgba(3,8,11,.86)),linear-gradient(90deg,rgba(3,8,11,.85),rgba(3,8,11,.18))]" aria-hidden="true" />
      <div className="relative flex h-full min-h-[680px] flex-col justify-between p-8">
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.15em] text-cyan-100">
            <span className="size-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />
            Secure Forensic Access
          </div>
          <h2 className="mt-5 max-w-[430px] text-[clamp(32px,3.6vw,52px)] font-semibold leading-[1.04] tracking-[-.045em] text-white">
            Protected Analysis Workspace
          </h2>
          <p className="mt-4 max-w-[420px] text-sm leading-6 text-[#a9bac1]">
            Access saved reports, frame-level heatmaps, prior scans, and private video analysis records from one secure dashboard.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3">
            {dashboardCards.map(([label, value], index) => (
              <div className={`rounded-2xl border border-white/10 bg-[#071116]/80 p-4 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 ${index % 2 ? 'translate-y-3' : ''}`} key={label}>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">{label}</p>
                <p className={`mt-2 text-lg font-bold ${value.includes('Fake') ? 'text-red-100' : 'text-cyan-100'}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            <AuthTrustPoint icon="shield" title="Private Analysis History" description="Stored under your account." />
            <AuthTrustPoint icon="heatmap" title="Frame-Level Heatmap Results" description="Review model attention areas." />
            <AuthTrustPoint icon="pdf" title="Downloadable PDF Reports" description="Export forensic evidence." />
          </div>
        </div>
      </div>
    </aside>
  )
}
