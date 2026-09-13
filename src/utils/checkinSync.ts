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

let memoryVerification: CheckinVerification = {
  mobileConnected: false,
  headshotPhoto: null,
  roomScans: {},
  idFront: null,
  idBack: null,
  completed: false
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

export function updateCheckinVerification(patch: Partial<CheckinVerification>): CheckinVerification {
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

  return updated
}

export function resetCheckinVerification() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('yatri_checkin_update'))
}
