import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useInView, animate } from 'framer-motion'
import {
  Shield, Mic, Camera, Smartphone, FileText, Monitor,
  CheckCircle, ArrowRight, ChevronDown, Lock, Zap,
  Users, Star, Clock, Award
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'

/* ─── Count-up Hook ─── */
function useCountUp(target: number, suffix = '', enabled = true) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || !ref.current || !enabled) return
    if (reduceMotion) { ref.current.textContent = `${target}${suffix}`; return }
    const controls = animate(0, target, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, target, suffix, reduceMotion, enabled])

  return ref
}

/* ─── Steps data ─── */
const STEPS = [
  { icon: FileText, label: 'Access Code Entry', desc: 'Enter your 6-digit exam access code to begin your session.' },
  { icon: Mic, label: 'Speaker Test', desc: 'Verify your speakers work by playing a short audio clip.' },
  { icon: Mic, label: 'Mic Test', desc: 'Record a 5-second clip and confirm your microphone is working.' },
  { icon: Camera, label: 'Webcam Test', desc: 'See a live preview of yourself and confirm the camera is clear.' },
  { icon: Smartphone, label: 'Mobile Pairing', desc: 'Scan a QR code with your phone to connect the mobile companion.' },
  { icon: CheckCircle, label: 'Code Re-entry', desc: 'Re-enter your access code on the phone to bind it to your session.' },
  { icon: CheckCircle, label: 'Environment Check', desc: 'Confirm you\'re alone, desk is clear, no extra devices in reach.' },
  { icon: Camera, label: 'Person Photo', desc: 'Take a clear photo of your face using your phone camera.' },
  { icon: Camera, label: 'Room Scan', desc: 'Capture 4 photos of your room — front, back, left, right.' },
  { icon: FileText, label: 'ID: Country & Type', desc: 'Select your country and the type of ID you will present.' },
  { icon: Lock, label: 'ID Capture', desc: 'Capture front and back of your ID via live camera — no file upload.' },
  { icon: Zap, label: 'Sync Back', desc: 'Desktop auto-advances once the phone flow completes.' },
  { icon: FileText, label: 'Terms & Conditions', desc: 'Read and accept the exam terms with a timestamped consent record.' },
  { icon: Monitor, label: 'System Check', desc: 'Verify network speed, screen count, and background apps.' },
  { icon: Camera, label: 'Final Face Check', desc: 'One last webcam confirmation before the exam begins.' },
  { icon: Shield, label: 'Proctor Notice', desc: 'Receive your automated session monitoring confirmation.' },
  { icon: Zap, label: 'Exam Download', desc: 'Your encrypted question set is prepared client-side.' },
  { icon: Award, label: 'Exam Session', desc: 'Timed exam with question navigator, flag-for-review, and webcam.' },
  { icon: Star, label: 'Results & Certificate', desc: 'Instant score, topic breakdown, and PDF certificate if you pass.' },
]

const FEATURES = [
  {
    icon: Shield,
    title: 'Realistic Check-in Flow',
    desc: 'Step-by-step diagnostic and check-in flow — zero surprises on real exam day.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Companion PWA',
    desc: 'Your phone becomes the room-scan and ID-capture camera. No app download needed.',
  },
  {
    icon: Lock,
    title: 'DPDP Act Compliant',
    desc: 'Encrypted storage, explicit consent, 30-day retention, audit log on every access.',
  },
  {
    icon: Zap,
    title: 'Instant Scoring',
    desc: 'Full topic breakdown immediately after submission. Know exactly where to study more.',
  },
  {
    icon: Award,
    title: 'PDF Certificate',
    desc: 'Pass at 65%+ and download a practice certificate for motivation and portfolio.',
  },
  {
    icon: Clock,
    title: 'Timed & Randomized',
    desc: 'Questions are shuffled every attempt. Realistic 65-minute countdown with auto-submit.',
  },
]

const FAQS = [
  {
    q: 'Is this an official certification exam?',
    a: 'No. Yatri Proctor is a practice platform designed to simulate the enterprise cloud proctoring experience. It issues practice certificates for readiness assessment.',
  },
  {
    q: 'What access code do I use?',
    a: 'Access codes are provided when you register for an assessment session on Yatri Cloud. For practice, try test code 123456 or 624-100-363.',
  },
  {
    q: 'Do I really need a phone for the check-in?',
    a: 'Yes — the phone companion captures your room scan and ID photos using high-definition mobile camera optics. The PWA opens seamlessly in your phone browser via QR scan, no app installation needed.',
  },
  {
    q: 'How long does the check-in take?',
    a: 'Typically 5–10 minutes end-to-end. A clear progress indicator is shown throughout so you always know how much is left.',
  },
  {
    q: 'Is my ID data stored?',
    a: 'ID and room-scan photos are encrypted at rest, stored for 30 days, then auto-deleted. Every access is logged. You can request immediate deletion at support@yatricloud.com.',
  },
  {
    q: 'What score do I need to pass?',
    a: 'A score of 65% or higher is considered a pass, matching industry exam passing thresholds. On pass, you can download a practice certificate.',
  },
]

