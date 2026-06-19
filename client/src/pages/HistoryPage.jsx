import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import FooterSection from '../components/sections/FooterSection'
import { useAuth } from '../components/auth/AuthContext'
import apiService from '../services/apiService'
import { getFriendlyError } from '../utils/errors'

const historyItems = [
  { video: 'sample_video.mp4', date: '14 June 2026', result: 'Fake', confidence: '87%', report: 'Ready' },
  { video: 'interview_clip.mov', date: '12 June 2026', result: 'Suspicious', confidence: '74%', report: 'Ready' },
  { video: 'authentic_source.mp4', date: '10 June 2026', result: 'Real', confidence: '91%', report: 'Ready' },
]

export default function HistoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState(historyItems)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true
    apiService.getVideoList()
      .then((payload) => {
        if (!isActive) return
        const videos = Array.isArray(payload) ? payload : payload?.videos || payload?.data || []
        setItems(videos.length ? videos.map((video) => ({
          id: video.id || video.videoId || video.filename,
          video: video.filename || video.videoName || 'Untitled video',
          date: video.createdAt || video.uploadedAt || 'Not reported',
          result: video.verdict || video.finalPrediction || video.status || 'Pending',
          confidence: video.confidence ? `${video.confidence}%` : video.fakeProbability ? `${video.fakeProbability}%` : '-',
          report: video.reportStatus || 'Ready',
        })) : [])
        setError('')
      })
      .catch((fetchError) => {
        if (!isActive) return
        setItems(historyItems)
        setError(getFriendlyError(fetchError, 'Failed to load history'))
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  async function deleteVideo(item) {
    const previous = items
    setItems((current) => current.filter((entry) => entry !== item))
    try {
      await apiService.deleteVideo(item.id || item.video)
    } catch (deleteError) {
      setItems(previous)
      setError(getFriendlyError(deleteError, 'Delete failed'))
    }
  }

  return (
    <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
      <Header />
      <main className="relative overflow-hidden pt-[122px] max-md:pt-[104px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_7%,rgba(34,211,238,.13),transparent_28%),linear-gradient(180deg,#05090c,#071116_45%,#03080b_100%)]" aria-hidden="true" />
        <section className="relative mx-auto w-[min(1240px,calc(100%-48px))] pb-20 max-md:w-[min(680px,calc(100%-30px))]" aria-labelledby="history-title">
          <div>
            <div className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.2em] text-cyan-200/85">
              <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#21d8ee]" />
              Private workspace
            </div>
            <h1 className="text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-.045em]" id="history-title">Analysis History</h1>
            <p className="mt-5 max-w-[760px] text-[clamp(15px,1.5vw,18px)] leading-7 text-[#a9bac1]">
              {user ? `${user.name}'s saved video analyses, frame heatmaps, and PDF report records.` : 'Sign in to save and review your analysis records.'}
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[30px] border border-white/10 bg-white/[.045] shadow-[0_28px_80px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl">
            {error && (
              <div className="border-b border-amber-300/15 bg-amber-300/10 px-5 py-4 text-sm font-semibold text-amber-100" role="alert">
                {error}
              </div>
            )}
            {isLoading && (
              <div className="px-5 py-8 text-center text-sm font-bold text-cyan-100">Loading history...</div>
            )}
            {!isLoading && items.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="text-xl font-bold text-white">No history yet</p>
                <p className="mt-2 text-sm text-slate-500">Upload a video to start saving analysis records.</p>
              </div>
            )}
            {!isLoading && items.map((item) => (
              <div className="grid grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(120px,.7fr))] items-center gap-4 border-b border-white/[.06] p-5 last:border-b-0 max-lg:grid-cols-1" key={item.video}>
                <div>
                  <p className="text-lg font-bold text-white">{item.video}</p>
                  <p className="mt-1 text-sm text-slate-500">Video forensics case</p>
                </div>
                <span className="text-sm font-semibold text-slate-300">{item.date}</span>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[.1em] ${item.result === 'Real' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : 'border-red-300/25 bg-red-400/10 text-red-100'}`}>{item.result}</span>
                <span className="text-sm font-bold text-cyan-100">{item.confidence}</span>
                <div className="flex gap-2">
                  <a className="inline-flex min-h-10 items-center justify-center rounded-full bg-cyan-300 px-4 text-sm font-extrabold text-[#021014]" href={item.id ? `/results/${item.id}` : '/results'}>View Result</a>
                  <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-300/25 bg-red-400/10 px-4 text-sm font-bold text-red-100" type="button" onClick={() => deleteVideo(item)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
