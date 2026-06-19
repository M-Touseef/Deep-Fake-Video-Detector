import { useEffect, useState } from 'react'
import { realWorldCases, riskStyles } from '../../data/homeContent'
import { useSectionReveal } from '../../hooks/useSectionReveal'
import { ArrowIcon } from '../shared/Icons'

export default function CaseAnalysis() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [comparePosition, setComparePosition] = useState(52)
  const [displayProbability, setDisplayProbability] = useState(0)
  const { isVisible, sectionRef } = useSectionReveal(0.15)
  const selectedCase = realWorldCases[selectedIndex]

  useEffect(() => {
    let frame
    const startedAt = performance.now()
    const duration = 650

    const count = (time) => {
      const progress = Math.min((time - startedAt) / duration, 1)
      setDisplayProbability(Math.round((1 - Math.pow(1 - progress, 3)) * selectedCase.probability))
      if (progress < 1) frame = requestAnimationFrame(count)
    }

    setDisplayProbability(0)
    frame = requestAnimationFrame(count)
    return () => cancelAnimationFrame(frame)
  }, [selectedCase.probability])

  const selectCase = (index) => {
    setSelectedIndex(index)
    setComparePosition(52)
  }

  const dividerX = comparePosition * 16

  return (
    <section id="case-analysis" ref={sectionRef} className="relative scroll-mt-6 overflow-hidden bg-[#050b0f] py-28 max-md:py-20" aria-labelledby="case-analysis-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_42%,rgba(33,216,238,.075),transparent_34%),radial-gradient(circle_at_10%_60%,rgba(255,77,81,.04),transparent_27%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,transparent,#000_20%,#000_80%,transparent)]" />

      <div className="relative mx-auto w-[min(1320px,calc(100%-48px))] max-md:w-[min(680px,calc(100%-30px))]">
        <header className="mb-16 max-w-[780px] max-lg:mx-auto max-lg:text-center">
          <div className={`mb-5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-cyan-200/80 transition-all duration-700 max-lg:justify-center ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            <span className="size-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.8)]" />
            Case intelligence
          </div>
          <h2 id="case-analysis-title" className={`text-[clamp(34px,4vw,52px)] font-semibold leading-[1.12] tracking-[-.045em] transition-all delay-100 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>Real-World Deepfake Case Analysis</h2>
          <p className={`mt-5 max-w-[720px] text-[15px] leading-7 text-[#91a5ad] transition-all delay-200 duration-700 max-lg:mx-auto ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>See how the system analyzes suspicious video frames, highlights manipulated facial regions, and explains the final Real/Fake prediction.</p>
        </header>

        <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-8 max-lg:grid-cols-1">
          <div className={`transition-all delay-300 duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>
            <div className="mb-5 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-500">Case queue</span>
              <span className="rounded-full bg-white/[.04] px-2.5 py-1 text-[10px] font-semibold text-slate-400">05 samples</span>
            </div>

            <div className="flex flex-col gap-2.5 max-lg:grid max-lg:grid-cols-2 max-sm:flex">
              {realWorldCases.map((caseItem, index) => {
                const active = index === selectedIndex
                return (
                  <button type="button" onClick={() => selectCase(index)} className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[.045] ${active ? 'border-cyan-300/35 bg-cyan-300/[.065] shadow-[0_12px_30px_rgba(0,0,0,.2)]' : 'border-white/[.065] bg-white/[.025]'}`} key={caseItem.title}>
                    <span className="relative h-[62px] w-[82px] shrink-0 overflow-hidden rounded-xl bg-slate-900">
                      <img className="size-full object-cover" src={caseItem.originalImage} alt="" aria-hidden="true" />
                      <img className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${active ? 'opacity-45' : 'opacity-0 group-hover:opacity-50'}`} src={caseItem.heatmapImage} alt="" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-slate-100">{caseItem.title}</span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.08em] ${riskStyles[caseItem.status]}`}>{caseItem.status}</span>
                        <span className="text-[11px] font-semibold text-slate-400">{caseItem.probability}% fake</span>
                      </span>
                    </span>
                    <span className={`mr-1 grid size-6 place-items-center rounded-full border transition-all ${active ? 'translate-x-0 border-cyan-300/30 bg-cyan-300/10 text-cyan-200 opacity-100' : '-translate-x-1 border-transparent text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}><ArrowIcon /></span>
                  </button>
                )
              })}
            </div>
          </div>

          <article className={`overflow-hidden rounded-[28px] border border-white/[.08] bg-[#091218]/90 shadow-[0_30px_80px_rgba(0,0,0,.34)] transition-all delay-300 duration-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
            <div className="flex items-center justify-between gap-4 border-b border-white/[.065] px-6 py-5 max-sm:items-start max-sm:px-4">
              <div><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-200/60">Selected case</span><h3 className="mt-1 text-xl font-semibold tracking-[-.025em] text-white">{selectedCase.title}</h3></div>
              <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] ${riskStyles[selectedCase.status]}`}>{selectedCase.status}</span>
            </div>

            <div className="p-6 max-sm:p-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-black shadow-[0_18px_45px_rgba(0,0,0,.3)]">
                <svg className="block aspect-video w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${selectedCase.title} original frame and heatmap comparison`}>
                  <defs><clipPath id={`case-clip-${selectedIndex}`}><rect x="0" y="0" width={dividerX} height="900" /></clipPath></defs>
                  <image href={selectedCase.originalImage} width="1600" height="900" preserveAspectRatio="xMidYMid slice" />
                  <image href={selectedCase.heatmapImage} width="1600" height="900" preserveAspectRatio="xMidYMid slice" clipPath={`url(#case-clip-${selectedIndex})`} />
                  <line x1={dividerX} y1="0" x2={dividerX} y2="900" stroke="rgba(255,255,255,.9)" strokeWidth="3" />
                  <circle cx={dividerX} cy="450" r="34" fill="rgba(5,11,15,.82)" stroke="rgba(255,255,255,.9)" strokeWidth="3" />
                  <path d={`M ${dividerX - 10} 450 l 8 -8 M ${dividerX - 10} 450 l 8 8 M ${dividerX + 10} 450 l -8 -8 M ${dividerX + 10} 450 l -8 8`} fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-white backdrop-blur-md">Heatmap</div>
                <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-white backdrop-blur-md">Original</div>
                <input className="absolute inset-0 size-full cursor-ew-resize opacity-0" type="range" min="0" max="100" value={comparePosition} onChange={(event) => setComparePosition(Number(event.target.value))} aria-label="Compare original frame with heatmap analysis" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] font-medium text-white/75 backdrop-blur-md">Drag to compare</span>
              </div>

              <div className="mt-6 grid grid-cols-[160px_160px_minmax(0,1fr)] gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
                <div className="rounded-2xl bg-red-400/[.055] p-4 ring-1 ring-inset ring-red-400/15"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-red-300/70">Fake probability</span><div className="mt-2 text-[34px] font-semibold tracking-[-.05em] text-red-300">{displayProbability}<small className="ml-0.5 text-base">%</small></div></div>
                <div className="rounded-2xl bg-emerald-300/[.045] p-4 ring-1 ring-inset ring-emerald-300/15"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-emerald-200/65">Authenticity</span><div className="mt-2 text-[34px] font-semibold tracking-[-.05em] text-emerald-200">{selectedCase.authenticity}<small className="ml-0.5 text-base">%</small></div></div>
                <div className="rounded-2xl bg-white/[.025] p-4 ring-1 ring-inset ring-white/[.065] max-xl:col-span-2 max-sm:col-span-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">Affected regions</span>
                  <div className="mt-3 flex flex-wrap gap-2">{selectedCase.regions.map((region, index) => <span className="animate-[pulse_.45s_ease-out_1] rounded-full border border-cyan-300/15 bg-cyan-300/[.055] px-2.5 py-1 text-[10px] font-medium text-cyan-100/80" key={`${selectedCase.title}-${region}-${index}`}>{region}</span>)}</div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-6 rounded-2xl bg-white/[.025] px-5 py-4 ring-1 ring-inset ring-white/[.055] max-md:flex-col max-md:items-start">
                <p className="max-w-[680px] text-[13px] leading-6 text-[#9aadb4]">{selectedCase.explanation}</p>
                <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[.075] px-4 py-2.5 text-xs font-semibold text-cyan-100 transition-all hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-cyan-300/[.12]">View Full Analysis<ArrowIcon /></button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
