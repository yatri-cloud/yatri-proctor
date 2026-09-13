import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, UserPlus, X, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { forgotPassword as requestForgotPassword } from '@/lib/auth'

interface LoginSignupProps {
  onSuccess: (user: any) => void
  onClose?: () => void
  defaultIsLogin?: boolean
}

export const LoginSignup: React.FC<LoginSignupProps> = ({
  onSuccess,
  onClose,
  defaultIsLogin = true,
}) => {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(defaultIsLogin)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'IN',
    phoneNumber: '',
    linkedinUrl: '',
  })

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    try {
      const user = await login(loginEmail, loginPassword)
      setSuccessMsg('Welcome back!')
      setTimeout(() => {
        onSuccess(user)
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!registerData.fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (!registerData.email.trim()) {
      setError('Valid email address is required.')
      return
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const user = await register({
        fullName: registerData.fullName.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        country: registerData.country,
        phoneNumber: registerData.phoneNumber.trim() || undefined,
        linkedinUrl: registerData.linkedinUrl.trim() || undefined,
      })
      setSuccessMsg('Account created successfully!')
      setTimeout(() => {
        onSuccess(user)
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!loginEmail.trim()) {
      setError('Enter your email address above to reset password.')
      return
    }
    setResetting(true)
    setError(null)
    try {
      await requestForgotPassword(loginEmail.trim())
      setSuccessMsg(`Password reset link sent to ${loginEmail.trim()}`)
    } catch {
      setError('Failed to send reset link.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="w-full max-w-[440px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header with Logo */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center justify-center mb-2"
        >
          <img
            src="/logo-64.png"
            alt="Yatri Cloud Logo"
            className="w-12 h-12 rounded-2xl object-contain shadow-xs"
          />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isLogin ? 'Welcome Back!' : 'Join Yatri Cloud'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Hello Yatris 👋
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-5">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true)
            setError(null)
            setSuccessMsg(null)
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            isLogin
              ? 'bg-white dark:bg-slate-900 text-[#0070E0] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false)
            setError(null)
            setSuccessMsg(null)
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            !isLogin
              ? 'bg-white dark:bg-slate-900 text-[#0070E0] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Sign Up
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-medium rounded-xl text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium rounded-xl text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLogin ? (
          /* ================= SIGN IN FORM ================= */
          <motion.form
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleLoginSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="candidate@yatricloud.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetting}
                  className="text-xs font-semibold text-[#0070E0] hover:underline"
                >
                  {resetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Quick Demo Credentials helper */}
            <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0070E0]" /> Default Test Accounts:
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Admin: <strong className="text-slate-800 dark:text-slate-200">admin@yatricloud.com</strong></span>
                <span className="font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded">Admin@123</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Candidate: <strong className="text-slate-800 dark:text-slate-200">candidate@yatricloud.com</strong></span>
                <span className="font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded">Candidate@123</span>
              </div>
            </div>
          </motion.form>
        ) : (
          /* ================= SIGN UP FORM ================= */
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleRegisterSubmit}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Yatharth Chauhan"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Country
                </label>
                <select
                  value={registerData.country}
                  onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
                >
                  <option value="IN">India (+91)</option>
                  <option value="US">United States (+1)</option>
                  <option value="GB">United Kingdom (+44)</option>
                  <option value="CA">Canada (+1)</option>
                  <option value="AU">Australia (+61)</option>
                  <option value="SG">Singapore (+65)</option>
                  <option value="AE">UAE (+971)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={registerData.phoneNumber}
                  onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070E0] dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account & Continue'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer switcher link */}
      <div className="text-center mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
            setSuccessMsg(null)
          }}
          className="text-slate-500 hover:text-[#0070E0] transition-colors font-medium"
        >
          {isLogin ? (
            <>
              Don't have an account? <span className="font-bold text-[#0070E0]">Sign up</span>
            </>
          ) : (
            <>
              Already have an account? <span className="font-bold text-[#0070E0]">Sign in</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
