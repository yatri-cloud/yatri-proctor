import { getApiBaseUrl } from '@/utils/apiConfig'

export interface UserProfile {
  id: number
  email: string
  fullName: string
  role: string
  phoneNumber?: string
  country?: string
  stateProvince?: string
  city?: string
  linkedinUrl?: string
  avatarUrl?: string
  active: boolean
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: UserProfile
  message?: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  country?: string
  stateProvince?: string
  city?: string
  linkedinUrl?: string
  avatarUrl?: string
}

const TOKEN_KEY = 'yatri:proctor:token'
const USER_KEY = 'yatri:proctor:user'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.error('Failed to store token', e)
  }
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: UserProfile) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('Failed to store user', e)
  }
}

export function clearAuthStorage() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (e) {
    console.error('Failed to clear auth storage', e)
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Invalid email or password')
  }

  setStoredToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  setStoredToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function getCurrentProfile(): Promise<UserProfile> {
  const token = getStoredToken()
  if (!token) throw new Error('Not authenticated')

  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile')

  setStoredUser(data)
  return data
}

export async function updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const token = getStoredToken()
  if (!token) throw new Error('Not authenticated')

  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update profile')

  setStoredUser(data)
  return data
}

export async function forgotPassword(email: string): Promise<void> {
  const baseUrl = getApiBaseUrl()
  await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
}

export function logout() {
  clearAuthStorage()
}
