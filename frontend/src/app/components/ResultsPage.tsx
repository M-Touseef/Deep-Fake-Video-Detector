import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { apiService } from '../services/api';
import { downloadForensicReportPdf } from '../services/reportPdf';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, FileVideo, Clock,
  Shield, AlertTriangle, Cpu, TrendingUp, Eye,
  ChevronRight, Activity, Download, HelpCircle, ListChecks, Search,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Types  (mirror the backend resultController response)
───────────────────────────────────────────────────────────── */
interface ManipulatedSegment {
  label: string;      // "Segment A"
  timeRange: string;  // "0.0s – 2.5s"
  score: number;      // 0–100 %
  verdict: string;    // "HIGH" | "MEDIUM" | "LOW"
}

interface FrameEvidence {
  rank: number;
  timestamp: string;      // "1.0s"
  score: number;          // 0–100 %
  originalBase64?: string;
  heatmapBase64: string;  // base64 JPEG from Grad-CAM
  activationRegion?: string;
  regionExplanation?: string;
}

interface ResultData {
  verdict: 'fake' | 'real';
  confidence: number;         // 0–1
  topkConfidence?: number;    // 0–1
  confidenceLabel?: 'High confidence' | 'Medium confidence' | 'Low confidence';
  qualityWarnings?: string[];
  qualitySummary?: {
    validFaceFrames?: number | null;
    avgFaceDetectionScore?: number | null;
    minFaceArea?: number | null;
  };
  manipulatedSegments: ManipulatedSegment[];
  frameEvidence: FrameEvidence[];
  modelVersion: string | null;
  processingTime: number | null;  // ms
  createdAt: string;
  video: {
    filename: string;
    duration: number | null;
    fps: number | null;
    frameCount: number | null;
    sourceUrl?: string | null;
    sourceHost?: string | null;
    claim?: string | null;
    verificationMode?: 'news-video' | null;
  };
}

