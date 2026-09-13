import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Volume2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import StageLayout from '@/components/StageLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function SpeakerTest() {
  const { dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [played, setPlayed] = useState(false)
  const [result, setResult] = useState<'pass' | 'fail' | null>(null)

  function playTestTone() {
    setPlayed(true)
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.5)
    } catch {
      // Fallback if AudioContext unavailable
    }
  }

  function handleAnswer(pass: boolean) {
    setResult(pass ? 'pass' : 'fail')
    dispatch({ type: 'SET_EQUIPMENT', key: 'speakerPass', value: pass })
    if (pass) {
      setTimeout(() => navigate('/exam/mic'), 800)
    }
  }

  return (
    <StageLayout screen={2} title="Speaker Test" subtitle="We'll play a short tone — confirm you can hear it.">
      <div className="rounded-2xl border border-border bg-card p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Volume2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold">Speaker Test</h2>
          <p className="text-sm text-muted-foreground">
            Click the button below to play a test tone. Make sure your volume is turned up.
          </p>
        </div>

        {/* Play button */}
        <button
          onClick={playTestTone}
          className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
        >
          {played ? 'Play Again' : 'Play Test Tone'}
        </button>

        {/* Answer buttons */}
        {played && result === null && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-center text-slate-800">Did you hear the tone?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(true)}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] text-white py-3 text-xs font-bold transition-colors shadow-xs"
              >
                Yes, I heard it
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 text-xs font-semibold transition-colors shadow-xs"
              >
                No, I couldn't
              </button>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result === 'pass' && (
          <motion.div
            initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs font-semibold text-center"
          >
            Speaker check passed! Moving to microphone test…
          </motion.div>
        )}
        {result === 'fail' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-xs font-bold text-red-700">Speaker check failed</p>
              <p className="text-xs text-slate-600 mt-1">
                Check your system volume and audio output device, then try again. The real exam requires working speakers.
              </p>
            </div>
            <button
              onClick={() => { setPlayed(false); setResult(null) }}
              className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3 text-xs font-bold text-white shadow-xs transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </StageLayout>
  )
}
