import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  FileVideo,
  Flame,
  Globe,
  GraduationCap,
  Layers,
  Lock,
  Menu,
  Newspaper,
  Play,
  Search,
  Server,
  Shield,
  Sparkles,
  Upload,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { DynamicBackground } from '../shared/ProductUI';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const DynamicGridBackground = ({ variant = 'verification' }: { variant?: 'verification' | 'scan' | 'hash' | 'heatmap' | 'identity' }) => (
  <DynamicBackground variant={variant} />
);

export const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={cx(
    'rounded-3xl border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20 backdrop-blur-xl',
    'transition duration-300 hover:border-blue-400/30 hover:bg-white/[0.075]',
    className,
  )}>
    {children}
  </div>
);

export const AnimatedNavbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin
    ? [{ to: '/admin', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> }]
    : [
      { to: '/home', label: 'Home', icon: <Shield className="h-4 w-4" /> },
      { to: '/upload', label: 'Detect', icon: <Search className="h-4 w-4" /> },
      { to: '/verify-news', label: 'Verify News', icon: <Newspaper className="h-4 w-4" /> },
      { to: '/history', label: 'History', icon: <BarChart3 className="h-4 w-4" /> },
      { to: '/about', label: 'Architecture', icon: <Layers className="h-4 w-4" /> },
    ];

  const active = (to: string) => location.pathname === to || (to === '/history' && location.pathname.startsWith('/results'));
  const ctaTarget = isAdmin ? '/admin' : '/verify-news';
  const ctaLabel = isAdmin ? 'Dashboard' : 'Try Detection';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B14]/82 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to={isAdmin ? '/admin' : '/home'} className="group flex min-w-0 shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 shadow-lg shadow-blue-500/20">
            <Shield className="h-5 w-5 text-blue-200" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-[#070B14] bg-green-400" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-extrabold tracking-wide text-white sm:text-base">Proof of Reality</p>
            <p className="hidden text-[10px] uppercase tracking-[0.24em] text-blue-300/80 sm:block">Media Verification</p>
          </div>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.045] p-1 shadow-lg shadow-black/10">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cx(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition xl:px-4',
                active(item.to)
                  ? 'border border-blue-400/30 bg-blue-500/15 text-blue-100'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          </div>
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          <div className="hidden text-right xl:block">
            <p className="max-w-[130px] truncate text-xs font-semibold text-white">{user?.name}</p>
            <p className="text-[11px] capitalize text-slate-500">{user?.role}</p>
          </div>
          <Link to={ctaTarget} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-500">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={logout} className="hidden rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 lg:inline-flex">
            Logout
          </button>
        </div>

        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          className="ml-auto rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:border-blue-400/30 hover:text-white lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#070B14]/96 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm font-bold text-white">{user?.name || 'User'}</p>
              <p className="mt-1 text-xs text-slate-500">{user?.email || user?.role}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cx(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  active(item.to)
                    ? 'border-blue-400/30 bg-blue-500/15 text-blue-100'
                    : 'border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/6',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to={ctaTarget} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={logout} className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              Logout
            </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const HeroRealityScanner = () => (
  <section className="relative overflow-hidden py-16 md:py-24">
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100">
          <Sparkles className="h-4 w-4 text-green-300" />
          Can you trust what you see?
        </div>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
          Investigate media before it becomes misinformation.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Proof of Reality guides users through upload, frame analysis, suspicious-region heatmaps, confidence calibration, and a downloadable forensic report.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/upload" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-500">
            Try Detection
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/verify-news" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-200 transition hover:border-green-400/30 hover:bg-green-500/10">
            Verify News Clip
            <Newspaper className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <GlassCard className="relative min-h-[420px] overflow-hidden p-5">
        <div className="absolute inset-4 rounded-3xl border border-blue-400/20" />
        <div className="absolute left-4 right-4 top-20 h-20 bg-gradient-to-b from-transparent via-green-400/20 to-transparent scan-line" />
        <div className="relative rounded-3xl border border-white/10 bg-[#0B1120]/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live Scan</p>
              <p className="mt-1 text-lg font-bold text-white">public_figure_clip.mp4</p>
            </div>
            <span className="rounded-full border border-green-400/25 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300">Trust 82%</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_38%,rgba(148,163,184,0.35),transparent_15%),radial-gradient(circle_at_50%_52%,rgba(59,130,246,0.18),transparent_28%)]" />
              <div className="absolute left-1/2 top-[44%] h-28 w-24 -translate-x-1/2 rounded-[45%] border border-slate-300/30 bg-slate-300/10" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">Original frame</div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-red-400/20 bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_58%,rgba(239,68,68,0.5),transparent_18%),radial-gradient(circle_at_58%_36%,rgba(59,130,246,0.28),transparent_22%)]" />
              <div className="absolute left-1/2 top-[44%] h-28 w-24 -translate-x-1/2 rounded-[45%] border border-red-300/40 bg-red-500/10" />
              <div className="absolute bottom-4 left-4 rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-200">Heatmap overlay</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Frames', '16'],
              ['Suspicious', '3'],
              ['Report', 'Ready'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  </section>
);

