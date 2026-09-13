import React, { useState, useEffect } from 'react'
import { X, Check, Copy, Edit, Trash2, UserPlus, UserCheck, Shield, Phone, Globe, Lock, Search } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getApiBaseUrl } from '@/utils/apiConfig'
import { UserProfile } from '@/lib/auth'

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
  const [users, setUsers] = useState<UserProfile[]>([])
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

  // Delete Session Confirmation Modal
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null)

  // Access Codes CRUD
  const [showCreateCode, setShowCreateCode] = useState(false)
  const [newCodeForm, setNewCodeForm] = useState({
    code: '',
    candidateName: '',
    examTitle: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    durationMinutes: 65,
    questionCount: 20,
  })
  const [editCodeItem, setEditCodeItem] = useState<AccessCodeItem | null>(null)
  const [deleteCodeId, setDeleteCodeId] = useState<number | null>(null)

  // Questions CRUD
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
  const [editQuestionItem, setEditQuestionItem] = useState<QuestionItem | null>(null)
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null)

  // Users CRUD
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'ROLE_USER',
    phoneNumber: '',
    country: 'IN',
  })
  const [editUserItem, setEditUserItem] = useState<UserProfile | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const api = getApiBaseUrl()
      const [sessionsRes, codesRes, statsRes, questionsRes, usersRes] = await Promise.all([
        fetch(`${api}/api/v1/admin/sessions`).catch(() => null),
        fetch(`${api}/api/v1/admin/access-codes`).catch(() => null),
        fetch(`${api}/api/v1/admin/stats`).catch(() => null),
        fetch(`${api}/api/v1/admin/questions`).catch(() => null),
        fetch(`${api}/api/v1/admin/users`).catch(() => null),
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
      if (usersRes && usersRes.ok) {
        setUsers(await usersRes.json())
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

  // Inspect session
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

  const handleDeleteSession = async (id: number) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/admin/sessions/${id}`, {
        method: 'DELETE',
      })
      setDeleteSessionId(null)
      if (inspectSessionId === id) setInspectSessionId(null)
      fetchData()
    } catch (err) {
      console.error('Failed to delete session:', err)
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

  // ── Access Codes Actions ──
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
          code: '',
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

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCodeItem) return
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/access-codes/${editCodeItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCodeItem),
      })
      if (res.ok) {
        setEditCodeItem(null)
        fetchData()
      }
    } catch (err) {
      console.error('Failed to update access code:', err)
    }
  }

  const handleDeleteCode = async (id: number) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/admin/access-codes/${id}`, {
        method: 'DELETE',
      })
      setDeleteCodeId(null)
      fetchData()
    } catch (err) {
      console.error('Failed to delete access code:', err)
    }
  }

  // ── Question Bank Actions ──
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

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editQuestionItem) return
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/questions/${editQuestionItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editQuestionItem),
      })
      if (res.ok) {
        setEditQuestionItem(null)
        fetchData()
      }
    } catch (err) {
      console.error('Failed to update question:', err)
    }
  }

  const handleDeleteQuestion = async (id: number) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/admin/questions/${id}`, {
        method: 'DELETE',
      })
      setDeleteQuestionId(null)
      fetchData()
    } catch (err) {
      console.error('Failed to delete question:', err)
    }
  }

  // ── User Management Actions ──
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      })
      if (res.ok) {
        setShowCreateUser(false)
        setNewUserForm({
          email: '',
          password: '',
          fullName: '',
          role: 'ROLE_USER',
          phoneNumber: '',
          country: 'IN',
        })
        fetchData()
      }
    } catch (err) {
      console.error('Failed to create user:', err)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUserItem) return
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/admin/users/${editUserItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editUserItem.fullName,
          role: editUserItem.role,
          phoneNumber: editUserItem.phoneNumber,
          country: editUserItem.country,
          active: editUserItem.active,
        }),
      })
      if (res.ok) {
        setEditUserItem(null)
        fetchData()
      }
    } catch (err) {
      console.error('Failed to update user:', err)
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/admin/users/${id}`, {
        method: 'DELETE',
      })
      setDeleteUserId(null)
      fetchData()
    } catch (err) {
      console.error('Failed to delete user:', err)
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

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      {/* 1. Header Band */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#0070E0]/[0.08] via-blue-50/50 to-white p-6 md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#0070E0]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="relative space-y-1.5">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {currentTab === 'users' ? 'User Accounts & Candidate Access' : 'Assessment Proctoring Engine'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Complete end-to-end administration: sessions, voucher codes, question catalog, and candidate accounts.
          </p>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={stats.totalSessions} />
        <StatCard label="Active In-Progress" value={stats.inProgressSessions} />
        <StatCard label="Completed Exams" value={stats.completedSessions} />
        <StatCard label="Registered Users" value={users.length} />
      </div>

      {/* 3. Tab 1 & Overview: Sessions */}
      {(currentTab === 'overview' || currentTab === 'sessions' || currentTab === 'flagged') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Card: Session List */}
          <div className="lg:col-span-2 bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
            <div className="-mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-5 rounded-t-2xl border-b border-blue-100 bg-gradient-to-r from-blue-50/70 to-transparent px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0070E0]">Examinations</p>
                <h2 className="mt-0.5 font-display text-lg font-bold tracking-tight text-slate-900">
                  {currentTab === 'flagged' ? 'Flagged Incidents' : 'Live Examination Sessions'}
                </h2>
                <p className="text-xs text-slate-500">Real-time candidate camera, microphone, and AI event streams.</p>
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {['ALL', 'IN_PROGRESS', 'SUBMITTED', 'FLAGGED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      statusFilter === st
                        ? 'bg-white text-[#0070E0] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'IN_PROGRESS' ? 'Active' : st === 'SUBMITTED' ? 'Completed' : 'Flagged'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidate name, access code, or exam title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-9 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Table */}
            {filteredSessions.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400">
                No matching examination sessions found.
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
                      <th className="py-2.5 pl-3 text-right">Actions</th>
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
                                : s.status === 'SUBMITTED' || s.status === 'COMPLETED'
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleInspectSession(s.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#0070E0] hover:bg-[#0060c0] text-white text-xs font-bold transition-colors shadow-xs"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => setDeleteSessionId(s.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Card: Trend by Month */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
            <div className="-mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-5 rounded-t-2xl border-b border-blue-100 bg-gradient-to-r from-blue-50/70 to-transparent px-5 md:px-6 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0070E0]">Trend</p>
              <h2 className="mt-0.5 font-display text-lg font-bold tracking-tight text-slate-900">Sessions by month</h2>
              <p className="text-xs text-slate-500">Gross exam sessions over the last six months.</p>
            </div>

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
              <button
                onClick={() => setShowCreateUser(true)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shadow-xs"
              >
                Create User Account
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. Tab 2: Access Codes CRUD */}
      {currentTab === 'access-codes' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assessment Access Codes ({accessCodes.length})</h2>
              <p className="text-xs text-slate-500">Single-use and pre-authorized candidate exam voucher codes.</p>
            </div>
            <button
              onClick={() => setShowCreateCode(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0070E0] text-white text-xs font-bold hover:bg-[#0060c0] shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
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
                  <th className="py-2.5 pl-3 text-right">Actions</th>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => copyToClipboard(c.code)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
                          title="Copy code"
                        >
                          {copiedCode === c.code ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => setEditCodeItem({ ...c })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0070E0] hover:bg-blue-50 transition-colors"
                          title="Edit code"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCodeId(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 3: Question Bank CRUD */}
      {currentTab === 'questions' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Question Catalog ({questions.length})</h2>
              <p className="text-xs text-slate-500">Live question bank utilized for proctored examination simulations.</p>
            </div>
            <button
              onClick={() => setShowCreateQuestion(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0070E0] text-white text-xs font-bold hover:bg-[#0060c0] shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Add Question
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-[#0070E0] text-white px-2.5 py-0.5 rounded">
                    {q.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 font-bold text-[11px]">#{q.id} &bull; {q.difficulty}</span>
                    <button
                      onClick={() => setEditQuestionItem({ ...q })}
                      className="p-1 rounded text-slate-400 hover:text-[#0070E0] hover:bg-blue-50"
                      title="Edit question"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteQuestionId(q.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="font-bold text-slate-900 leading-snug">{q.questionText}</p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 pt-1">
                  <div className={q.correctAnswer === 'A' ? 'font-bold text-[#0070E0]' : ''}>A. {q.optionA}</div>
                  <div className={q.correctAnswer === 'B' ? 'font-bold text-[#0070E0]' : ''}>B. {q.optionB}</div>
                  <div className={q.correctAnswer === 'C' ? 'font-bold text-[#0070E0]' : ''}>C. {q.optionC}</div>
                  <div className={q.correctAnswer === 'D' ? 'font-bold text-[#0070E0]' : ''}>D. {q.optionD}</div>
                </div>
                {q.explanation && (
                  <p className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 mt-1 italic">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tab 4: User Management CRUD */}
      {currentTab === 'users' && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User & Candidate Accounts ({users.length})</h2>
              <p className="text-xs text-slate-500">Manage candidates, proctors, and administrator permissions.</p>
            </div>
            <button
              onClick={() => setShowCreateUser(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create New User
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-9 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 pr-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 odd:bg-blue-50/20 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0070E0] text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'ROLE_ADMIN'
                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                          : u.role === 'ROLE_PROCTOR'
                          ? 'border-blue-200 bg-blue-50 text-[#0070E0]'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {u.country || 'IN'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditUserItem({ ...u })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0070E0] hover:bg-blue-50 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteUserId(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}

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

                {/* Status Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 mr-2">Override Status:</span>
                  <button
                    onClick={() => handleUpdateStatus(sessionDetail.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0070E0] border border-blue-200 font-bold hover:bg-blue-100"
                  >
                    Resume In-Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(sessionDetail.id, 'FLAGGED')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100"
                  >
                    Flag Violation
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(sessionDetail.id, 'TERMINATED')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold hover:bg-slate-200"
                  >
                    Terminate Exam
                  </button>
                  <button
                    onClick={() => setDeleteSessionId(sessionDetail.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 ml-auto"
                  >
                    Delete Session
                  </button>
                </div>

                {/* Proctor Broadcast message */}
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Live Broadcast Message to Candidate Screen
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Please look directly at the screen and keep your hands visible..."
                      value={proctorMessage}
                      onChange={(e) => setProctorMessage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0070E0]"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-[#0070E0] text-white font-bold rounded-lg hover:bg-[#005bb8] text-xs"
                    >
                      Broadcast
                    </button>
                  </div>
                  {messageSentStatus && (
                    <p className="text-[10px] text-emerald-600 font-bold">Message sent to candidate WebSocket!</p>
                  )}
                </div>

                {/* Submitted Photos Gallery */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">
                    Verification Photos ({sessionDetail.photos ? sessionDetail.photos.length : 0})
                  </h4>
                  {sessionDetail.photos && sessionDetail.photos.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {sessionDetail.photos.map((p) => (
                        <div key={p.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video">
                          <img
                            src={`${getApiBaseUrl()}${p.url}`}
                            alt={p.photoType}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback placeholder
                              (e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                          <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            {p.photoType} {p.direction ? `(${p.direction})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">No verification photos captured yet.</p>
                  )}
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
                <label className="block font-bold text-slate-800 mb-1">Custom Code (Optional - leave blank to auto-generate)</label>
                <input
                  type="text"
                  placeholder="e.g. 624-100-363"
                  value={newCodeForm.code}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Candidate Full Name</label>
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
                    onChange={(e) => setNewCodeForm({ ...newCodeForm, durationMinutes: parseInt(e.target.value) || 65 })}
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
                Generate Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Edit Access Code */}
      {editCodeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateCode} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Access Code #{editCodeItem.id}</h3>
              <button
                type="button"
                onClick={() => setEditCodeItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={editCodeItem.code}
                  onChange={(e) => setEditCodeItem({ ...editCodeItem, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={editCodeItem.candidateName}
                  onChange={(e) => setEditCodeItem({ ...editCodeItem, candidateName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={editCodeItem.examTitle}
                  onChange={(e) => setEditCodeItem({ ...editCodeItem, examTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Exam Code</label>
                  <input
                    type="text"
                    required
                    value={editCodeItem.examCode}
                    onChange={(e) => setEditCodeItem({ ...editCodeItem, examCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={editCodeItem.durationMinutes}
                    onChange={(e) => setEditCodeItem({ ...editCodeItem, durationMinutes: parseInt(e.target.value) || 65 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditCodeItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#0060c0] shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Delete Code Confirmation */}
      {deleteCodeId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Access Code?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete access code #{deleteCodeId}? Any candidate using this code will be invalidated.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteCodeId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCode(deleteCodeId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Question */}
      {showCreateQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuestion} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Question to Catalog</h3>
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

      {/* MODAL: Edit Question */}
      {editQuestionItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateQuestion} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Question #{editQuestionItem.id}</h3>
              <button
                type="button"
                onClick={() => setEditQuestionItem(null)}
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
                    value={editQuestionItem.topic}
                    onChange={(e) => setEditQuestionItem({ ...editQuestionItem, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Difficulty</label>
                  <select
                    value={editQuestionItem.difficulty}
                    onChange={(e) => setEditQuestionItem({ ...editQuestionItem, difficulty: e.target.value })}
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
                  value={editQuestionItem.questionText}
                  onChange={(e) => setEditQuestionItem({ ...editQuestionItem, questionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option A</label>
                  <input
                    type="text"
                    required
                    value={editQuestionItem.optionA}
                    onChange={(e) => setEditQuestionItem({ ...editQuestionItem, optionA: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option B</label>
                  <input
                    type="text"
                    required
                    value={editQuestionItem.optionB}
                    onChange={(e) => setEditQuestionItem({ ...editQuestionItem, optionB: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option C</label>
                  <input
                    type="text"
                    required
                    value={editQuestionItem.optionC}
                    onChange={(e) => setEditQuestionItem({ ...editQuestionItem, optionC: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Option D</label>
                  <input
                    type="text"
                    required
                    value={editQuestionItem.optionD}
                    onChange={(e) => setEditQuestionItem({ ...editQuestionItem, optionD: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Correct Answer</label>
                <select
                  value={editQuestionItem.correctAnswer}
                  onChange={(e) => setEditQuestionItem({ ...editQuestionItem, correctAnswer: e.target.value })}
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
                  value={editQuestionItem.explanation || ''}
                  onChange={(e) => setEditQuestionItem({ ...editQuestionItem, explanation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditQuestionItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#0060c0] shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Delete Question Confirmation */}
      {deleteQuestionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Question?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete question #{deleteQuestionId}? This question will be removed permanently.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteQuestionId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(deleteQuestionId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create User */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Platform User</h3>
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  >
                    <option value="ROLE_USER">Candidate (USER)</option>
                    <option value="ROLE_PROCTOR">Proctor</option>
                    <option value="ROLE_ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={newUserForm.phoneNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Country</label>
                  <input
                    type="text"
                    value={newUserForm.country}
                    onChange={(e) => setNewUserForm({ ...newUserForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#0060c0] shadow-xs"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Edit User */}
      {editUserItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateUser} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit User #{editUserItem.id}</h3>
              <button
                type="button"
                onClick={() => setEditUserItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={editUserItem.email}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserItem.fullName}
                  onChange={(e) => setEditUserItem({ ...editUserItem, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Role</label>
                  <select
                    value={editUserItem.role}
                    onChange={(e) => setEditUserItem({ ...editUserItem, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  >
                    <option value="ROLE_USER">Candidate (USER)</option>
                    <option value="ROLE_PROCTOR">Proctor</option>
                    <option value="ROLE_ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Account Status</label>
                  <select
                    value={editUserItem.active ? 'true' : 'false'}
                    onChange={(e) => setEditUserItem({ ...editUserItem, active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  >
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editUserItem.phoneNumber || ''}
                    onChange={(e) => setEditUserItem({ ...editUserItem, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Country</label>
                  <input
                    type="text"
                    value={editUserItem.country || ''}
                    onChange={(e) => setEditUserItem({ ...editUserItem, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0070E0]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditUserItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0070E0] text-white hover:bg-[#0060c0] shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Delete User Confirmation */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete user account #{deleteUserId}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteUserId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Session Confirmation */}
      {deleteSessionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Exam Session?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete session #{deleteSessionId}? All captured verification photos, telemetry, and answers will be purged.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteSessionId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSession(deleteSessionId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
