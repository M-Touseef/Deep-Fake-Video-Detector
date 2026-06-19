import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import apiService from '../../services/apiService'

const AuthContext = createContext(null)

const TOKEN_KEY = 'deepfake_token'
const USER_KEY = 'deepfake_user'

function readStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(Boolean(window.localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    function syncAuth() {
      setUser(readStoredUser())
      setToken(window.localStorage.getItem(TOKEN_KEY))
    }

    window.addEventListener('storage', syncAuth)
    window.addEventListener('auth-change', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('auth-change', syncAuth)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await apiService.getCurrentUser()
        const nextUser = response?.user || response
        if (!isActive) return
        if (nextUser?.id) {
          window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
          setUser(nextUser)
        }
      } catch {
        if (!isActive) return
        window.localStorage.removeItem(TOKEN_KEY)
        window.localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    restoreSession()
    return () => {
      isActive = false
    }
  }, [token])

  function persistAuth(nextToken, nextUser) {
    if (!nextToken || !nextUser) throw new Error('Authentication response did not include token and user.')
    window.localStorage.setItem(TOKEN_KEY, nextToken)
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
    window.dispatchEvent(new Event('auth-change'))
  }

  async function login(credentials) {
    setIsLoading(true)
    try {
      const response = await apiService.login(credentials.email, credentials.password)
      console.log('[AuthContext] Login response:', response)
      persistAuth(response.token, response.user)
      return response.user
    } finally {
      setIsLoading(false)
    }
  }

  async function register(payload) {
    setIsLoading(true)
    try {
      const response = await apiService.signup(payload.email, payload.password, payload.name)
      console.log('[AuthContext] Register response:', response)
      persistAuth(response.token, response.user)
      return response.user
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  const value = useMemo(() => ({
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    register,
    token,
    user,
  }), [isLoading, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
