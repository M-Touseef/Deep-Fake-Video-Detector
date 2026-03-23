import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileVideo, X, Shield, Clock, Cpu, ChevronRight, AlertTriangle } from 'lucide-react';
import { Navbar } from './Navbar';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const STEPS = [
  { pct: [0, 25], label: 'Uploading video…' },
  { pct: [25, 50], label: 'Extracting frames…' },
  { pct: [50, 80], label: 'Running AI inference…' },
  { pct: [80, 100], label: 'Generating heatmaps…' },
];

export const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentStep = STEPS.find(s => progress >= s.pct[0] && progress < s.pct[1]) ?? STEPS[3];

  const handleDrag = (e: React.DragEvent, entering: boolean) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(entering);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };
  const validateAndSetFile = (file: File) => {
    if (file.type !== 'video/mp4') { toast.error('Only MP4 format is supported'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('File size must be 50 MB or less'); return; }
    setSelectedFile(file);
    toast.success('Video ready to analyse');
  };
  const handleRemove = () => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const processVideo = async () => {
    if (!selectedFile) { toast.error('Please select a file first'); return; }
    setIsProcessing(true); setProgress(10);

    try {
      setProgress(20);
      const uploadResponse = await apiService.uploadVideo(selectedFile, user?.id);
      if (!uploadResponse.success) throw new Error(uploadResponse.message || 'Upload failed');

      const videoId = uploadResponse.data.videoId;
      if (!videoId) throw new Error('Server did not return a video ID');
      setProgress(40);

      setProgress(60);
      const analysisResponse = await apiService.startAnalysis(videoId);
      if (!analysisResponse.success) throw new Error(analysisResponse.message || 'Analysis start failed');

      setProgress(80);
      let done = false, attempts = 0;
      while (!done && attempts < 60) {
        await new Promise(r => setTimeout(r, 5000));
        const status = await apiService.getAnalysisStatus(videoId);
        if (status.success && (status.data?.status === 'done' || status.data?.status === 'completed')) {
          done = true; setProgress(100);
          toast.success('Analysis complete!');
          navigate(`/results/${videoId}`);
        } else if (status.data?.status === 'failed') {
          throw new Error(status.data?.error || 'Analysis failed');
        }
        attempts++;
      }
      if (!done) throw new Error('Analysis timed out after 5 minutes');

    } catch (err: any) {
      toast.error(err.message || 'Processing failed');
      setIsProcessing(false); setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-3xl -top-40 left-1/4" />
      </div>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Analyse a Video</h1>
          <p className="text-slate-400">Upload an MP4 — our AI will check every frame for deepfake artifacts in seconds</p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 text-amber-300/80 rounded-xl p-3.5 text-xs mb-8">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          AI results are indicative. Videos are auto-deleted after 12 hours.
        </div>

        {!isProcessing ? (
          <>
            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-300 mb-6 ${isDragging
                  ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                  : selectedFile
                    ? 'border-green-500/40 bg-green-500/5 hover:border-green-400/60'
                    : 'border-slate-600 bg-slate-800/30 hover:border-blue-500/50 hover:bg-slate-800/50'
                }`}
              onDragEnter={e => handleDrag(e, true)}
              onDragOver={e => handleDrag(e, true)}
              onDragLeave={e => handleDrag(e, false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="video/mp4" onChange={handleFileSelect} className="hidden" />
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDragging ? 'bg-blue-500/20' : 'bg-slate-700/60'}`}>
                <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-slate-400'}`} />
              </div>
              <p className="text-white font-semibold text-lg mb-1">
                {isDragging ? 'Release to upload' : 'Drop your video here'}
              </p>
              <p className="text-slate-500 text-sm">or click to browse — MP4 only, max 50 MB</p>
            </div>

            {/* Selected file card */}
            {selectedFile && (
              <div className="bg-slate-800/60 border border-green-500/30 rounded-xl p-4 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/15 rounded-lg flex items-center justify-center">
                    <FileVideo className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-slate-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · MP4</p>
                  </div>
                </div>
                <button onClick={handleRemove} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={processVideo}
              disabled={!selectedFile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-base"
            >
              <Cpu className="h-5 w-5" />
              Run Analysis
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Info pills */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: <FileVideo className="h-4 w-4 text-blue-400" />, label: 'Format', val: 'MP4 only' },
                { icon: <Cpu className="h-4 w-4 text-purple-400" />, label: 'Analysis time', val: '10–60s' },
                { icon: <Clock className="h-4 w-4 text-orange-400" />, label: 'Retention', val: '12 hours' },
              ].map(({ icon, label, val }) => (
                <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className="text-slate-400 text-xs mb-0.5">{label}</p>
                  <p className="text-white text-sm font-semibold">{val}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Processing state */
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center shadow-2xl">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Analysing Video</h2>
            <p className="text-slate-400 mb-8 text-sm">{currentStep.label}</p>

            <div className="max-w-sm mx-auto">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Progress</span><span>{progress}%</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-6 mt-8">
              {['Upload', 'Frames', 'Inference', 'Heatmaps'].map((s, i) => {
                const stepPct = [25, 50, 80, 100][i];
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${progress >= stepPct ? 'bg-blue-400' : 'bg-slate-600'}`} />
                    <span className={`text-xs ${progress >= stepPct ? 'text-blue-300' : 'text-slate-500'}`}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
