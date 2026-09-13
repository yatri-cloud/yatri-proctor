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
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const code = digits.join('')
  const isComplete = code.length === 6 && /^\d{6}$/.test(code)

  function handleDigitChange(idx: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = v
    setDigits(next)
    setError('')
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length) {
      const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
      setDigits(next)
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  async function handleVerify() {
    setError('')
    if (!isComplete) {
      setError('Please enter all 6 digits of your access code.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate API

    const session = validateAccessCode(code)
    if (!session) {
      setLoading(false)
      setError('Invalid or expired access code. Please check your booking confirmation and try again.')
      return
    }

    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const sessionId = `sess_${Date.now()}`
    dispatch({
      type: 'SET_ACCESS_CODE',
      code,
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
          <div className="text-center mb-8">
            <span className="step-pill mb-4 inline-flex">Step 1 of 19</span>
            <h2 className="font-display text-xl font-bold text-foreground">Enter Access Code</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code from your exam booking confirmation.
            </p>
          </div>

          {/* Code input boxes */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-lg border-2 bg-background outline-none transition-all ${
                  digit ? 'border-primary' : 'border-input'
                } focus:border-primary focus:ring-2 focus:ring-ring/30`}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
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
            onClick={handleVerify}
            disabled={loading}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Code...' : 'Verify Code'}
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo: try <code className="font-mono text-foreground">123456</code>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
