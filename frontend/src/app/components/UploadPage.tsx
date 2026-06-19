import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Clock, Cpu, FileVideo, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { AlertPanel, AppShell, IconTile, PageHeader, PrimaryButton, SectionPanel, StatCard } from './shared/ProductUI';
import { AnalysisProgressStepper, MediaUploadDropzone } from './premium/RealityComponents';

const STEPS = [
  { pct: [0, 25], label: 'Uploading video...' },
  { pct: [25, 50], label: 'Extracting frames...' },
  { pct: [50, 80], label: 'Running AI inference...' },
  { pct: [80, 100], label: 'Generating heatmaps...' },
];

export const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const currentStep = STEPS.find(s => progress >= s.pct[0] && progress < s.pct[1]) ?? STEPS[3];

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'video/mp4') { toast.error('Only MP4 format is supported'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('File size must be 50 MB or less'); return; }
    setSelectedFile(file);
    toast.success('Video ready to analyse');
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processVideo = async () => {
    if (!selectedFile) { toast.error('Please select a file first'); return; }
    setIsProcessing(true);
    setProgress(10);

    try {
      setProgress(20);
      const uploadResponse = await apiService.uploadVideo(selectedFile);
      if (!uploadResponse.success) throw new Error(uploadResponse.message || 'Upload failed');

      const videoId = uploadResponse.data.videoId;
      if (!videoId) throw new Error('Server did not return a video ID');
      setProgress(40);

      const analysisResponse = await apiService.startAnalysis(videoId);
      if (!analysisResponse.success) throw new Error(analysisResponse.message || 'Analysis start failed');

      setProgress(60);
      let done = false;
      let attempts = 0;
      while (!done && attempts < 60) {
        await new Promise(r => setTimeout(r, 5000));
        const status = await apiService.getAnalysisStatus(videoId);
        if (status.success && typeof status.data?.progress === 'number') {
          setProgress(prev => Math.max(prev, Math.min(status.data.progress, 99)));
        }
        if (status.success && (status.data?.status === 'done' || status.data?.status === 'completed')) {
          done = true;
          setProgress(100);
          toast.success('Analysis complete!');
          navigate(`/results/${videoId}`);
        } else if (status.data?.status === 'failed') {
          throw new Error(status.data?.errorMessage || status.data?.error || 'Analysis failed');
        }
        attempts++;
      }
      if (!done) throw new Error('Analysis timed out after 5 minutes');
    } catch (err: any) {
      toast.error(err.message || 'Processing failed');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <AppShell maxWidth="max-w-3xl" background="scan">
      <PageHeader
        align="center"
        title="Analyse a Video"
        description="Upload an MP4 and the AI will inspect visible faces for deepfake artifacts, confidence, warnings, and Grad-CAM evidence."
      />

      <AlertPanel icon={<AlertTriangle className="h-4 w-4" />} className="mb-6">
        AI results are indicative. Videos are auto-deleted after 12 hours.
      </AlertPanel>

      {!isProcessing ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) validateAndSetFile(file);
            }}
            className="hidden"
          />
          <MediaUploadDropzone
            selected={!!selectedFile}
            dragging={isDragging}
            title={selectedFile ? selectedFile.name : isDragging ? 'Release to upload' : 'Drop your video here'}
            helper={selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB - MP4` : 'MP4 only, max 50 MB'}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragState={setIsDragging}
          />

          {selectedFile && (
            <SectionPanel className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconTile tone="green"><FileVideo className="h-5 w-5" /></IconTile>
                <div>
                  <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB - MP4</p>
                </div>
              </div>
              <button onClick={handleRemove} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </SectionPanel>
          )}

          <PrimaryButton onClick={processVideo} disabled={!selectedFile} className="mt-6 w-full">
            <Cpu className="h-5 w-5" />
            Run Analysis
            <ChevronRight className="h-4 w-4" />
          </PrimaryButton>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <StatCard icon={<FileVideo className="h-4 w-4" />} label="Format" value="MP4" tone="blue" />
            <StatCard icon={<Cpu className="h-4 w-4" />} label="Time" value="10-60s" tone="purple" />
            <StatCard icon={<Clock className="h-4 w-4" />} label="Retention" value="12h" tone="amber" />
          </div>
        </>
      ) : (
        <SectionPanel className="p-10 text-center">
          <div className="relative mx-auto mb-8 h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Analysing Video</h2>
          <div className="mx-auto max-w-sm">
            <AnalysisProgressStepper label={currentStep.label} progress={progress} />
          </div>
        </SectionPanel>
      )}
    </AppShell>
  );
};
