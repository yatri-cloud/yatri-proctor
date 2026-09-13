import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import StageLayout from '@/components/StageLayout'

export default function ProctorNotice() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <StageLayout screen={16} title="Proctor Notice" hideBack>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Blue header band */}
        <div className="band-blue px-8 py-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo-64.png" alt="Yatri Cloud" className="w-14 h-14 rounded-full object-contain shadow-xs" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Session Notice</h2>
        </div>

        <div className="px-8 py-6 space-y-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-4"
          >
            <div className="rounded-xl bg-muted border border-border p-5 text-sm text-muted-foreground leading-relaxed text-left">
              <p className="font-semibold text-foreground mb-2">Your session is being monitored automatically.</p>
              <p>
                This mock exam session uses automated monitoring to simulate a real proctored exam environment.
                Your webcam feed is active during the exam — a small thumbnail is visible in the corner so you
                know monitoring is occurring.
              </p>
              <p className="mt-3">
                There is no live human proctor for this practice session. If you encounter any technical issues during your exam,
                please contact our support team immediately.
              </p>
            </div>

            <a
              href="mailto:support@yatricloud.com"
              className="inline-block text-xs font-bold text-[#0070E0] hover:underline"
            >
              support@yatricloud.com
            </a>
          </motion.div>

          <button
            onClick={() => navigate('/exam/download')}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            I Understand — Begin Exam
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Auto-advancing in <span className="font-mono text-foreground">{countdown}s</span>
          </p>
        </div>
      </div>
    </StageLayout>
  )
}
