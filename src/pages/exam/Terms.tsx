import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'
import { TERMS_CONTENT } from '@/data/terms-content'

export default function Terms() {
  const { session, dispatch } = useExamSession()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [agreed, setAgreed] = useState(true)

  function handleAgree() {
    if (!agreed) return
    dispatch({ type: 'SET_TERMS_ACCEPTED' })
    navigate('/exam/session')
  }

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      title="Candidate Agreement"
      subtitle="Read and accept the Yatri Proctor Assessment Code of Conduct."
      hideProgress
      onPrevious={() => navigate('/exam/environment')}
      onNext={handleAgree}
      nextLabel="Accept & Begin Exam"
      disableNext={!agreed}
      maxWidth="2xl"
    >
      <div className="py-2 space-y-4">
        {/* Scrollable terms */}
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans"
        >
          {TERMS_CONTENT}
        </div>

        {/* Agreement checkbox */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I have read, understand, and agree to the <strong>Yatri Proctor Testing Regulations</strong> and <strong>Assessment Non-Disclosure Agreement</strong>. I consent to continuous webcam and audio monitoring during the examination.
            </span>
          </label>
        </div>
      </div>
    </ProctorLayout>
  )
}
