import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { updateCheckinVerification } from '@/utils/checkinSync'

const DIRECTIONS: { id: string; label: string; instruction: string }[] = [
  { id: 'front', label: 'Front', instruction: 'Face the camera directly. Show your desk and the wall behind you.' },
  { id: 'right', label: 'Right', instruction: 'Slowly pan to the right side of the room.' },
  { id: 'back', label: 'Back', instruction: 'Turn 180° to show the wall or door behind you.' },
  { id: 'left', label: 'Left', instruction: 'Slowly pan to the left side of the room.' },
]

export default function RoomScan() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentDir, setCurrentDir] = useState(0)
  const [captured, setCaptured] = useState<string[]>([])
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640 } })
      .then(s => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play() } })
      .catch(() => {})
    return () => { videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()) }
  }, [currentDir])

  function captureDir() {
    if (!videoRef.current || !canvasRef.current) return
    const c = canvasRef.current
    c.width = videoRef.current.videoWidth; c.height = videoRef.current.videoHeight
    c.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const url = c.toDataURL('image/jpeg', 0.7)
    setPreview(url)
  }

  function acceptCapture() {
    if (!preview) return
    const dirKey = DIRECTIONS[currentDir].id as 'front' | 'right' | 'back' | 'left'
    updateCheckinVerification({
      roomScans: { [dirKey]: preview }
    })
    setCaptured(prev => [...prev, preview!])
    setPreview(null)
    if (currentDir < DIRECTIONS.length - 1) {
      setCurrentDir(v => v + 1)
    } else {
      navigate('/mobile/id-country')
    }
  }

  const dir = DIRECTIONS[currentDir]
  const allDone = captured.length >= DIRECTIONS.length

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <span className="step-pill mb-3 inline-flex">Step 9 of 19 — Room Scan</span>
          <h1 className="font-display text-xl font-bold">Room Scan</h1>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {DIRECTIONS.map((d, i) => (
            <div key={d.id} className={`flex flex-col items-center gap-1`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < captured.length ? 'bg-[hsl(var(--success))] text-white' :
                i === currentDir ? 'bg-primary text-white shadow-inset-btn' :
                'bg-muted text-muted-foreground border border-border'
              }`}>
                {i < captured.length ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>

        {!preview ? (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 text-center font-medium">{dir.instruction}</div>
            <button
              onClick={captureDir}
              className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
            >
              Capture {dir.label}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border-2 border-emerald-500 aspect-video">
              <img src={preview} alt="Room scan preview" className="w-full h-full object-cover" />
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
      </div>
    </div>
  )
}
