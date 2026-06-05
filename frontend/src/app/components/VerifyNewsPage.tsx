import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  FileVideo,
  Globe,
  Link as LinkIcon,
  Newspaper,
  Search,
  Shield,
  Upload,
  X,
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { AlertPanel, AnalysisProgress, AppShell, DropzoneUpload, PageHeader, PrimaryButton, SectionPanel } from './shared/ProductUI';

type FlowStage =
  | 'idle'
  | 'validating_input'
  | 'checking_video_length'
  | 'uploading'
  | 'queued'
  | 'extracting_faces'
  | 'running_model'
  | 'generating_report'
  | 'completed'
  | 'failed'
  | 'timeout';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MIN_DURATION = 5;
const MAX_DURATION = 120;

const stageLabels: Record<FlowStage, string> = {
  idle: 'Ready',
  validating_input: 'Checking your link, claim, and video file...',
  checking_video_length: 'Checking video length...',
  uploading: 'Uploading video...',
  queued: 'Waiting for analysis to start...',
  extracting_faces: 'Finding clear face frames...',
  running_model: 'Running AI manipulation analysis...',
  generating_report: 'Preparing verification report...',
  completed: 'Analysis complete',
  failed: 'Analysis failed',
  timeout: 'Analysis timed out',
};

const deriveHost = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
};

const readVideoDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read video duration. Please upload a valid MP4.'));
    };
    video.src = url;
  });

