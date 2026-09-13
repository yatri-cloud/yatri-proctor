import React from 'react'
import { motion } from 'framer-motion'

interface ProctorLayoutProps {
  accessCode?: string
  percentComplete?: number
  stepIcon?: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  nextLabel?: string
  disablePrevious?: boolean
  disableNext?: boolean
  hideNavigation?: boolean
  hideProgress?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  statusBadge?: React.ReactNode
  headerRight?: React.ReactNode
}

export const YatriProctorLogo: React.FC<{ className?: string }> = ({ className = 'h-7' }) => (
  <div className={`flex items-center gap-2.5 select-none font-display ${className}`}>
    <img src="/logo-64.png" alt="Yatri Cloud" className="w-7 h-7 rounded-full object-contain" />
    <div className="flex items-baseline tracking-tight">
      <span className="text-slate-900 font-bold text-lg">Yatri</span>
      <span className="text-[#0070E0] font-bold text-lg ml-1">Proctor</span>
    </div>
  </div>
)

export default function ProctorLayout({
  accessCode = '624-100-363',
  percentComplete,
  stepIcon,
  title,
  subtitle,
  children,
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  disablePrevious = false,
  disableNext = false,
  hideNavigation = false,
  hideProgress = false,
  maxWidth = '3xl',
  statusBadge,
  headerRight
}: ProctorLayoutProps) {

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl',
    '4xl': 'max-w-6xl',
  }[maxWidth]

  return (
    <div className="min-h-screen bg-[#eef0f2] text-slate-800 flex flex-col justify-between items-center py-4 sm:py-8 px-3 sm:px-6 font-sans">
      
      {/* Centered Application Window Card matching reference layout */}
      <div className={`w-full ${widthClasses} bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col my-auto transition-all`}>
        
        {/* Top Window Header */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-3.5 flex items-center justify-between">
          <YatriProctorLogo />

          <div className="flex items-center space-x-4">
            {statusBadge}
            {headerRight ? (
              headerRight
            ) : accessCode ? (
              <span className="text-xs sm:text-sm text-slate-600 font-normal">
                Access Code: <strong className="font-mono text-slate-800 font-medium">{accessCode}</strong>
              </span>
            ) : null}
          </div>
        </header>

        {/* Window Body Area */}
        <div className="p-6 sm:p-10 flex-1 flex flex-col min-h-[460px]">
          
          {/* Progress Bar (if applicable) */}
          {!hideProgress && percentComplete !== undefined && (
            <div className="mb-6">
              <div className="text-xs text-slate-600 font-medium mb-1.5">
                Percent complete: {percentComplete}%
              </div>
              <div className="w-full h-3 rounded-full border border-slate-300 bg-white p-0.5 overflow-hidden">
                <motion.div
                  className="bg-[#0070E0] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentComplete}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Title Area - Minimal and Clinical matching reference screenshots */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg">
                {subtitle}
              </p>
            )}
          </div>

          {/* Inner Content Card (Soft neutral/pale box matching reference #f4f7f6) */}
          <div className="bg-[#f4f7f6] rounded-xl p-6 sm:p-8 flex-1 flex flex-col justify-center">
            {children}
          </div>

        </div>

        {/* Window Bottom Actions */}
        {!hideNavigation && (
          <footer className="border-t border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between bg-white">
            <div>
              {onPrevious && (
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={disablePrevious}
                  className={`px-6 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    disablePrevious
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  {previousLabel}
                </button>
              )}
            </div>

            <div>
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={disableNext}
                  className={`px-7 py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                    disableNext
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0070E0] hover:bg-[#005bb8] active:bg-[#004a99] shadow-xs'
                  }`}
                >
                  {nextLabel}
                </button>
              )}
            </div>
          </footer>
        )}

      </div>

      {/* Clean Minimal Platform Footer */}
      <footer className="mt-4 text-center text-xs text-slate-400">
        Yatri Cloud Proctoring Platform &bull; Production Secure Engine
      </footer>

    </div>
  )
}
