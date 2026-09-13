import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Camera, CheckCircle } from 'lucide-react'
import StageLayout from '@/components/StageLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function WebcamTest() {
  const { dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamStarted, setStreamStarted] = useState(false)
  const [result, setResult] = useState<'pass' | 'fail' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    startStream()
    return () => {
      videoRef.current?.srcObject &&
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
  }, [])

  async function startStream() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { min: 640 }, height: { min: 480 }, facingMode: 'user' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreamStarted(true)
      }
    } catch {
      setError('Webcam access was denied. Please allow camera access in your browser settings and refresh.')
    }
  }

  function handleAnswer(pass: boolean) {
    dispatch({ type: 'SET_EQUIPMENT', key: 'webcamPass', value: pass })
    if (pass) {
      setResult('pass')
      setTimeout(() => navigate('/exam/mobile-pair'), 800)
    } else {
      setResult('fail')
    }
  }

  return (
    <StageLayout screen={4} title="Webcam Test">
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
            <Camera className="h-8 w-8 text-[#0070E0]" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">Webcam Test</h2>
          <p className="text-sm text-slate-500">
            Check that you can see yourself clearly. Position your face within the oval guide.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3" role="alert">
            <p className="text-xs font-bold text-rose-700">{error}</p>
          </div>
        ) : (
          <div className="webcam-frame">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
            />
            {/* Oval face guide */}
            <div className="capture-oval" />
            {streamStarted && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
            )}
          </div>
        )}

        {streamStarted && result === null && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-center text-slate-800">Can you see your face clearly?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(true)}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] text-white py-3 text-xs font-bold transition-colors shadow-xs"
              >
                Yes, it's clear
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 text-xs font-semibold transition-colors shadow-xs"
              >
                No, retry
              </button>
            </div>
          </motion.div>
        )}

        {result === 'pass' && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs font-semibold text-center">
            Webcam check passed! Moving to mobile pairing…
          </div>
        )}
        {result === 'fail' && (
          <button
            onClick={() => { setResult(null); startStream() }}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </StageLayout>
  )
}
