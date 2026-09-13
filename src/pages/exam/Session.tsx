import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Flag, ChevronLeft, ChevronRight, Send, Camera, AlertCircle } from 'lucide-react'
import { useExamSession } from '@/contexts/ExamSessionContext'

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Session() {
  const { session, dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [currentQ, setCurrentQ] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const webcamRef = useRef<HTMLVideoElement | null>(null)

  const questions = session.questions
  const total = questions.length

  // Redirect if no session
  useEffect(() => {
    if (!session.accessCode) navigate('/exam', { replace: true })
  }, [])

  // Start webcam thumbnail
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let sRef: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      .then(s => {
        sRef = s
        setWebcamStream(s)
      })
      .catch(() => { /* no webcam, silently fail */ })
    return () => {
      if (sRef) sRef.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (webcamRef.current && webcamStream) {
      webcamRef.current.srcObject = webcamStream
      webcamRef.current.play().catch(() => {})
    }
  }, [webcamStream, questions.length])

  const assignWebcamRef = (el: HTMLVideoElement | null) => {
    webcamRef.current = el
    if (el && webcamStream) {
      el.srcObject = webcamStream
      el.play().catch(() => {})
    }
  }

  // Timer — tick every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (session.timeRemaining === 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      dispatch({ type: 'SUBMIT_EXAM' })
      navigate('/exam/results', { replace: true })
    }
  }, [session.timeRemaining])

  if (!questions.length) return null
  const q = questions[currentQ]
  const isAnswered = (i: number) => !!session.answers[i]
  const isFlagged = (i: number) => session.flaggedQuestions.includes(i)
  const answeredCount = Object.keys(session.answers).length
  const unansweredCount = total - answeredCount
  const timerCritical = session.timeRemaining < 300 // < 5 min

  function handleAnswer(key: string) {
    dispatch({ type: 'SET_ANSWER', questionIndex: currentQ, answer: key })
  }

  function handleFlag() {
    dispatch({ type: 'TOGGLE_FLAG', questionIndex: currentQ })
  }

  function handleSubmit() {
    if (timerRef.current) clearInterval(timerRef.current)
    dispatch({ type: 'SUBMIT_EXAM' })
    navigate('/exam/results', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 glass-nav px-4 py-2.5 flex items-center gap-4">
        {/* Exam title */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Mock Exam · {session.candidateName}</p>
          <p className="text-sm font-semibold text-foreground truncate">AWS Solutions Architect – Associate</p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 border font-mono text-sm font-bold transition-colors ${
          timerCritical
            ? 'bg-red-600 text-white border-red-700'
            : 'bg-slate-100 border-slate-200 text-slate-900'
        }`}>
          <span>{formatTime(session.timeRemaining)}</span>
        </div>

        {/* Webcam thumbnail */}
        <div className="hidden sm:block w-16 h-11 rounded-lg overflow-hidden border border-slate-200 bg-black flex-shrink-0">
          <video ref={assignWebcamRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        {/* Submit */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
        >
          Submit Exam
        </button>
      </header>

      <div className="flex-1 flex pt-16">
        {/* Question navigator sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Questions</p>
            <p className="text-xs text-muted-foreground mt-0.5">{answeredCount}/{total} answered</p>
          </div>
          <div className="p-4 grid grid-cols-5 gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`
                  relative w-8 h-8 rounded text-xs font-bold transition-colors
                  ${i === currentQ ? 'bg-[#0070E0] text-white shadow-xs' :
                    isAnswered(i) ? 'bg-blue-50 text-[#0070E0] border border-blue-200' :
                    'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'}
                `}
              >
                {i + 1}
                {isFlagged(i) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                )}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="px-4 pb-4 space-y-1.5 mt-auto">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200" />
              Answered
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-3 h-3 rounded-sm bg-white border border-slate-300" />
              Unanswered
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="relative w-3 h-3 rounded-sm bg-white border border-slate-300">
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              Flagged
            </div>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
          {/* Question header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Q{currentQ + 1} / {total}</span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {q.topic}
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                {q.difficulty}
              </span>
            </div>
            <button
              onClick={handleFlag}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                isFlagged(currentQ)
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {isFlagged(currentQ) ? 'Flagged for Review' : 'Flag for Review'}
            </button>
          </div>

          {/* Question text */}
          <motion.div
            key={currentQ}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6 shadow-xs">
              <p className="text-base font-bold text-slate-900 leading-relaxed">{q.question}</p>
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {q.options.map(opt => {
                const selected = session.answers[currentQ] === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswer(opt.key)}
                    className={`
                      w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150
                      ${selected
                        ? 'border-[#0070E0] bg-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-[#0070E0]/40'}
                    `}
                  >
                    <div className={`
                      flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                      ${selected ? 'border-[#0070E0] bg-[#0070E0] text-white' : 'border-slate-300 text-slate-600'}
                    `}>
                      {opt.key}
                    </div>
                    <span className={`text-sm leading-relaxed ${selected ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentQ(v => Math.max(0, v - 1))}
              disabled={currentQ === 0}
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              Previous
            </button>

            <span className="text-xs font-bold text-slate-500 lg:hidden">{answeredCount}/{total}</span>

            {currentQ < total - 1 ? (
              <button
                onClick={() => setCurrentQ(v => Math.min(total - 1, v + 1))}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-7 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-7 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Submit Exam
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowSubmitModal(false)} />
          <motion.div
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 max-w-sm w-full space-y-5"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Submit Exam?</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                You have answered <strong className="text-slate-900">{answeredCount} of {total}</strong> questions.
                {unansweredCount > 0 && (
                  <> <strong className="text-red-600 font-bold">{unansweredCount} unanswered</strong> questions will be marked incorrect.</>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 transition-colors shadow-xs"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Submit Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
