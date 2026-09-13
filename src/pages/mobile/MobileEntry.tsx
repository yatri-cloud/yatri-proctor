import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, QrCode, ArrowRight, ShieldCheck } from 'lucide-react'
import { validateAccessCode } from '@/data/mock-sessions'
import { updateCheckinVerification, setActiveMobileToken } from '@/utils/checkinSync'
import { getApiBaseUrl } from '@/utils/apiConfig'

export default function MobileEntry() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  
  // Auto format code with hyphens (e.g., 624-100-363 or 123-456)
  const formatCode = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Default to query param or 624-100-363 matching the exam session access code
  const codeParam = searchParams.get('code')
  const [accessCodeInput, setAccessCodeInput] = useState(() => formatCode(codeParam || '624-100-363'))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setAccessCodeInput(formatCode(e.target.value))
  }

  async function handleVerify() {
    const clean = accessCodeInput.replace(/\D/g, '')
    if (clean.length !== 6 && clean.length !== 9) {
      setError('Please enter your 9-digit (e.g. 624-100-363) or 6-digit exam access code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate with Spring Boot backend first
      const res = await fetch(`${getApiBaseUrl()}/api/v1/sessions/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean })
      }).catch(() => null)

      let isValid = false
      if (res && res.ok) {
        isValid = true
      } else {
        // Fallback to local session catalog
        const mock = validateAccessCode(accessCodeInput) || validateAccessCode(clean)
        if (mock) isValid = true
      }

      if (!isValid) {
        setLoading(false)
        setError('Invalid access code. Please check your desktop screen and enter the matching code.')
        return
      }

      if (token) {
        setActiveMobileToken(token)
      }
      updateCheckinVerification({ mobileConnected: true }, token)
      navigate('/mobile/photo')
    } catch (err) {
      // Even if network blips, allow candidate to proceed with pairing
      if (token) setActiveMobileToken(token)
      updateCheckinVerification({ mobileConnected: true }, token)
      navigate('/mobile/photo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <div className="mb-3 flex items-center justify-center">
            <img src="/logo-64.png" alt="Yatri Cloud" className="w-12 h-12 rounded-full object-contain shadow-xs" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Mobile Companion</h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Confirm your exam access code to pair this smartphone with your testing workstation.
          </p>
        </div>

        {/* QR Pairing Badge */}
        {token && (
          <div className="mb-4 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="text-[11px] text-emerald-800 leading-tight">
              <strong>QR Code Recognized:</strong> Workstation session connected.
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Step 1 of 4 — Workstation Pairing
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Enter the Access Code shown on your desktop screen:
            </p>
          </div>

          {/* Access Code Input */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={accessCodeInput}
                onChange={handleInputChange}
                placeholder="624-100-363"
                className="w-full py-3.5 px-4 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border-2 border-slate-300 focus:border-[#0070E0] focus:ring-2 focus:ring-[#0070E0]/20 outline-none transition-all bg-slate-50"
              />
            </div>
            <p className="text-[11px] text-center text-slate-400">
              Accepts 9-digit code (624-100-363) or standard 6-digit code.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5" role="alert">
              <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || accessCodeInput.replace(/\D/g, '').length < 6}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Pairing Device...' : 'Verify & Pair Smartphone'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Yatri Cloud Secure Check-in Companion</span>
        </div>
      </motion.div>
    </div>
  )
}
