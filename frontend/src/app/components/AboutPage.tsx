import { Navbar } from './Navbar';
import {
  Shield, Eye, Brain, Layers, Zap, Lock,
  Cpu, Activity, TrendingUp, Users, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Tech = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/40 transition-all hover:-translate-y-0.5 duration-300">
    <div className="w-12 h-12 rounded-xl bg-slate-700/70 flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-white font-semibold mb-2 text-sm">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ n, title, desc, color }: { n: number; title: string; desc: string; color: string }) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${color}`}>{n}</div>
      {n < 4 && <div className="w-px flex-1 bg-gradient-to-b from-slate-600 to-transparent mt-2" />}
    </div>
    <div className="pb-7">
      <h3 className="text-white font-semibold mb-1 text-sm">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export const AboutPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute w-[600px] h-[600px] bg-blue-700/8 rounded-full blur-3xl -top-40 left-1/4" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl bottom-20 right-10" />
    </div>
    <Navbar />

    <div className="max-w-5xl mx-auto px-4 py-14">

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-6 shadow-2xl shadow-blue-500/30">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">ProofOfReality</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          An AI-powered deepfake detection system built as a Final Year Project.
          EfficientNet-B0 + Transformer backbone with Grad-CAM explainability — no black-box, every decision is transparent.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-3xl p-10 mb-16">
        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-slate-300 leading-relaxed text-base">
          In today's world, convincing synthetic media poses a real threat to public trust.
          ProofOfReality gives journalists, researchers, and everyday users a free, transparent tool
          to verify video authenticity — using state-of-the-art deep learning that explains <em>why</em> it flagged
          something, not just whether it did.
        </p>
      </div>

      {/* Tech features */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Technology</h2>
        <p className="text-slate-400 mb-8 text-sm">Each component is purpose-built for deepfake detection</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Tech icon={<Cpu className="h-6 w-6 text-blue-400" />}
            title="EfficientNet-B0 Backbone"
            desc="Lightweight but powerful CNN for extracting spatial features from 16 sampled face crops per video." />
          <Tech icon={<Brain className="h-6 w-6 text-purple-400" />}
            title="Transformer Temporal Encoder"
            desc="Multi-head self-attention across frames to capture temporal inconsistencies that CNNs alone miss." />
          <Tech icon={<Eye className="h-6 w-6 text-cyan-400" />}
            title="Spatial Grad-CAM"
            desc="Gradient-weighted class activation maps highlight the exact facial regions that triggered suspicion." />
          <Tech icon={<TrendingUp className="h-6 w-6 text-green-400" />}
            title="Top-K Frame Weighting"
            desc="The 4 most suspicious frames contribute more to the final verdict than neutral frames." />
          <Tech icon={<Layers className="h-6 w-6 text-orange-400" />}
            title="Segment Scoring"
            desc="Video split into time windows — deepfake manipulation often appears in bursts, not uniformly." />
          <Tech icon={<Zap className="h-6 w-6 text-yellow-400" />}
            title="BlazeFace Detection"
            desc="MediaPipe BlazeFace locates and quality-gates face crops before any inference, reducing noise." />
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10 mb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Inference Pipeline</h2>
        <p className="text-slate-400 mb-8 text-sm">From raw MP4 to detailed report — step by step</p>
        <div className="max-w-lg">
          <Step n={1} color="bg-blue-600" title="Frame Sampling"
            desc="16 frames are sampled evenly across the video duration. Each target position searches a ±window for a quality face crop." />
          <Step n={2} color="bg-purple-600" title="Face Quality Gating"
            desc="BlazeFace must detect a face with ≥70% confidence and ≥40×40px area, otherwise the frame is skipped." />
          <Step n={3} color="bg-green-600" title="EfficientNet + Transformer Inference"
            desc="Each face crop (224×224) passes through the backbone, then a Transformer reads all 16 frames together to predict authenticity." />
          <Step n={4} color="bg-orange-600" title="Grad-CAM + Post-processing"
            desc="Gradients flow back to the last conv block — ReLU-activated CAMs are overlaid on face crops. Top 3 suspicious frames are rendered." />
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10 mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Privacy & Ethics</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: <Lock className="h-5 w-5 text-green-400" />, title: 'Auto-deletion', desc: 'All uploaded videos are deleted automatically after 12 hours — no permanent storage.' },
            { icon: <Shield className="h-5 w-5 text-blue-400" />, title: 'No PII collected', desc: 'No personal data is retained. Processing is stateless and isolated per request.' },
            { icon: <Users className="h-5 w-5 text-purple-400" />, title: 'Human-in-the-loop', desc: 'Results should supplement human judgement — not replace it. Always verify through multiple sources.' },
            { icon: <Activity className="h-5 w-5 text-orange-400" />, title: 'Responsible use', desc: 'Designed for verification, journalism, education, and content moderation — not surveillance.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-slate-400 mb-4">Ready to check a video?</p>
        <Link to="/upload"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold transition-all shadow-xl shadow-blue-500/20">
          Start Analysing <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </div>
);
