import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  FileVideo, Eye, Trash2, CheckCircle, XCircle,
  Clock, Upload, AlertTriangle
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { apiService } from '../services/api';

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
    } catch (e: any) { toast.error(e.message || 'Delete failed'); }
  };

  const isFake = (item: any) => item.result?.verdict === 'fake';
  const getDeleteAfter = (uploadedAt: string) => new Date(new Date(uploadedAt).getTime() + 12 * 3600 * 1000).toISOString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-3xl -top-40 left-1/3" />
      </div>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Analysis History</h1>
            <p className="text-slate-400 text-sm">Your previously analysed videos</p>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20">
            <Upload className="h-4 w-4" /> New Analysis
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-slate-700/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileVideo className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No history yet</h3>
            <p className="text-slate-400 text-sm mb-6">Analyse a video to see it here</p>
            <Link to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors">
              <Upload className="h-4 w-4" /> Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-600/70 transition-all group">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isFake(item) ? 'bg-red-500/15' : 'bg-green-500/15'}`}>
                  <FileVideo className={`h-5 w-5 ${isFake(item) ? 'text-red-400' : 'text-green-400'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {item.originalName || item.filename || 'Unknown file'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{new Date(item.uploadedAt || Date.now()).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{item.frameCount || 0} frames</span>
                    <span>·</span>
                    <span>{item.result ? `${Math.round((item.result.confidence || 0) * 100)}% conf.` : item.status}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(getDeleteAfter(item.uploadedAt || new Date().toISOString()))}
                    </span>
                  </div>
                </div>

                {/* Verdict badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${item.result
                    ? isFake(item)
                      ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                      : 'bg-green-500/15 text-green-300 border border-green-500/20'
                    : 'bg-slate-700/60 text-slate-300 border border-slate-600/60'
                  }`}>
                  {item.result
                    ? isFake(item)
                      ? <><XCircle className="h-3.5 w-3.5" /> Deepfake</>
                      : <><CheckCircle className="h-3.5 w-3.5" /> Authentic</>
                    : <>{item.status}</>
                  }
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.result ? (
                    <Link to={`/results/${item._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-600 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-500">
                      Pending
                    </span>
                  )}
                  <button onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="flex items-start gap-2 mt-6 text-amber-300/70 text-xs bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Videos are automatically deleted after 12 hours to protect your privacy.
          </div>
        )}
      </div>
    </div>
  );
};
