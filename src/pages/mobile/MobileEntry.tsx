import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { validateAccessCode } from '@/data/mock-sessions'
import { updateCheckinVerification } from '@/utils/checkinSync'

export default function MobileEntry() {
  const { token } = useParams()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join('')

  function handleDigitChange(idx: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[idx] = v
    setDigits(next); setError('')
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  async function handleVerify() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const session = validateAccessCode(code)
    if (!session) {
      setLoading(false)
      setError('Code does not match the session. Check you scanned the correct QR and re-enter the same code.')
      return
    }
    updateCheckinVerification({ mobileConnected: true })
    navigate('/mobile/photo')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo-64.png" alt="Yatri Cloud" className="w-12 h-12 rounded-full object-contain shadow-xs" />
          </div>
          <h1 className="font-display text-2xl font-bold">Mobile Companion</h1>
          <p className="mt-2 text-sm text-muted-foreground">Re-enter your 6-digit exam access code to pair this device to your session.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Step 6 of 19 — Code Verification</p>

          <div className="flex gap-2 justify-center">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-lg border-2 bg-background outline-none transition-all ${d ? 'border-primary' : 'border-input'} focus:border-primary focus:ring-2 focus:ring-ring/30`}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5" role="alert">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3 text-xs font-bold text-white shadow-xs disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify & Pair'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
