const frameImages = [
  '/images/cases/fake-news-frame.png',
  '/images/cases/video-call-fraud-frame.png',
  '/images/cases/social-media-frame.png',
  '/images/cases/interview-frame.png',
  '/images/cases/authentic-video-frame.png',
]

const frameResults = [89, 76, 68, 92, 12]

function WorkspaceHeader({ label, status = 'Processing' }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(33,216,238,.8)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-300">{label}</span>
      </div>
      <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.1em] text-emerald-200/75">{status}</span>
    </div>
  )
}

function UploadVisual() {
  return (
    <div className="h-full">
      <WorkspaceHeader label="Input validation" status="Validated" />
      <div className="grid h-[calc(100%-53px)] grid-cols-[1.3fr_.7fr] gap-4 p-5 max-sm:grid-cols-1">
        <div className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-black">
          <img className="size-full object-cover" src="/images/cases/fake-news-frame.png" alt="Validated news video frame" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4">
            <div><p className="text-xs font-semibold text-white">press-briefing-clip.mp4</p><p className="mt-1 text-[10px] text-white/55">00:18.42 · H.264 · 1920 × 1080</p></div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md">▶</span>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 max-sm:grid max-sm:grid-cols-2">
          {[['Container', 'MP4'], ['Video codec', 'H.264'], ['Frame rate', '29.97 FPS'], ['File size', '24.8 MB']].map(([label, value]) => (
            <div className="rounded-xl border border-white/[.065] bg-white/[.025] px-3.5 py-3" key={label}><span className="block text-[9px] uppercase tracking-[.12em] text-slate-500">{label}</span><strong className="mt-1 block text-xs font-semibold text-slate-200">{value}</strong></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FramesVisual({ liveFrame }) {
  return (
    <div className="h-full">
      <WorkspaceHeader label="Frame extraction" status="184 frames" />
      <div className="p-5">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[.08] bg-black">
          <img className="size-full object-cover" src={frameImages[liveFrame % frameImages.length]} alt="Currently extracted video frame" />
          <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-semibold text-white/80 backdrop-blur-md">FRAME {String(36 + liveFrame * 37).padStart(3, '0')}</div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-white/60"><span>Timestamp 00:0{2 + liveFrame}.24</span><span>Sampling interval 1.2s</span></div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {frameImages.map((image, index) => <div className={`relative aspect-video overflow-hidden rounded-lg border transition-all duration-300 ${liveFrame % frameImages.length === index ? 'scale-[1.03] border-cyan-300/60 shadow-[0_0_16px_rgba(33,216,238,.16)]' : 'border-white/[.07] opacity-50'}`} key={image}><img className="size-full object-cover" src={image} alt="" aria-hidden="true" /><span className="absolute bottom-1 right-1 rounded bg-black/65 px-1 text-[8px] text-white/60">{String(index * 37 + 1).padStart(3, '0')}</span></div>)}
        </div>
      </div>
    </div>
  )
}

function FaceDetectionVisual() {
  return (
    <div className="h-full">
      <WorkspaceHeader label="Face region detection" status="1 face found" />
      <div className="grid h-[calc(100%-53px)] grid-cols-[1.5fr_.5fr] gap-4 p-5 max-sm:grid-cols-1">
        <div className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-black">
          <img className="size-full object-cover" src="/images/cases/fake-news-frame.png" alt="Face detection on news video frame" />
          <div className="absolute left-[35%] top-[9%] h-[64%] w-[29%] border border-cyan-200 shadow-[0_0_18px_rgba(33,216,238,.25)] before:absolute before:-left-px before:-top-px before:size-4 before:border-l-2 before:border-t-2 before:border-cyan-100 after:absolute after:-bottom-px after:-right-px after:size-4 after:border-b-2 after:border-r-2 after:border-cyan-100" />
          <div className="absolute left-[35%] top-[40%] h-px w-[29%] animate-pulse bg-cyan-200 shadow-[0_0_10px_#21d8ee]" />
          <span className="absolute left-[35%] top-[4%] rounded bg-cyan-300 px-2 py-1 text-[9px] font-bold text-[#031014]">FACE 01 · 99.4%</span>
        </div>
        <div className="flex flex-col justify-center gap-3">
          {[['Bounding box', '468 × 521'], ['Landmarks', '468 points'], ['Crop quality', 'High'], ['Tracking', 'Stable']].map(([label, value]) => <div className="border-b border-white/[.065] pb-3" key={label}><span className="text-[9px] uppercase tracking-[.12em] text-slate-500">{label}</span><p className="mt-1 text-xs font-semibold text-slate-200">{value}</p></div>)}
        </div>
      </div>
    </div>
  )
}

function ClassificationVisual({ inference }) {
  const circumference = 2 * Math.PI * 46
  const offset = circumference - (inference / 100) * circumference
  return (
    <div className="h-full">
      <WorkspaceHeader label="Model inference" status="Running" />
      <div className="grid h-[calc(100%-53px)] grid-cols-[.85fr_1.15fr] items-center gap-6 p-6 max-sm:grid-cols-1">
        <div className="relative mx-auto grid size-[190px] place-items-center">
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="46" fill="none" stroke="#16262d" strokeWidth="7" /><circle cx="55" cy="55" r="46" fill="none" stroke="#fb7185" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} /></svg>
          <div className="text-center"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">Fake probability</span><strong className="mt-1 block text-5xl font-semibold tracking-[-.06em] text-red-300">{inference}<small className="text-xl">%</small></strong></div>
        </div>
        <div className="space-y-4">
          {[['EfficientNet-B0', 'Spatial feature extraction', 'Complete'], ['Transformer Encoder', 'Temporal sequence analysis', inference < 72 ? 'Processing' : 'Complete'], ['Classification Head', 'Real / Fake prediction', inference < 86 ? 'Queued' : 'Fake']].map(([name, detail, status], index) => (
            <div className="relative overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.025] p-4" key={name}>
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-slate-100">{name}</p><p className="mt-1 text-[10px] text-slate-500">{detail}</p></div><span className={`text-[9px] font-semibold uppercase tracking-[.1em] ${status === 'Fake' ? 'text-red-300' : status === 'Complete' ? 'text-emerald-200' : 'text-cyan-200'}`}>{status}</span></div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[.06]"><span className={`block h-full rounded-full transition-all duration-700 ${index === 0 ? 'w-full bg-emerald-300' : index === 1 ? (inference > 70 ? 'w-full bg-cyan-300' : 'w-1/2 bg-cyan-300') : (inference > 85 ? 'w-full bg-red-300' : 'w-1/4 bg-slate-500')}`} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeatmapVisual() {
  return (
    <div className="h-full">
      <WorkspaceHeader label="Grad-CAM explanation" status="Generated" />
      <div className="grid h-[calc(100%-53px)] grid-cols-2 gap-3 p-5 max-sm:grid-cols-1">
        <figure className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-black"><img className="size-full object-cover" src="/images/cases/fake-news-frame.png" alt="Original analyzed frame" /><figcaption className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-white/75 backdrop-blur-md">Original</figcaption></figure>
        <figure className="relative overflow-hidden rounded-2xl border border-red-300/20 bg-black"><img className="size-full animate-[pulse_2.8s_ease-in-out_infinite] object-cover" src="/images/cases/fake-news-heatmap.png" alt="Grad-CAM heatmap showing facial attention regions" /><figcaption className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-red-200 backdrop-blur-md">Grad-CAM</figcaption></figure>
      </div>
    </div>
  )
}

function FrameAnalysisVisual({ liveFrame }) {
  return (
    <div className="h-full">
      <WorkspaceHeader label="Frame-level evidence" status="5 selected" />
      <div className="grid h-[calc(100%-53px)] grid-cols-5 gap-2.5 p-5 max-sm:grid-cols-2">
        {frameImages.map((image, index) => (
          <div className={`relative overflow-hidden rounded-xl border bg-black transition-all duration-500 ${liveFrame % frameImages.length === index ? 'border-cyan-300/50 shadow-[0_0_22px_rgba(33,216,238,.12)]' : 'border-white/[.07]'}`} key={image}>
            <img className="h-[58%] w-full object-cover" src={index === 0 || index === 3 ? image.replace('-frame.png', '-heatmap.png') : image} alt="" aria-hidden="true" />
            <div className="p-2.5"><span className="text-[8px] uppercase tracking-[.1em] text-slate-500">Frame {String(index * 37 + 1).padStart(3, '0')}</span><strong className={`mt-1 block text-lg font-semibold ${frameResults[index] > 60 ? 'text-red-300' : 'text-emerald-200'}`}>{frameResults[index]}%</strong><p className="mt-1 text-[8px] leading-3 text-slate-500">{index === 4 ? 'No significant regions' : 'Facial anomaly detected'}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardVisual() {
  return (
    <div className="h-full">
      <WorkspaceHeader label="Detection summary" status="Analysis complete" />
      <div className="grid h-[calc(100%-53px)] grid-cols-[1fr_.75fr] gap-5 p-5 max-sm:grid-cols-1">
        <div className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-black"><img className="size-full object-cover" src="/images/cases/fake-news-heatmap.png" alt="Final analyzed heatmap frame" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-16"><span className="rounded-full border border-red-300/25 bg-red-300/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-red-200">Fake detected</span></div></div>
        <div className="grid grid-cols-2 gap-3 content-center">
          {[['89%', 'Fake probability', 'text-red-300'], ['11%', 'Authenticity', 'text-emerald-200'], ['184', 'Frames analyzed', 'text-cyan-200'], ['01', 'Faces detected', 'text-violet-200']].map(([value, label, color]) => <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4" key={label}><strong className={`text-2xl font-semibold tracking-[-.04em] ${color}`}>{value}</strong><span className="mt-2 block text-[9px] uppercase tracking-[.1em] text-slate-500">{label}</span></div>)}
          <div className="col-span-2 rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><div className="flex justify-between text-[9px] uppercase tracking-[.1em] text-slate-500"><span>Model confidence</span><span className="text-slate-300">94.2%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.07]"><span className="block h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" /></div></div>
        </div>
      </div>
    </div>
  )
}

function ReportVisual() {
  return (
    <div className="h-full">
      <WorkspaceHeader label="PDF report generation" status="Ready" />
      <div className="flex h-[calc(100%-53px)] items-center justify-center overflow-hidden p-5">
        <div className="relative h-[92%] w-[72%] max-w-[420px] rotate-[-1deg] rounded-sm bg-[#f3f5f6] p-6 text-slate-900 shadow-[0_28px_70px_rgba(0,0,0,.45)] max-sm:w-[90%]">
          <div className="flex items-start justify-between border-b border-slate-300 pb-4"><div><p className="text-[8px] font-bold uppercase tracking-[.15em] text-cyan-700">VerifAI forensic report</p><h3 className="mt-1 text-base font-bold">Deepfake Analysis Result</h3></div><span className="text-[8px] text-slate-500">DF-2048</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3"><img className="aspect-video w-full rounded object-cover" src="/images/cases/fake-news-frame.png" alt="Original report frame" /><img className="aspect-video w-full rounded object-cover" src="/images/cases/fake-news-heatmap.png" alt="Heatmap report frame" /></div>
          <div className="mt-4 flex items-end justify-between"><div><span className="text-[8px] uppercase tracking-[.12em] text-slate-500">Final prediction</span><strong className="mt-1 block text-xl text-red-600">FAKE</strong></div><div className="text-right"><strong className="text-2xl">89%</strong><span className="block text-[8px] text-slate-500">fake probability</span></div></div>
          <div className="mt-4 border-t border-slate-300 pt-3"><p className="text-[8px] font-bold uppercase tracking-[.12em] text-slate-500">Affected regions</p><p className="mt-1 text-[9px]">Mouth · Eyes · Face Boundary</p><p className="mt-3 text-[8px] leading-4 text-slate-600">Heatmap attention and temporal analysis indicate suspicious lip movement and facial boundary inconsistencies.</p></div>
          <div className="absolute inset-x-6 bottom-5 flex justify-between border-t border-slate-300 pt-2 text-[7px] text-slate-400"><span>Generated by Deepfake Detection System</span><span>Page 1 of 6</span></div>
        </div>
      </div>
    </div>
  )
}

export default function FeatureVisuals({ activeIndex, liveFrame, inference }) {
  const visuals = [<UploadVisual />, <FramesVisual liveFrame={liveFrame} />, <FaceDetectionVisual />, <ClassificationVisual inference={inference} />, <HeatmapVisual />, <FrameAnalysisVisual liveFrame={liveFrame} />, <DashboardVisual />, <ReportVisual />]

  return (
    <div className="relative h-full">
      {visuals.map((visual, index) => <div className={`absolute inset-0 transition-all duration-700 ${activeIndex === index ? 'translate-y-0 scale-100 opacity-100' : index < activeIndex ? '-translate-y-5 scale-[.985] opacity-0' : 'translate-y-5 scale-[.985] opacity-0'}`} aria-hidden={activeIndex !== index} key={index}>{visual}</div>)}
    </div>
  )
}
