import { useEffect, useState } from 'react'
import { useSectionReveal } from '../../hooks/useSectionReveal'

const technologies = [
  { name: 'React', category: 'Frontend Library', description: 'Builds the responsive interface and interactive analysis views.', color: '#61DAFB', icon: 'react' },
  { name: 'Node.js', category: 'JavaScript Runtime', description: 'Supports server-side services and application API integration.', color: '#68A063', icon: 'node' },
  { name: 'Flask', category: 'Python Web Framework', description: 'Exposes the deepfake inference pipeline through lightweight APIs.', color: '#F3F4F6', icon: 'flask' },
  { name: 'OpenCV', category: 'Computer Vision Library', description: 'Handles video decoding, frame extraction, and image preprocessing.', color: '#5EC6FF', icon: 'opencv' },
  { name: 'MediaPipe', category: 'Machine Learning Framework', description: 'Detects facial landmarks and isolates regions for model analysis.', color: '#00BFA5', icon: 'mediapipe' },
  { name: 'EfficientNet-B0', category: 'Convolutional Neural Network', description: 'Extracts compact spatial features from detected facial regions.', color: '#A78BFA', icon: 'efficientnet' },
  { name: 'Transformer Encoder', category: 'Temporal Model', description: 'Analyzes relationships and manipulation patterns across video frames.', color: '#FBBF24', icon: 'transformer' },
  { name: 'Grad-CAM', category: 'Explainable AI Method', description: 'Produces attention heatmaps that explain the model prediction.', color: '#FB7185', icon: 'gradcam' },
]

function TechnologyIcon({ type, color }) {
  const lines = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (type === 'react') return <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="4" fill={color} /><g {...lines}><ellipse cx="32" cy="32" rx="27" ry="10" /><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(60 32 32)" /><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(120 32 32)" /></g></svg>
  if (type === 'node') return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 5 55 18v28L32 59 9 46V18L32 5Z" {...lines} /><path d="M21 40V24l13 16V24M42 25c7-3 10 4 4 7-7 3-3 10 4 6" {...lines} /></svg>
  if (type === 'flask') return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M25 7h14M28 7v18L14 49c-3 5 0 8 6 8h24c6 0 9-3 6-8L36 25V7" {...lines} /><path d="M20 43h24M25 36h14" {...lines} /></svg>
  if (type === 'opencv') return <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="17" r="11" {...lines} /><circle cx="18" cy="43" r="11" {...lines} /><circle cx="46" cy="43" r="11" {...lines} /><path d="M32 28v8M27 33l-5 3M37 33l5 3" {...lines} /></svg>
  if (type === 'mediapipe') return <svg viewBox="0 0 64 64" aria-hidden="true"><g fill={color}><circle cx="18" cy="19" r="5" /><circle cx="46" cy="19" r="5" /><circle cx="32" cy="32" r="6" /><circle cx="18" cy="46" r="5" /><circle cx="46" cy="46" r="5" /></g><path d="m22 22 6 6m14-6-6 6m-8 8-6 6m14-6 6 6" {...lines} /></svg>
  if (type === 'efficientnet') return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 13h40M12 32h31M12 51h40" {...lines} /><path d="M18 13v38M26 13v38M34 13v38" stroke={color} strokeWidth="1" opacity=".45" /><circle cx="52" cy="32" r="7" {...lines} /><path d="m49 32 2 2 4-5" {...lines} /></svg>
  if (type === 'transformer') return <svg viewBox="0 0 64 64" aria-hidden="true"><g fill={color}><circle cx="14" cy="16" r="3" /><circle cx="32" cy="12" r="3" /><circle cx="50" cy="16" r="3" /><circle cx="14" cy="48" r="3" /><circle cx="32" cy="52" r="3" /><circle cx="50" cy="48" r="3" /><circle cx="32" cy="32" r="5" /></g><path d="m17 17 11 12m4-14v12m15-10L36 29M17 47l11-12m4 14V37m15 10L36 35M17 18l30 28M47 18 17 46" {...lines} opacity=".75" /></svg>
  return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M19 27c0-10 5-17 13-17s13 7 13 17c0 14-6 26-13 26S19 41 19 27Z" {...lines} /><circle cx="27" cy="27" r="7" fill="#FB7185" opacity=".7" /><circle cx="39" cy="29" r="6" fill="#FB923C" opacity=".65" /><circle cx="33" cy="41" r="8" fill="#EF4444" opacity=".4" /></svg>
}

function getVisibleIndexes(activeIndex) {
  const length = technologies.length
  return [
    (activeIndex - 2 + length) % length,
    (activeIndex - 1 + length) % length,
    activeIndex,
    (activeIndex + 1) % length,
    (activeIndex + 2) % length,
  ]
}

