import React, { ReactNode, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Users,
  ShieldAlert,
  Key,
  GraduationCap,
  LogOut,
  ExternalLink,
  UserCheck
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
  currentTab: string
  onTabChange: (tab: string) => void
  onRefresh?: () => void
  loading?: boolean
}

const COLLAPSE_KEY = 'admin_sidebar_collapsed'

export default function AdminLayout({
  children,
  currentTab,
  onTabChange,
  onRefresh,
  loading = false,
}: AdminLayoutProps) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(COLLAPSE_KEY) === '1'
  )

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      }
      return next
    })
  }

  // Expandable groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    proctoring: true,
    accessCodes: true,
    questions: true,
    users: true,
  })

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'overview': return 'Overview'
      case 'sessions': return 'Live Sessions'
      case 'flagged': return 'Flagged Sessions'
      case 'access-codes': return 'Access Codes'
      case 'questions': return 'Question Bank'
      case 'users': return 'User Management'
      default: return 'Overview'
    }
  }

  /* ── Collapsed icon rail (desktop matching yatri-practice-hub Image 2) ── */
  const IconRail = (
    <div className="flex flex-col h-full w-[72px] flex-shrink-0 bg-white select-none">
      {/* Top Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 flex-shrink-0">
        <Link to="/" title="Yatri Cloud" className="hover:opacity-80 transition-opacity">
          <img src="/logo-64.png" alt="Yatri Cloud" className="w-8 h-8 rounded-full object-contain" />
        </Link>
      </div>

      {/* Navigation icon buttons */}
      <nav className="flex-1 p-3 flex flex-col items-center gap-2 overflow-y-auto">
        <button
          onClick={() => onTabChange('overview')}
          title="Dashboard / Overview"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none ${
            currentTab === 'overview'
              ? 'bg-[#0070E0] text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>

        <div className="my-1 h-px w-8 bg-slate-200" />

        <button
          onClick={() => onTabChange('sessions')}
          title="Live Sessions"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none ${
            currentTab === 'sessions'
              ? 'bg-[#0070E0] text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => onTabChange('flagged')}
          title="Flagged Sessions"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none ${
            currentTab === 'flagged'
              ? 'bg-[#0070E0] text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
        </button>

        <button
          onClick={() => onTabChange('access-codes')}
          title="Access Codes"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none ${
            currentTab === 'access-codes'
              ? 'bg-[#0070E0] text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Key className="w-5 h-5" />
        </button>

        <button
          onClick={() => onTabChange('questions')}
          title="Question Bank"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none ${
            currentTab === 'questions'
              ? 'bg-[#0070E0] text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
        </button>

        <button
          onClick={() => onTabChange('users')}
          title="User Accounts"
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none ${
            currentTab === 'users'
              ? 'bg-[#0070E0] text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-5 h-5" />
        </button>
      </nav>

      {/* Bottom Sign Out */}
      <div className="p-3 border-t border-slate-200 flex flex-col items-center flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          title="Sign Out"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  )

  /* ── Full expanded sidebar (w-64) ── */
  const FullNav = (
    <div className="flex flex-col h-full w-64 flex-shrink-0 bg-white select-none">
      {/* Top Logo & Title */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/logo-64.png" alt="Yatri Cloud" className="w-8 h-8 rounded-full object-contain" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Yatri <span className="text-[#0070E0]">Admin</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* OVERVIEW SECTION */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Overview
          </p>
          <button
            onClick={() => { onTabChange('overview'); setMobileOpen(false) }}
            className={`w-full text-left min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentTab === 'overview'
                ? 'bg-[#0070E0] text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-[#0070E0]'
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* MANAGE SECTION */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Manage
          </p>

          <div className="space-y-1">
            {/* Proctoring Group */}
            <div>
              <button
                onClick={() => toggleGroup('proctoring')}
                className="w-full flex items-center justify-between min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span>Proctoring</span>
                {openGroups.proctoring ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openGroups.proctoring && (
                <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-1 pt-1">
                  <button
                    onClick={() => { onTabChange('overview'); setMobileOpen(false) }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'overview'
                        ? 'bg-[#0070E0] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => { onTabChange('sessions'); setMobileOpen(false) }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'sessions'
                        ? 'bg-[#0070E0] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Live Sessions
                  </button>
                  <button
                    onClick={() => { onTabChange('flagged'); setMobileOpen(false) }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'flagged'
                        ? 'bg-[#0070E0] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Flagged Sessions
                  </button>
                </div>
              )}
            </div>

            {/* Access Codes Group */}
            <div>
              <button
                onClick={() => toggleGroup('accessCodes')}
                className="w-full flex items-center justify-between min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span>Access Codes</span>
                {openGroups.accessCodes ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openGroups.accessCodes && (
                <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-1 pt-1">
                  <button
                    onClick={() => { onTabChange('access-codes'); setMobileOpen(false) }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'access-codes'
                        ? 'bg-[#0070E0] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Manage Codes
                  </button>
                </div>
              )}
            </div>

            {/* Question Bank Group */}
            <div>
              <button
                onClick={() => toggleGroup('questions')}
                className="w-full flex items-center justify-between min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span>Question Bank</span>
                {openGroups.questions ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openGroups.questions && (
                <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-1 pt-1">
                  <button
                    onClick={() => { onTabChange('questions'); setMobileOpen(false) }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'questions'
                        ? 'bg-[#0070E0] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Users Group */}
            <div>
              <button
                onClick={() => toggleGroup('users')}
                className="w-full flex items-center justify-between min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span>Users & Candidates</span>
                {openGroups.users ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openGroups.users && (
                <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-1 pt-1">
                  <button
                    onClick={() => { onTabChange('users'); setMobileOpen(false) }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'users'
                        ? 'bg-[#0070E0] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    User Accounts
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sign Out Bottom Button */}
      <div className="p-4 border-t border-slate-200 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs"
        >
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar on Desktop & Off-Canvas on Mobile */}
      <aside
        className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-200 ease-out flex flex-col h-full z-40 overflow-hidden ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl z-50'
            : 'hidden md:flex'
        } ${collapsed ? 'md:w-[72px]' : 'md:w-64'}`}
      >
        {mobileOpen ? FullNav : collapsed ? IconRail : FullNav}
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Fixed Topbar Header matching Image 2 */}
        <header className="h-16 flex-shrink-0 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle - Square rounded-xl with border matching Image 2 */}
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div className="hidden md:block h-5 w-px bg-slate-200" />

            {/* Breadcrumb matching Image 2: Admin > Overview */}
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
              <span className="text-slate-400">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900 font-bold">{getPageTitle()}</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* View site button matching Image 2 */}
            <Link
              to="/portal"
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span>View site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {/* Profile Avatar Pill matching Image 2 */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block leading-tight">
                <span className="block text-xs font-bold text-slate-900">Admin</span>
                <span className="block text-[10px] text-slate-400">Superadmin</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0070E0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#f8fafc] p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
