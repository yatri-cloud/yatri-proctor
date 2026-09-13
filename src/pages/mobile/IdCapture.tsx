import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, RefreshCw, Lock, ArrowRight } from 'lucide-react'
import { updateCheckinVerification } from '@/utils/checkinSync'

type Side = 'front' | 'back'

export default function IdCapture() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentSide, setCurrentSide] = useState<Side>('front')
  const [frontCaptured, setFrontCaptured] = useState(false)
  const [backCaptured, setBackCaptured] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (frontCaptured && backCaptured) return
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640 } })
      .then(s => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play() } })
      .catch(() => {})
    return () => { videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()) }
  }, [currentSide, frontCaptured, backCaptured])

  function captureId() {
    if (!videoRef.current || !canvasRef.current) return
    const c = canvasRef.current
    c.width = videoRef.current.videoWidth; c.height = videoRef.current.videoHeight
    c.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    setPreview(c.toDataURL('image/jpeg', 0.8))
  }

  async function acceptCapture() {
    if (!preview) return
    if (currentSide === 'front') {
      updateCheckinVerification({ idFront: preview })
      setFrontCaptured(true); setPreview(null); setCurrentSide('back')
    } else {
      updateCheckinVerification({ idBack: preview, completed: true })
      setBackCaptured(true); setPreview(null)
      setUploading(true)
      await new Promise(r => setTimeout(r, 1200))
      navigate('/mobile/done')
    }
  }

  const bothDone = frontCaptured && backCaptured

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <span className="step-pill mb-3 inline-flex">Step 11 of 19 — ID Capture</span>
          <h1 className="font-display text-xl font-bold">ID Verification</h1>
        </div>

        {/* Side indicator */}
        <div className="flex gap-3">
          {(['front', 'back'] as Side[]).map(side => (
            <div key={side} className={`flex-1 flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
              (side === 'front' ? frontCaptured : backCaptured)
                ? 'border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.05)]'
                : currentSide === side
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card opacity-50'
            }`}>
              {(side === 'front' ? frontCaptured : backCaptured)
                ? <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                : <div className="w-4 h-4 rounded-full border-2 border-current" />}
              <span className="text-xs font-semibold capitalize">{side}</span>
            </div>
          ))}
        </div>

        {uploading ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
            <Lock className="h-8 w-8 text-primary mx-auto animate-pulse" />
            <p className="text-sm font-semibold">Securely uploading…</p>
            <p className="text-xs text-muted-foreground">Encrypting and storing your ID securely.</p>
          </div>
        ) : !preview ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              {currentSide === 'front'
                ? 'Place the FRONT of your ID flat and capture it clearly.'
                : 'Flip your ID and capture the BACK clearly.'}
            </p>
            <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={captureId}
              className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
            >
              Capture {currentSide === 'front' ? 'Front' : 'Back'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border-2 border-emerald-500 aspect-video">
              <img src={preview} alt="ID preview" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPreview(null)}
                className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
              >
                Retake
              </button>
              <button
                onClick={acceptCapture}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Use Photo
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-500 font-medium">
          Live camera only — no file upload. Encrypted at rest.
        </div>
      </div>
    </div>
  )
}
