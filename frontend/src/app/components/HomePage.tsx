import { Link } from 'react-router-dom';
import { ArrowRight, FileVideo, Newspaper, ShieldCheck } from 'lucide-react';
import { AppShell } from './shared/ProductUI';
import {
  ArchitectureFlowDiagram,
  FeatureBentoGrid,
  HeroRealityScanner,
  LimitationsAndEthics,
  ProblemImpactCards,
  ProcessTimeline,
  TechStackShowcase,
  UseCaseTabs,
  GlassCard,
  SectionTitle,
} from './premium/RealityComponents';

export const HomePage = () => (
  <AppShell background="verification">
    <HeroRealityScanner />

    <section className="py-10">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: <FileVideo className="h-5 w-5" />, label: 'Video-first analysis', value: 'MP4 media pipeline' },
          { icon: <ShieldCheck className="h-5 w-5" />, label: 'Trust guidance', value: 'Confidence + warnings' },
          { icon: <Newspaper className="h-5 w-5" />, label: 'News verification', value: 'Source + claim context' },
        ].map(item => (
          <GlassCard key={item.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">{item.icon}</div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-black text-white">{item.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>

    <ProblemImpactCards />
    <FeatureBentoGrid />
    <ProcessTimeline />
    <UseCaseTabs />
    <ArchitectureFlowDiagram />
    <TechStackShowcase />
    <LimitationsAndEthics />

    <section className="py-12">
      <GlassCard className="overflow-hidden p-8 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <SectionTitle
              eyebrow="Start"
              title="Run a verification journey."
              text="Choose a normal video analysis or attach news/source context for public-media verification."
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/upload" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-500/20 transition hover:bg-blue-500">
              Analyse Video
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/verify-news" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-green-400/25 bg-green-500/10 px-6 py-3.5 font-bold text-green-100 transition hover:bg-green-500/15">
              Verify News
              <Newspaper className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  </AppShell>
);
