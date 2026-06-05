import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Eye, FileVideo, Newspaper, Trash2, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { AlertPanel, AppShell, EmptyState, IconTile, LoadingState, PageHeader, SectionPanel } from './shared/ProductUI';

const getTimeRemaining = (deleteAfter: string) => {
  const remaining = new Date(deleteAfter).getTime() - Date.now();
  if (remaining < 0) return 'Expired';
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
};

export const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { loadHistory(); }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await apiService.getVideoList();
      if (res.success) setHistory(res.data || []);
      else toast.error('Failed to load history');
    } catch (e: any) {
      toast.error(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteVideo(id);
      await loadHistory();
      toast.success('Video deleted');
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const isFake = (item: any) => item.result?.verdict === 'fake';
  const getDeleteAfter = (uploadedAt: string) => new Date(new Date(uploadedAt).getTime() + 12 * 3600 * 1000).toISOString();

  return (
    <AppShell maxWidth="max-w-5xl">
      <PageHeader
        title="Analysis History"
        description="Your recent deepfake and news-video verification results."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/verify-news" className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200">
              <Newspaper className="h-4 w-4" />
              Verify News
            </Link>
            <Link to="/upload" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500">
              <Upload className="h-4 w-4" />
              New Analysis
            </Link>
          </div>
        }
      />

      {loading ? (
        <LoadingState label="Loading analysis history..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Analyse a video or verify a news clip to see results here."
          action={
            <Link to="/verify-news" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
              <Newspaper className="h-4 w-4" />
              Verify Your First Clip
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const fake = isFake(item);
            return (
              <SectionPanel key={item._id} className="flex flex-col gap-4 transition hover:border-slate-600/80 sm:flex-row sm:items-center">
                <IconTile tone={item.result ? fake ? 'red' : 'green' : 'slate'}>
                  <FileVideo className="h-5 w-5" />
                </IconTile>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">{item.originalName || item.filename || 'Unknown file'}</p>
                    {item.verificationMode === 'news-video' && (
                      <span className="rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-200">News</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{new Date(item.uploadedAt || Date.now()).toLocaleDateString()}</span>
                    <span>{item.frameCount || 0} frames</span>
                    {item.duration && <span>{item.duration.toFixed(1)}s</span>}
                    <span>{item.result ? `${Math.round((item.result.confidence || 0) * 100)}% conf.` : item.status}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(getDeleteAfter(item.uploadedAt || new Date().toISOString()))}
                    </span>
                  </div>
                  {item.claim && <p className="mt-2 line-clamp-1 text-xs text-slate-500">{item.claim}</p>}
                </div>

                <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${item.result
                  ? fake
                    ? 'border-red-500/20 bg-red-500/15 text-red-300'
                    : 'border-green-500/20 bg-green-500/15 text-green-300'
                  : 'border-slate-600/60 bg-slate-700/60 text-slate-300'
                  }`}>
                  {item.result
                    ? fake
                      ? <><XCircle className="h-3.5 w-3.5" /> Deepfake</>
                      : <><CheckCircle className="h-3.5 w-3.5" /> Authentic</>
                    : item.status}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {item.result ? (
                    <Link to={`/results/${item._id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:text-blue-300">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-500">Pending</span>
                  )}
                  <button onClick={() => handleDelete(item._id)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </SectionPanel>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <AlertPanel icon={<AlertTriangle className="h-4 w-4" />} className="mt-6">
          Videos are automatically deleted after 12 hours to protect your privacy.
        </AlertPanel>
      )}
    </AppShell>
  );
};
