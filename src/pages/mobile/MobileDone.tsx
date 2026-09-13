import { useEffect } from 'react'
import { CheckCircle, Monitor } from 'lucide-react'
import { updateCheckinVerification } from '@/utils/checkinSync'

export default function MobileDone() {
  useEffect(() => {
    updateCheckinVerification({ completed: true })
  }, [])
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-[hsl(var(--success))]" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">All Done!</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You've completed all the phone-side steps. Your desktop will advance automatically.
            You can put your phone down now.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Monitor className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Return to your <strong className="text-foreground">desktop or laptop</strong> to continue with Terms, System Check, and the exam.
          </p>
        </div>
      </div>
    </div>
  )
}
