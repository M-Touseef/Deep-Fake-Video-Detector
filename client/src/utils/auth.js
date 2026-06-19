export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isAdminUser(user) {
  return user?.role === 'admin'
}
