import { useEffect, useState } from 'react'
import { detectionSteps, entranceDelays } from '../../data/homeContent'
import { useSectionReveal } from '../../hooks/useSectionReveal'

export default function DetectionFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const { isVisible, sectionRef } = useSectionReveal(0.2)

  useEffect(() => {
    if (!isVisible) return undefined
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % detectionSteps.length)
    }, 1100)
    return () => window.clearInterval(interval)
  }, [isVisible])

  return (
    <section className="relative overflow-hidden border-t border-cyan-300/10 bg-[#071015] py-24 max-md:py-[78px]" id="detection-flow" ref={sectionRef} aria-labelledby="detection-flow-title">
      <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[440px] w-[700px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(33,216,238,.1),transparent_68%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.045)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20 [mask-image:linear-gradient(180deg,#000,transparent_78%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-[min(1320px,calc(100%-48px))] max-md:w-[min(620px,calc(100%-30px))]">
        <header className="mx-auto mb-16 max-w-[780px] text-center max-md:mb-14">
          <div className={`mb-5 flex items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-cyan-200/80 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3.5 opacity-0'}`}>
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
            Detection pipeline
          </div>
          <h2 id="detection-flow-title" className={`text-[clamp(34px,4vw,52px)] font-semibold leading-[1.12] tracking-[-.04em] transition-all delay-100 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            How Deepfake Detection Works
          </h2>
          <p className={`mx-auto mt-5 max-w-[700px] text-[15px] leading-7 text-[#91a5ad] transition-all delay-200 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            The system analyzes uploaded videos frame by frame, detects facial regions, applies AI-based classification, and generates visual heatmap explanations with a downloadable PDF report.
          </p>
        </header>

        <div className="relative grid grid-cols-6 gap-8 before:absolute before:left-[8.333%] before:right-[8.333%] before:top-9 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(96,192,207,.35)_8%,rgba(96,192,207,.35)_92%,transparent)] before:content-[''] max-md:mx-auto max-md:flex max-md:max-w-[560px] max-md:flex-col max-md:gap-0 max-md:before:bottom-10 max-md:before:left-8 max-md:before:right-auto max-md:before:top-8 max-md:before:h-auto max-md:before:w-px max-md:before:bg-[linear-gradient(180deg,transparent,rgba(96,192,207,.35)_5%,rgba(96,192,207,.35)_95%,transparent)]">
          {detectionSteps.map((step, index) => {
            const active = activeStep === index
            return (
              <div className="group/item relative min-w-0 max-md:pb-10 max-md:pl-24" key={step.number}>
                <article className={`group/card relative text-center transition-all duration-500 hover:-translate-y-1 max-md:min-h-[96px] max-md:text-left ${entranceDelays[index]} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} ${active ? '-translate-y-1' : ''}`}>
                  <div className={`relative z-10 mx-auto mb-7 grid size-[72px] place-items-center rounded-full border bg-[#09171d] shadow-[0_0_0_8px_#071015] transition-all duration-500 group-hover/card:scale-105 group-hover/card:border-cyan-200/70 group-hover/card:shadow-[0_0_0_8px_#071015,0_0_28px_rgba(33,216,238,.22)] max-md:absolute max-md:left-0 max-md:top-0 max-md:mb-0 ${active ? 'scale-105 border-cyan-200/80 shadow-[0_0_0_8px_#071015,0_0_30px_rgba(33,216,238,.28)]' : 'border-cyan-300/25'}`}>
                    <span className={`absolute inset-1.5 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(33,216,238,.13),transparent_70%)] transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-30'}`} />
                    <img className={`relative size-9 object-contain transition-all duration-500 group-hover/card:drop-shadow-[0_0_7px_rgba(101,233,248,.7)] ${active ? step.animation : ''}`} src={step.icon} alt="" aria-hidden="true" />
                    {step.scan && <span className={`absolute left-3 right-3 h-px bg-cyan-200 shadow-[0_0_8px_#21d8ee] transition-all duration-700 ${active ? 'top-14 opacity-100' : 'top-3 opacity-0'}`} aria-hidden="true" />}
                  </div>
                  <span className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[.16em] transition-colors duration-300 ${active ? 'bg-cyan-300/10 text-cyan-200' : 'bg-white/[.035] text-cyan-200/50'}`}>{step.number}</span>
                  <h3 className="text-[16px] font-semibold leading-tight tracking-[-.015em] text-slate-100">{step.title}</h3>
                  <p className="mx-auto mt-2.5 max-w-[180px] text-[11px] leading-[1.65] text-[#8499a1] max-md:mx-0 max-md:max-w-[390px] max-md:text-xs">{step.description}</p>
                </article>

                {index < detectionSteps.length - 1 && (
                  <div className="pointer-events-none absolute left-[calc(50%+36px)] top-9 z-20 h-px w-[calc(100%+32px-72px)] overflow-hidden max-md:left-8 max-md:top-[72px] max-md:h-[calc(100%-32px)] max-md:w-px">
                    <span className={`absolute inset-0 origin-left bg-cyan-300 shadow-[0_0_9px_#21d8ee] transition-transform duration-500 max-md:origin-top ${activeStep > index ? 'scale-x-100 max-md:scale-x-100 max-md:scale-y-100' : 'scale-x-0 max-md:scale-x-100 max-md:scale-y-0'}`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
