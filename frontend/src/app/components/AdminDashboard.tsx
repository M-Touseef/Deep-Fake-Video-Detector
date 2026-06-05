import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, Eye, FileVideo, Trash2, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { AppShell, IconTile, LoadingState, PageHeader, SectionPanel, StatCard } from './shared/ProductUI';

const chartStyles = {
  grid: { strokeDasharray: '3 3', stroke: '#1e293b' },
  axis: { fill: '#64748b', fontSize: 12 },
  tooltip: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' },
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalVideos: 0,
    deepfakeDetected: 0,
    authenticDetected: 0,
    processingVideos: 0,
    failedVideos: 0,
    detectionRate: 0,
  });

  useEffect(() => { if (user?.role === 'admin') loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, videosRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminUsers(),
        apiService.getAdminVideos(),
      ]);

      const overview = statsRes.data.overview;
      const results = statsRes.data.results;
      setStats({
        activeUsers: overview.activeUsers || 0,
        totalVideos: overview.totalVideos || 0,
        deepfakeDetected: results.fakeVideos || 0,
        authenticDetected: results.realVideos || 0,
        processingVideos: overview.processingVideos || 0,
        failedVideos: overview.failedVideos || 0,
        detectionRate: Number(results.detectionRate || 0),
      });
      setUsers(usersRes.data || []);
      setVideos(videosRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user and all their videos?')) return;
    try {
      await apiService.deleteAdminUser(id);
      toast.success('User deleted');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'User delete failed');
    }
  };

  if (user?.role !== 'admin') return <Navigate to="/home" />;

  const detectionData = [
    { name: 'Deepfake', value: stats.deepfakeDetected, fill: '#ef4444' },
    { name: 'Authentic', value: stats.authenticDetected, fill: '#22c55e' },
    { name: 'Processing', value: stats.processingVideos, fill: '#3b82f6' },
    { name: 'Failed', value: stats.failedVideos, fill: '#f97316' },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow={<p className="text-xs uppercase tracking-widest text-slate-400">Admin</p>}
        title="Dashboard"
        description="System overview, recent uploads, and user management."
      />

      {loading ? (
        <LoadingState label="Loading admin dashboard..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard icon={<Users className="h-6 w-6" />} label="Users" value={stats.activeUsers} tone="blue" />
            <StatCard icon={<FileVideo className="h-6 w-6" />} label="Total Uploads" value={stats.totalVideos} tone="green" />
            <StatCard icon={<Activity className="h-6 w-6" />} label="Deepfakes Found" value={stats.deepfakeDetected} tone="red" />
            <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Detection Rate" value={`${stats.detectionRate.toFixed(0)}%`} tone="purple" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <SectionPanel>
              <h2 className="mb-5 text-sm font-semibold text-white">Detection Breakdown</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={detectionData} barSize={44}>
                  <CartesianGrid {...chartStyles.grid} />
                  <XAxis dataKey="name" tick={chartStyles.axis} />
                  <YAxis tick={chartStyles.axis} allowDecimals={false} />
                  <Tooltip contentStyle={chartStyles.tooltip} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {detectionData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionPanel>

            <SectionPanel>
              <h2 className="mb-5 text-sm font-semibold text-white">Recent Videos</h2>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {videos.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-400">No videos uploaded yet</p>
                ) : videos.slice(0, 8).map(video => (
                  <div key={video._id} className="flex items-center gap-3 rounded-xl bg-slate-900/40 px-4 py-3">
                    <FileVideo className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{video.originalName || video.filename}</p>
                      <p className="text-xs text-slate-500">{video.status}</p>
                    </div>
                    {video.result?.verdict && (
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${video.result.verdict === 'fake' ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>
                        {video.result.verdict}
                      </span>
                    )}
                    {video.result && (
                      <Link to={`/results/${video._id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-500/10 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>

          <SectionPanel className="mb-8">
            <h2 className="mb-5 text-sm font-semibold text-white">User Management</h2>
            {users.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No users registered yet</p>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-4 rounded-xl bg-slate-900/40 px-4 py-3 transition hover:bg-slate-900/60">
                    <IconTile>{u.name?.[0]?.toUpperCase() || '?'}</IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${u.role === 'admin'
                      ? 'border-purple-500/30 bg-purple-500/20 text-purple-300'
                      : 'border-slate-600/60 bg-slate-700/60 text-slate-300'
                      }`}>{u.role}</span>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user.id}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Model', val: 'EfficientNet-B0 + Transformer' },
              { label: 'Inference time', val: '~10-60s per video' },
              { label: 'System status', val: 'Operational', green: true },
            ].map(({ label, val, green }) => (
              <SectionPanel key={label} className="text-center">
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className={`text-sm font-semibold ${green ? 'text-green-400' : 'text-white'}`}>{val}</p>
              </SectionPanel>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
};
