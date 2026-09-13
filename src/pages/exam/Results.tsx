import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Trophy, XCircle, Download, RotateCcw, Home, CheckCircle, TrendingUp } from 'lucide-react'
import { useExamSession } from '@/contexts/ExamSessionContext'

export default function Results() {
  const { session, dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!session.submittedAt) navigate('/exam', { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const score = session.score ?? 0
  const passed = score >= 65
  const total = session.questions.length
  const correctCount = Math.round((score / 100) * total)

  function handleRetake() {
    dispatch({ type: 'RESET' })
    navigate('/exam', { replace: true })
  }

  function handleDownloadCert() {
    // Mock: generate a simple text certificate
    const cert = `
YATRI PROCTOR — PRACTICE CERTIFICATE

Candidate: ${session.candidateName}
Exam: AWS Certified Solutions Architect – Associate (SAA-C03)
Score: ${score}%
Status: ${passed ? 'PASSED' : 'FAILED'}
Date: ${new Date(session.submittedAt!).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

This is a practice certificate for self-assessment purposes only.
It carries no official certification standing.

Yatri Cloud · yatricloud.com
    `.trim()

    const blob = new Blob([cert], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yatri-proctor-cert-${session.candidateName?.replace(/\s/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const topicEntries = Object.entries(session.topicBreakdown)

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Result card */}
        <motion.div
          initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`rounded-2xl border-2 overflow-hidden ${
            passed ? 'border-[hsl(var(--success)/0.4)]' : 'border-destructive/30'
          }`}
        >
          {/* Header band */}
          <div className={`px-8 py-10 text-center ${passed ? 'band-tint' : 'bg-destructive/5'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-[hsl(var(--success)/0.15)]' : 'bg-destructive/10'
            }`}>
              {passed
                ? <Trophy className="h-10 w-10 text-[hsl(var(--success))]" />
                : <XCircle className="h-10 w-10 text-destructive" />}
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {passed ? '🎉 Passed!' : 'Not Passed'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {passed
                ? 'Congratulations! You scored above the 65% passing threshold.'
                : 'Keep studying — review the topics below and retake when ready.'}
            </p>

            {/* Big score */}
            <div className="mt-6 inline-flex flex-col items-center">
              <span className="font-display text-7xl font-bold tabular-nums text-foreground">{score}<span className="text-4xl text-muted-foreground">%</span></span>
              <span className="text-sm text-muted-foreground mt-1">{correctCount} of {total} correct · Pass threshold 65%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-card">
            {[
              { label: 'Score', value: `${score}%` },
              { label: 'Correct', value: `${correctCount}/${total}` },
              { label: 'Status', value: passed ? 'PASSED' : 'FAILED' },
            ].map(stat => (
              <div key={stat.label} className="py-5 text-center">
                <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Topic breakdown */}
        {topicEntries.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs"
          >
            <h2 className="font-bold text-sm text-slate-900">Topic Breakdown</h2>

            <div className="space-y-3">
              {topicEntries.map(([topic, { correct, total: t }]) => {
                const pct = Math.round((correct / t) * 100)
                const topicPassed = pct >= 65
                return (
                  <div key={topic}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{topic}</span>
                      <span className={`text-xs font-bold ${topicPassed ? 'text-[#0070E0]' : 'text-slate-500'}`}>
                        {correct}/{t} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${topicPassed ? 'bg-[#0070E0]' : 'bg-slate-300'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Question review */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs"
        >
          <h2 className="font-bold text-sm text-slate-900">Answer Review</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
            {session.questions.map((q, i) => {
              const userAnswer = session.answers[i]
              const isCorrect = userAnswer === q.correctAnswer
              return (
                <div key={q.id} className={`rounded-xl border p-3.5 text-xs ${isCorrect ? 'border-emerald-200 bg-white' : 'border-rose-200 bg-white'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 leading-snug">Q{i + 1}. {q.question}</p>
                    <p className="text-slate-600 mt-1 font-medium">
                      Your answer: <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{userAnswer ?? '—'}</span>
                      {!isCorrect && <> &bull; Correct: <span className="text-emerald-700 font-bold">{q.correctAnswer}</span></>}
                    </p>
                    <p className="text-slate-500 mt-1 italic">{q.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions - Solid full color, no icons left of text */}
        <div className="flex flex-col sm:flex-row gap-3">
          {passed && (
            <button
              onClick={handleDownloadCert}
              className="flex-1 rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-5 py-3 text-xs font-bold text-white shadow-xs transition-colors"
            >
              Download Certificate
            </button>
          )}
          <button
            onClick={handleRetake}
            className="flex-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 text-xs font-semibold shadow-xs transition-colors"
          >
            Retake Exam
          </button>
          <Link
            to="/"
            className="flex-1 text-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
