import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Brain, ChevronRight, Cpu, Eye, Layers, Lock, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { AlertPanel, AppShell, Eyebrow, IconTile, PageHeader, SectionPanel } from './shared/ProductUI';

const Tech = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <SectionPanel className="transition hover:-translate-y-0.5 hover:border-blue-500/40">
    <IconTile>{icon}</IconTile>
    <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
  </SectionPanel>
);

const Step = ({ n, title, desc, tone }: { n: number; title: string; desc: string; tone: 'blue' | 'purple' | 'green' | 'amber' }) => (
  <div className="flex gap-5">
    <IconTile tone={tone}>{n}</IconTile>
    <div className="pb-6">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  </div>
);

export const AboutPage = () => (
  <AppShell maxWidth="max-w-5xl">
    <PageHeader
      align="center"
      eyebrow={<Eyebrow icon={<Shield className="h-3.5 w-3.5" />}>ProofOfReality</Eyebrow>}
      title="Transparent deepfake detection for everyday verification"
      description="An AI-powered Final Year Project using EfficientNet-B0, temporal reasoning, and Grad-CAM evidence to explain what the model saw."
    />

    <SectionPanel className="mb-10 border-blue-500/30 bg-blue-600/10 p-8">
      <h2 className="text-2xl font-bold text-white">Mission</h2>
      <p className="mt-4 leading-relaxed text-slate-300">
        Convincing synthetic media threatens public trust. ProofOfReality helps journalists, researchers, and everyday users inspect video authenticity with evidence, limitations, and clear next steps.
      </p>
    </SectionPanel>

    <section className="mb-10">
      <PageHeader title="Technology" description="Each component supports video-level detection, evidence, or responsible communication." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tech icon={<Cpu className="h-6 w-6 text-blue-400" />} title="EfficientNet-B0 Backbone" desc="Extracts spatial features from sampled face crops." />
        <Tech icon={<Brain className="h-6 w-6 text-purple-400" />} title="Temporal Reasoning" desc="Reads frame evidence together to reduce one-frame noise." />
        <Tech icon={<Eye className="h-6 w-6 text-cyan-400" />} title="Spatial Grad-CAM" desc="Highlights facial regions that influenced the classifier." />
        <Tech icon={<TrendingUp className="h-6 w-6 text-green-400" />} title="Top-K Frame Weighting" desc="Emphasises the most suspicious frames in the confidence score." />
        <Tech icon={<Layers className="h-6 w-6 text-orange-400" />} title="Segment Scoring" desc="Splits the video into time windows for clearer review." />
        <Tech icon={<Zap className="h-6 w-6 text-yellow-400" />} title="BlazeFace Detection" desc="Finds and quality-gates faces before inference." />
      </div>
    </section>

    <SectionPanel className="mb-10 p-8">
      <PageHeader title="Inference Pipeline" description="From raw MP4 to result page and PDF report." />
      <div className="max-w-2xl">
        <Step n={1} tone="blue" title="Frame sampling" desc="16 frames are sampled across the video, with nearby-frame search when a target frame has poor face visibility." />
        <Step n={2} tone="purple" title="Face quality gating" desc="BlazeFace must detect a visible face with enough confidence and area before the model sees it." />
        <Step n={3} tone="green" title="Model inference" desc="Face crops pass through the detector to classify likely real or manipulated video." />
        <Step n={4} tone="amber" title="Evidence and guidance" desc="Grad-CAM heatmaps, quality warnings, trust labels, and reports help users interpret the result." />
      </div>
    </SectionPanel>

    <SectionPanel className="mb-10 p-8">
      <PageHeader title="Privacy & Ethics" description="The product is designed for verification and decision support." />
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { icon: <Lock className="h-5 w-5 text-green-400" />, title: 'Auto-deletion', desc: 'Uploaded videos are deleted automatically after 12 hours.' },
          { icon: <Shield className="h-5 w-5 text-blue-400" />, title: 'No permanent PII', desc: 'The app does not need personal media archives to function.' },
          { icon: <Users className="h-5 w-5 text-purple-400" />, title: 'Human-in-the-loop', desc: 'Results should guide judgement, not replace it.' },
          { icon: <Activity className="h-5 w-5 text-orange-400" />, title: 'Responsible use', desc: 'Built for verification, education, journalism, and moderation.' },
        ].map(item => (
          <div key={item.title} className="flex gap-3">
            <IconTile>{item.icon}</IconTile>
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>

    <AlertPanel icon={<AlertTriangle className="h-4 w-4" />} className="mb-8">
      This checks visual manipulation signals, not whether a news claim is factually true.
    </AlertPanel>

    <div className="text-center">
      <Link to="/verify-news" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:from-blue-500 hover:to-blue-400">
        Verify a news video
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  </AppShell>
);
