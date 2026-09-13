import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Flag, Clock, Calculator, FileText, ArrowRight, Shield } from 'lucide-react'
import { YatriProctorLogo } from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function SimulationRunner() {
  const navigate = useNavigate()
  const { session } = useExamSession()

  const [stage, setStage] = useState<'loading' | 'welcome' | 'question' | 'complete'>('loading')
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60)
  const [flagged, setFlagged] = useState<boolean>(false)

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    check1: true,
    check2: true,
    check3: true,
  })

  // PIP Webcam
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    let localStream: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
    })
      .then(s => {
        localStream = s
        setStream(s)
      })
      .catch(err => {
        console.warn('Simulation camera access warning:', err)
      })

    return () => {
      if (localStream) localStream.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stage, stream])

  const assignVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (el && stream) {
      el.srcObject = stream
      el.play().catch(() => {})
    }
  }

  // Transition from loading to welcome after 1.2s
  useEffect(() => {
    if (stage === 'loading') {
      const timer = setTimeout(() => setStage('welcome'), 1200)
      return () => clearTimeout(timer)
    }
  }, [stage])

  // Timer countdown
  useEffect(() => {
    if (stage === 'question' && secondsRemaining > 0) {
      const timer = setInterval(() => setSecondsRemaining(s => s - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [stage, secondsRemaining])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `00:${m}:${s}`
  }

  // Phase 1: Loading Screen
  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[440px] flex flex-col justify-between">
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <YatriProctorLogo />
            <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
              Code: {session.accessCode || '624-100-363'}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 flex-1">
            <div className="w-14 h-14 rounded-full border-3 border-primary border-t-transparent animate-spin" />
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                Initializing Assessment Environment
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Please wait while Yatri Proctor loads the test delivery interface...
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3 text-xs text-slate-400 text-center border-t border-slate-200">
            Yatri Cloud Secure Assessment Engine
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-slate-900">
      
      {/* Simulation Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <YatriProctorLogo />
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-900">Assessment Delivery Simulation</div>
            <div className="text-[11px] text-slate-500">Candidate: Yatharth Chauhan</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold mr-1.5">Time Remaining:</span>
            <span className="text-sm font-bold font-mono text-slate-900">{formatTimer(secondsRemaining)}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <button className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Calculator
            </button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Scratchpad
            </button>
          </div>
        </div>
      </header>

      {/* Main Simulation Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-between relative">
        
        {/* PIP Floating Webcam Video */}
        <div className="absolute top-8 right-8 z-30 w-44 aspect-video bg-slate-950 rounded-xl overflow-hidden border-2 border-white shadow-xl hidden md:block">
          <video
            ref={assignVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
          />
          {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 text-[10px] space-y-1">
              <div className="w-3.5 h-3.5 border-2 border-[#0070E0] border-t-transparent rounded-full animate-spin" />
              <span>Camera feed...</span>
            </div>
          )}
          <div className="absolute top-1.5 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs">
            REC
          </div>
        </div>

        {/* Phase 2: Welcome Screen */}
        {stage === 'welcome' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto my-auto w-full space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome to the Assessment Simulation
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Familiarize yourself with the interface, keyboard shortcuts, and exam controls.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <strong className="text-sm text-slate-900 block">Navigation Instructions:</strong>
                <p>&bull; Use the bottom navigation buttons to move between questions.</p>
                <p>&bull; Mark challenging questions for later review using the <strong>Flag for Review</strong> toggle.</p>
                <p>&bull; Keyboard shortcuts: Press <strong>Alt+N</strong> for Next and <strong>Alt+P</strong> for Previous.</p>
                <p>&bull; Your camera monitoring feed remains active in the upper right corner.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                <strong className="text-slate-900">Practice Session:</strong> Responses entered in this simulation are for interface practice only and do not affect your actual certification record.
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Question Interface */}
        {stage === 'question' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-3xl mx-auto my-auto w-full space-y-6 animate-in fade-in duration-200">
            
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="text-lg font-bold text-slate-900">
                Question 1 of 1 (Practice)
              </div>
              
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700 select-none bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={flagged}
                  onChange={(e) => setFlagged(e.target.checked)}
                  className="rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0]"
                />
                <span>Flag for Review</span>
              </label>
            </div>

            {/* Question Body */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                Before beginning your official examination, confirm that you understand the following testing regulations:
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex items-start space-x-3 p-3.5 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.check1}
                    onChange={(e) => setChecklist({ ...checklist, check1: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0]"
                  />
                  <span className="text-xs text-slate-700 leading-normal">
                    I understand that speaking aloud, whispering, or covering my mouth is prohibited during the session.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3.5 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.check2}
                    onChange={(e) => setChecklist({ ...checklist, check2: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0]"
                  />
                  <span className="text-xs text-slate-700 leading-normal">
                    I understand that leaving the camera frame or having another person enter the room may invalidate the exam.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3.5 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.check3}
                    onChange={(e) => setChecklist({ ...checklist, check3: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0]"
                  />
                  <span className="text-xs text-slate-700 leading-normal">
                    I confirm that smartwatches, phones, and unapproved materials have been removed from my desk area.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Complete Screen */}
        {stage === 'complete' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto my-auto w-full text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-[#0070E0] flex items-center justify-center mx-auto shadow-xs font-bold text-2xl">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Simulation Successfully Completed
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your computer and browser are fully compatible with Yatri Proctor. Click <strong>End Session</strong> to view your readiness report.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs mt-8">
          <button
            onClick={() => navigate('/exam/completed')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
          >
            End Session
          </button>

          <div className="flex items-center space-x-3">
            {stage === 'question' && (
              <button
                onClick={() => setStage('welcome')}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                Previous
              </button>
            )}

            {stage === 'welcome' && (
              <button
                onClick={() => setStage('question')}
                className="px-7 py-2.5 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#005bb8] shadow-xs transition-colors"
              >
                Next
              </button>
            )}

            {stage === 'question' && (
              <button
                onClick={() => setStage('complete')}
                className="px-7 py-2.5 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#005bb8] shadow-xs transition-colors"
              >
                Next
              </button>
            )}

            {stage === 'complete' && (
              <button
                onClick={() => navigate('/exam/completed')}
                className="px-7 py-2.5 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#005bb8] shadow-xs transition-colors"
              >
                View System Test Report
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