/* ─────────────────────────────────────────────────────────────
   Circular confidence gauge
───────────────────────────────────────────────────────────── */
const CircleGauge = ({ pct, isFake }: { pct: number; isFake: boolean }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = isFake ? '#ef4444' : '#22c55e';
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>{pct}%</text>
      <text x="70" y="84" textAnchor="middle" fontSize="10" fill="#6b7280">confidence</text>
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   Risk badge colours
───────────────────────────────────────────────────────────── */
const riskStyle = (v: string) => {
  switch (v?.toUpperCase()) {
    case 'HIGH': return { badge: 'bg-red-100 text-red-700 border-red-300', bar: 'bg-red-500', glow: 'shadow-red-200' };
    case 'MEDIUM': return { badge: 'bg-orange-100 text-orange-700 border-orange-300', bar: 'bg-orange-400', glow: 'shadow-orange-200' };
    default: return { badge: 'bg-green-100 text-green-700 border-green-300', bar: 'bg-green-400', glow: 'shadow-green-200' };
  }
};

const getEvidenceRegion = (frame?: FrameEvidence) =>
  frame?.activationRegion || 'Model-highlighted facial region';

const getEvidenceExplanation = (frame?: FrameEvidence) => {
  if (!frame) return '';
  if (frame.regionExplanation) return frame.regionExplanation;

  if (frame.score >= 75) {
    return 'Strong suspicious activation is visible in this face crop. Review mouth, jawline, eye, and skin-boundary regions for manipulation artifacts.';
  }

  if (frame.score >= 45) {
    return 'Moderate activation is visible. The frame should be reviewed for subtle blending, texture, or facial-boundary inconsistencies.';
  }

  return 'Low activation was detected. This frame is included for comparison but is not a strong standalone manipulation indicator.';
};

const getConfidenceCalibration = (
  confidence: number,
  label?: ResultData['confidenceLabel'],
) => {
  const inferredLabel = label
    || (confidence > 0.85
      ? 'High confidence'
      : confidence >= 0.6
        ? 'Medium confidence'
        : 'Low confidence');

  if (inferredLabel === 'High confidence') {
    return {
      label: inferredLabel,
      style: 'bg-green-500/10 text-green-300 border-green-500/30',
      note: 'Model confidence is above 85%. Use evidence review for confirmation.',
    };
  }

  if (inferredLabel === 'Medium confidence') {
    return {
      label: inferredLabel,
      style: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      note: 'Model confidence is between 60% and 85%. Human review is recommended.',
    };
  }

  return {
    label: inferredLabel,
    style: 'bg-red-500/10 text-red-300 border-red-500/30',
    note: 'Model confidence is below 60%. Treat the result as inconclusive.',
  };
};

const getTrustSummary = (
  result: ResultData,
  qualityWarnings: string[],
  highSegmentCount: number,
) => {
  const confidence = result.confidence;
  const isFake = result.verdict === 'fake';
  const isInconclusive = confidence < 0.6;
  const hasQualityWarning = qualityWarnings.length > 0;
  const trustLabel = isInconclusive
    ? 'Uncertain'
    : isFake
      ? confidence > 0.85 ? 'Very likely manipulated' : 'Probably manipulated'
      : confidence > 0.85 ? 'Very likely real' : 'Probably real';

  if (isInconclusive) {
    return {
      trustLabel,
      headline: 'We cannot make a strong call on this video.',
      meaning: 'The system found some signals, but the confidence is too low to treat the result as reliable.',
      why: 'This can happen when the face is hard to see, there are few usable frames, or the video is compressed.',
      next: 'Do not share this as verified. Look for the original source or compare it with trusted reporting.',
      style: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    };
  }

  if (isFake) {
    return {
      trustLabel,
      headline: 'This video shows signs of manipulation.',
      meaning: 'The model found facial patterns that look suspicious compared with authentic video examples.',
      why: highSegmentCount > 0
        ? `${highSegmentCount} time segment${highSegmentCount > 1 ? 's' : ''} and the highlighted face regions contributed most to the result.`
        : 'The overall face evidence looked suspicious, even though no single high-risk time segment dominated.',
      next: hasQualityWarning
        ? 'Treat this as a warning signal and review the quality warnings before making a decision.'
        : 'Avoid sharing it as real until you can confirm the source from trusted channels.',
      style: 'border-red-500/30 bg-red-500/10 text-red-100',
    };
  }

  return {
    trustLabel,
    headline: 'This video does not show strong deepfake signs.',
    meaning: 'The model did not find major manipulation patterns in the visible face evidence.',
    why: hasQualityWarning
      ? 'However, the video quality may limit how much confidence you should place in this result.'
      : 'The available face evidence passed the main quality checks and did not trigger strong suspicious regions.',
    next: 'Still check where the video came from before treating it as proven real.',
    style: 'border-green-500/30 bg-green-500/10 text-green-100',
  };
};

const getTrustChecklist = (
  result: ResultData,
  qualityWarnings: string[],
  highSegmentCount: number,
) => {
  const warningsText = qualityWarnings.join(' ').toLowerCase();
  return [
    {
      label: 'Face is clearly visible',
      ok: !warningsText.includes('low face visibility') && result.frameEvidence.length > 0,
      detail: warningsText.includes('low face visibility')
        ? 'Face visibility warning reported.'
        : 'Face evidence was available for review.',
    },
    {
      label: 'Enough usable moments were found',
      ok: !warningsText.includes('few valid frames'),
      detail: warningsText.includes('few valid frames')
        ? 'Only a small number of usable face frames were detected.'
        : 'The analysis had enough usable face frames.',
    },
    {
      label: 'Video quality is not heavily compressed',
      ok: !warningsText.includes('heavy compression'),
      detail: warningsText.includes('heavy compression')
        ? 'Compression may hide or create visual artifacts.'
        : 'No major compression warning was reported.',
    },
    {
      label: 'Suspicious moments are easy to review',
      ok: result.frameEvidence.length > 0 || highSegmentCount === 0,
      detail: result.frameEvidence.length > 0
        ? 'Top suspicious frames are shown with heatmaps.'
        : 'No frame-level evidence was returned.',
    },
  ];
};

/* ─────────────────────────────────────────────────────────────
   Results Page
───────────────────────────────────────────────────────────── */
export const ResultsPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    apiService.getResults(id)
      .then(r => { if (r.success) setResult(r.data as ResultData); else toast.error('Failed to load results'); })
      .catch(e => toast.error(e.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-blue-300 text-lg font-medium tracking-wide">Loading analysis results…</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!result) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <XCircle className="h-16 w-16 text-red-400" />
        <h1 className="text-3xl font-bold text-white">Result Not Found</h1>
        <p className="text-slate-400">The analysis result for this video could not be found.</p>
        <Link to="/history"
          className="mt-4 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
          View History
        </Link>
      </div>
    </div>
  );

  /* ── Derived values ── */
  const isFake = result.verdict === 'fake';
  const confPct = Math.round(result.confidence * 100);
  const topkPct = result.topkConfidence ? Math.round(result.topkConfidence * 100) : null;
  const procSec = result.processingTime ? (result.processingTime / 1000).toFixed(1) : null;
  const highSegs = result.manipulatedSegments.filter(s => s.verdict?.toUpperCase() === 'HIGH');
  const currentFrame = result.frameEvidence[activeFrame];
  const calibration = getConfidenceCalibration(result.confidence, result.confidenceLabel);
  const qualityWarnings = result.qualityWarnings || [];
  const qualitySummary = result.qualitySummary;
  const trustSummary = getTrustSummary(result, qualityWarnings, highSegs.length);
  const trustChecklist = getTrustChecklist(result, qualityWarnings, highSegs.length);
  const isNewsVerification = result.video?.verificationMode === 'news-video';
  const recommendedAction = result.confidence < 0.6
    ? 'Needs review'
    : isFake
      ? 'Do not share as verified'
      : qualityWarnings.length > 0
        ? 'Share with caution'
        : 'Likely safe with source check';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Back */}
        <Link to="/history"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to History
        </Link>

        {/* ══════════════════════════════════════════════════════
            HERO VERDICT SECTION
        ══════════════════════════════════════════════════════ */}
        <div className={`relative rounded-2xl p-px mb-8 overflow-hidden ${isFake
          ? 'bg-gradient-to-r from-red-500 via-rose-400 to-red-600'
          : 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-600'}`}
        >
          <div className="bg-slate-900/95 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Circular gauge */}
              <div className="flex-shrink-0">
                <CircleGauge pct={confPct} isFake={isFake} />
              </div>

              {/* Verdict text */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3 border ${isFake
                    ? 'bg-red-950/60 text-red-400 border-red-700'
                    : 'bg-green-950/60 text-green-400 border-green-700'
                  }`}>
                  {isFake
                    ? <><XCircle className="h-4 w-4" /> DEEPFAKE DETECTED</>
                    : <><CheckCircle className="h-4 w-4" /> LIKELY AUTHENTIC</>}
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                  {isFake
                    ? <span className="text-red-400">Manipulated Video</span>
                    : <span className="text-green-400">Authentic Video</span>}
                </h1>

                <p className="text-slate-400 text-base mb-4 max-w-lg">
                  {isFake
                    ? `Our AI model detected deepfake indicators with ${confPct}% confidence. ${highSegs.length > 0 ? `${highSegs.length} high-risk segment${highSegs.length > 1 ? 's' : ''} identified.` : ''}`
                    : `No significant deepfake artifacts were detected. The video appears to be authentic with ${confPct}% confidence.`}
                </p>

                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold mb-4 ${calibration.style}`}>
                  <Shield className="h-3.5 w-3.5" />
                  {calibration.label}
                </div>

                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold mb-4 ml-2 ${trustSummary.style}`}>
                  <HelpCircle className="h-3.5 w-3.5" />
                  {trustSummary.trustLabel}
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FileVideo className="h-4 w-4" />
                  <span className="truncate max-w-xs">{result.video?.filename || 'Unknown file'}</span>
                </div>
              </div>

              {/* Top-K badge (ML feature) */}
              {topkPct !== null && (
                <div className="flex-shrink-0 text-center bg-slate-800/70 border border-slate-700 rounded-xl p-4 min-w-[110px]">
                  <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-300">{topkPct}%</p>
                  <p className="text-xs text-slate-400 leading-tight mt-0.5">Top‑K<br />Confidence</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className={`lg:col-span-3 rounded-2xl border p-6 ${trustSummary.style}`}>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white">What This Means</h2>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{trustSummary.headline}</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { title: 'Meaning', text: trustSummary.meaning },
                { title: 'Why', text: trustSummary.why },
                { title: 'Next step', text: trustSummary.next },
              ].map(item => (
                <div key={item.title} className="rounded-xl bg-slate-950/30 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/50 mb-2">{item.title}</p>
                  <p className="text-sm leading-relaxed text-white/85">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-blue-300" />
              <h2 className="text-lg font-bold text-white">Can I Trust This Video?</h2>
            </div>
            <div className="space-y-3">
              {trustChecklist.map(item => (
                <div key={item.label} className="flex gap-3 rounded-xl bg-slate-900/60 border border-slate-700/60 p-3">
                  {item.ok
                    ? <CheckCircle className="h-5 w-5 text-green-300 shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-100 flex gap-2">
              <Search className="h-4 w-4 shrink-0 mt-0.5" />
              Check the original source, date, and trusted news coverage before you share the video as real.
            </div>
          </div>
        </div>

        {isNewsVerification && (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileVideo className="h-5 w-5 text-blue-300" />
              <h2 className="text-lg font-bold text-white">News Verification Context</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-950/30 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-200/70 mb-2">Source</p>
                {result.video.sourceUrl ? (
                  <a
                    href={result.video.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-200 hover:text-blue-100 break-all"
                  >
                    {result.video.sourceHost || result.video.sourceUrl}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">Not reported</p>
                )}
              </div>
              <div className="rounded-xl bg-slate-950/30 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-200/70 mb-2">Recommended action</p>
                <p className="text-sm font-semibold text-white">{recommendedAction}</p>
              </div>
              <div className="md:col-span-2 rounded-xl bg-slate-950/30 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-200/70 mb-2">Claim/headline</p>
                <p className="text-sm text-white leading-relaxed">{result.video.claim || 'Not reported'}</p>
              </div>
              <div className="md:col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                This checks video manipulation, not whether the claim itself is factually true. Confirm the story with trusted reporting before sharing.
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className={`h-5 w-5 ${qualityWarnings.length ? 'text-amber-300' : 'text-green-300'}`} />
                <h2 className="text-lg font-bold text-white">Confidence Calibration & Limitations</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">{calibration.note}</p>
              {qualityWarnings.length > 0 ? (
                <div className="space-y-2">
                  {qualityWarnings.map((warning, index) => (
                    <div key={`${warning}-${index}`} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                      {warning}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-100">
                  No face-visibility, frame-count, compression, or no-face warning was reported for this completed analysis.
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[360px]">
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/70 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Valid Faces</p>
                <p className="text-xl font-bold text-white">{qualitySummary?.validFaceFrames ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/70 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Face Score</p>
                <p className="text-xl font-bold text-white">
                  {qualitySummary?.avgFaceDetectionScore != null
                    ? `${Math.round(qualitySummary.avgFaceDetectionScore * 100)}%`
                    : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/70 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Min Area</p>
                <p className="text-xl font-bold text-white">{qualitySummary?.minFaceArea ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            STATS ROW
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Activity className="h-5 w-5 text-blue-400" />, label: 'Detection Confidence', value: `${confPct}%` },
            { icon: <Eye className="h-5 w-5 text-purple-400" />, label: 'Frames Analysed', value: result.frameEvidence.length || result.video?.frameCount || '—' },
            { icon: <Shield className="h-5 w-5 text-orange-400" />, label: 'High-Risk Segments', value: highSegs.length },
            { icon: <Clock className="h-5 w-5 text-green-400" />, label: 'Processing Time', value: procSec ? `${procSec}s` : '—' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
                {icon}{label}
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
          {result.video?.duration && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
                <FileVideo className="h-5 w-5 text-cyan-400" />Video Duration
              </div>
              <p className="text-2xl font-bold text-white">{result.video.duration.toFixed(1)}s</p>
            </div>
          )}
          {result.video?.fps && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
                <Cpu className="h-5 w-5 text-yellow-400" />Frame Rate
              </div>
              <p className="text-2xl font-bold text-white">{result.video.fps} fps</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-5 gap-8 mb-8">

          {/* ══════════════════════════════════════════════════════
              SEGMENT TIMELINE  (left, 3 cols)
          ══════════════════════════════════════════════════════ */}
          {result.manipulatedSegments.length > 0 && (
            <div className="md:col-span-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-5 w-5 text-orange-400" />
                  <h2 className="text-lg font-bold text-white">Segment Analysis</h2>
                  <span className="ml-auto text-xs text-slate-500 bg-slate-700/60 px-2 py-1 rounded-full">
                    Grad-CAM powered
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-5">
                  The video is divided into time windows. Each segment's manipulation likelihood is scored
                  independently using frame-level Grad-CAM activations.
                </p>

                <div className="space-y-4">
                  {result.manipulatedSegments.map((seg, i) => {
                    const s = riskStyle(seg.verdict);
                    return (
                      <div key={i} className={`rounded-xl p-4 border ${s.glow} shadow bg-slate-900/60`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{seg.label}</span>
                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock className="h-3 w-3" />{seg.timeRange}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.badge}`}>
                            {seg.verdict} RISK
                          </span>
                        </div>

                        {/* Score bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.bar}`}
                              style={{ width: `${Math.min(seg.score, 100)}%`, transition: 'width 0.8s ease' }}
                            />
                          </div>
                          <span className="text-sm font-bold text-white min-w-[42px] text-right">
                            {seg.score.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isFake && highSegs.length > 0 && (
                  <div className="mt-5 flex items-start gap-2 text-orange-400 bg-orange-950/30 border border-orange-800/40 rounded-lg p-3 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {highSegs.length} segment{highSegs.length > 1 ? 's' : ''} showed HIGH manipulation likelihood.
                    These correspond to time windows where deepfake artifacts were most prominent.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              HOW IT WORKS PANEL  (right, 2 cols)
          ══════════════════════════════════════════════════════ */}
          <div className={result.manipulatedSegments.length > 0 ? 'md:col-span-2' : 'md:col-span-5'}>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <Cpu className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">How This Works</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: <Eye className="h-5 w-5 text-purple-400" />,
                    title: 'EfficientNet-B0 Backbone',
                    desc: 'A spatial CNN extracts per-frame features from 16 uniformly sampled frames across your video.',
                  },
                  {
                    icon: <Activity className="h-5 w-5 text-blue-400" />,
                    title: 'Grad-CAM Explainability',
                    desc: 'Gradient-weighted class activation maps highlight exactly which facial regions triggered the detection.',
                  },
                  {
                    icon: <TrendingUp className="h-5 w-5 text-green-400" />,
                    title: 'Top-K Frame Averaging',
                    desc: 'The top 4 most suspicious frames are weighted more heavily to boost detection accuracy.',
                  },
                  {
                    icon: <Shield className="h-5 w-5 text-orange-400" />,
                    title: 'Segment-Level Scoring',
                    desc: 'Video is split into temporal segments scored independently, pinpointing exactly when manipulation occurs.',
                  },
                ].map(f => (
                  <div key={f.title} className="flex gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {result.modelVersion && (
                <div className="mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-500 flex items-center justify-between">
                  <span>Model</span>
                  <span className="font-mono text-slate-400">{result.modelVersion}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            GRAD-CAM FRAME EVIDENCE
        ══════════════════════════════════════════════════════ */}
        {result.frameEvidence.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Grad-CAM Frame Evidence</h2>
              <span className="ml-auto text-xs text-slate-500 bg-slate-700/60 px-2 py-1 rounded-full">
                Top {result.frameEvidence.length} suspicious frames
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              These are the frames the model found most suspicious. The <span className="text-red-400 font-medium">red/warm overlay</span> is the
              Grad-CAM heatmap — it shows exactly which facial regions activated the deepfake classifier.
              Click a thumbnail to inspect it.
            </p>

            {/* Thumbnail strip */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {result.frameEvidence.map((f, i) => (
                <button
                  key={f.rank}
                  onClick={() => setActiveFrame(i)}
                  className={`flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all ${i === activeFrame
                      ? 'border-blue-400 scale-105 shadow-lg shadow-blue-500/30'
                      : 'border-slate-600 hover:border-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  style={{ width: 96, height: 96 }}
                >
                  {f.heatmapBase64
                    ? <img src={`data:image/jpeg;base64,${f.heatmapBase64}`} alt={`Frame #${f.rank}`} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500 text-xs">No img</div>
                  }
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                    #{f.rank} · {f.timestamp}
                  </div>
                </button>
              ))}
            </div>

            {/* Active frame detail */}
            {currentFrame && (
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/40">
                <div className="grid md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Original Face Crop</p>
                      <span className="text-[11px] uppercase tracking-wide text-slate-500">Input evidence</span>
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-600 bg-slate-800 shadow-xl">
                      {currentFrame.originalBase64 || currentFrame.heatmapBase64
                        ? <img
                          src={`data:image/jpeg;base64,${currentFrame.originalBase64 || currentFrame.heatmapBase64}`}
                          alt={`Original face crop frame #${currentFrame.rank}`}
                          className="w-full h-full object-cover"
                        />
                        : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400">No image</div>
                      }
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Grad-CAM Overlay</p>
                      <span className="text-[11px] uppercase tracking-wide text-red-300">Model focus</span>
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-600 bg-slate-800 shadow-xl">
                      {currentFrame.heatmapBase64
                        ? <img
                          src={`data:image/jpeg;base64,${currentFrame.heatmapBase64}`}
                          alt={`Grad-CAM overlay frame #${currentFrame.rank}`}
                          className="w-full h-full object-cover"
                        />
                        : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400">No heatmap</div>
                      }
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-5">
                {/* Large image */}
                <div className="hidden" style={{ width: 240, height: 240 }}>
                  {currentFrame.heatmapBase64
                    ? <img
                      src={`data:image/jpeg;base64,${currentFrame.heatmapBase64}`}
                      alt={`Grad-CAM frame #${currentFrame.rank}`}
                      className="w-full h-full object-cover"
                    />
                    : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400">No image</div>
                  }
                </div>

                {/* Frame metadata */}
                <div className="md:col-span-3 flex flex-col justify-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        #{currentFrame.rank} Most Suspicious
                      </span>
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {currentFrame.timestamp}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-2">
                      Frame at {currentFrame.timestamp}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      The warm regions in this Grad-CAM overlay indicate where the EfficientNet-B0 backbone
                      detected potential manipulation artifacts — typically around eyes, mouth, or hairline boundaries.
                    </p>
                  </div>

                  <p className="text-slate-300 text-sm mt-3">{getEvidenceExplanation(currentFrame)}</p>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-200">
                    <Eye className="h-3.5 w-3.5" />
                    Region focus: <span className="font-semibold text-purple-100">{getEvidenceRegion(currentFrame)}</span>
                  </div>

                  {/* Score bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Suspicion Score</span>
                      <span className="font-bold text-red-400">{currentFrame.score.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                        style={{ width: `${Math.min(currentFrame.score, 100)}%`, transition: 'width 0.6s ease' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Score derived from top-25% mean of normalised Grad-CAM activation values
                    </p>
                  </div>

                  {/* Navigate */}
                  {result.frameEvidence.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {result.frameEvidence.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveFrame(i)}
                          className={`h-2 rounded-full transition-all ${i === activeFrame ? 'bg-blue-400 w-6' : 'bg-slate-600 w-2 hover:bg-slate-400'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Reviewer note</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Compare the original crop against the heatmap overlay. Warm regions mark where gradients most influenced the classifier, so they should guide human review rather than replace it.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-800/70 p-3">
                      <p className="text-slate-500 mb-1">Timestamp</p>
                      <p className="text-white font-semibold">{currentFrame.timestamp}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/70 p-3">
                      <p className="text-slate-500 mb-1">Suspicion</p>
                      <p className="text-red-300 font-semibold">{currentFrame.score.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            FOOTER META
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 pt-6 border-t border-slate-800">
          <span>Analysed: {new Date(result.createdAt).toLocaleString()}</span>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                downloadForensicReportPdf(result);
                toast.success('Forensic report downloaded');
              }}
              className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Download Forensic Report
            </button>
            <Link to="/upload"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Analyse another video <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