export default function Index() {
  const reduceMotion = useReducedMotion()

  const usersRef = useCountUp(50000, '+')
  const ratingRef = useCountUp(4, '.8★')
  const examsRef = useCountUp(20, ' Qs')
  const stepsRef = useCountUp(19, ' Steps')

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Blue glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-blue-50 px-4 py-1.5 mb-8">
              <span className="text-xs font-bold text-[#0070E0]">Pearson VUE OnVUE-Style Practice Platform</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-6"
              style={{ lineHeight: 1.05 }}>
              Proctored exams,{' '}
              <span className="gradient-text">redefined.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
              Experience the full OnVUE check-in flow before your real cloud certification exam.
              Equipment checks, mobile pairing, room scan, ID verification — and then the actual timed exam.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/exam"
                className="inline-flex items-center justify-center rounded-lg bg-[#0070E0] hover:bg-[#005bb8] px-8 py-3.5 text-base font-bold text-white shadow-xs transition-colors"
              >
                Start Mock Exam
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-8 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                How It Works
              </a>
            </div>

            {/* Demo code hint */}
            <p className="text-xs text-muted-foreground">
              Demo: use access code{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">123456</code>
              {' '}to try it now
            </p>
          </motion.div>

          {/* Floating step chips marquee */}
          <div className="mt-16 overflow-hidden">
            <div className="flex gap-3 animate-marquee whitespace-nowrap">
              {[...STEPS, ...STEPS].map((step, i) => (
                <span key={i} className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-slate-700 flex-shrink-0">
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust stats ─────────────────────────────────────── */}
      <section className="band-tint py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { ref: usersRef, label: 'Yatri Cloud Learners' },
              { ref: ratingRef, label: 'Platform Rating' },
              { ref: examsRef, label: 'Questions per Exam' },
              { ref: stepsRef, label: 'Check-in Steps' },
            ].map(({ ref, label }, i) => (
              <ScrollReveal key={label} delay={i * 0.08}>
                <div>
                  <span
                    ref={ref}
                    className="font-display text-4xl font-bold text-foreground tabular-nums"
                  >
                    0
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">19-Step Process</span>
              <h2 className="mt-3 font-display text-4xl font-bold">How It Works</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Every step mirrors the real Pearson VUE OnVUE check-in flow.
                A persistent "Step N of 19" indicator keeps you oriented throughout.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.label} delay={Math.min(i * 0.04, 0.4)}>
                <div className="relative flex gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-card transition-all duration-200 group">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <span className="font-display text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1">
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features bento ──────────────────────────────────── */}
      <section id="features" className="band-tint py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Why Yatri Proctor</span>
              <h2 className="mt-3 font-display text-4xl font-bold">Built for the real exam day.</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Most mock exam tools are just a quiz with a timer.
                We replicate the complete check-in experience that trips up candidates on real exam day.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.07}>
                <div className="rounded-xl border border-border bg-white p-6 hover:border-primary/30 hover:shadow-card transition-all duration-200 group h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</span>
              <h2 className="mt-3 font-display text-4xl font-bold">Common questions</h2>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <FAQItem question={faq.q} answer={faq.a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ────────────────────────────────────────── */}
      <section className="band-blue py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 mb-8">
              <span className="text-xs font-bold text-white">Ready when you are</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready for exam day?
            </h2>
            <p className="text-lg text-white/90 mb-10 max-w-xl mx-auto">
              Enter your access code and walk through the full 19-step check-in — just like the real thing.
            </p>
            <Link
              to="/exam"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#0070E0] shadow-xs hover:bg-slate-100 transition-colors"
            >
              Enter Access Code
            </Link>
            <p className="mt-4 text-sm text-white/60">
              Demo code: <code className="font-mono text-white">123456</code>
            </p>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ── FAQ Accordion item ── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-6 py-4 text-left gap-4 min-h-[52px] hover:bg-muted/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">{question}</span>
        <motion.div
          animate={open ? { rotate: 45 } : { rotate: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          className="flex-shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center"
        >
          <span className="text-muted-foreground text-lg leading-none">+</span>
        </motion.div>
      </button>
      {open && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 pb-4"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

import React from 'react'
