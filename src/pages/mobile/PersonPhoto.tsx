import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateCheckinVerification } from '@/utils/checkinSync'

export default function PersonPhoto() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [streamStarted, setStreamStarted] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    startCamera()
    return () => { videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()) }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setStreamStarted(true) }
    } catch { setError('Camera access denied. Please allow camera permission and refresh.') }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    setPhotoUrl(canvas.toDataURL('image/jpeg', 0.8))
    setCaptured(true);
    (videoRef.current.srcObject as MediaStream)?.getTracks().forEach(t => t.stop())
  }

  function retake() {
    setCaptured(false); setPhotoUrl(null); startCamera()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <span className="step-pill mb-3 inline-flex">Step 8 of 19 — Person Photo</span>
          <h1 className="font-display text-xl font-bold">Take Your Photo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Position your face clearly within the oval guide. Ensure good lighting.</p>
        </div>

        {error ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4" role="alert">
            <p className="text-xs font-bold text-rose-700">{error}</p>
          </div>
        ) : captured && photoUrl ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500 aspect-video w-full">
              <img src={photoUrl} alt="Captured face photo" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs">
                  Captured
                </span>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={retake}
                className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
              >
                Retake
              </button>
              <button
                onClick={() => {
                  if (photoUrl) {
                    updateCheckinVerification({ headshotPhoto: photoUrl })
                  }
                  navigate('/mobile/room-scan')
                }}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Looks Good
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="webcam-frame">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />
              <div className="capture-oval" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={capturePhoto}
              disabled={!streamStarted}
              className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Capture Photo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
