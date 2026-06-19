import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { isAdminUser } from '../../utils/auth'

const loggedOutNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Sign In', href: '/signin' },
  { label: 'Register', href: '/register' },
]

const loggedInNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Upload', href: '/upload' },
  { label: 'History', href: '/history' },
  { label: 'Methodology', href: '/#detection-flow' },
]

const adminNavItems = [
  { label: 'Dashboard', href: '/admin' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout: logoutUser, user } = useAuth()
  const navItems = user ? (isAdminUser(user) ? adminNavItems : loggedInNavItems) : loggedOutNavItems

  useEffect(() => {
    const closeMenu = () => setIsOpen(false)
    window.addEventListener('auth-change', closeMenu)
    return () => {
      window.removeEventListener('auth-change', closeMenu)
    }
  }, [])

  function logout() {
    logoutUser()
    setIsOpen(false)
    window.location.href = '/'
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-[#05090c]/75 text-[#f4fbff] shadow-[0_18px_45px_rgba(0,0,0,.22)] backdrop-blur-2xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,.55),transparent)]" aria-hidden="true" />
      <div className="mx-auto flex h-[82px] w-[min(1240px,calc(100%-48px))] items-center justify-between gap-6 max-md:h-[72px] max-md:w-[min(680px,calc(100%-30px))]">
        <a className="group flex min-w-0 items-center gap-3.5" href="/" aria-label="VerifAI video forensics home">
          <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cyan-300/35 bg-[#071116] shadow-[inset_0_0_24px_rgba(34,211,238,.14),0_0_28px_rgba(34,211,238,.12)] transition-all duration-300 group-hover:border-cyan-200/70 group-hover:bg-cyan-300/10 max-md:size-12">
            <span className="absolute inset-1 rounded-xl border border-cyan-200/10" aria-hidden="true" />
            <img className="relative size-11 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,.38)] max-md:size-9" src="/images/verifai-logo.svg" alt="" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[18px] font-black uppercase leading-none tracking-[.18em] text-white max-md:text-[15px]">Verif<span className="text-cyan-300">AI</span></span>
            <span className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-[.11em] text-slate-400 max-sm:max-w-[150px]">AI Video Forensics</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.035] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a className="rounded-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-[.08em] text-slate-300 transition-all duration-300 hover:bg-cyan-300/10 hover:text-cyan-100 hover:shadow-[inset_0_0_0_1px_rgba(103,232,249,.18)]" href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.85)]" />
            Engine Online
          </span>
          {user ? (
            <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-extrabold text-[#021014] shadow-[0_14px_34px_rgba(34,211,238,.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_18px_42px_rgba(34,211,238,.28)]" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <a className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-extrabold text-[#021014] shadow-[0_14px_34px_rgba(34,211,238,.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_18px_42px_rgba(34,211,238,.28)]" href="/signin">
              Secure Login
            </a>
          )}
        </div>

        <button
          className="group grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[.045] text-slate-100 transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-300/10 lg:hidden"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="relative h-4 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      <div className={`mx-auto w-[min(680px,calc(100%-30px))] overflow-hidden transition-all duration-300 lg:hidden ${isOpen ? 'max-h-[420px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="rounded-[28px] border border-white/10 bg-[#071116]/95 p-2 shadow-[0_24px_55px_rgba(0,0,0,.34)]" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:bg-cyan-300/10 hover:text-cyan-100"
              href={item.href}
              key={item.label}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              <span className="text-cyan-300/70">&#8594;</span>
            </a>
          ))}
          {user ? (
            <button className="mt-2 flex min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-extrabold text-[#021014]" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <a className="mt-2 flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-extrabold text-[#021014]" href="/signin" onClick={() => setIsOpen(false)}>
              Secure Login
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
