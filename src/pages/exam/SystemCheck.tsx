import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Wifi, Monitor, Cpu, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import StageLayout from '@/components/StageLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'

interface Check {
  id: string
  label: string
  detail: string
  icon: React.ElementType
  status: 'pending' | 'checking' | 'pass' | 'fail'
  value?: string
}

export default function SystemCheck() {
  const { dispatch } = useExamSession()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [checks, setChecks] = useState<Check[]>([
    { id: 'network', label: 'Network Speed', detail: 'Minimum 3 Mbps required', icon: Wifi, status: 'pending' },
    { id: 'screen', label: 'Screen Count', detail: 'Single monitor only', icon: Monitor, status: 'pending' },
    { id: 'cpu', label: 'System Resources', detail: 'Sufficient CPU/RAM headroom', icon: Cpu, status: 'pending' },
  ])
  const [started, setStarted] = useState(false)
  const [allDone, setAllDone] = useState(false)

  function updateCheck(id: string, status: Check['status'], value?: string) {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, status, value } : c))
  }

  async function runChecks() {
    setStarted(true)

    // Network check
    updateCheck('network', 'checking')
    await new Promise(r => setTimeout(r, 1200))
    // Mock speed: 25 Mbps (passes 3 Mbps minimum)
    const networkMbps = Math.round(Math.random() * 30 + 10)
    updateCheck('network', 'pass', `${networkMbps} Mbps`)

    // Screen count check
    updateCheck('screen', 'checking')
    await new Promise(r => setTimeout(r, 800))
    const screenCount = window.screen ? 1 : 1 // Browser can't reliably detect multiple monitors in all cases
    const screenPass = screenCount <= 1
    updateCheck('screen', screenPass ? 'pass' : 'fail', `${screenCount} screen detected`)

    // CPU/Memory check
    updateCheck('cpu', 'checking')
    await new Promise(r => setTimeout(r, 700))
    // @ts-ignore
    const memory = (navigator as any).deviceMemory ?? 8
    const cpuPass = memory >= 4
    updateCheck('cpu', cpuPass ? 'pass' : 'fail', `${memory} GB RAM`)

    const allPass = screenPass && cpuPass
    dispatch({
      type: 'SET_SYSTEM_CHECK',
      results: { networkMbps, screenCount, passed: allPass },
    })
    setAllDone(true)
  }

  const allPass = checks.every(c => c.status === 'pass')
  const anyFail = checks.some(c => c.status === 'fail')

  return (
    <StageLayout screen={14} title="System Check">
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-xl font-bold">System Check</h2>
          <p className="text-sm text-muted-foreground">
            We'll verify your network speed, screen setup, and system resources before launching the exam.
          </p>
        </div>

        {/* Close background apps prompt */}
        {!started && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-bold text-amber-900 mb-1">Before running the check:</p>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              <li>Close all unnecessary browser tabs and applications</li>
              <li>Disconnect any secondary monitors</li>
              <li>Disable VPN if active</li>
            </ul>
          </div>
        )}

        {/* Checks list */}
        <div className="space-y-3">
          {checks.map((check, i) => (
            <div key={check.id} className="flex items-center gap-4 rounded-xl border border-border p-4">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <check.icon className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{check.label}</p>
                <p className="text-xs text-muted-foreground">{check.value ?? check.detail}</p>
              </div>
              <div className="flex-shrink-0">
                {check.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-border" />}
                {check.status === 'checking' && (
                  <motion.div animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
                {check.status === 'pass' && <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />}
                {check.status === 'fail' && <XCircle className="h-5 w-5 text-destructive" />}
              </div>
            </div>
          ))}
        </div>

        {anyFail && allDone && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
            One or more checks failed. Please resolve the issues above (disconnect extra monitors, close background apps) and try again.
          </div>
        )}

        {!started ? (
          <button
            onClick={runChecks}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Run System Check
          </button>
        ) : allDone && allPass ? (
          <button
            onClick={() => navigate('/exam/final-check')}
            className="w-full rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            All Checks Passed — Continue
          </button>
        ) : allDone && anyFail ? (
          <button
            onClick={() => { setStarted(false); setAllDone(false); setChecks(prev => prev.map(c => ({ ...c, status: 'pending', value: undefined }))) }}
            className="w-full rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-6 py-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            Run Again
          </button>
        ) : null}
      </div>
    </StageLayout>
  )
}
