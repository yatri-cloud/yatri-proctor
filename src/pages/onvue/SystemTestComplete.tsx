import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function SystemTestComplete() {
  const navigate = useNavigate()
  const { session } = useExamSession()

  return (
    <ProctorLayout
      accessCode={session.accessCode || '558-301-465'}
      title="Congratulations you've completed an anonymous system test."
      hideProgress
      onNext={() => navigate('/')}
      nextLabel="Close"
      maxWidth="3xl"
    >
      <div className="max-w-xl mx-auto my-auto w-full space-y-5 py-2">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 rounded-full bg-[#52a447] text-white flex items-center justify-center shadow-xs">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">
            What's next?
          </h2>

          <ol className="text-xs text-slate-700 space-y-3 list-decimal list-inside leading-relaxed">
            <li>
              Register for an exam.
            </li>
            <li>
              You will then receive a confirmation email with a link to run a system test on the device and network you plan to use on exam day.
            </li>
          </ol>

          <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            Completion of a successful system test is required for check-in on exam day.
          </p>
        </div>
      </div>
    </ProctorLayout>
  )
}

