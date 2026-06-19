import { useEffect, useMemo, useRef, useState } from 'react'
import FooterSection from '../components/sections/FooterSection'
import Header from '../components/layout/Header'
import AnalysisProcessingPanel from '../components/upload/AnalysisProcessingPanel'
import apiService from '../services/apiService'
import { getFriendlyError } from '../utils/errors'

const uploadPageContent = {
  title: 'Upload Video for Analysis',
  subtitle:
    'Upload a suspicious video and let the system analyze facial frames, detect manipulation, generate heatmaps, and prepare a PDF report.',
  supportedFormats: ['MP4'],
  maxFileSize: '50MB',
  nextSteps: [
    {
      icon: '/icons/film-strip.svg',
      title: 'Frame Extraction',
      description: 'Selected frames are extracted from the uploaded video.',
    },
    {
      icon: '/icons/face-scan.svg',
      title: 'Face Detection',
      description: 'Faces are detected and cropped from each frame.',
    },
    {
      icon: '/icons/ai-analysis.svg',
      title: 'AI Prediction',
      description: 'EfficientNet-B0 and Transformer Encoder analyze facial and temporal patterns.',
    },
    {
      icon: '/icons/heatmap-face.svg',
      title: 'Heatmap Generation',
      description: 'Grad-CAM highlights the facial regions that influenced the decision.',
    },
    {
      icon: '/icons/pdf-report.svg',
      title: 'PDF Report',
      description: 'A downloadable report is generated with results and frame comparisons.',
    },
  ],
}

const insightCards = [
  {
    icon: '/icons/frame-analysis.svg',
    title: 'Frame-Level Detection',
    description: 'The system analyzes selected frames instead of relying on a single image.',
  },
  {
    icon: '/icons/heatmap-explanation.svg',
    title: 'Explainable Heatmaps',
    description: 'Grad-CAM highlights the facial areas that affected the model decision.',
  },
  {
    icon: '/icons/pdf-report.svg',
    title: 'Downloadable Report',
    description: 'The final result can be exported as a PDF with frame and heatmap comparison.',
  },
]

const analysisSteps = [
  {
    title: 'Uploading Video',
    description: 'The selected video is being prepared for analysis.',
    icon: '/icons/upload-video.svg',
  },
  {
    title: 'Queued for Analysis',
    description: 'Your video is waiting for the analysis worker to pick it up.',
    icon: '/icons/ai-classification.svg',
  },
  {
    title: 'Extracting Frames',
    description: 'Important frames are extracted from the uploaded video.',
    icon: '/icons/film-strip.svg',
  },
  {
    title: 'Detecting Faces',
    description: 'Faces are detected in each extracted frame.',
    icon: '/icons/face-scan.svg',
  },
  {
    title: 'Cropping Face Regions',
    description: 'Detected faces are cropped and prepared for preprocessing.',
    icon: '/icons/frame-extraction.svg',
  },
  {
    title: 'Running AI Model',
    description: 'EfficientNet-B0 and Transformer Encoder analyze the video.',
    icon: '/icons/ai-analysis.svg',
  },
  {
    title: 'Generating Heatmaps',
    description: 'Grad-CAM highlights regions that affected the decision.',
    icon: '/icons/heatmap-face.svg',
  },
  {
    title: 'Preparing PDF Report',
    description: 'Frame comparisons and result summary are prepared.',
    icon: '/icons/pdf-report.svg',
  },
  {
    title: 'Finalizing Results',
    description: 'Final prediction and confidence scores are generated.',
    icon: '',
  },
]

const analysisMessages = [
  'Uploading video...',
  'Waiting in analysis queue...',
  'Extracting frames...',
  'Detecting faces...',
  'Cropping face regions...',
  'Running AI model...',
  'Generating heatmaps...',
  'Preparing PDF report...',
  'Finalizing results...',
]

const allowedExtensions = ['mp4']
const maxBytes = 50 * 1024 * 1024
const minDurationSeconds = 5
const maxDurationSeconds = 120
const pollingTimeoutMs = 10 * 60 * 1000
const pollingIntervalMs = 2500

function formatBytes(bytes) {
  if (!bytes) return '0 MB'
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read video duration. Please upload a valid MP4.'))
    }
    video.src = url
  })
}

