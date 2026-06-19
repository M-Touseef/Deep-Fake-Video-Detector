import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import FooterSection from '../components/sections/FooterSection'
import SuspiciousFrameCard from '../components/results/SuspiciousFrameCard'

export default function FramesPage() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem('analysisResult')
      if (stored) {
        setResult(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
        <Header />
        <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 pt-28">
          <section className="relative w-[min(680px,100%)] rounded-[30px] border border-cyan-300/20 bg-cyan-400/[.04] p-7 text-center shadow-[0_32px_90px_rgba(0,0,0,.42)]">
            <h1 className="text-[clamp(32px,5vw,52px)] font-semibold tracking-[-.045em]">No Frames Found</h1>
            <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[#a9bac1]">Please analyze a video first to view its frame-level details.</p>
            <a className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-extrabold text-[#021014]" href="/history">Back to History</a>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
      <Header />
      <main className="relative overflow-hidden pt-[122px] max-md:pt-[104px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,.13),transparent_28%),linear-gradient(180deg,#05090c,#071116_45%,#03080b)]" aria-hidden="true" />
        <section className="relative mx-auto w-[min(1240px,calc(100%-48px))] pb-20 max-md:w-[min(680px,calc(100%-30px))]" aria-labelledby="frames-title">
          <div>
            <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
              <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
              Frame analysis
            </div>
            <h1 className="text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-.045em]" id="frames-title">Frame-Level Analysis</h1>
            <p className="mt-5 max-w-[780px] text-[clamp(15px,1.5vw,18px)] leading-7 text-[#a9bac1]">
              Review suspicious frames with original previews, heatmap comparisons, fake probability, and affected facial regions.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
            {result.suspiciousFrames?.map((frame) => (
              <SuspiciousFrameCard frame={frame} key={frame.frameNumber} />
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
