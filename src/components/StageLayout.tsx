import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const SCREEN_LABELS: Record<number, string> = {
  1: 'Access Code',
  2: 'Speaker Test',
  3: 'Microphone Test',
  4: 'Webcam Test',
  5: 'Mobile Pairing',
  6: 'Code Verification',
  7: 'Environment Check',
  8: 'Person Photo',
  9: 'Room Scan',
  10: 'ID: Country & Type',
  11: 'ID: Capture',
  12: 'Mobile Complete',
  13: 'Sync Back',
  14: 'System Checks',
  15: 'Final Face Check',
  16: 'Proctor Notice',
  17: 'Preparing Exam',
  18: 'Live Exam',
  19: 'Results',
}

interface StageLayoutProps {
  screen: number
  totalScreens?: number
  title?: string
  subtitle?: string
  backHref?: string
  hideBack?: boolean
  widthClass?: string
  children: React.ReactNode
}

export default function StageLayout({
  screen,
  totalScreens = 19,
  title,
  subtitle,
  backHref,
  hideBack = false,
  widthClass = 'max-w-xl',
  children,
}: StageLayoutProps) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const progress = Math.min(Math.max((screen / totalScreens) * 100, 0), 100)
  const label = title ?? SCREEN_LABELS[screen] ?? `Step ${screen}`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top persistent progress bar */}
      <div
        className="fixed inset-x-0 top-0 h-1 bg-muted z-50 overflow-hidden"
        role="progressbar"
        aria-valuenow={screen}
        aria-valuemin={1}
        aria-valuemax={totalScreens}
        aria-label={`Step ${screen} of ${totalScreens}`}
      >
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Header bar */}
      <div className="sticky top-0 z-40 glass-nav px-4 py-3 flex items-center gap-3">
        {!hideBack && (
          <button
            onClick={() => backHref ? navigate(backHref) : navigate(-1)}
            className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
            aria-label="Go back"
          >
            Back
          </button>
        )}

        {/* Logo + step */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img src="/logo-64.png" alt="Yatri" className="w-6 h-6 rounded-full object-contain" />
          <span className="text-xs font-bold text-slate-800 truncate">{label}</span>
        </div>

        {/* Step pill */}
        <span className="step-pill flex-shrink-0">
          Step {screen} of {totalScreens}
        </span>
      </div>

      {/* Page content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          className={`w-full ${widthClass}`}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle && (
            <div className="mb-8 text-center">
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </motion.div>
      </main>
    </div>
  )
}
