import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, FileCheck } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function ExamDownload() {
  const navigate = useNavigate()
  const { session } = useExamSession()
  const [progress, setProgress] = useState(0)
  const [downloadedMB, setDownloadedMB] = useState('0.0')
  const totalMB = '42.8'

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        const next = prev + 5
        setDownloadedMB(((next / 100) * 42.8).toFixed(1))
        return next
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  const isComplete = progress >= 100

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      percentComplete={57}
      title="Secure Package Download"
      subtitle="Downloading encrypted test delivery assets and questions."
      onPrevious={() => navigate('/exam/network')}
      onNext={() => navigate('/exam/secure-browser')}
      disableNext={!isComplete}
      maxWidth="2xl"
    >
      <div className="py-6 space-y-6">
        <p className="text-sm text-slate-600">
          Yatri Proctor is pre-caching assessment content and security monitoring modules locally to ensure uninterrupted exam delivery even in the event of momentary network fluctuations.
        </p>

        {/* Download Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Yatri Proctor Encrypted Exam Payload
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {downloadedMB} MB / {totalMB} MB
              </span>
            </div>
            <span className="text-sm font-bold font-mono text-[#0070E0]">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0070E0] h-full rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {isComplete ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-semibold">
              Encrypted exam package verified and ready for security environment check.
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Transferring secure modules...</span>
              <span className="text-[#0070E0] font-bold">Please do not close this window</span>
            </div>
          )}
        </div>
      </div>
    </ProctorLayout>
  )
}
