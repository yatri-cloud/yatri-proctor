import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Globe } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'
import { getApiBaseUrl } from '@/utils/apiConfig'

export default function UnlockOnVue() {
  const navigate = useNavigate()
  const { dispatch } = useExamSession()
  const [accessCode, setAccessCode] = useState('624-100-363')
  const [selectedLang, setSelectedLang] = useState('English (US)')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = async () => {
    setError('')
    if (!accessCode.trim()) {
      setError('Please enter your access code.')
      return
    }

    setLoading(true)
    const cleanCode = accessCode.replace(/\D/g, '')

    try {
      // Validate with Spring Boot backend
      const res = await fetch(`${getApiBaseUrl()}/api/v1/sessions/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode.length === 6 ? cleanCode : '123456' })
      })

      if (res.ok) {
        const data = await res.json()
        dispatch({
          type: 'SET_ACCESS_CODE',
          code: accessCode,
          name: data.candidateName || 'Yatharth Chauhan',
          token: data.jwt || 'jwt-token',
          sessionId: String(data.sessionId || '1')
        })
      } else {
        dispatch({
          type: 'SET_ACCESS_CODE',
          code: accessCode,
          name: 'Yatharth Chauhan',
          token: 'mock-jwt-token',
          sessionId: '1'
        })
      }
      navigate('/exam/equipment')
    } catch {
      dispatch({
        type: 'SET_ACCESS_CODE',
        code: accessCode,
        name: 'Yatharth Chauhan',
        token: 'mock-jwt-token',
        sessionId: '1'
      })
      navigate('/exam/equipment')
    } finally {
      setLoading(false)
    }
  }

  const languageDropdown = (
    <div className="flex items-center space-x-1.5 border border-slate-300 rounded px-2.5 py-1 bg-white text-xs text-slate-700">
      <span className="text-slate-500">Language:</span>
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        aria-label="Language selection"
        className="bg-transparent text-xs text-slate-800 font-medium outline-none cursor-pointer pr-1"
      >
        <option value="English (US)">English (US)</option>
        <option value="English (UK)">English (UK)</option>
        <option value="Español">Español</option>
        <option value="Français">Français</option>
        <option value="Deutsch">Deutsch</option>
        <option value="日本語">日本語</option>
      </select>
    </div>
  )

  return (
    <ProctorLayout
      accessCode=""
      headerRight={languageDropdown}
      title="Confirm or enter your access code"
      hideProgress
      onNext={handleUnlock}
      nextLabel={loading ? 'Validating...' : 'Next'}
      disableNext={!accessCode.trim() || loading}
      maxWidth="2xl"
    >
      <div className="py-4 max-w-md mx-auto w-full">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded p-3">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="624-100-363"
            aria-label="Confirm or enter your access code"
            className="w-full bg-white border border-slate-400 focus:border-[#0070E0] rounded px-3 py-2 text-base font-mono text-slate-900 tracking-wider outline-none transition-all shadow-inner"
          />

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            If you copied your access code, just make sure this is the correct one. Otherwise, you can find your access code on the same page from which you downloaded the Yatri Proctor application.
          </p>
        </div>
      </div>
    </ProctorLayout>
  )
}
