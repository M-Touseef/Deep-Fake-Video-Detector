import Header from '../layout/Header'
import FooterSection from '../sections/FooterSection'
import AuthTrustPoint from './AuthTrustPoint'
import AuthVisualPanel from './AuthVisualPanel'

const mobileTrustPoints = [
  { icon: 'shield', title: 'Private Analysis History' },
  { icon: 'heatmap', title: 'Frame-Level Heatmap Results' },
  { icon: 'pdf', title: 'Downloadable PDF Reports' },
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#05090c] font-['Manrope'] text-[#f4fbff] antialiased">
      <Header />
      <main className="relative overflow-hidden pt-[122px] max-md:pt-[104px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(34,211,238,.13),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(16,185,129,.08),transparent_24%),linear-gradient(180deg,#05090c_0%,#071116_50%,#03080b_100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(33,216,238,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(33,216,238,.045)_1px,transparent_1px)] bg-[size:62px_62px] opacity-30 [mask-image:linear-gradient(180deg,#000,transparent_82%)]" aria-hidden="true" />

        <section className="relative mx-auto grid w-[min(1240px,calc(100%-48px))] grid-cols-[minmax(0,.82fr)_minmax(480px,1fr)] gap-8 pb-20 max-lg:w-[min(680px,calc(100%-30px))] max-lg:grid-cols-1">
          <div className="flex min-h-[680px] items-center max-lg:min-h-0">
            {children}
          </div>
          <AuthVisualPanel />
          <div className="grid gap-3 lg:hidden">
            {mobileTrustPoints.map((point) => (
              <AuthTrustPoint {...point} key={point.title} />
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
