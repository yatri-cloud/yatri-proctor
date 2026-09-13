import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Download, CheckCircle } from 'lucide-react'
import StageLayout from '@/components/StageLayout'

const STEPS = [
  'Authenticating session token…',
  'Fetching encrypted exam payload…',
  'Verifying payload integrity…',
  'Decrypting question bank…',
  'Shuffling question order…',
  'Exam ready!',
]

export default function ExamDownload() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx(prev => {
        const next = prev + 1
        setProgress(Math.round((next / STEPS.length) * 100))
        if (next >= STEPS.length) {
          clearInterval(interval)
          setTimeout(() => navigate('/exam/session'), 800)
        }
        return Math.min(next, STEPS.length - 1)
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  const done = stepIdx >= STEPS.length - 1

  return (
    <StageLayout screen={17} title="Preparing Exam" hideBack>
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          {done ? (
            <CheckCircle className="h-8 w-8 text-[hsl(var(--success))]" />
          ) : (
            <motion.div
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Download className="h-8 w-8 text-primary" />
            </motion.div>
          )}
        </div>

        <div>
          <h2 className="font-display text-xl font-bold">{done ? 'Exam Ready!' : 'Preparing Your Exam'}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{STEPS[stepIdx]}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>

        {/* Security note */}
        <div className="text-center text-xs text-slate-500">
          <span>Exam content is encrypted end-to-end</span>
        </div>
      </div>
    </StageLayout>
  )
}
