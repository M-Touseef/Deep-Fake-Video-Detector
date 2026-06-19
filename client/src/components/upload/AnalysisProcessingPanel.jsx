const statusStyles = {
  Completed: {
    row: 'border-emerald-300/20 bg-emerald-300/[.055]',
    icon: 'border-emerald-300/35 bg-emerald-300/15 text-emerald-200',
    text: 'text-emerald-200',
  },
  Processing: {
    row: 'border-cyan-300/30 bg-cyan-300/[.075] shadow-[0_0_34px_rgba(34,211,238,.08)]',
    icon: 'border-cyan-200/50 bg-cyan-300/20 text-cyan-100',
    text: 'text-cyan-100',
  },
  Pending: {
    row: 'border-white/[.07] bg-white/[.025]',
    icon: 'border-white/10 bg-white/[.035] text-slate-500',
    text: 'text-slate-500',
  },
  Failed: {
    row: 'border-red-300/25 bg-red-400/10',
    icon: 'border-red-300/35 bg-red-400/15 text-red-200',
    text: 'text-red-200',
  },
}

function getStepStatus(index, currentStep, failedStep) {
  if (failedStep === index) return 'Failed'
  if (index < currentStep) return 'Completed'
  if (index === currentStep) return 'Processing'
  return 'Pending'
}

function StepMarker({ status }) {
  if (status === 'Completed') return <span className="text-[9px] font-black" aria-hidden="true">OK</span>
  if (status === 'Failed') return <span aria-hidden="true">!</span>
  if (status === 'Processing') return <span className="size-2.5 animate-pulse rounded-full bg-current shadow-[0_0_12px_currentColor]" aria-hidden="true" />
  return <span className="size-2 rounded-full border border-current opacity-70" aria-hidden="true" />
}

