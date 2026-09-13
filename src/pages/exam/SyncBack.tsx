import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2, CheckCircle, Smartphone } from 'lucide-react'
import StageLayout from '@/components/StageLayout'

export default function SyncBack() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Mock: WebSocket "verification complete" arrives after 3 seconds
    const t = setTimeout(() => {
      setDone(true)
      setTimeout(() => navigate('/exam/terms'), 1200)
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <StageLayout screen={12} title="Syncing…" hideBack>
      <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-6">
        {!done ? (
          <>
            <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto">
              <motion.div
                animate={reduceMotion ? {} : { rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Waiting for Phone</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your phone is completing the room scan and ID verification.
                This page will advance automatically when done.
              </p>
            </div>
            <div className="py-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Phone verification in progress…</span>
            </div>
            <p className="text-xs text-muted-foreground">
              If this takes too long, ask your test-taker to complete all steps on the phone.
            </p>
          </>
        ) : (
          <motion.div
            initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-[hsl(var(--success))]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[hsl(var(--success))]">Verification Complete!</h2>
              <p className="mt-2 text-sm text-muted-foreground">All checks passed. Advancing to Terms & Conditions…</p>
            </div>
          </motion.div>
        )}
      </div>
    </StageLayout>
  )
}
