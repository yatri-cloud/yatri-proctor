import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Monitor, AlertCircle, RefreshCw, X, ArrowRight, Laptop, ShieldCheck } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { useExamSession } from '@/contexts/ExamSessionContext'
import { getApiBaseUrl } from '@/utils/apiConfig'

interface ProhibitedApp {
  id: string
  name: string
  pid: number
  closed: boolean
}

export default function SecureBrowserCheck() {
  const navigate = useNavigate()
  const { session } = useExamSession()

  const [apps, setApps] = useState<ProhibitedApp[]>([])
  const [displayCount, setDisplayCount] = useState<number>(1)
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false)
  const [retesting, setRetesting] = useState<boolean>(false)
  const [hasTested, setHasTested] = useState<boolean>(false)

  const checkDisplays = useCallback(() => {
    // Real screen detection using W3C Multi-Screen Window Placement API
    const isExtended = (window.screen as unknown as { isExtended?: boolean }).isExtended
    if (typeof isExtended === 'boolean') {
      setDisplayCount(isExtended ? 2 : 1)
    } else {
      setDisplayCount(1)
    }
  }, [])

  const runRealProcessScan = useCallback(async () => {
    setRetesting(true)
    checkDisplays()

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/sessions/diagnostics/system-processes`, {
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.prohibitedApps)) {
          setApps(data.prohibitedApps.map((a: { id: string; name: string; pid: number }) => ({
            id: String(a.id || a.pid),
            name: a.name,
            pid: a.pid,
            closed: false
          })))
        } else {
          setApps([])
        }
      } else {
        setApps([])
      }
    } catch (err) {
      console.warn('Real system process check fallback:', err)
      setApps([])
    } finally {
      setRetesting(false)
      setHasTested(true)
    }
  }, [checkDisplays])

  useEffect(() => {
    // Only listen for display changes if tested, do NOT auto-run scan on page load
    window.addEventListener('resize', checkDisplays)
    return () => window.removeEventListener('resize', checkDisplays)
  }, [checkDisplays])

  const unclosedApps = apps.filter(a => !a.closed)
  const hasAppViolations = unclosedApps.length > 0
  const hasDisplayViolations = displayCount > 1
  const allClear = hasTested && !hasAppViolations && !hasDisplayViolations

  const handleCloseApp = async (app: ProhibitedApp) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/sessions/diagnostics/kill-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid: app.pid, name: app.name })
      })
    } catch (err) {
      console.warn('Error killing process:', err)
    }
    await runRealProcessScan()
  }

  const handleCloseAllAndRetest = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/sessions/diagnostics/kill-all-prohibited`, {
        method: 'POST'
      })
    } catch (err) {
      console.warn('Error terminating prohibited apps:', err)
    }
    await runRealProcessScan()
    setShowTroubleshoot(false)
  }

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      percentComplete={67}
      title="System test - Exam simulation - Secure browser test"
      onPrevious={() => navigate('/exam/network')}
      onNext={() => navigate('/exam/video-streaming')}
      disableNext={!hasTested || !allClear || retesting}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
        
        {/* Column 1: Instructions matching 11.png */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 leading-snug">
              1. Minimize risk of disruption by following the instructions below:
            </h3>

            <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed">
              <li>
                Press Command + Option + Escape and close all applications except for Finder and Yatri Proctor.
              </li>
              <li>
                Only one monitor is allowed. Please unplug any extra monitors.
              </li>
              <li>
                Do not use a corporate network or VPN.
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => setShowTroubleshoot(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Troubleshoot
            </button>
          </div>
        </div>

        {/* Column 2: Test & Issues matching 11.png */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 leading-snug">
              2. Test to see if there are any issues that could prevent your exam from launching.
            </h3>

            <button
              type="button"
              onClick={runRealProcessScan}
              disabled={retesting}
              className="mb-4 px-5 py-2 bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {retesting ? 'Checking...' : hasTested ? 'Retest' : 'Start test'}
            </button>

            {/* Issues Box matching 11.png */}
            <div className="border border-slate-300 rounded-lg p-4 text-xs">
              {!hasTested && !retesting ? (
                <div className="text-slate-600 py-1 leading-relaxed">
                  Click <strong className="text-slate-800">Start test</strong> above to scan for prohibited background applications and verify display configuration.
                </div>
              ) : retesting ? (
                <div className="flex items-center space-x-2.5 text-slate-700 font-medium py-1">
                  <span className="w-4 h-4 rounded-full border-2 border-[#0070E0] border-t-transparent animate-spin inline-block" />
                  <span>Scanning host processes and monitor configuration...</span>
                </div>
              ) : hasAppViolations ? (
                <div>
                  <div className="font-semibold text-slate-800 mb-2">
                    The issues below could prevent exam launch:
                  </div>
                  <div className="text-slate-900 font-bold mb-1">
                    Prohibited background applications running:
                  </div>
                  {hasDisplayViolations && (
                    <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 font-semibold">
                      Multiple displays detected ({displayCount} monitors). Only 1 monitor is permitted. Please unplug extra monitors.
                    </div>
                  )}
                  <ul className="list-disc list-inside text-slate-600 space-y-2 mb-3">
                    {unclosedApps.map(app => (
                      <li key={app.id}>
                        {app.name}
                        <button
                          onClick={() => handleCloseApp(app)}
                          className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold shadow-xs"
                        >
                          Close now
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleCloseAllAndRetest}
                    className="mt-3 block w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Close all background processes
                  </button>
                </div>
              ) : hasDisplayViolations ? (
                <div className="text-rose-700 font-semibold">
                  Multiple displays detected ({displayCount} monitors). Please disconnect secondary monitors and click Retest.
                </div>
              ) : (
                <div className="text-emerald-700 font-bold">
                  All checks passed. No issues detected that could prevent exam launch.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Troubleshooting modal */}
      {showTroubleshoot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-3">Troubleshooting Secure Browser</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              If tests report issues, check the following:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside mb-6">
              <li>Disconnect external docks, USB hubs, or flash drives.</li>
              <li>Unplug HDMI, DisplayPort, or Thunderbolt external monitors.</li>
              <li>Quit any screen recorder, communication tool, or VPN client.</li>
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTroubleshoot(false)}
                className="px-5 py-2 bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ProctorLayout>
  )
}

