import { Link } from 'react-router-dom';
import {
  Upload, Shield, Eye, TrendingUp, Activity,
  Cpu, ChevronRight, AlertTriangle, Play
} from 'lucide-react';
import { Navbar } from './Navbar';

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1">
    <div className="w-12 h-12 rounded-xl bg-slate-700/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ n, title, desc }: { n: number; title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/30">{n}</div>
      {n < 3 && <div className="w-px flex-1 bg-gradient-to-b from-blue-500/50 to-transparent mt-2" />}
    </div>
    <div className="pb-8">
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
    {/* Glow blobs */}
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl -top-40 -left-40" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl bottom-0 right-0" />
    </div>

    <Navbar />

    {/* ── HERO ── */}
    <section className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
      <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-8">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        AI-powered analysis — results in seconds
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
        <span className="text-white">Is your video</span><br />
        <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
          real or fake?
        </span>
      </h1>

      <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Upload an MP4 video and our EfficientNet-B0 + Transformer model will analyse every frame
        for deepfake artifacts — with Grad-CAM heatmaps showing exactly where.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/upload"
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5"
        >
          <Upload className="h-5 w-5" />
          Analyse a Video
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/about"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-semibold text-base transition-all"
        >
          <Play className="h-4 w-4" />
          How it works
        </Link>
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">What our model actually does</h2>
        <p className="text-slate-400">No black-box — every decision is explainable</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Feature icon={<Cpu className="h-6 w-6 text-blue-400" />}
          title="EfficientNet-B0 Backbone"
          desc="Spatial CNN extracts features from 16 evenly sampled frames per video" />
        <Feature icon={<Eye className="h-6 w-6 text-purple-400" />}
          title="Grad-CAM Heatmaps"
          desc="Gradient-weighted class activation maps pinpoint manipulated facial regions" />
        <Feature icon={<TrendingUp className="h-6 w-6 text-green-400" />}
          title="Top-K Frame Averaging"
          desc="The 4 most suspicious frames are weighted heavily to boost accuracy" />
        <Feature icon={<Shield className="h-6 w-6 text-orange-400" />}
          title="Segment Analysis"
          desc="Video split into time windows — each scored independently for localisation" />
      </div>
    </section>

    {/* ── HOW IT WORKS ── */}
    <section className="max-w-4xl mx-auto px-4 pb-24">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Three-step process</h2>
          <p className="text-slate-400">From upload to detailed report in under a minute</p>
        </div>
        <div className="max-w-sm mx-auto">
          <Step n={1} title="Upload your video"
            desc="Drop an MP4 file (up to 100 MB). We extract 16 evenly-spaced frames automatically." />
          <Step n={2} title="AI analyses every frame"
            desc="BlazeFace detects faces, EfficientNet + Transformer scores each frame. Grad-CAM maps are generated." />
          <Step n={3} title="View detailed results"
            desc="Verdict, confidence score, Grad-CAM overlays, and per-segment risk timeline — all on one page." />
        </div>
        <div className="text-center mt-4">
          <Link to="/upload"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors">
            <Activity className="h-4 w-4" /> Start analysing
          </Link>
        </div>
      </div>
    </section>

    {/* ── DISCLAIMER ── */}
    <div className="max-w-4xl mx-auto px-4 pb-16">
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 text-amber-300/80 rounded-xl p-4 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>AI detection is highly accurate but not infallible. Results are indicative and should not be used as sole legal evidence. Videos are auto-deleted after 12 hours.</p>
      </div>
    </div>
  </div>
);