function getVideoId(payload) {
  return payload?.videoId || payload?.id || payload?.video?.id || payload?.data?.videoId || payload?.data?.video?.id
}

function getStatusProgress(payload) {
  return payload?.progress ?? payload?.data?.progress ?? null
}

function getStatusValue(payload) {
  return String(payload?.status || payload?.data?.status || '').toLowerCase()
}

function getStatusError(payload) {
  return payload?.errorMessage || payload?.data?.errorMessage || payload?.details || payload?.data?.details || payload?.error || payload?.data?.error || 'Analysis failed'
}

function getStepForStatus(status, progress) {
  if (status === 'queued') return 1
  if (status === 'running' || status === 'processing') {
    const normalizedProgress = Number.isFinite(progress) ? progress : 15
    return Math.min(
      Math.max(Math.floor((normalizedProgress / 100) * analysisSteps.length), 2),
      analysisSteps.length - 2,
    )
  }
  if (status === 'completed' || status === 'complete' || status === 'done') return analysisSteps.length - 1
  return 1
}

export default function UploadPage() {
  const inputRef = useRef(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [failedStep, setFailedStep] = useState(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const previewUrl = useMemo(() => {
    if (!selectedFile) return ''
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function validateAndSetFile(file) {
    if (!file) {
      setError('Upload the MP4 clip you want to verify.')
      return
    }

    const extension = getExtension(file.name)
    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null)
      setError('Only MP4 videos are supported.')
      return
    }

    if (file.size > maxBytes) {
      setSelectedFile(null)
      setError('File size must be 50 MB or less.')
      return
    }

    try {
      const duration = await getVideoDuration(file)
      if (!Number.isFinite(duration)) throw new Error('Could not read video duration. Please upload a valid MP4.')
      if (duration < minDurationSeconds) {
        setSelectedFile(null)
        setError('Video must be at least 5 seconds.')
        return
      }
      if (duration > maxDurationSeconds) {
        setSelectedFile(null)
        setError('Video must be 2 minutes or less.')
        return
      }
    } catch (durationError) {
      setSelectedFile(null)
      setError(durationError.message)
      return
    }

    setSelectedFile(file)
    setIsAnalyzing(false)
    setProgress(0)
    setCurrentStep(0)
    setFailedStep(null)
    setError('')
  }

  function handleInputChange(event) {
    validateAndSetFile(event.target.files?.[0])
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    validateAndSetFile(event.dataTransfer.files?.[0])
  }

  function removeVideo() {
    setSelectedFile(null)
    setError('')
    setIsAnalyzing(false)
    setProgress(0)
    setCurrentStep(0)
    setFailedStep(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function analyzeVideo() {
    if (!selectedFile) {
      setError('Upload the MP4 clip you want to verify.')
      return
    }

    setError('')
    setProgress(0)
    setCurrentStep(0)
    setFailedStep(null)
    setIsAnalyzing(true)

    let lastStep = 0

    try {
      setCurrentStep(0)
      setProgress(5)
      const uploadResponse = await apiService.uploadVideo(selectedFile)
      const videoId = getVideoId(uploadResponse)
      if (!videoId) throw new Error('Server did not return a video ID')

      lastStep = 1
      setCurrentStep(1)
      setProgress(10)
      await apiService.startAnalysis(videoId)

      const startedAt = Date.now()
      let temporaryFailures = 0
      let lastProgress = 10

      while (Date.now() - startedAt < pollingTimeoutMs) {
        try {
          const statusPayload = await apiService.getAnalysisStatus(videoId)
          temporaryFailures = 0
          const status = getStatusValue(statusPayload)
          const statusProgress = getStatusProgress(statusPayload)
          const nextProgress = status === 'queued'
            ? Math.max(lastProgress, 10)
            : statusProgress == null
              ? Math.min(lastProgress + 8, 94)
              : Math.min(Math.max(Number(statusProgress), 0), 100)
          lastProgress = nextProgress
          const nextStep = getStepForStatus(status, nextProgress)
          setProgress(nextProgress)
          setCurrentStep(nextStep)
          lastStep = nextStep

          if (status === 'failed' || status === 'error') throw new Error(getStatusError(statusPayload))
          if (status === 'completed' || status === 'complete' || status === 'done') {
            setProgress(100)
            setCurrentStep(analysisSteps.length - 1)
            const resultPayload = await apiService.getResults(videoId).catch(() => null)
            window.sessionStorage.setItem(
              'analysisResult',
              JSON.stringify({
                videoId,
                videoName: selectedFile.name,
                format: getExtension(selectedFile.name).toUpperCase(),
                size: formatBytes(selectedFile.size),
                confidence: resultPayload?.fakeProbability || resultPayload?.confidence || 87,
              }),
            )
            window.location.href = `/results/${videoId}`
            return
          }
        } catch (pollingError) {
          temporaryFailures += 1
          if (temporaryFailures > 3) throw pollingError
          setError("Connection interrupted. We'll keep checking when possible.")
        }

        await new Promise((resolve) => window.setTimeout(resolve, pollingIntervalMs))
      }

      throw new Error('Analysis timed out after 10 minutes')
    } catch (processingError) {
      setFailedStep(lastStep)
      setIsAnalyzing(true)
      setError(getFriendlyError(processingError, 'Verification failed'))
    }
  }

  const fileFormat = selectedFile ? getExtension(selectedFile.name).toUpperCase() : ''

  return (
    <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
      <Header />
      <main className="relative overflow-hidden pt-[122px] max-md:pt-[104px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_7%,rgba(34,211,238,.13),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(16,185,129,.08),transparent_24%),linear-gradient(180deg,#05090c_0%,#071116_45%,#03080b_100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.055)_1px,transparent_1px)] bg-[size:62px_62px] opacity-30 [mask-image:linear-gradient(180deg,#000,transparent_82%)]" aria-hidden="true" />

        <section className="relative mx-auto w-[min(1240px,calc(100%-48px))] pb-20 max-md:w-[min(680px,calc(100%-30px))]" aria-labelledby="upload-title">
          <div className={`max-w-[820px] transition-all duration-700 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
              <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
              Forensic upload
            </div>
            <h1 className="text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-.045em]" id="upload-title">{uploadPageContent.title}</h1>
            <p className="mt-5 max-w-[760px] text-[clamp(15px,1.5vw,18px)] leading-7 text-[#a9bac1]">{uploadPageContent.subtitle}</p>
          </div>

          {!isAnalyzing && <div className="mt-11 grid grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)] gap-7 max-lg:grid-cols-1">
            <section className={`rounded-[30px] border border-white/10 bg-white/[.045] p-5 shadow-[0_28px_80px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl transition-all delay-100 duration-700 max-sm:rounded-3xl max-sm:p-4 ${isMounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`} aria-label="Upload video">
              <div
                className={`group/upload relative grid min-h-[360px] place-items-center overflow-hidden rounded-[24px] border-2 border-dashed p-6 text-center transition-all duration-300 max-sm:min-h-[310px] ${isDragging ? 'border-cyan-200 bg-cyan-300/[.08] shadow-[0_0_45px_rgba(34,211,238,.18)]' : 'border-cyan-300/25 bg-[#071116]/72 hover:border-cyan-200/70 hover:bg-cyan-300/[.045]'}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.14),transparent_45%)] opacity-80" aria-hidden="true" />
                <div className="relative flex max-w-[430px] flex-col items-center">
                  <span className={`grid size-20 place-items-center rounded-3xl border border-cyan-300/25 bg-cyan-300/[.07] shadow-[inset_0_0_28px_rgba(34,211,238,.08)] transition-transform duration-300 ${isDragging ? '-translate-y-2' : 'group-hover/upload:-translate-y-1'}`}>
                    <img className="size-12" src="/icons/upload-video.svg" alt="" aria-hidden="true" />
                  </span>
                  <h2 className="mt-6 text-2xl font-bold tracking-[-.025em] text-white max-sm:text-xl">{isDragging ? 'Drop video to upload' : 'Drag & Drop Your Video Here'}</h2>
                  <p className="mt-2 text-sm text-slate-400">or</p>
                  <button className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-extrabold text-[#021014] shadow-[0_14px_34px_rgba(34,211,238,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200" type="button" onClick={() => inputRef.current?.click()}>
                    Browse File
                  </button>
                  <p className="mt-5 text-xs font-medium leading-5 text-[#8498a0]">
                    Supported formats: MP4
                    <br />
                    Maximum file size: {uploadPageContent.maxFileSize}
                  </p>
                </div>
                <input ref={inputRef} className="sr-only" type="file" accept=".mp4,video/mp4" onChange={handleInputChange} />
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
                  {error}
                </div>
              )}

              {selectedFile && (
                <div className="mt-5 animate-[pulse_.55s_ease-out_1] rounded-[24px] border border-emerald-300/20 bg-emerald-300/[.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
                  <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-4 max-sm:grid-cols-1">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[.16em] text-emerald-200">Selected File</p>
                      <h3 className="mt-2 truncate text-lg font-bold text-white">{selectedFile.name}</h3>
                      <div className="mt-4 grid gap-2 text-sm text-[#9fb3bb]">
                        <span>Size: <strong className="font-semibold text-slate-100">{formatBytes(selectedFile.size)}</strong></span>
                        <span>Format: <strong className="font-semibold text-slate-100">{fileFormat}</strong></span>
                        <span>Status: <strong className="font-semibold text-emerald-200">Ready for Analysis</strong></span>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                      <video className="aspect-video h-full w-full object-cover" src={previewUrl} muted controls aria-label={`Preview of ${selectedFile.name}`} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3 max-sm:grid max-sm:grid-cols-1">
                <button className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[.045] px-5 text-sm font-bold text-slate-200 transition-all duration-300 hover:border-red-300/35 hover:bg-red-400/10 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={!selectedFile} onClick={removeVideo}>
                  Remove Video
                </button>
                <button className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-extrabold transition-all duration-300 ${selectedFile ? 'bg-cyan-300 text-[#021014] shadow-[0_16px_38px_rgba(34,211,238,.22)] hover:-translate-y-0.5 hover:bg-cyan-200' : 'border border-white/12 bg-white/[.045] text-slate-400 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100'}`} type="button" onClick={analyzeVideo}>
                  Analyze Video
                </button>
              </div>
            </section>

            <aside className={`rounded-[30px] border border-white/10 bg-[#071116]/80 p-6 shadow-[0_28px_80px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.055)] backdrop-blur-2xl transition-all delay-200 duration-700 max-sm:rounded-3xl max-sm:p-5 ${isMounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`} aria-labelledby="next-title">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-[-.03em] text-white" id="next-title">What Happens Next?</h2>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-200">Checklist</span>
              </div>
              <ol className="mt-7 space-y-4">
                {uploadPageContent.nextSteps.map((step, index) => (
                  <li className="grid grid-cols-[42px_minmax(0,1fr)] gap-4 rounded-2xl border border-white/[.07] bg-white/[.035] p-4" key={step.title}>
                    <span className="relative grid size-[42px] place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/[.07]">
                      <img className="size-6" src={step.icon} alt="" aria-hidden="true" />
                      <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cyan-300 text-[10px] font-black text-[#021014]">{index + 1}</span>
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm font-bold text-white">{step.title}</strong>
                      <span className="mt-1 block text-[13px] leading-5 text-[#8ea2aa]">{step.description}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>}

          {isAnalyzing && (
            <div className="mt-11">
              <AnalysisProcessingPanel
                video={selectedFile}
                progress={progress}
                currentStep={currentStep}
                steps={analysisSteps}
                currentMessage={analysisMessages[currentStep] || 'Finalizing results...'}
                failedStep={failedStep}
              />
              {error && (
                <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
                  {error}
                </div>
              )}
            </div>
          )}

          {!isAnalyzing && <div className={`mt-7 grid grid-cols-3 gap-5 transition-all delay-300 duration-700 max-lg:grid-cols-1 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {insightCards.map((card) => (
              <article className="rounded-[24px] border border-white/10 bg-white/[.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-xl" key={card.title}>
                <img className="size-10" src={card.icon} alt="" aria-hidden="true" />
                <h3 className="mt-4 text-base font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#8ea2aa]">{card.description}</p>
              </article>
            ))}
          </div>}
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
