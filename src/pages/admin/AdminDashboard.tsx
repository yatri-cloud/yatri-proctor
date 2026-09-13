import React, { useState, useEffect } from 'react'
import { X, Check, Copy } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getApiBaseUrl } from '@/utils/apiConfig'

interface SessionSummary {
  id: number
  accessCode: string
  candidateName: string
  candidateEmail?: string
  examTitle: string
  examCode: string
  status: string
  scorePercent: number | null
  speakerPass: boolean | null
  micPass: boolean | null
  webcamPass: boolean | null
  mobilePaired: boolean | null
  personPhotoCaptured: boolean | null
  roomScansComplete: boolean | null
  idVerified: boolean | null
  termsAccepted: boolean | null
  systemCheckPassed: boolean | null
  networkMbps: number | null
  timeRemainingSeconds: number | null
  createdAt: string
  photoCount: number
}

interface SessionDetail extends SessionSummary {
  photos: {
    id: number
    photoType: string
    direction: string | null
    idSide: string | null
    capturedAt: string
    url: string
  }[]
  answers: {
    questionId: number
    questionText: string
    topic: string
    difficulty: string
    selectedAnswer: string
    correctAnswer: string
    correct: boolean
    flagged: boolean
  }[]
}

interface AccessCodeItem {
  id: number
  code: string
  candidateName: string
  examTitle: string
  examCode: string
  durationMinutes: number
  questionCount: number
  validUntil: string
  createdAt: string
  expired: boolean
}

interface AdminStats {
  totalSessions: number
  inProgressSessions: number
  completedSessions: number
  flaggedSessions: number
  averageScorePercent: number
  passRatePercent: number
}

