import { Navbar } from '../Navbar';
import { CheckCircle, FileVideo, Upload, XCircle } from 'lucide-react';

type BackgroundVariant = 'verification' | 'scan' | 'hash' | 'heatmap' | 'identity';

const FloatingMediaCard = ({
  className,
  status,
  suspicious,
}: {
  className: string;
  status: string;
  suspicious?: boolean;
}) => (
  <div className={`absolute hidden rounded-xl border bg-white/[0.045] backdrop-blur-md shadow-2xl shadow-black/20 md:block ${className}`}>
    <div className="p-3 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <span>{suspicious ? 'Deepfake Check' : 'Media Scan'}</span>
        {suspicious ? <XCircle className="h-3.5 w-3.5 text-red-300" /> : <CheckCircle className="h-3.5 w-3.5 text-green-300" />}
      </div>
      <div className={`mt-3 h-2 rounded ${suspicious ? 'w-28 bg-red-400/40' : 'w-24 bg-blue-400/40'}`} />
      <div className="mt-2 h-2 w-32 rounded bg-slate-500/30" />
      <span className={`mt-4 inline-flex rounded-full px-2 py-1 ${suspicious ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
        {status}
      </span>
    </div>
  </div>
);

export const DynamicBackground = ({ variant = 'verification' }: { variant?: BackgroundVariant }) => (
  <div className="absolute inset-0 overflow-hidden bg-[#070B14]">
    <div className={`absolute inset-0 ${variant === 'scan' ? 'scan-field' : variant === 'hash' || variant === 'identity' ? 'hash-pattern' : 'verification-grid'}`} />

    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.16),transparent_46%),linear-gradient(180deg,rgba(7,11,20,0)_0%,rgba(7,11,20,0.74)_84%)]" />

    {variant === 'verification' && (
      <>
        <FloatingMediaCard
          className="left-10 top-24 h-28 w-44 border-blue-400/20 animate-verification-float"
          status="Verified"
        />
        <FloatingMediaCard
          className="right-12 bottom-24 h-28 w-44 border-red-400/20 animate-verification-float-delayed"
          status="Suspicious"
          suspicious
        />
        <div className="absolute left-[18%] top-[58%] hidden h-px w-64 rotate-12 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent md:block" />
        <div className="absolute right-[22%] top-[28%] hidden h-px w-52 -rotate-12 bg-gradient-to-r from-transparent via-green-400/30 to-transparent md:block" />
      </>
    )}

    {variant === 'scan' && (
      <>
        <div className="scan-line absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-transparent via-green-400/18 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/15 animate-ring-pulse" />
        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-400/15 animate-ring-pulse" />
      </>
    )}

    {variant === 'heatmap' && (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(239,68,68,0.18),transparent_24%),radial-gradient(circle_at_68%_42%,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_52%_70%,rgba(34,197,94,0.12),transparent_22%)]" />
        <div className="absolute left-1/2 top-32 h-40 w-40 -translate-x-1/2 rounded-full border border-blue-300/10 animate-ring-pulse" />
      </>
    )}

    {variant === 'hash' && (
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.12),transparent_32%,rgba(34,197,94,0.08)_64%,transparent)]" />
    )}

    {variant === 'identity' && (
      <>
        <div className="absolute left-[18%] top-[18%] h-80 w-80 rounded-full border border-blue-400/10" />
        <div className="absolute left-[18%] top-[18%] h-56 w-56 rounded-full border border-green-400/10 animate-ring-pulse" />
        <div className="absolute right-[12%] bottom-[16%] h-48 w-48 rounded-full border border-blue-300/10 animate-ring-pulse" />
        <div className="scan-line absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent" />
      </>
    )}
  </div>
);

export const AppShell = ({
  children,
  maxWidth = 'max-w-6xl',
  background = 'hash',
}: {
  children: React.ReactNode;
  maxWidth?: string;
  background?: BackgroundVariant;
}) => (
  <div className="relative min-h-screen overflow-hidden bg-[#070B14] text-white">
    <DynamicBackground variant={background} />
    <div className="relative z-10">
    <Navbar />
    <main className={`${maxWidth} mx-auto px-4 py-10`}>
      {children}
    </main>
    </div>
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
}) => (
  <div className={`mb-8 ${align === 'center' ? 'text-center' : 'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'}`}>
    <div className={align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl'}>
      {eyebrow && <div className="mb-3">{eyebrow}</div>}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-400">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const Eyebrow = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
    {icon}
    {children}
  </span>
);

export const SectionPanel = ({
  children,
  className = '',
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) => (
  <section className={`rounded-2xl border border-slate-700/60 bg-slate-800/60 ${padded ? 'p-5 md:p-6' : ''} ${className}`}>
    {children}
  </section>
);

export const IconTile = ({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'blue' | 'green' | 'red' | 'amber' | 'purple' }) => {
  const tones = {
    slate: 'bg-slate-700/70 text-slate-300',
    blue: 'bg-blue-500/15 text-blue-300',
    green: 'bg-green-500/15 text-green-300',
    red: 'bg-red-500/15 text-red-300',
    amber: 'bg-amber-500/15 text-amber-300',
    purple: 'bg-purple-500/15 text-purple-300',
  };

  return <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{children}</div>;
};

export const StatCard = ({
  icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'slate';
}) => (
  <SectionPanel className="flex items-center gap-4">
    <IconTile tone={tone}>{icon}</IconTile>
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-white">{value}</p>
    </div>
  </SectionPanel>
);

export const AlertPanel = ({
  icon,
  children,
  tone = 'amber',
  className = '',
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'amber' | 'red' | 'green' | 'blue' | 'slate';
  className?: string;
}) => {
  const tones = {
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    red: 'border-red-500/25 bg-red-500/10 text-red-100',
    green: 'border-green-500/20 bg-green-500/10 text-green-100',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
    slate: 'border-slate-700/60 bg-slate-900/40 text-slate-300',
  };

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${tones[tone]} ${className}`}>
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div>{children}</div>
    </div>
  );
};

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="h-9 w-9 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
    <p className="mt-4 text-sm text-slate-400">{label}</p>
  </div>
);

