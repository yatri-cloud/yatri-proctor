import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Mic, CheckCircle, XCircle, RefreshCw, Play, Square } from 'lucide-react'
import StageLayout from '@/components/StageLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function MicTest() {
  const { dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<'idle' | 'recording' | 'playback' | 'confirm'>('idle')
  const [countdown, setCountdown] = useState(5)
  const [result, setResult] = useState<'pass' | 'fail' | null>(null)
  const [error, setError] = useState('')
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(20).fill(3))
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const recordedBlobRef = useRef<Blob | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const rafRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
  }, [])

  async function startRecording() {
    setError('')
    setCountdown(5)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const mr = new MediaRecorder(stream)
      mediaRecRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        recordedBlobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' })
        setPhase('playback')
      }
      mr.start()

      setPhase('recording')

      // Animate waveform
      const data = new Uint8Array(analyser.frequencyBinCount)
      function drawWave() {
        analyser.getByteFrequencyData(data)
        const heights = Array.from({ length: 20 }, (_, i) => {
          const val = data[Math.floor(i * data.length / 20)] / 255
          return Math.max(3, Math.round(val * 36))
        })
        setWaveHeights(heights)
        rafRef.current = requestAnimationFrame(drawWave)
      }
      drawWave()

      // Countdown
      let t = 5
      timerRef.current = setInterval(() => {
        t--
        setCountdown(t)
        if (t <= 0) {
          clearInterval(timerRef.current!)
          cancelAnimationFrame(rafRef.current)
          mr.stop()
          stream.getTracks().forEach(t => t.stop())
          setWaveHeights(Array(20).fill(3))
        }
      }, 1000)
    } catch {
      setError('Microphone access was denied. Please allow microphone access in your browser and try again.')
    }
  }

  function playback() {
    if (!recordedBlobRef.current) return
    const url = URL.createObjectURL(recordedBlobRef.current)
    const audio = new Audio(url)
    audio.play()
    audio.onended = () => setPhase('confirm')
  }

  function handleAnswer(pass: boolean) {
    setResult(pass ? 'pass' : 'fail')
    dispatch({ type: 'SET_EQUIPMENT', key: 'micPass', value: pass })
    if (pass) setTimeout(() => navigate('/exam/webcam'), 800)
  }

  return (
    <StageLayout screen={3} title="Microphone Test">
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold">Microphone Test</h2>
          <p className="text-sm text-muted-foreground">
            We'll record 5 seconds of audio. Speak into your microphone, then listen back.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3" role="alert">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Idle */}
        {phase === 'idle' && (
          <button
            onClick={startRecording}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Start 5-Second Recording
          </button>
        )}

        {/* Recording */}
        {phase === 'recording' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-red-600">Recording — {countdown}s</span>
            </div>
            {/* Waveform */}
            <div className="flex items-end justify-center gap-0.5 h-10 px-4">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className="waveform-bar flex-1"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 0.04}s`,
                    animation: reduceMotion ? 'none' : undefined,
                  }}
                />
              ))}
            </div>
            <p className="text-center text-xs text-slate-500">Speak clearly into your microphone…</p>
          </div>
        )}

        {/* Playback */}
        {phase === 'playback' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-900">Recording complete!</p>
              <p className="text-xs text-slate-500">Play it back to verify your microphone is working.</p>
            </div>
            <button
              onClick={playback}
              className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3 text-xs font-bold text-white shadow-xs transition-colors"
            >
              Play Recording
            </button>
          </div>
        )}

        {/* Confirm */}
        {phase === 'confirm' && result === null && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-center text-slate-800">Could you clearly hear your voice?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(true)}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] text-white py-3 text-xs font-bold transition-colors shadow-xs"
              >
                Yes, works great
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 text-xs font-semibold transition-colors shadow-xs"
              >
                No, try again
              </button>
            </div>
          </motion.div>
        )}

        {result === 'pass' && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs font-semibold text-center">
            Microphone check passed! Moving to webcam test…
          </div>
        )}
        {result === 'fail' && (
          <button
            onClick={() => { setPhase('idle'); setResult(null) }}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </StageLayout>
  )
}
