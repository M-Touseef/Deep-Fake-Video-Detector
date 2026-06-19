import { useState } from 'react'
import AuthInput from './AuthInput'

export default function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <AuthInput {...props} type={isVisible ? 'text' : 'password'} />
      <button
        className="absolute right-3 top-[34px] rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-slate-300 transition-colors hover:border-cyan-300/30 hover:text-cyan-100"
        type="button"
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
