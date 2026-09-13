import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Germany', 'France', 'UAE', 'Japan', 'Other']
const ID_TYPES: Record<string, string[]> = {
  India: ['Aadhaar Card', 'Passport', 'Driving License', 'PAN Card', 'Voter ID'],
  'United States': ['Driver\'s License', 'Passport', 'State ID', 'Military ID'],
  default: ['Passport', 'National ID Card', 'Driver\'s License'],
}

export default function IdCountry() {
  const navigate = useNavigate()
  const [country, setCountry] = useState('')
  const [idType, setIdType] = useState('')

  const idTypes = country ? (ID_TYPES[country] ?? ID_TYPES.default) : []

  function handleContinue() {
    if (!country || !idType) return
    navigate('/mobile/id-capture')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="step-pill mb-3 inline-flex">Step 10 of 19 — ID Selection</span>
          <div className="mb-3 flex items-center justify-center">
            <img src="/logo-64.png" alt="Yatri Cloud" className="w-12 h-12 rounded-full object-contain shadow-xs" />
          </div>
          <h1 className="font-display text-xl font-bold">Select Your ID</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose the country and type of government-issued ID you will present.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide" htmlFor="country">Country</label>
            <select
              id="country"
              value={country}
              onChange={e => { setCountry(e.target.value); setIdType('') }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
            >
              <option value="">Select country…</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {country && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide" htmlFor="idtype">ID Type</label>
              <select
                id="idtype"
                value={idType}
                onChange={e => setIdType(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
              >
                <option value="">Select ID type…</option>
                {idTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!country || !idType}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            Continue to ID Capture
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Your ID will be captured via live camera only — no file upload. Images are encrypted and deleted after 30 days.
        </p>
      </div>
    </div>
  )
}
