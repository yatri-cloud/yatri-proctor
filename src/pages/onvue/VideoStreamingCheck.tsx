import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, HelpCircle, X } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function VideoStreamingCheck() {
  const navigate = useNavigate()
  const { session } = useExamSession()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [canSeeSelf, setCanSeeSelf] = useState<'yes' | 'no' | null>(null)
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      .then(s => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play().catch(() => {})
        }
      })
      .catch(() => {})

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      percentComplete={83}
      title="System test - Video streaming check"
      onPrevious={() => navigate('/exam/secure-browser')}
      onNext={() => navigate('/exam/simulation-ready')}
      disableNext={canSeeSelf !== 'yes'}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto items-center">
        
        {/* Left Card: Confirmation matching 15.png */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-4 shadow-xs">
          <p className="text-sm font-medium text-slate-900">
            Can you see yourself in the video stream?
          </p>

          <div className="flex items-center justify-center space-x-6">
            <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-700">
              <input
                type="radio"
                name="canSeeSelf"
                value="yes"
                checked={canSeeSelf === 'yes'}
                onChange={() => setCanSeeSelf('yes')}
                className="text-[#0070E0] focus:ring-[#0070E0]"
              />
              <span>Yes</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-700">
              <input
                type="radio"
                name="canSeeSelf"
                value="no"
                checked={canSeeSelf === 'no'}
                onChange={() => {
                  setCanSeeSelf('no')
                  setShowTroubleshoot(true)
                }}
                className="text-[#0070E0] focus:ring-[#0070E0]"
              />
              <span>No</span>
            </label>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            If your face isn't shown here, the proctor can't see you and your exam will be revoked.
          </p>

          {canSeeSelf === 'yes' && (
            <p className="text-xs text-slate-800 font-medium pt-1">
              You may proceed with the system test.
            </p>
          )}
        </div>

        {/* Right Card: Video with Recording badge matching 15.png */}
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-300 shadow-xs">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Top Right Recording label matching 15.png */}
            <div className="absolute top-2.5 right-3 flex items-center space-x-1 text-red-600 text-xs font-semibold select-none">
              <span>Recording</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            </div>
          </div>

          <span className="text-[11px] text-slate-500 mt-2 text-center">
            Your session is being recorded.
          </span>
        </div>

      </div>

      {/* Camera Troubleshoot Modal */}
      {showTroubleshoot && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-2">Camera Troubleshooting</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              If your video feed is not displaying:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside mb-6">
              <li>Ensure browser camera permissions are set to "Allow".</li>
              <li>Close any running apps using your webcam (e.g. Zoom, Meet, FaceTime).</li>
              <li>Make sure your webcam is plugged in and not physically covered.</li>
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTroubleshoot(false)}
                className="px-5 py-2 bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </ProctorLayout>
  )
}