export const VerifyNewsPage = () => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [claim, setClaim] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<FlowStage>('idle');
  const [progress, setProgress] = useState(0);
  const [failureMessage, setFailureMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const sourceHost = useMemo(() => deriveHost(sourceUrl), [sourceUrl]);
  const isBusy = stage !== 'idle' && stage !== 'failed' && stage !== 'timeout' && stage !== 'completed';

  const validateFields = async () => {
    const nextErrors: Record<string, string> = {};
    const trimmedUrl = sourceUrl.trim();
    const trimmedClaim = claim.trim();

    if (!trimmedUrl) {
      nextErrors.sourceUrl = 'Paste the news or social media link.';
    } else {
      try {
        const parsed = new URL(trimmedUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          nextErrors.sourceUrl = 'Link must start with http or https.';
        }
        if (trimmedUrl.length > 500) {
          nextErrors.sourceUrl = 'Link must be 500 characters or less.';
        }
      } catch {
        nextErrors.sourceUrl = 'Enter a valid link.';
      }
    }

    if (trimmedClaim.length < 10 || trimmedClaim.length > 280) {
      nextErrors.claim = 'Claim/headline must be 10-280 characters.';
    }

    if (!selectedFile) {
      nextErrors.video = 'Upload the MP4 clip you want to verify.';
    } else {
      if (selectedFile.type !== 'video/mp4') {
        nextErrors.video = 'Only MP4 videos are supported.';
      } else if (selectedFile.size > MAX_FILE_SIZE) {
        nextErrors.video = 'File size must be 50 MB or less.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAndSetFile = async (file: File) => {
    const nextErrors = { ...errors };
    delete nextErrors.video;
    setFailureMessage('');
    setDuration(null);

    if (file.type !== 'video/mp4') {
      nextErrors.video = 'Only MP4 videos are supported.';
      setErrors(nextErrors);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      nextErrors.video = 'File size must be 50 MB or less.';
      setErrors(nextErrors);
      return;
    }

    try {
      const videoDuration = await readVideoDuration(file);
      if (!Number.isFinite(videoDuration)) {
        nextErrors.video = 'Could not read video duration. Please upload a valid MP4.';
      } else if (videoDuration < MIN_DURATION) {
        nextErrors.video = 'Video must be at least 5 seconds.';
      } else if (videoDuration > MAX_DURATION) {
        nextErrors.video = 'Video must be 2 minutes or less.';
      }

      if (nextErrors.video) {
        setSelectedFile(null);
        setErrors(nextErrors);
        return;
      }

      setSelectedFile(file);
      setDuration(videoDuration);
      setErrors(nextErrors);
      toast.success('Video ready for news verification');
    } catch (error: any) {
      nextErrors.video = error.message || 'Could not read video duration. Please upload a valid MP4.';
      setSelectedFile(null);
      setErrors(nextErrors);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDuration(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const humaniseFailure = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('no face')) return 'No clear face was found. Try a clearer clip.';
    if (lower.includes('not available') || lower.includes('offline') || lower.includes('econnrefused')) {
      return 'Analysis service is offline. Try again later.';
    }
    if (lower.includes('timed out') || lower.includes('timeout')) return 'This video took too long. Try a shorter clip.';
    if (lower.includes('network') || lower.includes('fetch')) return "Connection interrupted. We'll keep checking when possible.";
    return message;
  };

  const pollStatus = async (videoId: string) => {
    let attempts = 0;
    let networkFailures = 0;

    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts += 1;

      try {
        const status = await apiService.getAnalysisStatus(videoId);
        networkFailures = 0;

        if (status.success && typeof status.data?.progress === 'number') {
          const nextProgress = Math.min(status.data.progress, 99);
          setProgress(nextProgress);

          if (nextProgress < 35) setStage('queued');
          else if (nextProgress < 55) setStage('extracting_faces');
          else if (nextProgress < 88) setStage('running_model');
          else setStage('generating_report');
        }

        if (status.success && (status.data?.status === 'done' || status.data?.status === 'completed')) {
          setStage('completed');
          setProgress(100);
          toast.success('News video verification complete');
          navigate(`/results/${videoId}`);
          return;
        }

        if (status.data?.status === 'failed') {
          throw new Error(status.data?.errorMessage || status.data?.error || 'Analysis failed');
        }
      } catch (error: any) {
        networkFailures += 1;
        if (networkFailures < 3) {
          setFailureMessage("Connection interrupted. We'll keep checking.");
          continue;
        }

        throw error;
      }
    }

    const timeout = new Error('This video took too long. Try a shorter clip.');
    setStage('timeout');
    throw timeout;
  };

  const startVerification = async () => {
    setFailureMessage('');
    setStage('validating_input');
    setProgress(5);

    try {
      const valid = await validateFields();
      if (!valid || !selectedFile) {
        setStage('failed');
        setFailureMessage('Please fix the highlighted fields before starting verification.');
        return;
      }

      setStage('checking_video_length');
      setProgress(12);
      const videoDuration = duration ?? await readVideoDuration(selectedFile);
      if (videoDuration < MIN_DURATION) throw new Error('Video must be at least 5 seconds.');
      if (videoDuration > MAX_DURATION) throw new Error('Video must be 2 minutes or less.');

      setStage('uploading');
      setProgress(20);
      const uploadResponse = await apiService.uploadVideo(selectedFile, {
        verificationMode: 'news-video',
        sourceUrl: sourceUrl.trim(),
        claim: claim.trim(),
      });
      if (!uploadResponse.success) throw new Error(uploadResponse.message || 'Upload failed');

      const videoId = uploadResponse.data?.videoId;
      if (!videoId) throw new Error('Server did not return a video ID');

      setStage('queued');
      setProgress(35);
      const analysisResponse = await apiService.startAnalysis(videoId);
      if (!analysisResponse.success) throw new Error(analysisResponse.message || 'Analysis start failed');

      await pollStatus(videoId);
    } catch (error: any) {
      const message = humaniseFailure(error.message || 'Verification failed');
      setFailureMessage(message);
      setStage(message.toLowerCase().includes('too long') ? 'timeout' : 'failed');
      setProgress(0);
      toast.error(message);
    }
  };

  const selectedFileInfo = selectedFile
    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB${duration ? ` - ${duration.toFixed(1)}s` : ''}`
    : '';

  return (
    <AppShell maxWidth="max-w-5xl">
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
              <Newspaper className="h-3.5 w-3.5" />
              News and social media video verification
            </span>
          }
          title="Verify News Video"
          description="Paste where the clip came from, describe the claim, then upload the MP4. This checks for video manipulation, not whether the news claim itself is true."
        />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <SectionPanel>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                <LinkIcon className="h-4 w-4 text-blue-300" />
                Source link
              </label>
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                disabled={isBusy}
                placeholder="https://news-site.com/story or social post link"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className={errors.sourceUrl ? 'text-red-300' : 'text-slate-500'}>
                  {errors.sourceUrl || 'Use the original source when possible.'}
                </span>
                {sourceHost && <span className="text-blue-300">{sourceHost}</span>}
              </div>
            </SectionPanel>

            <SectionPanel>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                <Search className="h-4 w-4 text-green-300" />
                Claim or headline
              </label>
              <textarea
                value={claim}
                onChange={(event) => setClaim(event.target.value)}
                disabled={isBusy}
                rows={4}
                placeholder="Example: This video claims to show a public figure making a new statement..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className={errors.claim ? 'text-red-300' : 'text-slate-500'}>
                  {errors.claim || 'Write what the video is claiming in plain language.'}
                </span>
                <span className="text-slate-500">{claim.trim().length}/280</span>
              </div>
            </SectionPanel>

            <DropzoneUpload
              selected={!!selectedFile}
              helper={selectedFile ? selectedFileInfo : 'MP4 only, 5 seconds to 2 minutes, max 50 MB'}
              error={errors.video}
              dragging={isDragging}
              disabled={isBusy}
              onClick={() => !isBusy && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragState={setIsDragging}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4"
                className="hidden"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) validateAndSetFile(file);
                }}
              />

              <p className="font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Upload the MP4 clip'}
              </p>
            </DropzoneUpload>

            {selectedFile && !isBusy && (
              <button
                onClick={removeFile}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Remove video
              </button>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <SectionPanel>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-300" />
                <h2 className="font-bold text-white">Verification limits</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-300 shrink-0 mt-0.5" />Checks whether the visible face may be manipulated.</div>
                <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />Does not prove whether the claim itself is true.</div>
                <div className="flex gap-2"><Globe className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />Use official platform download/export options before upload.</div>
                <div className="flex gap-2"><Clock className="h-4 w-4 text-purple-300 shrink-0 mt-0.5" />Accepted length: 5 seconds to 2 minutes.</div>
              </div>
            </SectionPanel>

            <div>
              <AnalysisProgress label={stageLabels[stage]} progress={progress} />
              {failureMessage && (
                <AlertPanel tone="red" className="mt-4">
                  {failureMessage}
                </AlertPanel>
              )}
            </div>

            <PrimaryButton
              onClick={startVerification}
              disabled={isBusy}
              className="w-full"
            >
              <FileVideo className="h-5 w-5" />
              Start Verification
              <ChevronRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
    </AppShell>
  );
};
