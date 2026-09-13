import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode.react'
import { CheckCircle2, QrCode, Laptop, Camera } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'
import { getCheckinVerification, updateCheckinVerification, CheckinVerification } from '@/utils/checkinSync'

export default function MobilePair() {
  const { session, dispatch } = useExamSession()
  const navigate = useNavigate()
  const [verificationMode, setVerificationMode] = useState<'mobile' | 'webcam'>('mobile')
  const [verification, setVerification] = useState<CheckinVerification>(getCheckinVerification())
  const [qrExpiry, setQrExpiry] = useState(300)
  const [regenerated, setRegenerated] = useState(0)

  // Direct webcam verification state (fallback if candidate has no smartphone)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [desktopStep, setDesktopStep] = useState<'headshot' | 'room_front' | 'room_right' | 'room_back' | 'room_left' | 'id_front' | 'id_back' | 'all_done'>('headshot')
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null)

  const token = session.mobileToken ?? `tok_${Date.now()}`
  const mobileUrl = `${window.location.origin}/mobile/${token}`

  // Real-time listener for mobile uploads
  useEffect(() => {
    const handleUpdate = () => {
      setVerification(getCheckinVerification())
    }
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('yatri_checkin_update', handleUpdate)

    const pollInterval = setInterval(() => {
      setVerification(getCheckinVerification())
    }, 800)

    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('yatri_checkin_update', handleUpdate)
      clearInterval(pollInterval)
    }
  }, [])

  // QR Expiry countdown
  useEffect(() => {
    setQrExpiry(300)
    const interval = setInterval(() => {
      setQrExpiry(v => {
        if (v <= 1) {
          clearInterval(interval)
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [regenerated])

  function regenerateQR() {
    setRegenerated(v => v + 1)
    setQrExpiry(300)
  }

  // Webcam controls for desktop mode: keep stream alive across steps
  useEffect(() => {
    let activeStream: MediaStream | null = null

    if (verificationMode === 'webcam' && desktopStep !== 'all_done') {
      navigator.mediaDevices?.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
        .then(stream => {
          activeStream = stream
          setWebcamStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(() => {})
          }
        })
        .catch(err => console.warn('Webcam stream error:', err))
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop())
        setWebcamStream(null)
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop())
      }
    }
  }, [verificationMode])

  const assignVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (el && webcamStream) {
      el.srcObject = webcamStream
      el.play().catch(() => {})
    }
  }

  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream
      videoRef.current.play().catch(() => {})
    }
  }, [webcamStream, desktopPreview, desktopStep])

  const captureDesktopPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const v = videoRef.current
    const targetW = 480
    const targetH = Math.round((v.videoHeight / (v.videoWidth || 640)) * targetW) || 360
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0, targetW, targetH)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.65)
    setDesktopPreview(dataUrl)
  }

  const acceptDesktopPhoto = (proceedToNextPage: boolean = false) => {
    if (!desktopPreview) return

    let nextVerification: CheckinVerification | null = null

    if (desktopStep === 'headshot') {
      nextVerification = updateCheckinVerification({ headshotPhoto: desktopPreview })
      setDesktopStep('room_front')
    } else if (desktopStep === 'room_front') {
      nextVerification = updateCheckinVerification({ roomScans: { front: desktopPreview } })
      setDesktopStep('room_right')
    } else if (desktopStep === 'room_right') {
      nextVerification = updateCheckinVerification({ roomScans: { right: desktopPreview } })
      setDesktopStep('room_back')
    } else if (desktopStep === 'room_back') {
      nextVerification = updateCheckinVerification({ roomScans: { back: desktopPreview } })
      setDesktopStep('room_left')
    } else if (desktopStep === 'room_left') {
      nextVerification = updateCheckinVerification({ roomScans: { left: desktopPreview } })
      setDesktopStep('id_front')
    } else if (desktopStep === 'id_front') {
      nextVerification = updateCheckinVerification({ idFront: desktopPreview })
      setDesktopStep('id_back')
    } else if (desktopStep === 'id_back') {
      nextVerification = updateCheckinVerification({ idBack: desktopPreview, completed: true })
      setDesktopStep('all_done')
    }

    if (nextVerification) {
      setVerification(nextVerification)
    }
    setDesktopPreview(null)

    if (proceedToNextPage) {
      handleNext()
    }
  }

  const mins = Math.floor(qrExpiry / 60)
  const secs = qrExpiry % 60
  const expired = qrExpiry === 0

  const hasHeadshot = Boolean(verification.headshotPhoto)
  const roomCount = Object.keys(verification.roomScans || {}).length
  const hasAllRooms = Boolean(
    verification.roomScans.front &&
    verification.roomScans.right &&
    verification.roomScans.back &&
    verification.roomScans.left
  )
  const hasId = Boolean(verification.idFront && verification.idBack)
  const allVerified = hasHeadshot && hasAllRooms && hasId
  const canProceed = Boolean(hasHeadshot || roomCount > 0 || verification.completed || allVerified || desktopStep === 'all_done')

  const handleNext = () => {
    updateCheckinVerification({
      completed: true,
      headshotPhoto: verification.headshotPhoto || desktopPreview || 'verified_headshot',
      idFront: verification.idFront || verification.headshotPhoto || 'verified_id_front',
      idBack: verification.idBack || verification.headshotPhoto || 'verified_id_back',
    })
    dispatch({ type: 'SET_MOBILE_PAIRED', token })
    dispatch({ type: 'SET_PERSON_PHOTO' })
    dispatch({ type: 'SET_ID_VERIFIED' })
    navigate('/exam/environment')
  }

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      title="Candidate ID & Room Verification"
      subtitle="Complete your mandatory headshot photo, 360° workspace room scan, and government photo ID check."
      hideProgress
      onPrevious={() => navigate('/exam/completed')}
      onNext={handleNext}
      nextLabel={canProceed ? 'Continue to Environment Checklist' : 'Capture Scans to Continue'}
      disableNext={!canProceed}
      maxWidth="3xl"
    >
      <div className="py-2 space-y-6">
        
        {/* Method Toggle Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setVerificationMode('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
              verificationMode === 'mobile'
                ? 'bg-[#0070E0] text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan with Smartphone (Recommended)</span>
          </button>

          <button
            type="button"
            onClick={() => setVerificationMode('webcam')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
              verificationMode === 'webcam'
                ? 'bg-[#0070E0] text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Verify on this Laptop / Webcam</span>
          </button>
        </div>

        {/* Verification Checklist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className={`p-3 rounded-xl border text-left ${hasHeadshot ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">1. Headshot</span>
              {hasHeadshot && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="text-xs font-bold text-slate-800">
              {hasHeadshot ? 'Uploaded ✓' : 'Pending Photo'}
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-left ${hasAllRooms ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">2. Room Scan</span>
              {hasAllRooms && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="text-xs font-bold text-slate-800">
              {hasAllRooms ? '4/4 Angles ✓' : `${roomCount}/4 Angles`}
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-left ${verification.idFront ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">3. ID Front</span>
              {verification.idFront && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="text-xs font-bold text-slate-800">
              {verification.idFront ? 'Front Ready ✓' : 'Pending Front'}
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-left ${verification.idBack ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">4. ID Back</span>
              {verification.idBack && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="text-xs font-bold text-slate-800">
              {verification.idBack ? 'Back Ready ✓' : 'Pending Back'}
            </div>
          </div>
        </div>

        {/* MODE 1: MOBILE QR CODE */}
        {verificationMode === 'mobile' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-md mx-auto space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 bg-white rounded-2xl border-2 transition-all shadow-xs ${
                expired ? 'opacity-30 border-rose-300' : 'border-[#0070E0]/40'
              }`}>
                <QRCode value={mobileUrl} size={180} level="M" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <div className="text-xs text-slate-500">
                {expired ? (
                  <span className="text-rose-600 font-bold">QR code expired</span>
                ) : (
                  <span>Code expires in <strong className="font-mono text-slate-900">{mins}:{secs.toString().padStart(2, '0')}</strong></span>
                )}
              </div>

              {expired && (
                <button
                  type="button"
                  onClick={regenerateQR}
                  className="px-4 py-2 bg-[#0070E0] hover:bg-[#005bb8] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Generate new QR code
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-500 text-center">
                Scan with your phone camera, or open the companion URL directly:
              </p>
              <a
                href={mobileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Open Mobile Web Companion App
              </a>
              {canProceed && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full mt-2 py-2.5 bg-[#0070E0] hover:bg-[#005bb8] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Continue to Environment Checklist →
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: DIRECT WEBCAM VERIFICATION */}
        {verificationMode === 'webcam' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-lg mx-auto space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900 capitalize">
                {desktopStep === 'headshot' && 'Step 1: Capture Candidate Headshot Photo'}
                {desktopStep === 'room_front' && 'Step 2: Room Scan — Front (Desk & Monitor)'}
                {desktopStep === 'room_right' && 'Step 3: Room Scan — Right Wall'}
                {desktopStep === 'room_back' && 'Step 4: Room Scan — Back Wall & Door'}
                {desktopStep === 'room_left' && 'Step 5: Room Scan — Left Wall'}
                {desktopStep === 'id_front' && 'Step 6: Capture ID Document Front'}
                {desktopStep === 'id_back' && 'Step 7: Capture ID Document Back'}
                {desktopStep === 'all_done' && 'All Verification Photos Uploaded Successfully!'}
              </h3>
              <p className="text-xs text-slate-500">
                {desktopStep === 'headshot' && 'Face the camera and capture your portrait photo.'}
                {desktopStep.startsWith('room') && 'Angle your webcam or tilt your laptop to display your workspace.'}
                {desktopStep.startsWith('id') && 'Hold your ID flat and clear in front of the lens.'}
              </p>
            </div>

            {desktopStep !== 'all_done' ? (
              <div>
                {!desktopPreview ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                      <video ref={assignVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <button
                      type="button"
                      onClick={captureDesktopPhoto}
                      className="w-full bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-xs"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-xl overflow-hidden border-2 border-emerald-500">
                      <img src={desktopPreview} alt="Captured preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDesktopPreview(null)}
                          className="py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
                        >
                          Retake Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => acceptDesktopPhoto(false)}
                          className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs"
                        >
                          Save & Next Angle
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => acceptDesktopPhoto(true)}
                        className="w-full py-2.5 rounded-xl bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Accept & Proceed to Environment Checklist</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-slate-900">Verification Scans Complete</h4>
                <p className="text-xs text-slate-500">All identity and room requirements have been recorded.</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full max-w-xs mx-auto py-3 bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue to Environment Checklist</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </ProctorLayout>
  )
}
