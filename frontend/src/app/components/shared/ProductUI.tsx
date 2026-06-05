import { Navbar } from '../Navbar';
import { FileVideo, Upload } from 'lucide-react';

export const AppShell = ({ children, maxWidth = 'max-w-6xl' }: { children: React.ReactNode; maxWidth?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute w-[560px] h-[560px] bg-blue-700/10 rounded-full blur-3xl -top-44 left-1/4" />
      <div className="absolute w-[380px] h-[380px] bg-cyan-500/8 rounded-full blur-3xl bottom-0 right-0" />
    </div>
    <Navbar />
    <main className={`${maxWidth} mx-auto px-4 py-10`}>
      {children}
    </main>
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
