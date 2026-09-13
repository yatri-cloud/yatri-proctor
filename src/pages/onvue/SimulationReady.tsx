import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function SimulationReady() {
  const navigate = useNavigate()
  const { session } = useExamSession()

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      percentComplete={100}
      title="System test - Exam simulation - Launch simulation!"
      onPrevious={() => navigate('/exam/video-streaming')}
      onNext={() => navigate('/exam/simulation-runner')}
      nextLabel="Launch simulation"
      maxWidth="3xl"
    >
      <div className="max-w-md mx-auto my-auto text-center space-y-4 py-8">
        <h2 className="text-base font-semibold text-slate-900">
          You're almost there!
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Launch and complete this quick simulation to confirm your testing experience goes smoothly on exam day.
        </p>
      </div>
    </ProctorLayout>
  )
}

