import { Link } from 'react-router-dom'
import { Shield, Mail, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-white border-t border-border">
      {/* Soft blue wordmark backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-display font-bold whitespace-nowrap text-primary/5"
          style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', letterSpacing: '-0.04em' }}
        >
          Yatri Proctor
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo-64.png" alt="Yatri Cloud" className="w-8 h-8 rounded-full object-contain" />
              <span className="font-display text-lg font-bold text-slate-900">
                Yatri <span className="text-[#0070E0]">Proctor</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              The most realistic mock exam experience for cloud certification candidates.
              Train for the real thing — check-in and all.
            </p>
            <a
              href="mailto:support@yatricloud.com"
              className="block text-xs font-semibold text-slate-600 hover:text-[#0070E0] transition-colors"
            >
              support@yatricloud.com
            </a>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</p>
            {[
              { label: 'Start Exam', to: '/exam' },
              { label: 'How It Works', href: '/#how-it-works' },
              { label: 'Features', href: '/#features' },
              { label: 'FAQ', href: '/#faq' },
            ].map(link => (
              link.to
                ? <Link key={link.label} to={link.to} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                : <a key={link.label} href={link.href!} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
            ))}
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
            {[
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'DPDP Compliance', href: '#' },
              { label: 'Data Deletion Request', href: 'mailto:support@yatricloud.com?subject=Data+Deletion+Request' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
            <a
              href="https://yatricloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-brand-700 transition-colors mt-2"
            >
              Yatri Cloud <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Yatri Cloud. All rights reserved.</p>
          <p className="text-center">
            Enterprise Online Assessment & Remote Proctoring Engine by Yatri Cloud.
          </p>
        </div>
      </div>
    </footer>
  )
}
