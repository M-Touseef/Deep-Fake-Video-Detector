import { useEffect, useState } from 'react'

export default function ScoreCard({ label, value, suffix = '', tone = 'cyan', delay = 0 }) {
  const isNumeric = typeof value === 'number'
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value)

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value)
      return undefined
    }

    let frame
    const start = window.performance.now()
    const duration = 900

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) frame = window.requestAnimationFrame(animate)
    }

    const timeout = window.setTimeout(() => {
      frame = window.requestAnimationFrame(animate)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      window.cancelAnimationFrame(frame)
    }
  }, [delay, isNumeric, value])

  const toneClasses = {
    cyan: 'border-cyan-300/20 bg-cyan-300/[.055] text-cyan-100',
    red: 'border-red-300/20 bg-red-400/[.08] text-red-100',
    emerald: 'border-emerald-300/20 bg-emerald-300/[.06] text-emerald-100',
    amber: 'border-amber-300/20 bg-amber-300/[.06] text-amber-100',
    slate: 'border-white/10 bg-white/[.04] text-slate-100',
  }

  return (
    <article className={`rounded-[24px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] transition-all duration-500 hover:-translate-y-1 ${toneClasses[tone] || toneClasses.cyan}`}>
      <p className="text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">{label}</p>
      <strong className="mt-3 block text-[clamp(30px,4vw,46px)] font-semibold leading-none tracking-[-.045em]">
        {displayValue}
        {suffix}
      </strong>
    </article>
  )
}
