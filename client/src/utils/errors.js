export function getFriendlyError(error, fallback = 'Something went wrong. Please try again.') {
  const message = String(error?.message || error || '').toLowerCase()

  if (message.includes('no face')) return 'No clear face was found. Try a clearer clip.'
  if (message.includes('refused') || message.includes('offline') || message.includes('service unavailable')) return 'Analysis service is offline. Try again later.'
  if (message.includes('timeout') || message.includes('timed out')) return 'This video took too long. Try a shorter clip.'
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) return "Connection interrupted. We'll keep checking when possible."
  if (message.includes('already exists')) return 'Email already exists.'
  if (message.includes('invalid credentials') || message.includes('unauthorized')) return 'Invalid credentials.'

  return error?.message || fallback
}
