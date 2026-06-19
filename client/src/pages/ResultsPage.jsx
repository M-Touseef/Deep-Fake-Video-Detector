import { useEffect, useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import FooterSection from '../components/sections/FooterSection'
import HeatmapRegionChips from '../components/results/HeatmapRegionChips'
import PDFReportCard from '../components/results/PDFReportCard'
import ResultInterpretation from '../components/results/ResultInterpretation'
import ResultSummaryBanner from '../components/results/ResultSummaryBanner'
import ScoreCard from '../components/results/ScoreCard'
import SuspiciousFrameCard from '../components/results/SuspiciousFrameCard'
import { analysisResult as fallbackResult } from '../data/resultData'
import apiService from '../services/apiService'
import { downloadPdfReport } from '../utils/reportDownload'
import { getFriendlyError } from '../utils/errors'

function readStoredResult() {
  try {
    return JSON.parse(window.sessionStorage.getItem('analysisResult') || 'null')
  } catch {
    return null
  }
}

function buildResult() {
  const stored = readStoredResult()
  if (!stored) return fallbackResult

  return {
    ...fallbackResult,
    videoName: stored.videoName || fallbackResult.videoName,
    fakeProbability: stored.confidence || fallbackResult.fakeProbability,
    authenticityScore: Math.max(0, 100 - (stored.confidence || fallbackResult.fakeProbability)),
  }
}

function normalizeResult(payload) {
  const data = payload?.data || payload?.result || payload
  if (!data || !data.videoId) return null

  // Process backend data into frontend expected format
  const confidencePercent = data.confidence !== undefined ? Math.round(data.confidence * 100) : fallbackResult.fakeProbability;
  
  // Map frames
  let suspiciousFrames = fallbackResult.suspiciousFrames;
  if (Array.isArray(data.frameEvidence) && data.frameEvidence.length > 0) {
    suspiciousFrames = data.frameEvidence.map((evidence, idx) => ({
      frameNumber: `Frame ${evidence.timestamp || idx + 1}`,
      fakeProbability: Math.round(evidence.score || 0),
      status: evidence.score > 50 ? 'Fake' : 'Real',
      affectedRegions: evidence.activationRegion ? [evidence.activationRegion] : [],
      originalImage: evidence.originalBase64?.startsWith('data:') ? evidence.originalBase64 : (evidence.originalBase64 ? `data:image/jpeg;base64,${evidence.originalBase64}` : fallbackResult.suspiciousFrames[0].originalImage),
      heatmapImage: evidence.heatmapBase64?.startsWith('data:') ? evidence.heatmapBase64 : (evidence.heatmapBase64 ? `data:image/jpeg;base64,${evidence.heatmapBase64}` : fallbackResult.suspiciousFrames[0].heatmapImage),
    }));
  }

  // Extract all unique activation regions
  let affectedRegions = fallbackResult.affectedRegions;
  if (Array.isArray(data.frameEvidence) && data.frameEvidence.length > 0) {
    const regions = data.frameEvidence.map(e => e.activationRegion).filter(Boolean);
    affectedRegions = [...new Set(regions)];
    if (affectedRegions.length === 0) affectedRegions = ['Face'];
  }

  const finalPrediction = data.verdict ? (data.verdict.toLowerCase() === 'real' ? 'Real' : 'Fake') : fallbackResult.finalPrediction;

  return {
    ...fallbackResult,
    ...data,
    videoName: data.videoName || data.video?.filename || fallbackResult.videoName,
    finalPrediction,
    fakeProbability: confidencePercent,
    authenticityScore: Math.max(0, 100 - confidencePercent),
    suspiciousFrames,
    affectedRegions,
    interpretation: `The uploaded video is classified as ${finalPrediction} with a confidence level of ${confidencePercent}%.`,
    conclusion: data.qualitySummary ? `Video analyzed with ${data.qualitySummary.validFaceFrames || 0} valid face frames.` : fallbackResult.conclusion,
  }
}

export default function ResultsPage() {
  const initialResult = useMemo(buildResult, [])
  const [result, setResult] = useState(initialResult)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const videoId = window.location.pathname.split('/results/')[1]
    if (!videoId) return undefined

    let isActive = true
    setIsLoading(true)

    apiService.getResults(videoId)
      .then((payload) => {
        if (!isActive) return
        const nextResult = normalizeResult(payload)
        if (!nextResult) {
          setNotFound(true)
          return
        }
        setResult(nextResult)
        window.sessionStorage.setItem('analysisResult', JSON.stringify(nextResult))
        setError('')
      })
      .catch((fetchError) => {
        if (!isActive) return
        if (String(fetchError?.message || '').toLowerCase().includes('not found')) {
          setNotFound(true)
        } else {
          setError(getFriendlyError(fetchError, 'Failed to load results'))
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const scoreCards = [
    { label: 'Fake Probability', value: result.fakeProbability, suffix: '%', tone: 'red' },
    { label: 'Authenticity Score', value: result.authenticityScore, suffix: '%', tone: 'emerald' },
    { label: 'Frames Analyzed', value: result.framesAnalyzed, tone: 'cyan' },
    { label: 'Faces Detected', value: result.facesDetected, tone: 'cyan' },
    { label: 'Confidence Level', value: result.confidenceLevel, tone: 'amber' },
    { label: 'PDF Report', value: result.reportStatus, tone: 'slate' },
  ]

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
        <Header />
        <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(248,113,113,.12),transparent_30%),linear-gradient(180deg,#05090c,#071116_52%,#03080b)]" aria-hidden="true" />
          <section className="relative w-[min(680px,100%)] rounded-[30px] border border-red-300/20 bg-red-400/[.07] p-7 text-center shadow-[0_32px_90px_rgba(0,0,0,.42)]">
            <h1 className="text-[clamp(32px,5vw,52px)] font-semibold tracking-[-.045em]">Result Not Found</h1>
            <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[#a9bac1]">No analysis result was found for this video. It may have been deleted or the analysis has not completed yet.</p>
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(34,211,238,.13),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(248,113,113,.1),transparent_24%),linear-gradient(180deg,#05090c_0%,#071116_44%,#03080b_100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.05)_1px,transparent_1px)] bg-[size:62px_62px] opacity-30 [mask-image:linear-gradient(180deg,#000,transparent_82%)]" aria-hidden="true" />

        <section className="relative mx-auto w-[min(1240px,calc(100%-48px))] pb-20 max-md:w-[min(680px,calc(100%-30px))]" aria-labelledby="results-title">
          <div className="animate-[pulse_.55s_ease-out_1]">
            <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
              <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
              Detection dashboard
            </div>
            <h1 className="text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-.045em]" id="results-title">Analysis Result</h1>
            <p className="mt-5 max-w-[820px] text-[clamp(15px,1.5vw,18px)] leading-7 text-[#a9bac1]">
              The uploaded video has been analyzed using frame-level detection, AI classification, and Grad-CAM heatmap explainability.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Video: {result.videoName}</span>
              <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Analysis Date: {result.analysisDate}</span>
              <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Frames Analyzed: {result.framesAnalyzed}</span>
            </div>
          </div>

          <div className="mt-10">
            <ResultSummaryBanner result={result} />
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100" role="alert">
              {isLoading ? 'Loading latest result...' : error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-6 gap-4 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {scoreCards.map((card, index) => (
              <ScoreCard delay={index * 90} key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-6">
            <ResultInterpretation interpretation={result.interpretation} />
          </div>

          <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]" aria-labelledby="frames-title">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-[-.03em] text-white" id="frames-title">Most Suspicious Frames</h2>
                <p className="mt-2 text-sm text-[#8ea2aa]">A focused preview of the frames that most influenced the prediction.</p>
              </div>
              <a className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-5 text-sm font-bold text-cyan-100 transition-all duration-300 hover:border-cyan-200/45 hover:bg-cyan-300/12" href="/frames">
                View All Frames
              </a>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
              {result.suspiciousFrames.slice(0, 4).map((frame) => (
                <SuspiciousFrameCard frame={frame} key={frame.frameNumber} />
              ))}
            </div>
          </section>

          <div className="mt-6 grid grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)] gap-6 max-lg:grid-cols-1">
            <HeatmapRegionChips regions={result.affectedRegions} />
            <PDFReportCard onDownload={() => downloadPdfReport(result)} />
          </div>

          <div className="mt-7 flex flex-wrap justify-end gap-3 max-sm:grid max-sm:grid-cols-1">
            <a className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[.045] px-5 text-sm font-bold text-slate-100 transition-all duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/10" href="/frames">View Frame Analysis</a>
            <a className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[.045] px-5 text-sm font-bold text-slate-100 transition-all duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/10" href="/report">Preview PDF Report</a>
            <button className="inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-5 text-sm font-bold text-cyan-100 transition-all duration-300 hover:bg-cyan-300/12" type="button" onClick={() => downloadPdfReport(result)}>Download PDF Report</button>
            <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-extrabold text-[#021014] shadow-[0_16px_38px_rgba(34,211,238,.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200" href="/upload">Analyze Another Video</a>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
