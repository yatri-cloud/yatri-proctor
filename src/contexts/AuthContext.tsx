import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  UserProfile,
  getStoredUser,
  getStoredToken,
  loginUser,
  registerUser,
  getCurrentProfile,
  updateProfile,
  logout as authLogout,
  RegisterPayload,
} from '@/lib/auth'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<UserProfile>
  register: (payload: RegisterPayload) => Promise<UserProfile>
  updateUserProfile: (payload: Partial<UserProfile>) => Promise<UserProfile>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser())
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken()
      if (storedToken) {
        try {
          const profile = await getCurrentProfile()
          setUser(profile)
          setToken(storedToken)
        } catch {
          // Token expired or server unreachable, fallback to cached user or clear
          const cached = getStoredUser()
          if (!cached) authLogout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true)
    try {
      const res = await loginUser(email, pass)
      setUser(res.user)
      setToken(res.token)
      return res.user
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    setIsLoading(true)
    try {
      const res = await registerUser(payload)
      setUser(res.user)
      setToken(res.token)
      return res.user
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserProfile = async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await updateProfile(payload)
    setUser(updated)
    return updated
  }

  const logout = () => {
    authLogout()
    setUser(null)
    setToken(null)
  }

  const refreshProfile = async () => {
    try {
      const profile = await getCurrentProfile()
      setUser(profile)
    } catch {
      // Ignored
    }
  }

  const isAuthenticated = !!user && !!token
  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        updateUserProfile,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
