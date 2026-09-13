import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ExamSessionProvider } from '@/contexts/ExamSessionContext'

// Portal
const CandidatePortal = lazy(() => import('@/pages/portal/CandidatePortal'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Exact OnVUE Flow (matching docs/requirements/ui)
const UnlockOnVue = lazy(() => import('@/pages/onvue/UnlockOnVue'))
const EquipmentChecks = lazy(() => import('@/pages/onvue/EquipmentChecks'))
const NetworkCheck = lazy(() => import('@/pages/onvue/NetworkCheck'))
const ExamDownload = lazy(() => import('@/pages/onvue/ExamDownload'))
const SecureBrowserCheck = lazy(() => import('@/pages/onvue/SecureBrowserCheck'))
const VideoStreamingCheck = lazy(() => import('@/pages/onvue/VideoStreamingCheck'))
const SimulationReady = lazy(() => import('@/pages/onvue/SimulationReady'))
const SimulationRunner = lazy(() => import('@/pages/onvue/SimulationRunner'))
const SystemTestComplete = lazy(() => import('@/pages/onvue/SystemTestComplete'))

// Proctored Exam Delivery
const MobilePair = lazy(() => import('@/pages/exam/MobilePair'))
const Environment = lazy(() => import('@/pages/exam/Environment'))
const Terms = lazy(() => import('@/pages/exam/Terms'))
const Session = lazy(() => import('@/pages/exam/Session'))
const Results = lazy(() => import('@/pages/exam/Results'))

// Mobile PWA Companion
const MobileEntry = lazy(() => import('@/pages/mobile/MobileEntry'))
const PersonPhoto = lazy(() => import('@/pages/mobile/PersonPhoto'))
const RoomScan = lazy(() => import('@/pages/mobile/RoomScan'))
const IdCountry = lazy(() => import('@/pages/mobile/IdCountry'))
const IdCapture = lazy(() => import('@/pages/mobile/IdCapture'))
const MobileDone = lazy(() => import('@/pages/mobile/MobileDone'))

// Admin Portal
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef0f2]">
      <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-md border border-slate-200">
        <div className="w-10 h-10 rounded-full border-3 border-[#0070E0] border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-700">Loading Yatri Proctor...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ExamSessionProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Candidate Portal & Admin */}
            <Route path="/" element={<CandidatePortal />} />
            <Route path="/portal" element={<CandidatePortal />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Exact Diagnostic & Simulation Flow (matches docs/requirements/ui 3.png - 18.png) */}
            <Route path="/exam" element={<UnlockOnVue />} />
            <Route path="/exam/unlock" element={<UnlockOnVue />} />
            <Route path="/exam/equipment" element={<EquipmentChecks />} />
            <Route path="/exam/network" element={<NetworkCheck />} />
            <Route path="/exam/download" element={<ExamDownload />} />
            <Route path="/exam/secure-browser" element={<SecureBrowserCheck />} />
            <Route path="/exam/video-streaming" element={<VideoStreamingCheck />} />
            <Route path="/exam/simulation-ready" element={<SimulationReady />} />
            <Route path="/exam/simulation-runner" element={<SimulationRunner />} />
            <Route path="/exam/completed" element={<SystemTestComplete />} />

            {/* Aliases for compatibility */}
            <Route path="/onvue/unlock" element={<UnlockOnVue />} />
            <Route path="/onvue/equipment" element={<EquipmentChecks />} />
            <Route path="/onvue/network" element={<NetworkCheck />} />
            <Route path="/onvue/download" element={<ExamDownload />} />
            <Route path="/onvue/secure-browser" element={<SecureBrowserCheck />} />
            <Route path="/onvue/video-streaming" element={<VideoStreamingCheck />} />
            <Route path="/onvue/simulation-ready" element={<SimulationReady />} />
            <Route path="/onvue/simulation-runner" element={<SimulationRunner />} />
            <Route path="/onvue/completed" element={<SystemTestComplete />} />

            {/* Exam Day Check-in & Certification Engine */}
            <Route path="/exam/mobile-pair" element={<MobilePair />} />
            <Route path="/exam/environment" element={<Environment />} />
            <Route path="/exam/terms" element={<Terms />} />
            <Route path="/exam/session" element={<Session />} />
            <Route path="/exam/results" element={<Results />} />

            {/* Mobile Companion PWA flow */}
            <Route path="/mobile/:token" element={<MobileEntry />} />
            <Route path="/mobile/photo" element={<PersonPhoto />} />
            <Route path="/mobile/room-scan" element={<RoomScan />} />
            <Route path="/mobile/id-country" element={<IdCountry />} />
            <Route path="/mobile/id-capture" element={<IdCapture />} />
            <Route path="/mobile/done" element={<MobileDone />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ExamSessionProvider>
  )
}
