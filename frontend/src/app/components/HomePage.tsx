import { Link } from 'react-router-dom';
import { Upload, Shield, Eye, TrendingUp, Activity, Cpu, ChevronRight, AlertTriangle, Play, Newspaper } from 'lucide-react';
import { AlertPanel, AppShell, Eyebrow, IconTile, PageHeader, SectionPanel } from './shared/ProductUI';

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <SectionPanel className="group transition hover:-translate-y-1 hover:border-blue-500/50">
    <IconTile>{icon}</IconTile>
    <h3 className="mt-4 font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
  </SectionPanel>
);

const Step = ({ n, title, desc }: { n: number; title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30">{n}</div>
      {n < 3 && <div className="mt-2 w-px flex-1 bg-gradient-to-b from-blue-500/50 to-transparent" />}
    </div>
    <div className="pb-7">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  </div>
);

export const HomePage = () => (
  <AppShell>
    <section className="py-16 text-center">
      <PageHeader
        align="center"
        eyebrow={<Eyebrow icon={<div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />}>AI-powered video verification</Eyebrow>}
        title="Is this video real, fake, or uncertain?"
        description="Upload an MP4 or verify a news clip. ProofOfReality checks visible faces for manipulation signs and explains the result in plain language."
      />

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Link to="/upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-400">
          <Upload className="h-5 w-5" />
          Analyse a Video
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link to="/verify-news" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-8 py-3.5 font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white">
          <Newspaper className="h-4 w-4" />
          Verify News Video
        </Link>
        <Link to="/about" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-8 py-3.5 font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white">
          <Play className="h-4 w-4" />
          How it works
        </Link>
      </div>
    </section>

    <section className="pb-16">
      <PageHeader
        align="center"
        title="What the product does"
        description="The app combines model evidence, quality warnings, and human-readable guidance so normal users can make safer sharing decisions."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Feature icon={<Cpu className="h-6 w-6 text-blue-400" />} title="Model Analysis" desc="EfficientNet-B0 extracts spatial features from sampled face crops." />
        <Feature icon={<Eye className="h-6 w-6 text-purple-400" />} title="Heatmap Evidence" desc="Grad-CAM overlays show which facial regions influenced the result." />
        <Feature icon={<TrendingUp className="h-6 w-6 text-green-400" />} title="Confidence Calibration" desc="Results are labelled high, medium, low, or uncertain." />
        <Feature icon={<Shield className="h-6 w-6 text-orange-400" />} title="News Verification" desc="Source links and claims are attached to the analysis report." />
      </div>
    </section>

    <section className="mx-auto max-w-4xl pb-16">
      <SectionPanel className="p-8 md:p-10">
        <PageHeader
          align="center"
          title="Three-step process"
          description="From upload to detailed report in under a minute for normal-length clips."
        />
        <div className="mx-auto max-w-md">
          <Step n={1} title="Upload or verify a clip" desc="Use standard video analysis or paste a news/social link with the claim being made." />
          <Step n={2} title="AI analyses visible faces" desc="The backend samples frames, detects faces, runs the model, and generates Grad-CAM evidence." />
          <Step n={3} title="Review practical guidance" desc="See verdict, confidence, warnings, suspicious frames, and a PDF report." />
        </div>
        <div className="mt-3 text-center">
          <Link to="/verify-news" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            <Activity className="h-4 w-4" />
            Start verification
          </Link>
        </div>
      </SectionPanel>
    </section>

    <div className="mx-auto max-w-4xl pb-10">
      <AlertPanel icon={<AlertTriangle className="h-4 w-4" />}>
        AI detection is indicative. Use it as decision support, not sole legal or factual proof. Videos are auto-deleted after 12 hours.
      </AlertPanel>
    </div>
  </AppShell>
);