function StageNode({ label, detail, active, index, children }) {
  return (
    <div
      className={`relative grid min-h-[132px] place-items-center rounded-[22px] border p-3 transition-all duration-700 [transform-style:preserve-3d] ${active ? 'border-cyan-200/45 bg-cyan-300/[.085] shadow-[0_0_38px_rgba(34,211,238,.14)]' : 'border-white/[.08] bg-white/[.035] opacity-70'}`}
      style={{ transform: `translateZ(${active ? 28 : 0}px) rotateY(${index % 2 ? -8 : 8}deg)` }}
    >
      <div className="absolute inset-0 rounded-[22px] bg-[linear-gradient(135deg,rgba(255,255,255,.08),transparent_45%,rgba(34,211,238,.08))]" aria-hidden="true" />
      <div className="relative grid place-items-center">{children}</div>
      <div className="relative mt-3 text-center">
        <p className="text-xs font-black uppercase tracking-[.14em] text-white">{label}</p>
        <p className="mt-1 text-[11px] font-semibold text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

function VideoFrameStack({ active }) {
  return (
    <div className="relative h-20 w-24 [transform-style:preserve-3d]">
      {[0, 1, 2].map((item) => (
        <div
          className={`absolute inset-0 rounded-xl border bg-[#071116] shadow-[0_18px_40px_rgba(0,0,0,.3)] ${active ? 'border-cyan-200/45' : 'border-white/10'}`}
          key={item}
          style={{ transform: `translate3d(${item * 10}px, ${item * -8}px, ${item * 14}px) rotateY(-18deg)` }}
        >
          <div className="grid h-full grid-rows-[1fr_18px] overflow-hidden rounded-xl">
            <div className="relative bg-[linear-gradient(135deg,#10242b,#071116)]">
              <span className="absolute left-[30%] top-[22%] h-[42%] w-[34%] rounded-full border border-cyan-200/45" />
              <span className="absolute inset-x-3 top-1/2 h-px bg-cyan-200/45" />
            </div>
            <div className="flex items-center gap-1.5 border-t border-white/10 px-2">
              <span className="size-1.5 rounded-full bg-cyan-200" />
              <span className="h-1 flex-1 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FaceScanGate({ active }) {
  return (
    <div className="relative grid size-24 place-items-center [transform-style:preserve-3d]">
      <div className={`absolute inset-0 rounded-2xl border ${active ? 'border-cyan-100/70 shadow-[0_0_28px_rgba(103,232,249,.2)]' : 'border-white/15'}`} />
      <div className="absolute left-3 right-3 top-1/2 h-px animate-pulse bg-cyan-100/80 shadow-[0_0_14px_rgba(103,232,249,.7)]" />
      <div className="relative h-16 w-12 rounded-[45%] border border-cyan-100/55 bg-cyan-300/[.06]">
        <span className="absolute left-2 top-5 size-1.5 rounded-full bg-cyan-100" />
        <span className="absolute right-2 top-5 size-1.5 rounded-full bg-cyan-100" />
        <span className="absolute bottom-4 left-1/2 h-px w-5 -translate-x-1/2 bg-cyan-100/70" />
      </div>
      <span className="absolute -left-1 -top-1 size-4 border-l-2 border-t-2 border-cyan-100" />
      <span className="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-cyan-100" />
    </div>
  )
}

function HeatmapSlab({ active }) {
  return (
    <div className="relative h-24 w-24 rounded-2xl border border-red-300/35 bg-[radial-gradient(circle_at_55%_45%,rgba(251,191,36,.9),rgba(248,113,113,.64)_28%,rgba(34,211,238,.22)_58%,rgba(7,17,22,.8)_100%)] shadow-[0_18px_44px_rgba(248,113,113,.12)]" style={{ transform: 'rotateX(58deg) rotateZ(-18deg)' }}>
      <div className={`absolute inset-2 rounded-xl border border-white/15 ${active ? 'animate-pulse' : ''}`} />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
    </div>
  )
}

function VerdictCore({ active, progress }) {
  return (
    <div className="relative grid size-24 place-items-center [transform-style:preserve-3d]" style={{ transform: 'rotateX(-12deg) rotateY(26deg)' }}>
      <div className={`absolute inset-0 rounded-2xl border ${active ? 'border-emerald-200/50 bg-emerald-300/10' : 'border-white/10 bg-white/[.03]'} shadow-[0_18px_42px_rgba(16,185,129,.1)]`} />
      <div className="absolute inset-3 rounded-xl border border-cyan-200/25 bg-[#071116]/90" style={{ transform: 'translateZ(18px)' }} />
      <strong className="relative text-2xl font-black tracking-[-.05em] text-cyan-100">{progress}%</strong>
    </div>
  )
}

function Forensic3DPipeline({ currentStep, safeProgress, activeStep }) {
  const stageNames = ['Frames', 'Face scan', 'Heatmap', 'Verdict']

  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#02070a] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] max-sm:min-h-[620px]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,.08)_1px,transparent_1px),linear-gradient(rgba(34,211,238,.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-45" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cyan-300/[.08] to-transparent" aria-hidden="true" />
      <div className="absolute left-1/2 top-[54%] h-1 w-[72%] -translate-x-1/2 rounded-full bg-cyan-200/20 shadow-[0_0_26px_rgba(34,211,238,.18)] max-sm:hidden" aria-hidden="true" />
      <div className="absolute left-[14%] top-[54%] h-1 w-24 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-cyan-100/80 shadow-[0_0_22px_rgba(103,232,249,.8)] max-sm:hidden" aria-hidden="true" />

      <div className="relative grid min-h-[300px] grid-cols-4 items-center gap-4 [perspective:1100px] max-lg:grid-cols-2 max-sm:grid-cols-1">
        <StageNode label="Frames" detail="Decode stream" active={currentStep >= 0} index={0}>
          <VideoFrameStack active={currentStep >= 0} />
        </StageNode>
        <StageNode label="Face scan" detail="Detect crop" active={currentStep >= 2} index={1}>
          <FaceScanGate active={currentStep >= 2} />
        </StageNode>
        <StageNode label="Heatmap" detail="Grad-CAM" active={currentStep >= 5} index={2}>
          <HeatmapSlab active={currentStep >= 5} />
        </StageNode>
        <StageNode label="Verdict" detail="Report ready" active={safeProgress >= 85} index={3}>
          <VerdictCore active={safeProgress >= 85} progress={safeProgress} />
        </StageNode>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-100">3D pipeline operation</p>
          <p className="mt-1 text-sm font-bold text-white">{activeStep?.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stageNames.map((name, index) => {
            const active = index <= Math.max(0, Math.floor((safeProgress / 100) * stageNames.length) - 1)
            return (
              <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] ${active ? 'border-cyan-200/30 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[.035] text-slate-500'}`} key={name}>
                {name}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AnalysisProcessingPanel({ video, progress, currentStep, steps, currentMessage, failedStep = null }) {
  const safeProgress = Math.min(Math.max(Math.round(progress), 0), 100)
  const fileFormat = video?.name?.split('.').pop()?.toUpperCase() || 'MP4'
  const fileSize = video?.size ? `${(video.size / (1024 * 1024)).toFixed(1)} MB` : '24.6 MB'
  const activeStep = steps[currentStep] || steps[steps.length - 1]
  const frameLabels = ['Decode', 'Faces', 'Heatmap', 'Verdict']

  return (
    <section className="animate-[pulse_.45s_ease-out_1] rounded-[30px] border border-white/10 bg-white/[.045] p-6 shadow-[0_30px_90px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl max-sm:rounded-3xl max-sm:p-4" aria-labelledby="analysis-title">
      <div className="grid grid-cols-[minmax(0,1fr)_290px] gap-6 max-lg:grid-cols-1">
        <div>
          <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
            <span className="size-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
            Live processing
          </div>
          <h2 className="mt-4 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.03] tracking-[-.045em]" id="analysis-title">Analyzing Video</h2>
          <p className="mt-4 max-w-[720px] text-[15px] leading-7 text-[#a9bac1]">
            The analysis worker is reading frames, finding faces, running the AI model, and preparing visual evidence for the final report.
          </p>
        </div>

        <div className="rounded-[24px] border border-cyan-300/15 bg-[#071116]/75 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-cyan-200/75">Uploaded Video</p>
          <h3 className="mt-3 truncate text-lg font-bold text-white">{video?.name || 'sample_video.mp4'}</h3>
          <div className="mt-4 grid gap-2 text-sm text-[#9fb3bb]">
            <span>Format: <strong className="font-semibold text-slate-100">{fileFormat}</strong></span>
            <span>Size: <strong className="font-semibold text-slate-100">{fileSize}</strong></span>
            <span>Status: <strong className="font-semibold text-cyan-100">Processing</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#02070a] shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
        <div className="grid grid-cols-[minmax(0,1.22fr)_minmax(280px,.78fr)] max-lg:grid-cols-1">
          <div className="bg-black p-4">
            <Forensic3DPipeline currentStep={currentStep} safeProgress={safeProgress} activeStep={activeStep} />
          </div>

          <aside className="flex flex-col justify-between gap-5 border-l border-white/[.08] bg-[#071116]/88 p-5 max-lg:border-l-0 max-lg:border-t">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-cyan-200/75">Pipeline status</p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-.035em] text-white">{currentMessage}</h3>
              <p className="mt-3 text-sm leading-6 text-[#91a7af]">Your video can safely stay on this screen while the backend queue and worker complete the analysis.</p>
            </div>

            <div className="grid gap-3">
              {frameLabels.map((label, index) => {
                const threshold = (index + 1) * 22
                const active = safeProgress >= threshold || index <= Math.max(0, Math.floor(currentStep / 2))
                return (
                  <div className={`grid grid-cols-[40px_minmax(0,1fr)_52px] items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-500 ${active ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100' : 'border-white/[.07] bg-white/[.025] text-slate-500'}`} key={label}>
                    <span className={`grid size-10 place-items-center rounded-xl border ${active ? 'border-cyan-200/30 bg-cyan-300/15' : 'border-white/10 bg-white/[.035]'}`}>
                      {active ? <span className="size-2.5 animate-pulse rounded-full bg-current shadow-[0_0_12px_currentColor]" /> : <span className="size-2 rounded-full border border-current" />}
                    </span>
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-right text-xs font-black">{active ? 'Live' : 'Wait'}</span>
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-6 rounded-[26px] border border-white/[.08] bg-[#071116]/72 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">Progress: {safeProgress}%</p>
            <p className="mt-1 text-sm text-[#8ea2aa]">Currently: <span className="font-semibold text-cyan-100">{activeStep?.title}</span></p>
          </div>
          <p className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100">{currentMessage}</p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#67e8f9,#34d399)] shadow-[0_0_22px_rgba(34,211,238,.35)] transition-[width] duration-500 ease-out" style={{ width: `${safeProgress}%` }} />
        </div>
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {steps.map((step, index) => {
          const status = getStepStatus(index, currentStep, failedStep)
          const styles = statusStyles[status]

          return (
            <li className={`grid grid-cols-[44px_minmax(0,1fr)_92px] gap-4 rounded-[22px] border p-4 transition-all duration-500 max-sm:grid-cols-[40px_minmax(0,1fr)] ${styles.row}`} key={step.title}>
              <span className={`grid size-11 place-items-center rounded-2xl border ${styles.icon}`}>
                {step.icon ? <img className="size-6" src={step.icon} alt="" aria-hidden="true" /> : <StepMarker status={status} />}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full text-xs font-black ${styles.icon}`}>
                    <StepMarker status={status} />
                  </span>
                  <strong className="truncate text-sm font-bold text-white">{step.title}</strong>
                </span>
                <span className="mt-1 block text-[13px] leading-5 text-[#8ea2aa]">{step.description}</span>
              </span>
              <span className={`self-start rounded-full border border-current/20 px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-[.08em] max-sm:col-span-2 ${styles.text}`}>{status}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
