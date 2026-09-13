import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#eef0f2] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex items-center justify-center">
        <img src="/logo-64.png" alt="Yatri Cloud" className="w-16 h-16 rounded-full object-contain shadow-xs" />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Page Not Found</h1>
      <p className="text-slate-600 mb-8 max-w-md text-sm">The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-lg bg-[#0070E0] hover:bg-[#005bb8] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
