import { useEffect } from 'react'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      window.location.replace('/')
      return
    }

    if (allowedRole && user?.role !== allowedRole) {
      window.location.replace(user?.role === 'admin' ? '/admin' : '/home')
    }
  }, [allowedRole, isAuthenticated, isLoading, user])

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#05090c] text-[#f4fbff]">
        <div className="rounded-[28px] border border-white/10 bg-white/[.045] px-6 py-5 text-center shadow-[0_24px_70px_rgba(0,0,0,.38)]">
          <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-200" />
          <p className="mt-4 text-sm font-bold text-cyan-100">Restoring secure session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (allowedRole && user?.role !== allowedRole) return null

  return children
}
