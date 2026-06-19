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
  if (!values.name.trim()) errors.name = 'Full name is required.'
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password must be at least 8 characters.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm password is required.'
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!values.agreement) errors.agreement = 'Please accept the ethical use agreement.'
  return errors
}

export default function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false,
  })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [success, setSuccess] = useState('')
  const { isLoading, register } = useAuth()

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

    setSuccess('Account created successfully. Redirecting to upload page.')
    register({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    })
      .then((user) => {
        window.location.href = user?.role === 'admin' ? '/admin' : '/upload'
      })
      .catch((error) => {
        setSuccess('')
        setAlert(getFriendlyError(error, 'Unable to create account. Please try again.'))
      })
  }

  return (
    <AuthLayout>
      <AuthFormCard
        eyebrow="Create secure account"
        title="Create Your Account"
        subtitle="Register to save your deepfake analysis history, frame-level results, and generated PDF reports."
      >
        <form className={`grid gap-5 ${isLoading ? 'opacity-80' : ''}`} noValidate onSubmit={handleSubmit}>
          <AuthErrorAlert message={alert} />
          <AuthErrorAlert message={success} tone="success" />
          <AuthInput autoComplete="name" error={errors.name} id="register-name" label="Full Name" name="name" placeholder="Demo User" type="text" value={values.name} onChange={updateValue} />
          <AuthInput autoComplete="email" error={errors.email} id="register-email" label="Email Address" name="email" placeholder="demo@example.com" type="email" value={values.email} onChange={updateValue} />
          <PasswordInput autoComplete="new-password" error={errors.password} id="register-password" label="Password" name="password" placeholder="At least 8 characters" value={values.password} onChange={updateValue} />
          <PasswordInput autoComplete="new-password" error={errors.confirmPassword} id="register-confirm-password" label="Confirm Password" name="confirmPassword" placeholder="Repeat your password" value={values.confirmPassword} onChange={updateValue} />


          <label className="grid grid-cols-[18px_minmax(0,1fr)] gap-3 text-sm font-semibold leading-6 text-slate-300">
            <input className="mt-1 size-4 accent-cyan-300" checked={values.agreement} name="agreement" type="checkbox" onChange={updateValue} />
            <span>
              I agree to use this system for ethical video verification and analysis.
              {errors.agreement && <span className="mt-1 block text-xs font-semibold text-red-200">{errors.agreement}</span>}
            </span>
          </label>

          <AuthButton loading={isLoading} loadingText="Creating Account...">Create Account</AuthButton>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <a className="font-bold text-cyan-200 transition-colors hover:text-cyan-100" href="/signin">Sign In</a>
          </p>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
