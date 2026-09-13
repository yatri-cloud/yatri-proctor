import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { YatriProctorLogo } from '@/components/ProctorLayout'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { ShieldCheck, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'

export default function CandidatePortal() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [copied, setCopied] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authDefaultLogin, setAuthDefaultLogin] = useState(true)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [accessCode, setAccessCode] = useState('624-100-363')

  const copyCode = () => {
    navigator.clipboard.writeText(accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const candidateDisplayName = user ? user.fullName : 'Candidate'
  const candidateDisplayId = user ? `YC-${String(user.id).padStart(4, '0')}` : 'YC-9830218'

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <YatriProctorLogo />
            </Link>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">Candidate Portal</span>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0070E0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">{candidateDisplayName}</div>
                    <div className="text-[10px] text-slate-500">{candidateDisplayId}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900 truncate">{user.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0070E0]">
                        <ShieldCheck className="w-3 h-3" />
                        {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Verified Candidate'}
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#0070E0]" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthDefaultLogin(true)
                    setAuthModalOpen(true)
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-[#0070E0] px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthDefaultLogin(false)
                    setAuthModalOpen(true)
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  Register
                </button>
              </div>
            )}

            <button
              onClick={() => navigate('/exam/unlock')}
              className="bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Start System Check
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        
        {/* System Test Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Have you tested your computer for online proctoring?
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Run a Yatri Proctor system test before your exam day to verify your microphone, speakers, webcam, and internet connection pass all integrity checks.
            </p>
          </div>
          <button
            onClick={() => navigate('/exam/unlock')}
            className="bg-[#0070E0] hover:bg-[#005bb8] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            Run a system test
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Appointment Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirmed Assessment Appointment
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                  Scheduled & Ready
                </span>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      AWS Certified Solutions Architect – Associate (SAA-C03)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Online Proctored &bull; Delivery: Yatri Proctor Engine
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:pl-6 border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Duration</div>
                    <div className="text-lg font-bold text-slate-900">65 Minutes</div>
                  </div>
                </div>

                {/* Appointment timing */}
                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">Candidate</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {candidateDisplayName}
                    </div>
                    <div className="text-xs text-slate-500">{candidateDisplayId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">Single-Use Access Code</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-base font-bold text-[#0070E0] bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-xs">
                        {accessCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate('/exam/unlock')}
                    className="flex-1 sm:flex-none bg-[#0070E0] hover:bg-[#005bb8] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all"
                  >
                    Start System Readiness Check
                  </button>

                  <button
                    onClick={() => navigate('/exam/mobile-pair')}
                    className="flex-1 sm:flex-none bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-colors"
                  >
                    Direct Exam Check-In
                  </button>
                </div>
              </div>
            </div>

            {/* Assessment Checklist */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                Assessment Integrity Rules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                <div>
                  <strong className="text-slate-900 block mb-0.5">Private Room</strong>
                  Ensure no other individuals enter or speak during the entire exam.
                </div>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Valid Photo ID</strong>
                  Government-issued Passport, Driver’s License, or National ID card.
                </div>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Clear Desk</strong>
                  Disconnect extra monitors, remove all paper, books, and electronic devices.
                </div>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Mobile Phone</strong>
                  Required during check-in to photograph your workspace and identity card.
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                System Diagnostics Required
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Yatri Proctor validates all audio, video, network, and application security prerequisites in real time before exam entry.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3.5 text-xs text-slate-700 leading-relaxed">
                  Click <strong>Start System Readiness Check</strong> on the left to begin your verification. All stages are completed sequentially.
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="text-slate-900 font-bold text-xs mb-1">
                Yatri Cloud Support
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Questions or issues with your verification? Contact candidate support at <strong className="text-slate-800">support@yatricloud.com</strong>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Login / Signup Modal */}
      <LoginModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultIsLogin={authDefaultLogin}
      />
    </div>
  )
}
