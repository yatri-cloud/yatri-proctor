import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

const CHECKLIST = [
  { id: 'alone', label: 'I am alone in the room', detail: 'No other people are present or can enter or view your screen during the session.' },
  { id: 'devices', label: 'No other electronic devices are accessible', detail: 'Secondary phones, tablets, smart watches, or headphones are out of arm’s reach.' },
  { id: 'desk', label: 'My desk and testing area are clear', detail: 'No paper, books, pens, notes, or unauthorized study materials within reach.' },
  { id: 'quiet', label: 'The testing space is quiet and private', detail: 'Minimal background noise, televisions, or radios that could interrupt the exam.' },
  { id: 'lighting', label: 'Lighting is adequate and direct', detail: 'Face is clearly illuminated from the front without dark shadows or harsh backlighting.' },
]

export default function Environment() {
  const navigate = useNavigate()
  const { session } = useExamSession()
  const [checked, setChecked] = useState<Record<string, boolean>>({
    alone: true,
    devices: true,
    desk: true,
    quiet: true,
    lighting: true,
  })

  const allChecked = CHECKLIST.every(item => checked[item.id])

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      title="Environment Verification"
      subtitle="Confirm testing room compliance with Yatri Proctor standards."
      hideProgress
      onPrevious={() => navigate('/exam/mobile-pair')}
      onNext={() => navigate('/exam/terms')}
      nextLabel="Accept & Continue"
      disableNext={!allChecked}
      maxWidth="2xl"
    >
      <div className="py-2 space-y-4">
        <p className="text-xs text-slate-600">
          Your remote proctor verifies room compliance via your camera and mobile room scans. Review and check all requirements:
        </p>

        <div className="space-y-2.5">
          {CHECKLIST.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`w-full flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                checked[item.id]
                  ? 'border-[#0070E0] bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked[item.id]}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {item.detail}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ProctorLayout>
  )
}
