import { useEffect, useRef, useState } from 'react'
import FeatureVisuals from '../feature-story/FeatureVisuals'
import { features } from '../../data/homeContent'
import { useSectionReveal } from '../../hooks/useSectionReveal'

export default function FeatureOverview() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [liveFrame, setLiveFrame] = useState(0)
  const [inference, setInference] = useState(0)
  const stepRefs = useRef([])
  const { isVisible, sectionRef } = useSectionReveal(0.04)
  const progressHeights = ['h-[7%]', 'h-[20%]', 'h-[33%]', 'h-[46%]', 'h-[59%]', 'h-[72%]', 'h-[85%]', 'h-full']

  useEffect(() => {
    const observers = stepRefs.current.map((element, index) => {
      if (!element) return null
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index)
        },
        { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
      )
      observer.observe(element)
      return observer
    })

    return () => observers.forEach((observer) => observer?.disconnect())
  }, [])

  useEffect(() => {
    if (!isVisible) return undefined
    const interval = window.setInterval(() => setLiveFrame((current) => (current + 1) % 5), 1200)
    return () => window.clearInterval(interval)
  }, [isVisible])

  useEffect(() => {
    if (activeIndex !== 3) {
      setInference(activeIndex > 3 ? 89 : 0)
      return undefined
    }

    setInference(0)
    const interval = window.setInterval(() => {
      setInference((current) => {
        if (current >= 89) {
          window.clearInterval(interval)
          return 89
        }
        return Math.min(current + 3, 89)
      })
    }, 35)
    return () => window.clearInterval(interval)
  }, [activeIndex])

  return (
    <section id="features" ref={sectionRef} className="relative scroll-mt-6 overflow-clip border-t border-white/[.055] bg-[#071015]" aria-labelledby="features-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_25%,rgba(33,216,238,.08),transparent_28%),radial-gradient(circle_at_18%_60%,rgba(99,102,241,.045),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,#000,transparent_92%)]" />

      <div className="relative mx-auto w-[min(1320px,calc(100%-48px))] py-28 max-md:w-[min(680px,calc(100%-30px))] max-md:py-20">
        <header className="mx-auto mb-20 max-w-[780px] text-center max-md:mb-14">
          <div className={`mb-5 flex items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-cyan-200/80 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}><span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />Analysis story</div>
          <h2 id="features-title" className={`text-[clamp(34px,4vw,52px)] font-semibold leading-[1.12] tracking-[-.045em] transition-all delay-100 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>From Uploaded Video to Explainable Evidence</h2>
          <p className={`mx-auto mt-5 max-w-[700px] text-[15px] leading-7 text-[#91a5ad] transition-all delay-200 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>Follow one suspicious video through the complete detection pipeline. Each stage reveals the actual data, model output, and evidence produced by the system.</p>
        </header>

        <div className="grid grid-cols-[.72fr_1.28fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="relative">
            <div className="absolute bottom-[6%] left-[27px] top-[6%] w-px bg-white/[.08] max-lg:hidden"><span className={`block w-px bg-gradient-to-b from-cyan-300 via-cyan-300 to-transparent transition-all duration-700 ${progressHeights[activeIndex]}`} /></div>
            {features.map((feature, index) => (
              <article
                ref={(element) => { stepRefs.current[index] = element }}
                className="group flex min-h-[52vh] items-center py-12 max-lg:min-h-0 max-lg:py-7"
                key={feature.title}
              >
                <button type="button" onClick={() => setActiveIndex(index)} className={`relative w-full pl-[76px] text-left transition-all duration-500 max-lg:rounded-2xl max-lg:border max-lg:p-5 max-lg:pl-20 ${activeIndex === index ? 'opacity-100 max-lg:border-cyan-300/20 max-lg:bg-cyan-300/[.035]' : 'opacity-35 hover:opacity-70 max-lg:border-white/[.06]'}`}>
                  <span className={`absolute left-0 top-0 grid size-14 place-items-center rounded-full border bg-[#09171d] shadow-[0_0_0_7px_#071015] transition-all duration-500 max-lg:left-4 max-lg:top-5 ${activeIndex === index ? 'scale-110 border-cyan-200/70 shadow-[0_0_0_7px_#071015,0_0_26px_rgba(33,216,238,.2)]' : 'border-white/10'}`}><img className="size-7 object-contain" src={feature.icon} alt="" aria-hidden="true" /></span>
                  <span className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200/55">Stage {String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-[clamp(23px,2.4vw,34px)] font-semibold leading-tight tracking-[-.04em] text-white">{feature.title}</h3>
                  <p className="mt-4 max-w-[430px] text-[13px] leading-6 text-[#8da0a8]">{feature.description}</p>
                  <span className={`mt-5 inline-flex rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.11em] transition-colors ${activeIndex === index ? 'border-cyan-300/20 bg-cyan-300/[.07] text-cyan-100/75' : 'border-white/[.07] text-slate-500'}`}>{feature.tag}</span>
                </button>
              </article>
            ))}
          </div>

          <div className="sticky top-6 h-[min(680px,calc(100vh-48px))] min-h-[560px] max-lg:order-first max-lg:top-3 max-lg:z-20 max-lg:h-[480px] max-lg:min-h-0 max-sm:h-[420px]">
            <div className="relative h-full overflow-hidden rounded-[30px] border border-white/[.085] bg-[#081218]/95 shadow-[0_35px_100px_rgba(0,0,0,.38),0_0_50px_rgba(33,216,238,.045)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-between border-b border-white/[.055] bg-[#071015]/90 px-5 backdrop-blur-md">
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-400/70" /><span className="size-2 rounded-full bg-amber-300/70" /><span className="size-2 rounded-full bg-emerald-300/70" /></div>
                <span className="text-[9px] font-semibold uppercase tracking-[.15em] text-slate-500">Forensic analysis workspace</span>
                <span className="text-[9px] text-slate-600">DF-2048</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 top-11"><FeatureVisuals activeIndex={activeIndex} liveFrame={liveFrame} inference={inference} /></div>
            </div>
            <div className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(circle,rgba(33,216,238,.09),transparent_65%)] blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