export default function TechnologyShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const { isVisible, sectionRef } = useSectionReveal(0.12)
  const visibleIndexes = getVisibleIndexes(activeIndex)

  useEffect(() => {
    if (!isVisible || isPaused) return undefined
    const interval = window.setInterval(() => setActiveIndex((current) => (current + 1) % technologies.length), 2500)
    return () => window.clearInterval(interval)
  }, [isPaused, isVisible])

  const previous = () => setActiveIndex((current) => (current - 1 + technologies.length) % technologies.length)
  const next = () => setActiveIndex((current) => (current + 1) % technologies.length)

  return (
    <section id="technology" ref={sectionRef} className="relative overflow-hidden border-t border-white/[.055] bg-gradient-to-b from-[#050b0f] via-[#071218] to-[#05090c] py-28 max-md:py-20" aria-labelledby="technology-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(33,216,238,.11),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,transparent,#000_20%,#000_80%,transparent)]" />

      <div className="relative mx-auto w-[min(1240px,calc(100%-48px))] max-md:w-[min(680px,calc(100%-30px))]">
        <header className="mx-auto mb-14 max-w-[720px] text-center">
          <div className={`mb-5 flex items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-cyan-200/80 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}><span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />Technology stack</div>
          <h2 id="technology-title" className={`text-[clamp(34px,4vw,52px)] font-semibold leading-[1.12] transition-all delay-100 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Technical <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">Expertise</span>
          </h2>
          <p className={`mx-auto mt-5 max-w-[650px] text-[15px] leading-7 text-[#91a5ad] transition-all delay-200 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>Tools and AI technologies used to build video processing, facial analysis, deep learning classification, and explainable reports.</p>
        </header>

        <div className={`transition-all delay-300 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <div className="hidden min-h-[250px] items-center justify-center gap-5 md:flex">
            {visibleIndexes.map((technologyIndex, slot) => {
              const technology = technologies[technologyIndex]
              const active = slot === 2
              const near = slot === 1 || slot === 3
              return (
                <button
                  type="button"
                  onClick={() => setActiveIndex(technologyIndex)}
                  className={`group relative grid h-[210px] w-[210px] shrink-0 place-items-center overflow-hidden rounded-lg border p-6 text-center transition-all duration-500 ${
                    active
                      ? 'z-20 scale-110 border-cyan-300/35 bg-[#0b1a21] shadow-[0_28px_70px_rgba(0,0,0,.42),0_0_42px_rgba(33,216,238,.13)]'
                      : near
                        ? 'z-10 scale-95 border-white/[.08] bg-white/[.035] opacity-75 hover:-translate-y-2 hover:border-cyan-300/25 hover:opacity-100'
                        : 'scale-[.85] border-white/[.055] bg-white/[.025] opacity-35'
                  }`}
                  key={`${slot}-${technology.name}`}
                >
                  <span className="absolute inset-x-5 top-4 h-px bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent" />
                  <span className="absolute right-4 top-4 text-[10px] font-bold tracking-[.16em] text-white/15">{String(technologyIndex + 1).padStart(2, '0')}</span>
                  <div className={`${active ? 'size-[72px]' : 'size-16'} grid place-items-center rounded-lg border border-cyan-200/10 bg-white/[.035] p-4 transition-transform duration-500 group-hover:scale-105`}>
                    <TechnologyIcon type={technology.icon} color={technology.color} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-cyan-200/55">{technology.category}</p>
                    <h3 className="mt-2 text-[20px] font-semibold text-white">{technology.name}</h3>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 md:hidden">
            {technologies.map((technology, index) => (
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`grid h-[126px] place-items-center rounded-lg border p-3 text-center transition-all duration-300 ${
                  index === activeIndex ? 'border-cyan-300/35 bg-[#0b1a21]' : 'border-white/[.07] bg-white/[.03]'
                }`}
                key={technology.name}
              >
                <div className="grid size-10 place-items-center rounded-lg border border-cyan-200/10 bg-white/[.035] p-2">
                  <TechnologyIcon type={technology.icon} color={technology.color} />
                </div>
                <p className="text-[12px] font-semibold text-white">{technology.name}</p>
              </button>
            ))}
          </div>

          <div className="mx-auto mt-9 max-w-[760px] rounded-lg border border-white/[.07] bg-white/[.025] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,.22)]">
            <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-cyan-200/55">{technologies[activeIndex].category}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{technologies[activeIndex].name}</h3>
            <p className="mx-auto mt-3 max-w-[560px] text-[13px] leading-6 text-[#91a5ad]">{technologies[activeIndex].description}</p>
          </div>

          <div className="mt-9 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2" role="tablist" aria-label="Technology slides">
              {technologies.map((technology, index) => <button type="button" onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-cyan-300 shadow-[0_0_8px_rgba(33,216,238,.65)]' : 'w-1.5 bg-white/15 hover:bg-white/30'}`} aria-label={`Show ${technology.name}`} aria-selected={index === activeIndex} role="tab" key={technology.name} />)}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={previous} className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[.035] text-lg text-slate-300 transition-all hover:-translate-x-0.5 hover:border-cyan-300/30 hover:text-cyan-200" aria-label="Previous technology">&#8592;</button>
              <button type="button" onClick={next} className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[.035] text-lg text-slate-300 transition-all hover:translate-x-0.5 hover:border-cyan-300/30 hover:text-cyan-200" aria-label="Next technology">&#8594;</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
