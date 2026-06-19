import { useEffect, useState } from 'react'
import { badgeDelays, heroBadges } from '../../data/homeContent'
import { ArrowIcon, ScanIcon } from '../shared/Icons'

export default function HeroSection() {
  const [probability, setProbability] = useState(0)
  const [timelineFrame, setTimelineFrame] = useState(0)

  useEffect(() => {
    let frame
    const start = performance.now()
    const duration = 1800

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1)
      setProbability(Math.round((1 - Math.pow(1 - progress, 3)) * 87))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    const timeout = window.setTimeout(() => {
      frame = requestAnimationFrame(animate)
    }, 1050)
    const timeline = window.setInterval(() => setTimelineFrame((current) => (current + 1) % 8), 420)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(timeline)
      cancelAnimationFrame(frame)
    }
  }, [])

  const circumference = 2 * Math.PI * 44
  const scoreOffset = circumference - (probability / 100) * circumference

  return (
    <section className="relative isolate min-h-svh overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-[-4%] -z-50 animate-[pulse_12s_ease-in-out_infinite] bg-[url('/images/hero-forensic-bg.png')] bg-cover bg-center" aria-hidden="true" />
      <div className="absolute inset-0 -z-40 bg-[linear-gradient(90deg,rgba(3,8,11,.96)_0%,rgba(3,8,11,.9)_28%,rgba(3,8,11,.45)_58%,rgba(3,8,11,.38)_100%),linear-gradient(180deg,rgba(3,7,10,.72)_0%,transparent_26%,rgba(3,7,10,.45)_74%,rgba(3,7,10,.95)_100%)] max-md:bg-[linear-gradient(180deg,rgba(3,8,11,.93),rgba(3,8,11,.72)_55%,rgba(3,8,11,.92))]" aria-hidden="true" />
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(rgba(33,216,238,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.08)_1px,transparent_1px)] bg-[size:58px_58px] opacity-[.17] [mask-image:linear-gradient(90deg,#000,transparent_72%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-[-180px] -z-20 h-40 animate-[bounce_9s_linear_infinite] bg-[linear-gradient(180deg,transparent,rgba(33,216,238,.04)_70%,rgba(91,234,255,.18)_99%,transparent)]" aria-hidden="true" />

      <div className="mx-auto grid min-h-svh w-[min(1240px,calc(100%-48px))] grid-cols-[.92fr_1.08fr] items-center gap-[42px] pb-16 pt-[138px] max-[1040px]:grid-cols-2 max-[1040px]:gap-[18px] max-md:w-[min(620px,calc(100%-30px))] max-md:grid-cols-1 max-md:pb-14 max-md:pt-[116px] max-sm:pt-[106px]" id="top">
        <div className="relative z-20 max-w-[640px] max-md:mx-auto max-md:text-center">
          <div className="mb-6 flex animate-[pulse_1s_ease-out_1] items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/90 max-md:justify-center"><span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />Explainable video forensics</div>
          <h1 className="max-w-[720px] text-[clamp(44px,5.1vw,74px)] font-semibold leading-[1.02] tracking-[-.055em] max-[1040px]:text-[clamp(42px,5.5vw,60px)] max-md:text-[clamp(42px,12vw,64px)] max-sm:text-[42px]" id="hero-title">AI-Powered <span className="text-transparent [-webkit-text-stroke:1px_#7aeeff] [text-shadow:0_0_26px_rgba(33,216,238,.18)]">Deepfake</span><br />Detection System</h1>
          <p className="mt-6 max-w-[600px] text-[clamp(16px,1.5vw,18px)] leading-7 text-[#a9bac1] max-md:mx-auto max-sm:text-[15px]">Analyze videos frame by frame, detect facial manipulation, and understand the result through explainable AI heatmaps.</p>

          <div className="mt-[34px] flex flex-wrap gap-[13px] max-md:justify-center max-sm:grid">
            <a className="inline-flex min-h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-full border border-transparent bg-cyan-300 px-6 text-sm font-bold text-[#021014] shadow-[0_10px_30px_rgba(21,203,228,.15),inset_0_0_0_1px_rgba(255,255,255,.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_13px_36px_rgba(21,203,228,.25)] max-sm:w-full" href="/upload"><ScanIcon />Upload Video</a>
            <a className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-full border border-slate-200/20 bg-white/[.04] px-6 text-sm font-semibold text-[#d9e9ee] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-950/40 max-sm:w-full" href="#detection-flow">View Detection Process<ArrowIcon /></a>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5 max-md:justify-center" aria-label="Detection features">
            {heroBadges.map((badge, index) => <span className={`flex animate-[pulse_.7s_ease-out_1] items-center gap-[7px] rounded-full border border-slate-200/10 bg-white/[.035] px-3 py-2 text-[11px] font-medium text-[#a6bbc2] backdrop-blur-lg max-sm:text-[10px] ${badgeDelays[index]}`} key={badge}><span className="grid size-4 place-items-center rounded-full bg-cyan-300/10 text-[9px] text-cyan-300">&#10003;</span>{badge}</span>)}
          </div>
        </div>

        <div className="relative z-10 w-[min(100%,650px)] justify-self-end animate-[pulse_6s_ease-in-out_infinite] max-md:mt-6 max-md:w-[min(100%,570px)] max-md:justify-self-center" aria-label="Deepfake analysis dashboard preview">
          <div className="absolute inset-[10%_5%] -z-10 bg-[radial-gradient(circle,rgba(20,191,218,.24),transparent_67%)] blur-3xl" aria-hidden="true" />
          <div className="relative w-full overflow-hidden rounded-[30px] border border-cyan-200/20 shadow-[0_32px_80px_rgba(0,0,0,.62),0_0_45px_rgba(21,175,202,.08)] [transform:perspective(1200px)_rotateY(-2deg)_rotateX(1deg)] max-[1040px]:rounded-xl">
            <img className="block h-auto w-full" src="/images/hero-detection-dashboard.png" alt="Forensic AI dashboard scanning a video face across a frame timeline and heatmap" />
            <div className="absolute left-[23%] top-[22%] z-30 h-[34%] w-[27%] animate-pulse rounded-[45%] bg-[radial-gradient(circle_at_65%_40%,rgba(255,51,44,.48),transparent_22%),radial-gradient(circle_at_35%_42%,rgba(255,78,40,.4),transparent_22%),radial-gradient(circle_at_52%_68%,rgba(255,32,36,.36),transparent_18%)] opacity-75 blur-[7px] [mix-blend-mode:screen]" aria-hidden="true" />
            <div className="absolute left-[9%] top-[36%] z-40 h-[3px] w-[54%] animate-pulse bg-[linear-gradient(90deg,transparent,rgba(89,239,255,.95),transparent)] shadow-[0_0_13px_rgba(33,216,238,.95),0_10px_20px_rgba(33,216,238,.17)]" aria-hidden="true" />
            <div className="pointer-events-none absolute left-[9%] right-[8%] top-[61.6%] z-40 grid h-[13%] grid-cols-8 gap-[1.5%]" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span className={`rounded border-2 transition-all duration-300 ${timelineFrame === index ? 'border-cyan-400 shadow-[0_0_12px_rgba(33,216,238,.45)]' : 'border-transparent'}`} key={index} />)}</div>

            <div className="absolute right-[7.2%] top-[19%] z-50 min-h-[27%] w-[28.5%] rounded-2xl border border-red-400/35 bg-[linear-gradient(150deg,rgba(11,21,29,.98),rgba(12,18,24,.96))] px-[2.6%] py-[3.2%] shadow-[0_15px_35px_rgba(0,0,0,.5),inset_0_0_25px_rgba(255,64,70,.05)] backdrop-blur-xl max-[1040px]:rounded-xl">
              <div className="flex items-center justify-between gap-1.5 text-[clamp(5px,.62vw,9px)] font-bold tracking-[.08em] text-[#8aa4ae]"><span>FAKE PROBABILITY</span><span className="border border-red-400/35 bg-red-500/10 px-1.5 py-0.5 uppercase tracking-normal text-red-300">High risk</span></div>
              <div className="mt-[10%] flex items-center gap-[9%]">
                <div className="relative grid aspect-square basis-[49%] place-items-center">
                  <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="#0a1319" stroke="#25343c" strokeWidth="8" /><circle cx="50" cy="50" r="44" fill="none" stroke="#ff4d51" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={scoreOffset} /></svg>
                  <strong className="relative text-[clamp(13px,2vw,29px)] font-bold tracking-[-.04em]">{probability}<small className="text-[.48em] text-red-300">%</small></strong>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5"><strong className="text-[clamp(6px,.7vw,10px)] leading-[1.15] text-red-300">Manipulation detected</strong><span className="text-[clamp(5px,.5vw,8px)] leading-tight text-[#778c94]">Confidence threshold exceeded</span></div>
              </div>
            </div>
          </div>

          <div className="absolute left-[-3%] top-[5%] z-[60] flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#071116]/85 px-3 py-2 text-[10px] font-semibold tracking-[.08em] text-[#c8dce2] shadow-[0_8px_22px_rgba(0,0,0,.25)] backdrop-blur-lg max-sm:left-0"><span className="text-[8px] text-[#6e8a94]">CASE</span>DF-2048</div>
          <div className="absolute bottom-[5%] right-[-1%] z-[60] flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#071116]/85 px-3 py-2 text-[10px] font-semibold tracking-[.08em] text-[#c8dce2] shadow-[0_8px_22px_rgba(0,0,0,.25)] backdrop-blur-lg max-sm:right-0"><span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_9px_#21d8ee]" />Frame 184 analyzed</div>
        </div>
      </div>
    </section>
  )
}
