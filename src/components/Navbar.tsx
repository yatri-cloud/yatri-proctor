import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
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
    </header>
  )
}
