import { getApiBaseUrl } from '@/utils/apiConfig'

export interface CheckinVerification {
  mobileConnected: boolean
  headshotPhoto: string | null
  roomScans: {
    front?: string
    right?: string
    back?: string
    left?: string
  }
  idFront: string | null
  idBack: string | null
  idCountry?: string
  idType?: string
  completed: boolean
}

const STORAGE_KEY = 'yatri_checkin_verification'
const ACTIVE_TOKEN_KEY = 'yatri_active_mobile_token'

let memoryVerification: CheckinVerification = {
  mobileConnected: false,
  headshotPhoto: null,
  roomScans: {},
  idFront: null,
  idBack: null,
  completed: false
}

export function getActiveMobileToken(): string | null {
  try {
    return (
      sessionStorage.getItem('yatri_mobile_token') ||
      localStorage.getItem(ACTIVE_TOKEN_KEY) ||
      localStorage.getItem('yatri_mobile_token')
    )
  } catch {
    return null
  }
}

export function setActiveMobileToken(token: string) {
  try {
    sessionStorage.setItem('yatri_mobile_token', token)
    localStorage.setItem(ACTIVE_TOKEN_KEY, token)
    localStorage.setItem('yatri_mobile_token', token)
  } catch {}
}

export function getCheckinVerification(): CheckinVerification {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      memoryVerification = {
        ...memoryVerification,
        ...parsed,
        roomScans: {
          ...(memoryVerification.roomScans || {}),
          ...(parsed.roomScans || {})
        }
      }
      return memoryVerification
    }
  } catch {}
  return memoryVerification
}

export function updateCheckinVerification(
  patch: Partial<CheckinVerification>,
  tokenOverride?: string
): CheckinVerification {
  const current = getCheckinVerification()
  const updated: CheckinVerification = {
    ...current,
    ...patch,
    roomScans: {
      ...(current.roomScans || {}),
      ...(patch.roomScans || {})
    }
  }

  const hasHeadshot = Boolean(updated.headshotPhoto)
  const hasAllRooms = Boolean(
    updated.roomScans?.front &&
    updated.roomScans?.right &&
    updated.roomScans?.back &&
    updated.roomScans?.left
  )
  const hasId = Boolean(updated.idFront && updated.idBack)

  if (hasHeadshot && hasAllRooms && hasId) {
    updated.completed = true
  }

  memoryVerification = updated

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('LocalStorage quota notice (relying on memory verification):', err)
  }

  try {
    window.dispatchEvent(new Event('yatri_checkin_update'))
  } catch {}

  // Sync to backend across devices (mobile to desktop)
  const token = tokenOverride || getActiveMobileToken()
  if (token) {
    syncToBackend(token, updated)
  }

  return updated
}

async function syncToBackend(token: string, state: CheckinVerification) {
  try {
    // Send lightweight indicators to avoid payload limits
    const payload: Record<string, any> = {
      mobileConnected: state.mobileConnected || true,
      completed: state.completed,
    }
    if (state.headshotPhoto) payload.headshotPhoto = 'captured'
    if (state.idFront) payload.idFront = 'captured'
    if (state.idBack) payload.idBack = 'captured'
    if (state.idCountry) payload.idCountry = state.idCountry
    if (state.idType) payload.idType = state.idType

    if (state.roomScans) {
      const scans: Record<string, string> = {}
      if (state.roomScans.front) scans.front = 'captured'
      if (state.roomScans.right) scans.right = 'captured'
      if (state.roomScans.back) scans.back = 'captured'
      if (state.roomScans.left) scans.left = 'captured'
      if (Object.keys(scans).length > 0) payload.roomScans = scans
    }

    await fetch(`${getApiBaseUrl()}/api/v1/mobile/${encodeURIComponent(token)}/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.warn('Remote sync notice:', err)
  }
}

export async function fetchRemoteCheckinVerification(tokenOverride?: string): Promise<CheckinVerification> {
  const token = tokenOverride || getActiveMobileToken()
  if (!token) return getCheckinVerification()

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/mobile/${encodeURIComponent(token)}/verification`, {
      headers: { 'Accept': 'application/json' }
    })

    if (res.ok) {
      const data = await res.json()
      if (data && typeof data === 'object') {
        const patch: Partial<CheckinVerification> = {}
        if (data.mobileConnected) patch.mobileConnected = true
        if (data.headshotPhoto) patch.headshotPhoto = memoryVerification.headshotPhoto || 'captured'
        if (data.idFront) patch.idFront = memoryVerification.idFront || 'captured'
        if (data.idBack) patch.idBack = memoryVerification.idBack || 'captured'
        if (data.roomScans && typeof data.roomScans === 'object') {
          patch.roomScans = {
            ...(memoryVerification.roomScans || {}),
            ...data.roomScans
          }
        }
        if (patch.headshotPhoto || patch.roomScans || patch.idFront || patch.idBack) {
          return updateCheckinVerification(patch)
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote verification:', err)
  }

  return getCheckinVerification()
}

export function resetCheckinVerification() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('yatri_checkin_update'))
}
