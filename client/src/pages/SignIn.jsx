import { useState } from 'react'
import AuthButton from '../components/auth/AuthButton'
import AuthErrorAlert from '../components/auth/AuthErrorAlert'
import AuthFormCard from '../components/auth/AuthFormCard'
import AuthInput from '../components/auth/AuthInput'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../components/auth/AuthContext'
import { isValidEmail } from '../utils/auth'
import { getFriendlyError } from '../utils/errors'

function validate(values) {
  const errors = {}
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  return errors
}

export default function SignIn() {
  const [values, setValues] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const { isLoading, login } = useAuth()

  function updateValue(event) {
    const { name, value, checked, type } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setAlert('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    login({ email: values.email.trim(), password: values.password })
      .then((user) => {
        window.location.href = user?.role === 'admin' ? '/admin' : '/home'
      })
      .catch((error) => {
        setAlert(getFriendlyError(error, 'Invalid credentials.'))
      })
  }

  return (
    <AuthLayout>
      <AuthFormCard
        eyebrow="Secure forensic access"
        title="Welcome Back"
        subtitle="Sign in to continue analyzing videos, reviewing detection history, and downloading forensic PDF reports."
      >
        <form className={`grid gap-5 ${isLoading ? 'opacity-80' : ''}`} noValidate onSubmit={handleSubmit}>
          <AuthErrorAlert message={alert} />
          <AuthInput autoComplete="email" error={errors.email} id="signin-email" label="Email Address" name="email" placeholder="demo@example.com" type="email" value={values.email} onChange={updateValue} />
          <PasswordInput autoComplete="current-password" error={errors.password} id="signin-password" label="Password" name="password" placeholder="Enter your password" value={values.password} onChange={updateValue} />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-300">
              <input className="size-4 accent-cyan-300" checked={values.remember} name="remember" type="checkbox" onChange={updateValue} />
              Remember me
            </label>
            <button className="font-bold text-cyan-200 transition-colors hover:text-cyan-100" type="button" onClick={() => setAlert('Password reset is not connected yet. Please contact the system administrator.')}>
              Forgot password?
            </button>
          </div>

          <AuthButton loading={isLoading} loadingText="Signing In...">Sign In</AuthButton>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <a className="font-bold text-cyan-200 transition-colors hover:text-cyan-100" href="/register">Create Account</a>
          </p>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
