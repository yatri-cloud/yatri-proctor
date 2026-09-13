import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { ShieldCheck, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authDefaultLogin, setAuthDefaultLogin] = useState(true)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  const isExamFlow = location.pathname.startsWith('/exam') || location.pathname.startsWith('/mobile')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  if (isExamFlow) return null // Hide navbar during exam flow

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav py-3' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-64.png" alt="Yatri Cloud" className="w-8 h-8 rounded-full object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Yatri <span className="text-[#0070E0]">Proctor</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Features', href: '/#features' },
            { label: 'FAQ', href: '/#faq' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {label}
            </a>
          ))}
          <Link
            to="/portal"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Candidate Portal
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-xs font-bold text-[#0070E0] hover:text-[#005bb8] transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* CTA and User Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#0070E0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs font-bold text-slate-900">{user.fullName.split(' ')[0]}</div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">{user.fullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#0070E0]" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/portal"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Candidate Portal
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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

          <Link
            to="/exam"
            className="rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Start Exam
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full inset-x-0 bg-white border-t border-slate-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {['How It Works', 'Features', 'FAQ'].map(label => (
              <a
                key={label}
                href={`/#${label.toLowerCase().replace(/ /g, '-')}`}
                className="py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <Link
              to="/exam"
              className="mt-2 text-center rounded-xl bg-[#0070E0] hover:bg-[#005bb8] px-4 py-2.5 text-xs font-bold text-white shadow-xs"
            >
              Start Exam
            </Link>
          </div>
        </motion.div>
      )}

      {/* Auth Modal */}
      <LoginModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultIsLogin={authDefaultLogin}
      />
    </header>
  )
}
