import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import StageLayout from '@/components/StageLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'
import { validateAccessCode } from '@/data/mock-sessions'
import { MOCK_QUESTIONS, shuffleQuestions } from '@/data/mock-questions'

export default function AccessCode() {
  const { dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [codeVal, setCodeVal] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const cleanDigits = codeVal.replace(/\D/g, '').slice(0, 9)

  const formatCode = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 9)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setCodeVal(formatCode(e.target.value))
  }

  async function handleVerify() {
    setError('')
    if (cleanDigits.length !== 6 && cleanDigits.length !== 9) {
      setError('Please enter your 9-digit (e.g. 624-100-363) or 6-digit access code.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // simulate API

    const session = validateAccessCode(codeVal) || validateAccessCode(cleanDigits)
    if (!session) {
      setLoading(false)
      setError('Invalid or expired access code. Please check your confirmation and try again.')
      return
    }

    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const sessionId = `sess_${Date.now()}`
    dispatch({
      type: 'SET_ACCESS_CODE',
      code: session.code || codeVal,
      name: session.candidateName,
      sessionId,
      token,
    })
    dispatch({ type: 'SET_QUESTIONS', questions: shuffleQuestions(MOCK_QUESTIONS) })
    navigate('/exam/speaker')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Progress bar stub at top */}
      <div className="fixed inset-x-0 top-0 h-1 bg-muted">
        <div className="h-full bg-primary" style={{ width: `${(1 / 19) * 100}%` }} />
      </div>

      {/* Logo */}
      <div className="mb-12 flex flex-col items-center gap-3">
        <img src="/logo-64.png" alt="Yatri Cloud" className="w-12 h-12 rounded-full object-contain shadow-xs" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Yatri Proctor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Mock Exam Platform</p>
        </div>
      </div>

      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="text-center mb-6">
            <span className="step-pill mb-4 inline-flex">Step 1 of 19</span>
            <h2 className="font-display text-xl font-bold text-foreground">Enter Access Code</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter your access code from your booking confirmation or desktop setup.
            </p>
          </div>

          {/* Single clean formatted input */}
          <div className="mb-6 space-y-2">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={codeVal}
              onChange={handleInputChange}
              placeholder="624-100-363"
              className="w-full py-3.5 px-4 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border-2 border-slate-300 focus:border-[#0070E0] focus:ring-2 focus:ring-[#0070E0]/20 outline-none transition-all bg-slate-50"
              aria-label="Access Code"
            />
            <p className="text-[11px] text-center text-muted-foreground">
              Enter 9 digits (<code className="font-mono font-bold text-foreground">624-100-363</code>) or 6 digits (<code className="font-mono text-foreground">123456</code>)
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 mb-5"
              role="alert"
            >
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </motion.div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || (cleanDigits.length !== 6 && cleanDigits.length !== 9)}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Code...' : 'Verify Code'}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCodeVal('624-100-363')}
              className="text-[11px] font-medium text-[#0070E0] hover:underline"
            >
              Autofill 624-100-363
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setCodeVal('123-456')}
              className="text-[11px] font-medium text-slate-500 hover:underline"
            >
              Demo 123456
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
