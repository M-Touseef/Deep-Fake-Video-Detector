import { useEffect, useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import FooterSection from '../components/sections/FooterSection'
import { adminMockStats, adminMockUsers, adminMockVideos } from '../data/adminMockData'
import apiService from '../services/apiService'
import { useAuth } from '../components/auth/AuthContext'
import { isAdminUser } from '../utils/auth'
import { getFriendlyError } from '../utils/errors'

const statLabels = [
  ['totalUsers', 'Total Users'],
  ['totalVideos', 'Uploaded Videos'],
  ['analysesToday', 'Analyses Today'],
  ['fakeDetections', 'Fake Detections'],
  ['reportsGenerated', 'PDF Reports'],
  ['storageUsed', 'Storage Used'],
]

function AdminStatCard({ label, value }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
      <p className="text-[11px] font-bold uppercase tracking-[.15em] text-slate-500">{label}</p>
      <strong className="mt-3 block text-[clamp(28px,4vw,44px)] font-semibold leading-none tracking-[-.045em] text-cyan-100">{value}</strong>
    </article>
  )
}

function StatusBadge({ value }) {
  const lower = String(value).toLowerCase()
  const style = lower.includes('fake')
    ? 'border-red-300/25 bg-red-400/10 text-red-100'
    : lower.includes('real') || lower.includes('completed')
      ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
      : 'border-amber-300/25 bg-amber-300/10 text-amber-100'

  return <span className={`w-fit rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[.1em] ${style}`}>{value}</span>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(adminMockStats)
  const [videos, setVideos] = useState(adminMockVideos)
  const [users, setUsers] = useState(adminMockUsers)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const isAdmin = isAdminUser(user)

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false)
      return
    }

    let isActive = true

    async function loadAdminData() {
      try {
        const [statsData, videosData, usersData] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getAdminVideos(),
          apiService.getAdminUsers(),
        ])

        if (!isActive) return
        setStats(statsData || adminMockStats)
        setVideos(Array.isArray(videosData) ? videosData : videosData?.videos || adminMockVideos)
        setUsers(Array.isArray(usersData) ? usersData : usersData?.users || adminMockUsers)
        setError('')
      } catch (error) {
        if (!isActive) return
        setStats(adminMockStats)
        setVideos(adminMockVideos)
        setUsers(adminMockUsers)
        setError(getFriendlyError(error, 'Failed to load admin data'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadAdminData()
    return () => {
      isActive = false
    }
  }, [isAdmin])

  async function deleteUser(userId) {
    if (userId === user?.id) {
      setError('You cannot delete your own admin account.')
      return
    }
    if (!window.confirm('Delete this user and all their videos?')) return

    const previousUsers = users
    setUsers((current) => current.filter((item) => item.id !== userId))
    try {
      await apiService.deleteAdminUser(userId)
    } catch (error) {
      setUsers(previousUsers)
      setError(getFriendlyError(error, 'User delete failed.'))
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
        <Header />
        <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(248,113,113,.12),transparent_30%),linear-gradient(180deg,#05090c,#071116_52%,#03080b)]" aria-hidden="true" />
          <section className="relative w-[min(680px,100%)] rounded-[30px] border border-red-300/20 bg-red-400/[.07] p-7 text-center shadow-[0_32px_90px_rgba(0,0,0,.42)]">
            <h1 className="text-[clamp(32px,5vw,52px)] font-semibold tracking-[-.045em]">Admin Access Required</h1>
            <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[#a9bac1]">
              Sign in with an administrator account to view system statistics, users, uploaded videos, and moderation controls.
            </p>
            <a className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-extrabold text-[#021014]" href="/signin">Go to Sign In</a>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
      <Header />
      <main className="relative overflow-hidden pt-[122px] max-md:pt-[104px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_7%,rgba(34,211,238,.13),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(248,113,113,.08),transparent_24%),linear-gradient(180deg,#05090c_0%,#071116_48%,#03080b_100%)]" aria-hidden="true" />
        <section className="relative mx-auto w-[min(1240px,calc(100%-48px))] pb-20 max-md:w-[min(680px,calc(100%-30px))]" aria-labelledby="admin-title">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
                <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
                Administrator console
              </div>
              <h1 className="text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-.045em]" id="admin-title">Admin Dashboard</h1>
              <p className="mt-5 max-w-[760px] text-[clamp(15px,1.5vw,18px)] leading-7 text-[#a9bac1]">
                Monitor users, uploaded videos, analysis activity, generated reports, and moderation actions across VerifAI.
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-emerald-100">
              {isLoading ? 'Syncing...' : 'Admin Online'}
            </span>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100" role="alert">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-6 gap-4 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {statLabels.map(([key, label]) => (
              <AdminStatCard label={label} value={stats[key]} key={key} />
            ))}
          </div>

          <div className="mt-7 grid grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] gap-6 max-xl:grid-cols-1">
            <section className="rounded-[30px] border border-white/10 bg-white/[.04] p-5 shadow-[0_28px_80px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.05)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-[-.03em] text-white">Recent Uploaded Videos</h2>
                <span className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">GET /api/admin/videos?limit=100</span>
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/[.08]">
                {videos.map((video) => (
                  <div className="grid grid-cols-[minmax(0,1.2fr)_120px_120px_90px] items-center gap-4 border-b border-white/[.06] p-4 last:border-b-0 max-lg:grid-cols-1" key={video.id}>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-white">{video.filename}</p>
                      <p className="mt-1 text-xs text-slate-500">{video.owner} | {video.uploadedAt}</p>
                    </div>
                    <StatusBadge value={video.status} />
                    <StatusBadge value={video.verdict} />
                    <span className="text-sm font-bold text-cyan-100">{video.confidence ? `${video.confidence}%` : '-'}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/10 bg-white/[.04] p-5 shadow-[0_28px_80px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.05)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-[-.03em] text-white">User Management</h2>
                <span className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">GET /api/admin/users</span>
              </div>
              <div className="mt-5 grid gap-3">
                {users.map((item) => (
                  <div className="rounded-2xl border border-white/[.08] bg-[#071116]/72 p-4" key={item.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-white">{item.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{item.email}</p>
                      </div>
                      <StatusBadge value={item.role} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-400">{item.videos} videos | Joined {item.joinedAt}</span>
                      <button className="rounded-full border border-red-300/25 bg-red-400/10 px-3.5 py-2 text-xs font-black uppercase tracking-[.1em] text-red-100 transition-colors hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={item.id === user?.id} onClick={() => deleteUser(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
