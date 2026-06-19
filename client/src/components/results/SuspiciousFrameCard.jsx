import { useState } from 'react'

function EvidenceImage({ src, alt, label, heatmap = false }) {
  const [failed, setFailed] = useState(!src)

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#071116]">
      {failed ? (
        <div className="grid h-full place-items-center text-sm font-bold text-slate-500">{heatmap ? 'No heatmap' : 'No image'}</div>
      ) : (
        <img className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${heatmap ? 'opacity-90 mix-blend-screen group-hover:opacity-100' : ''}`} src={src} alt={alt} onError={() => setFailed(true)} />
      )}
      <span className={`absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] backdrop-blur-md ${heatmap ? 'text-cyan-100' : 'text-slate-100'}`}>{label}</span>
    </div>
  )
}

export default function SuspiciousFrameCard({ frame }) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[.04] shadow-[0_20px_60px_rgba(0,0,0,.26),inset_0_1px_0_rgba(255,255,255,.05)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/25">
      <div className="grid grid-cols-2">
        <EvidenceImage alt={`${frame.frameNumber} original frame`} label="Original" src={frame.originalImage} />
        <EvidenceImage alt={`${frame.frameNumber} heatmap`} heatmap label="Heatmap" src={frame.heatmapImage} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">{frame.frameNumber}</h3>
            <p className="mt-1 text-sm text-[#8ea2aa]">Fake Probability: <strong className="font-semibold text-red-100">{frame.fakeProbability}%</strong></p>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] ${frame.status === 'Fake' ? 'border-red-300/25 bg-red-400/15 text-red-100' : 'border-amber-300/25 bg-amber-300/15 text-amber-100'}`}>
            {frame.status}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
          {(frame.affectedRegions || ['No frame']).map((region) => (
            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[.075] px-2.5 py-1 text-[11px] font-semibold text-cyan-100" key={region}>{region}</span>
          ))}
        </div>
      </div>
    </article>
  )
}