export const EmptyState = ({
  icon = <FileVideo className="h-8 w-8 text-slate-400" />,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <SectionPanel className="py-14 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700/60">{icon}</div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate-400">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </SectionPanel>
);

export const PrimaryButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryLink = ({
  children,
  className = '',
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white ${className}`}
    {...props}
  >
    {children}
  </a>
);

export const AnalysisProgress = ({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) => (
  <SectionPanel>
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-white">Live status</p>
      <span className="text-xs text-slate-500">{progress}%</span>
    </div>
    <p className="mb-4 text-sm text-slate-300">{label}</p>
    <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  </SectionPanel>
);

export const DropzoneUpload = ({
  selected,
  helper,
  error,
  dragging,
  disabled,
  onClick,
  onDrop,
  onDragState,
  children,
}: {
  selected?: boolean;
  helper: string;
  error?: string;
  dragging?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragState: (dragging: boolean) => void;
  children: React.ReactNode;
}) => (
  <div
    onDragEnter={(event) => { event.preventDefault(); onDragState(true); }}
    onDragOver={(event) => { event.preventDefault(); onDragState(true); }}
    onDragLeave={(event) => { event.preventDefault(); onDragState(false); }}
    onDrop={onDrop}
    onClick={onClick}
    className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging
      ? 'border-blue-400 bg-blue-500/10'
      : selected
        ? 'border-green-500/40 bg-green-500/5'
        : 'border-slate-600 bg-slate-800/30 hover:border-blue-500/60'
      } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
  >
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-700/70">
      <Upload className="h-7 w-7 text-slate-300" />
    </div>
    {children}
    <p className="mt-1 text-sm text-slate-500">{helper}</p>
    {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
  </div>
);
