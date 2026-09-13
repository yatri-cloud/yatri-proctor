export const getApiBaseUrl = (): string => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env
  if (env?.VITE_API_BASE_URL) {
    return env.VITE_API_BASE_URL
  }
  // In dev server on port 5173, direct to backend port 8080 if needed
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'http://localhost:8080'
  }
  // In production (e.g. Render) or when served directly, use relative URL (same origin)
  return ''
}
