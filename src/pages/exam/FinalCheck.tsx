import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, ArrowRight } from 'lucide-react'
import StageLayout from '@/components/StageLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function FinalCheck() {
  const { dispatch } = useExamSession()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      })
      .catch(() => setError('Could not access webcam. Please ensure camera permissions are granted.'))
    return () => {
      videoRef.current?.srcObject &&
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
  }, [])

  function handleConfirm() {
    dispatch({ type: 'SET_FINAL_FACE' })
    setConfirmed(true)
    setTimeout(() => navigate('/exam/proctor-notice'), 600)
  }

  return (
    <StageLayout screen={15} title="Final Face Check">
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-xl font-bold">Final Face Check</h2>
          <p className="text-sm text-muted-foreground">One last look — make sure your face is clearly visible before the exam begins.</p>
        </div>

        {error ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700" role="alert">{error}</div>
        ) : (
          <div className="webcam-frame">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />
            <div className="capture-oval" />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
          </div>
        )}

        {!confirmed ? (
          <button
            onClick={handleConfirm}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Yes, I can see my face clearly
          </button>
        ) : (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs font-semibold text-center">
            Confirmed! Proceeding to proctor notice…
          </div>
        )}
      </div>
    </StageLayout>
  )
}