interface QuestionItem {
  id: number
  topic: string
  difficulty: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xs">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0070E0]">{label}</p>
    <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900">{value}</p>
  </div>
)

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<string>('overview')
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [accessCodes, setAccessCodes] = useState<AccessCodeItem[]>([])
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalSessions: 0,
    inProgressSessions: 0,
    completedSessions: 0,
    flaggedSessions: 0,
    averageScorePercent: 0,
    passRatePercent: 0,
  })

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Inspection Modal
  const [inspectSessionId, setInspectSessionId] = useState<number | null>(null)
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [proctorMessage, setProctorMessage] = useState('')
  const [messageSentStatus, setMessageSentStatus] = useState(false)

  // Create Code Modal
  const [showCreateCode, setShowCreateCode] = useState(false)
  const [newCodeForm, setNewCodeForm] = useState({
    candidateName: '',
    examTitle: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    durationMinutes: 65,
    questionCount: 20,
  })

  // Create Question Modal
  const [showCreateQuestion, setShowCreateQuestion] = useState(false)
  const [newQuestionForm, setNewQuestionForm] = useState({
    topic: 'Cloud Architecture',
    difficulty: 'MEDIUM',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
  })

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const api = getApiBaseUrl()
      const [sessionsRes, codesRes, statsRes, questionsRes] = await Promise.all([
        fetch(`${api}/api/v1/admin/sessions`).catch(() => null),
        fetch(`${api}/api/v1/admin/access-codes`).catch(() => null),
        fetch(`${api}/api/v1/admin/stats`).catch(() => null),
        fetch(`${api}/api/v1/admin/questions`).catch(() => null),
      ])

      if (sessionsRes && sessionsRes.ok) {
        setSessions(await sessionsRes.json())
      }
      if (codesRes && codesRes.ok) {
        setAccessCodes(await codesRes.json())
      }
      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json())
      }
      if (questionsRes && questionsRes.ok) {
        setQuestions(await questionsRes.json())
      }
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleInspectSession = async (id: number) => {
    setInspectSessionId(id)
    setLoadingDetail(true)
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/sessions/${id}`)
      if (res.ok) {
        setSessionDetail(await res.json())
      }
    } catch (err) {
      console.error('Failed to load session detail:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/admin/sessions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: 'Proctor Admin action' }),
      })
      fetchData()
      if (inspectSessionId === id) {
        handleInspectSession(id)
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!inspectSessionId || !proctorMessage.trim()) return
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/admin/sessions/${inspectSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: proctorMessage }),
      })
      setMessageSentStatus(true)
      setProctorMessage('')
      setTimeout(() => setMessageSentStatus(false), 3000)
    } catch (err) {
      console.error('Failed to send proctor message:', err)
    }
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/access-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCodeForm),
      })
      if (res.ok) {
        setShowCreateCode(false)
        setNewCodeForm({
          candidateName: '',
          examTitle: 'AWS Certified Solutions Architect – Associate',
          examCode: 'SAA-C03',
          durationMinutes: 65,
          questionCount: 20,
        })
        fetchData()
      }
    } catch (err) {
      console.error('Failed to create access code:', err)
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestionForm),
      })
      if (res.ok) {
        setShowCreateQuestion(false)
        setNewQuestionForm({
          topic: 'Cloud Architecture',
          difficulty: 'MEDIUM',
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
          explanation: '',
        })
        fetchData()
      }
    } catch (err) {
      console.error('Failed to create question:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.accessCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.examTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      statusFilter === 'ALL'
        ? currentTab === 'flagged' ? s.status === 'FLAGGED' : true
        : s.status === statusFilter
    return matchesSearch && matchesFilter
  })

  // Simulated month session data matching screenshot
  const monthlyData = [
    { month: 'Apr 2026', count: 12, max: 25 },
    { month: 'May 2026', count: 18, max: 25 },
    { month: 'Jun 2026', count: 15, max: 25 },
    { month: 'Jul 2026', count: 22, max: 25 },
    { month: 'Aug 2026', count: 19, max: 25 },
    { month: 'Sep 2026', count: sessions.length, max: 25 },
  ]

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onRefresh={fetchData}
      loading={loading}
    >
      {/* 1. Header Band matching exact screenshot layout */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#0070E0]/[0.08] via-blue-50/50 to-white p-6 md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#0070E0]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="relative space-y-1.5">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {currentTab === 'access-codes' ? 'Access Codes' : currentTab === 'questions' ? 'Question Bank' : 'Proctoring'}{' '}
            <span className="text-[#0070E0]">Overview</span>
          </h1>
          <p className="text-xs text-slate-500">
            Live enterprise session monitoring, candidate verification, and secure exam delivery.
          </p>
        </div>
      </div>

      {/* 2. Platform Totals KPI Band matching screenshot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sessions" value={stats.totalSessions || sessions.length} />
        <StatCard label="In-Progress Exams" value={stats.inProgressSessions || sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'CREATED').length} />
        <StatCard label="Flagged Sessions" value={stats.flaggedSessions || sessions.filter(s => s.status === 'FLAGGED').length} />
        <StatCard label="Active Access Codes" value={accessCodes.length} />
      </div>

      {/* 3. Main Split Grid matching screenshot */}
      {(currentTab === 'overview' || currentTab === 'sessions' || currentTab === 'flagged') && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] items-start">
          
          {/* Left Wide Card: Sessions Table */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-xs">
            {/* Card Header with soft gradient tint matching screenshot */}
            <div className="-mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-5 rounded-t-2xl border-b border-blue-100 bg-gradient-to-r from-blue-50/70 to-transparent px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0070E0]">
                  {currentTab === 'flagged' ? 'Security Alerts' : 'Live Monitoring'}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold tracking-tight text-slate-900">
                  {currentTab === 'flagged' ? 'Flagged Candidate Sessions' : 'Active Candidate Sessions'}
                </h2>
                <p className="text-xs text-slate-500">The candidates taking exams and their verification states.</p>
              </div>

              {/* Action Button - Solid full color, no icon left of text */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateCode(true)}
                  className="px-4 py-2 rounded-xl bg-[#0070E0] text-white text-xs font-bold hover:bg-[#0060c0] active:bg-[#0054a8] transition-colors shadow-xs"
                >
                  New Code
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search candidate, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0070E0] font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter sessions by status"
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CREATED">Created</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FLAGGED">Flagged</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>

            {/* Table with odd-row tints matching screenshot */}
            {filteredSessions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No sessions found. Start a test check-in with an access code to see it live here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 pr-3">Session</th>
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 odd:bg-blue-50/20 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 pr-3 font-mono text-slate-600 font-bold">
                          #{s.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.candidateName}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{s.examTitle}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {s.accessCode}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              s.status === 'FLAGGED'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : s.status === 'IN_PROGRESS' || s.status === 'CREATED'
                                ? 'border-blue-200 bg-blue-50 text-[#0070E0]'
                                : s.status === 'COMPLETED'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 text-sm">
                          {s.scorePercent !== null ? `${s.scorePercent}%` : '—'}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {/* Full solid color Inspect button */}
                          <button
                            onClick={() => handleInspectSession(s.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0070E0] hover:bg-[#0060c0] text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Card: Trend by Month matching screenshot */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
            <div className="-mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-5 rounded-t-2xl border-b border-blue-100 bg-gradient-to-r from-blue-50/70 to-transparent px-5 md:px-6 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0070E0]">Trend</p>
              <h2 className="mt-0.5 font-display text-lg font-bold tracking-tight text-slate-900">Sessions by month</h2>
              <p className="text-xs text-slate-500">Gross exam sessions over the last six months.</p>
            </div>

            {/* Monthly Trend Bars matching screenshot */}
            <div className="flex flex-col gap-3.5">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-xs">
                  <span className="w-20 font-bold text-slate-700">{m.month}</span>
                  <div className="flex-1 mx-3 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0070E0] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (m.count / m.max) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono font-bold text-slate-900">{m.count}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions Card - Solid full color buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 mb-2">Platform Quick Controls</div>
              <button
                onClick={() => setShowCreateCode(true)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-[#0070E0] text-white hover:bg-[#0060c0] text-xs font-bold transition-colors shadow-xs"
              >
                Generate Candidate Access Code
              </button>
              <button
                onClick={() => setShowCreateQuestion(true)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs"
              >
                Add Question to Bank
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. Tab 2: Access Codes */}
      {currentTab === 'access-codes' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assessment Access Codes</h2>
              <p className="text-xs text-slate-500">Single-use and pre-authorized candidate exam voucher codes.</p>
            </div>
            <button
              onClick={() => setShowCreateCode(true)}
              className="px-4 py-2 rounded-xl bg-[#0070E0] text-white text-xs font-bold hover:bg-[#0060c0] shadow-xs"
            >
              Generate New Code
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 pr-3">Access Code</th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Exam</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Copy</th>
                </tr>
              </thead>
              <tbody>
                {accessCodes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 odd:bg-blue-50/20">
                    <td className="py-3 pr-3 font-mono font-bold text-slate-900 text-sm">
                      {c.code}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{c.candidateName}</td>
                    <td className="py-3 px-3 text-slate-700">{c.examTitle} ({c.examCode})</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{c.durationMinutes} mins ({c.questionCount} Qs)</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.expired ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {c.expired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        onClick={() => copyToClipboard(c.code)}
                        className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
                        title="Copy code"
                      >
                        {copiedCode === c.code ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 3: Question Bank */}
      {currentTab === 'questions' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Question Catalog ({questions.length})</h2>
              <p className="text-xs text-slate-500">Live question bank utilized for proctored examination simulations.</p>
            </div>
            <button
              onClick={() => setShowCreateQuestion(true)}
              className="px-4 py-2 rounded-xl bg-[#0070E0] text-white text-xs font-bold hover:bg-[#0060c0] shadow-xs"
            >
              Add Question
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-[#0070E0] text-white px-2.5 py-0.5 rounded">
                    {q.topic}
                  </span>
                  <span className="font-mono text-slate-500 font-bold text-[11px]">#{q.id} &bull; {q.difficulty}</span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">{q.questionText}</p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 pt-1">
                  <div className={q.correctAnswer === 'A' ? 'font-bold text-[#0070E0]' : ''}>A. {q.optionA}</div>
                  <div className={q.correctAnswer === 'B' ? 'font-bold text-[#0070E0]' : ''}>B. {q.optionB}</div>
                  <div className={q.correctAnswer === 'C' ? 'font-bold text-[#0070E0]' : ''}>C. {q.optionC}</div>
                  <div className={q.correctAnswer === 'D' ? 'font-bold text-[#0070E0]' : ''}>D. {q.optionD}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Inspect Session */}
      {inspectSessionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Candidate Session #{inspectSessionId}
                </h3>
                <p className="text-xs text-slate-500">Live examination integrity inspection and proctor communication.</p>
              </div>
              <button
                onClick={() => setInspectSessionId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Loading candidate session data...
              </div>
            ) : sessionDetail ? (
              <div className="space-y-5 text-xs">
                {/* Status bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Candidate</span>
                    <strong className="text-slate-900 font-bold">{sessionDetail.candidateName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Access Code</span>
                    <strong className="font-mono text-slate-900 font-bold">{sessionDetail.accessCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                    <span className="font-bold text-[#0070E0]">{sessionDetail.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hardware</span>
                    <span className="text-slate-800 font-bold">Verified</span>
                  </div>
                </div>

                {/* Proctor Live Chat */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Broadcast Proctor Message to Candidate Screen
                    </span>
                    {messageSentStatus && (
                      <span className="text-[11px] font-bold text-emerald-600">Dispatched!</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Please face the webcam directly or adjust your lighting..."
                      value={proctorMessage}
                      onChange={(e) => setProctorMessage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#0070E0]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!proctorMessage.trim()}
                      className="px-5 py-2 rounded-lg bg-[#0070E0] text-white text-xs font-bold hover:bg-[#0060c0] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs"
                    >
                      Send Alert
                    </button>
                  </div>
                </div>

                {/* Status action buttons - Solid full color */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-bold">Session Interventions:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(sessionDetail.id, 'FLAGGED')}
                      className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs shadow-xs transition-colors"
                    >
                      Flag Violation
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sessionDetail.id, 'TERMINATED')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      Terminate Exam
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sessionDetail.id, 'COMPLETED')}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL: Create Access Code */}
      {showCreateCode && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCode} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Generate Access Code</h3>
              <button
                type="button"
                onClick={() => setShowCreateCode(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yatharth Chauhan"
                  value={newCodeForm.candidateName}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, candidateName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={newCodeForm.examTitle}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, examTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Exam Code</label>
                  <input
                    type="text"
                    required
                    value={newCodeForm.examCode}
                    onChange={(e) => setNewCodeForm({ ...newCodeForm, examCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={newCodeForm.durationMinutes}
                    onChange={(e) => setNewCodeForm({ ...newCodeForm, durationMinutes: +e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateCode(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#0060c0] shadow-xs"
              >
                Create Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Create Question */}
      {showCreateQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuestion} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Question to Bank</h3>
              <button
                type="button"
                onClick={() => setShowCreateQuestion(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.topic}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Difficulty</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionForm.questionText}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, questionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option A</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optionA}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionA: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option B</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optionB}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionB: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option C</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optionC}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionC: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option D</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optionD}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionD: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Correct Answer</label>
                <select
                  value={newQuestionForm.correctAnswer}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correctAnswer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Explanation</label>
                <input
                  type="text"
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateQuestion(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#0060c0] shadow-xs"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  )
}
