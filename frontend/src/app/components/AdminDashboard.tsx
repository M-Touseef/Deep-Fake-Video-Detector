import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Users, FileVideo, Activity, TrendingUp, Trash2, Eye } from 'lucide-react';
import { useAuth } from './AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';
import { apiService } from '../services/api';

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <div className={`bg-slate-800/50 border rounded-2xl p-6 flex items-center gap-4 ${color}`}>
    <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-3xl font-extrabold text-white">{value}</p>
    </div>
  </div>
);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users className="h-6 w-6 text-blue-400" />} label="Users" value={stats.activeUsers} color="border-blue-500/20" />
              <StatCard icon={<FileVideo className="h-6 w-6 text-green-400" />} label="Total Uploads" value={stats.totalVideos} color="border-green-500/20" />
              <StatCard icon={<Activity className="h-6 w-6 text-red-400" />} label="Deepfakes Found" value={stats.deepfakeDetected} color="border-red-500/20" />
              <StatCard icon={<TrendingUp className="h-6 w-6 text-purple-400" />} label="Detection Rate" value={`${stats.detectionRate.toFixed(0)}%`} color="border-purple-500/20" />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5 text-sm">Detection Breakdown</h2>
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
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5 text-sm">Recent Videos</h2>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {videos.length === 0 ? (
                    <p className="text-slate-400 text-center py-12 text-sm">No videos uploaded yet</p>
                  ) : videos.slice(0, 8).map(video => (
                    <div key={video._id} className="flex items-center gap-3 bg-slate-900/40 rounded-xl px-4 py-3">
                      <FileVideo className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{video.originalName || video.filename}</p>
                        <p className="text-slate-500 text-xs">{video.status}</p>
                      </div>
                      {video.result?.verdict && (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${video.result.verdict === 'fake' ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>
                          {video.result.verdict}
                        </span>
                      )}
                      {video.result && (
                        <Link to={`/results/${video._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-blue-500/10">
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
              <h2 className="text-white font-semibold mb-5 text-sm">User Management</h2>
              {users.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-sm">No users registered yet</p>
              ) : (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center gap-4 bg-slate-900/40 rounded-xl px-4 py-3 hover:bg-slate-900/60 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-700/60 text-slate-300 border border-slate-600/60'
                        }`}>{u.role}</span>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Model', val: 'EfficientNet-B0 + Transformer' },
                { label: 'Inference time', val: '~10-60s per video' },
                { label: 'System status', val: 'Operational', green: true },
              ].map(({ label, val, green }) => (
                <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 text-center">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-sm font-semibold ${green ? 'text-green-400' : 'text-white'}`}>{val}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
