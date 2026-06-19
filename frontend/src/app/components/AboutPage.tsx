import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Cpu, Eye, Layers, Shield, Zap } from 'lucide-react';
import { AppShell } from './shared/ProductUI';
import {
  ArchitectureFlowDiagram,
  GlassCard,
  LimitationsAndEthics,
  ProcessTimeline,
  SectionTitle,
  TechStackShowcase,
} from './premium/RealityComponents';

const ModelCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <GlassCard className="p-6">
    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">{icon}</div>
    <h3 className="text-lg font-black text-white">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
  </GlassCard>
);

export const AboutPage = () => (
  <AppShell maxWidth="max-w-6xl" background="hash">
    <section className="py-14 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-400/25 bg-blue-500/12 shadow-xl shadow-blue-500/20">
        <Shield className="h-8 w-8 text-blue-200" />
      </div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-300/75">Architecture and Responsible AI</p>
      <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-white md:text-6xl">
        A transparent system for detecting, explaining, and reporting suspicious media.
      </h1>
      <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-400">
        Proof of Reality separates frontend experience, backend orchestration, ML inference, explainability, and report generation so the project can be understood as a real AI product prototype.
      </p>
    </section>

    <section className="py-10">
      <SectionTitle eyebrow="Model pipeline" title="The model is not a black box in the UI." text="The system communicates detection, evidence, confidence, and limitations in the same journey." />
      <div className="grid gap-4 md:grid-cols-3">
        <ModelCard icon={<Cpu className="h-6 w-6" />} title="EfficientNet-B0 Backbone" text="Extracts spatial features from sampled face crops in each uploaded video." />
        <ModelCard icon={<Brain className="h-6 w-6" />} title="Temporal Reasoning" text="Aggregates frame evidence so one noisy moment does not dominate the user experience." />
        <ModelCard icon={<Eye className="h-6 w-6" />} title="Grad-CAM Explainability" text="Renders heatmap evidence to show suspicious regions around face boundaries." />
        <ModelCard icon={<Layers className="h-6 w-6" />} title="Segment Timeline" text="Groups frame evidence into time windows to make review easier for normal users." />
        <ModelCard icon={<Zap className="h-6 w-6" />} title="Quality Warnings" text="Flags no-face, low visibility, few valid frames, and heavy compression limitations." />
        <ModelCard icon={<Shield className="h-6 w-6" />} title="Human Review" text="The result is framed as verification support, not absolute legal or factual proof." />
      </div>
    </section>

    <ProcessTimeline />
    <ArchitectureFlowDiagram />
    <TechStackShowcase />
    <LimitationsAndEthics />

    <section className="py-12 text-center">
      <Link to="/verify-news" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-blue-500/20 transition hover:bg-blue-500">
        Try the verification flow
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  </AppShell>
);