export const ProblemImpactCards = () => {
  const items = [
    { icon: <Globe className="h-5 w-5" />, title: 'Viral misinformation', text: 'A manipulated clip can move faster than corrections and shape public opinion.' },
    { icon: <Newspaper className="h-5 w-5" />, title: 'News uncertainty', text: 'Viewers need a quick way to decide whether a clip deserves more scrutiny.' },
    { icon: <Users className="h-5 w-5" />, title: 'Common users at risk', text: 'The interface explains confidence and limitations without requiring ML knowledge.' },
  ];

  return (
    <section className="py-12">
      <SectionTitle eyebrow="The problem" title="Fake media is not just a technical issue." text="The product frames detection as a responsible verification journey, not a one-click magic answer." />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(item => (
          <GlassCard key={item.title} className="p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">{item.icon}</div>
            <h3 className="text-lg font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

export const FeatureBentoGrid = () => {
  const items = [
    { icon: <Shield />, title: 'Deepfake detection', text: 'Classifies likely real or manipulated video using visible face evidence.', span: 'md:col-span-2' },
    { icon: <Layers />, title: 'Frame-level analysis', text: 'Samples frames and identifies the most suspicious moments.' },
    { icon: <Eye />, title: 'Explainable AI', text: 'Grad-CAM highlights the facial regions that influenced the model.' },
    { icon: <FileText />, title: 'Report generation', text: 'Exports a forensic-style PDF with verdict, warnings, metadata, and evidence.' },
    { icon: <Search />, title: 'News verification', text: 'Adds source link, claim context, and share guidance for public media.' },
  ];

  return (
    <section className="py-12">
      <SectionTitle eyebrow="Capabilities" title="Built as a media verification product." text="Each feature explains what happened, why it happened, and what the user should do next." />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(item => (
          <GlassCard key={item.title} className={cx('p-6', item.span)}>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">{item.text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

export const ProcessTimeline = () => {
  const steps = [
    ['Upload', <Upload className="h-4 w-4" />],
    ['Frame Extraction', <FileVideo className="h-4 w-4" />],
    ['Face Detection', <Eye className="h-4 w-4" />],
    ['AI Analysis', <Brain className="h-4 w-4" />],
    ['Grad-CAM', <Flame className="h-4 w-4" />],
    ['Final Report', <FileText className="h-4 w-4" />],
  ];

  return (
    <section className="py-12">
      <SectionTitle eyebrow="Workflow" title="A transparent investigation pipeline." text="The user can follow the journey from raw media to final report." />
      <GlassCard className="p-6">
        <div className="grid gap-4 md:grid-cols-6">
          {steps.map(([label, icon], index) => (
            <div key={String(label)} className="relative rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200">{icon}</div>
              <p className="text-xs text-slate-500">Step {index + 1}</p>
              <p className="mt-1 text-sm font-bold text-white">{label}</p>
              {index < steps.length - 1 && <div className="absolute right-[-18px] top-1/2 hidden h-px w-8 bg-blue-400/25 md:block" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
};

export const ArchitectureFlowDiagram = () => {
  const nodes = [
    ['Frontend', <Globe className="h-5 w-5" />, 'React + Tailwind interface'],
    ['Backend API', <Server className="h-5 w-5" />, 'Auth, jobs, uploads, reports'],
    ['MongoDB', <Database className="h-5 w-5" />, 'Videos, jobs, users, results'],
    ['ML API', <Cpu className="h-5 w-5" />, 'Flask inference service'],
    ['Model + XAI', <Brain className="h-5 w-5" />, 'Detector and Grad-CAM'],
    ['PDF Report', <FileText className="h-5 w-5" />, 'Evidence export'],
  ];

  return (
    <section className="py-12">
      <SectionTitle eyebrow="System design" title="Separated like a real AI product." text="The ML service, backend API, database, and frontend have clear responsibilities." />
      <GlassCard className="p-6">
        <div className="grid gap-4 md:grid-cols-6">
          {nodes.map(([title, icon, text], index) => (
            <div key={String(title)} className="relative rounded-2xl border border-white/10 bg-[#0B1120]/70 p-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/12 text-green-200">{icon}</div>
              <p className="font-bold text-white">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
              {index < nodes.length - 1 && <div className="absolute right-[-18px] top-1/2 hidden h-px w-8 bg-green-400/25 md:block" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
};

export const UseCaseTabs = () => {
  const cases = [
    { key: 'journalists', icon: <Newspaper />, title: 'Journalists', text: 'Attach source and claim context, then export a report for editorial review.' },
    { key: 'public', icon: <Users />, title: 'Public users', text: 'Understand whether a viral clip is suspicious before sharing it.' },
    { key: 'students', icon: <GraduationCap />, title: 'Students', text: 'Learn how deepfake detection, XAI, and responsible AI fit together.' },
    { key: 'orgs', icon: <Lock />, title: 'Organizations', text: 'Review suspicious media with access control, admin visibility, and retention cleanup.' },
  ];
  const [active, setActive] = useState(cases[0]);

  return (
    <section className="py-12">
      <SectionTitle eyebrow="Use cases" title="Designed for real verification moments." text="The same model output is translated for different audiences." />
      <GlassCard className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          {cases.map(item => (
            <button
              key={item.key}
              onClick={() => setActive(item)}
              className={cx(
                'rounded-2xl border px-4 py-3 text-left transition',
                active.key === item.key ? 'border-blue-400/35 bg-blue-500/15 text-white' : 'border-white/10 bg-white/[0.025] text-slate-400 hover:text-white',
              )}
            >
              <div className="mb-2 h-5 w-5">{item.icon}</div>
              <p className="font-bold">{item.title}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B1120]/70 p-6">
          <p className="text-2xl font-bold text-white">{active.title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{active.text}</p>
        </div>
      </GlassCard>
    </section>
  );
};

export const TechStackShowcase = () => {
  const groups = [
    ['Frontend', 'React, Vite, Tailwind, responsive UI'],
    ['Backend', 'Node.js, Express, MongoDB, auth, jobs'],
    ['AI Model', 'PyTorch, EfficientNet-B0, face extraction'],
    ['Verification', 'Grad-CAM, PDF reports, quality warnings'],
  ];

  return (
    <section className="py-12">
      <SectionTitle eyebrow="Tech stack" title="Built with deployable system layers." text="The stack is organized around product, platform, model, and verification." />
      <div className="grid gap-4 md:grid-cols-4">
        {groups.map(([title, text]) => (
          <GlassCard key={title} className="p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-blue-300/70">{title}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

export const LimitationsAndEthics = () => (
  <section className="py-12">
    <GlassCard className="border-amber-400/20 bg-amber-500/[0.055] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-black text-white">Limitations and ethics</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-100/80">
            AI detection assists verification; it is not absolute proof. Low quality, compression, missing faces, and unusual media sources can reduce reliability. The system explains limitations, supports human review, and avoids claiming factual truth from video analysis alone.
          </p>
        </div>
      </div>
    </GlassCard>
  </section>
);

export const MediaUploadDropzone = ({
  title,
  helper,
  error,
  selected,
  dragging,
  disabled,
  onClick,
  onDrop,
  onDragState,
}: {
  title: string;
  helper: string;
  error?: string;
  selected?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragState: (dragging: boolean) => void;
}) => (
  <div
    onDragEnter={(event) => { event.preventDefault(); onDragState(true); }}
    onDragOver={(event) => { event.preventDefault(); onDragState(true); }}
    onDragLeave={(event) => { event.preventDefault(); onDragState(false); }}
    onDrop={onDrop}
    onClick={onClick}
    className={cx(
      'group rounded-3xl border-2 border-dashed p-9 text-center backdrop-blur-xl transition',
      dragging ? 'border-blue-300 bg-blue-500/12' : selected ? 'border-green-400/40 bg-green-500/8' : 'border-white/12 bg-white/[0.045] hover:border-blue-400/50',
      disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
    )}
  >
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/6 text-blue-200 transition group-hover:scale-105">
      {selected ? <CheckCircle className="h-8 w-8 text-green-300" /> : <Upload className="h-8 w-8" />}
    </div>
    <p className="text-lg font-black text-white">{title}</p>
    <p className="mt-2 text-sm text-slate-400">{helper}</p>
    {error && <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
  </div>
);

export const AnalysisProgressStepper = ({ progress, label }: { progress: number; label: string }) => {
  const phases = ['Upload', 'Frames', 'Faces', 'AI', 'Grad-CAM', 'Report'];
  const activeIndex = Math.min(phases.length - 1, Math.floor((progress / 100) * phases.length));

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold text-white">{label}</p>
        <span className="text-sm font-bold text-blue-200">{progress}%</span>
      </div>
      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {phases.map((phase, index) => (
          <div key={phase} className={cx('rounded-xl border px-3 py-2 text-center text-xs font-semibold', index <= activeIndex ? 'border-blue-400/30 bg-blue-500/12 text-blue-100' : 'border-white/10 bg-white/[0.025] text-slate-500')}>
            {phase}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export const ResultDashboard = ({
  verdict,
  confidence,
  label,
  warnings,
  onDownload,
}: {
  verdict: 'fake' | 'real';
  confidence: number;
  label?: string;
  warnings: string[];
  onDownload: () => void;
}) => {
  const fake = verdict === 'fake';
  const score = Math.round(confidence * 100);

  return (
    <GlassCard className={cx('p-6', fake ? 'border-red-400/20' : 'border-green-400/20')}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <div className={cx('absolute inset-3 rounded-full border-8', fake ? 'border-red-400/25' : 'border-green-400/25')} />
          <div className={cx('text-4xl font-black', fake ? 'text-red-300' : 'text-green-300')}>{score}%</div>
        </div>
        <div className="flex-1">
          <div className={cx('mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold', fake ? 'border-red-400/25 bg-red-500/10 text-red-200' : 'border-green-400/25 bg-green-500/10 text-green-200')}>
            {fake ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {fake ? 'Suspicious media detected' : 'Likely authentic'}
          </div>
          <h2 className="text-3xl font-black text-white">{fake ? 'Manipulation indicators found' : 'No strong manipulation signs'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Confidence label: {label || 'Not reported'}. {warnings.length ? `${warnings.length} limitation warning(s) should be reviewed.` : 'No major limitation warning was reported.'}
          </p>
        </div>
        <button onClick={onDownload} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-bold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-500">
          <Download className="h-4 w-4" />
          Report
        </button>
      </div>
    </GlassCard>
  );
};

export const HeatmapComparisonSlider = ({ original, heatmap, alt }: { original?: string; heatmap?: string; alt: string }) => {
  const [value, setValue] = useState(52);
  const fallback = original || heatmap;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        {fallback ? <img src={`data:image/jpeg;base64,${fallback}`} alt={alt} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-500">No frame</div>}
        {heatmap && (
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
            <img src={`data:image/jpeg;base64,${heatmap}`} alt={`${alt} heatmap`} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">Original</div>
        <div className="absolute bottom-3 right-3 rounded-full bg-red-500/70 px-3 py-1 text-xs text-white">Grad-CAM</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
};

export const SuspiciousFrameGallery = ({
  frames,
  active,
  onSelect,
}: {
  frames: Array<{ rank: number; timestamp: string; score: number; heatmapBase64?: string }>;
  active: number;
  onSelect: (index: number) => void;
}) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {frames.map((frame, index) => (
      <button
        key={`${frame.rank}-${frame.timestamp}`}
        onClick={() => onSelect(index)}
        className={cx('rounded-2xl border p-2 text-left transition', active === index ? 'border-blue-400/50 bg-blue-500/12' : 'border-white/10 bg-white/[0.035] hover:border-white/20')}
      >
        <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
          {frame.heatmapBase64 ? <img src={`data:image/jpeg;base64,${frame.heatmapBase64}`} alt={`Suspicious frame ${frame.rank}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">No image</div>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white">#{frame.rank} - {frame.timestamp}</span>
          <span className="rounded-full bg-red-500/15 px-2 py-1 text-xs font-bold text-red-200">{frame.score.toFixed(1)}%</span>
        </div>
      </button>
    ))}
  </div>
);

export const SectionTitle = ({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) => (
  <div className="mb-7">
    <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-300/75">{eyebrow}</p>
    <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h2>
    {text && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{text}</p>}
  </div>
);
