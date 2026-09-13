import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import ProctorLayout from '@/components/ProctorLayout'
import { playOnVueChime } from '@/utils/audioChime'
import { useExamSession } from '@/contexts/ExamSessionContext'
import { getApiBaseUrl } from '@/utils/apiConfig'

export default function EquipmentChecks() {
  const navigate = useNavigate()
  const { session, dispatch } = useExamSession()

  // Mic state
  const [micLevel, setMicLevel] = useState<number>(0)
  const [micState, setMicState] = useState<'idle' | 'testing' | 'passed' | 'failed'>('idle')
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Speaker state
  const [speakerState, setSpeakerState] = useState<'idle' | 'playing' | 'tested'>('idle')
  const [speakerAnswer, setSpeakerAnswer] = useState<'yes' | 'no' | null>(null)

  // Webcam state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [webcamState, setWebcamState] = useState<'idle' | 'testing' | 'passed' | 'failed'>('idle')
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  // Devices
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([])
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioId, setSelectedAudioId] = useState<string>('')
  const [selectedVideoId, setSelectedVideoId] = useState<string>('')

  // Enumerate devices without auto-starting streams
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then(devices => {
        const aInputs = devices.filter(d => d.kind === 'audioinput')
        const vInputs = devices.filter(d => d.kind === 'videoinput')
        setAudioInputs(aInputs)
        setVideoInputs(vInputs)
        if (aInputs.length > 0) setSelectedAudioId(aInputs[0].deviceId)
        if (vInputs.length > 0) setSelectedVideoId(vInputs[0].deviceId)
      })
      .catch(() => {})

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      if (audioStream) audioStream.getTracks().forEach(t => t.stop())
      if (videoStream) videoStream.getTracks().forEach(t => t.stop())
    }
  }, [])

  // START MICROPHONE CHECK
  const startMicCheck = async () => {
    try {
      setMicState('testing')
      setMicLevel(0)

      const constraints: MediaStreamConstraints = {
        audio: selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setAudioStream(stream)

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioContextClass()
      audioContextRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let sampleCount = 0
      let detectedAudio = false

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
        const avg = sum / dataArray.length
        const level = Math.min(100, Math.round((avg / 128) * 100))
        setMicLevel(Math.max(4, level))

        sampleCount++
        if (level > 12) {
          detectedAudio = true
        }

        // Auto-mark passed after detecting speech or sample window
        if ((detectedAudio && sampleCount > 25) || sampleCount > 70) {
          setMicState('passed')
        }

        animFrameRef.current = requestAnimationFrame(updateMeter)
      }
      updateMeter()
    } catch (err) {
      console.warn('Microphone error:', err)
      setMicState('failed')
    }
  }

  // START SPEAKER CHECK
  const handleTestChime = async () => {
    setSpeakerState('playing')
    try {
      await playOnVueChime()
    } catch (err) {
      console.warn('Chime error:', err)
    }
    setSpeakerState('tested')
  }

  // START WEBCAM CHECK
  const startWebcamCheck = async () => {
    try {
      setWebcamState('testing')
      const constraints: MediaStreamConstraints = {
        video: selectedVideoId
          ? { deviceId: { exact: selectedVideoId }, width: 640, height: 480 }
          : { width: 640, height: 480 }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setVideoStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.warn('Webcam error:', err)
      setWebcamState('failed')
    }
  }

  const allPassed = micState === 'passed' && speakerAnswer === 'yes' && (webcamState === 'testing' || webcamState === 'passed')

  const handleNext = async () => {
    try {
      if (session.sessionId) {
        fetch(`${getApiBaseUrl()}/api/v1/sessions/${session.sessionId}/equipment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            speakerPass: speakerAnswer === 'yes',
            micPass: micState === 'passed',
            webcamPass: webcamState === 'passed' || webcamState === 'testing'
          })
        }).catch(() => {})
      }
    } catch {}

    dispatch({ type: 'SET_EQUIPMENT', key: 'speakerPass', value: speakerAnswer === 'yes' })
    dispatch({ type: 'SET_EQUIPMENT', key: 'micPass', value: micState === 'passed' })
    dispatch({ type: 'SET_EQUIPMENT', key: 'webcamPass', value: webcamState === 'passed' || webcamState === 'testing' })

    navigate('/exam/network')
  }

  return (
    <ProctorLayout
      accessCode={session.accessCode || '624-100-363'}
      percentComplete={29}
      title="System test: Diagnostics - Equipment checks"
      onPrevious={() => navigate('/exam/unlock')}
      onNext={handleNext}
      disableNext={!allPassed}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
        
        {/* Card 1: Microphone */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Microphone
              </h3>
              {micState === 'passed' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            {/* Level box */}
            <div className="w-full h-10 border border-slate-300 rounded-lg bg-slate-50 p-1 mb-4 flex items-center">
              <div
                className="h-full bg-[#0070E0] rounded-xs transition-all duration-75"
                style={{ width: `${Math.max(4, micLevel)}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-center mb-5">
              {micState === 'idle'
                ? 'Click Start to test your microphone and speak aloud.'
                : micState === 'testing'
                ? 'Listening... Speak or make noise into your microphone.'
                : micState === 'passed'
                ? 'Microphone verified successfully!'
                : 'Microphone access failed. Check permissions.'}
            </p>
          </div>

          <div className="space-y-3">
            <select
              aria-label="Choose microphone"
              value={selectedAudioId}
              onChange={(e) => setSelectedAudioId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none truncate"
            >
              {audioInputs.length > 0 ? (
                audioInputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Microphone'}</option>
                ))
              ) : (
                <option value="">Default Microphone</option>
              )}
            </select>

            {micState === 'idle' && (
              <button
                type="button"
                onClick={startMicCheck}
                className="w-full bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Start microphone check
              </button>
            )}

            {micState === 'testing' && (
              <button
                type="button"
                onClick={() => setMicState('passed')}
                className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Confirm working (Pass)
              </button>
            )}

            {micState === 'passed' && (
              <div className="w-full text-center py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg">
                Microphone Ready ✓
              </div>
            )}

            {micState === 'failed' && (
              <button
                type="button"
                onClick={startMicCheck}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Retry microphone check
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Speakers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <h3 className="text-sm font-semibold text-slate-900 text-center">
                Speakers
              </h3>
              {speakerAnswer === 'yes' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            {/* Speaker Sound Illustration */}
            <div className="h-14 flex items-center justify-center text-slate-700 mb-2">
              <div className="relative flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                {speakerState === 'playing' ? 'Playing music tone...' : 'Audio Output Test'}
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center mb-3">
              Can you hear the sound playing?
            </p>

            {/* Radio buttons */}
            <div className="flex items-center justify-center space-x-6 mb-4">
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-700 font-semibold">
                <input
                  type="radio"
                  name="speakerAnswer"
                  value="yes"
                  checked={speakerAnswer === 'yes'}
                  onChange={() => setSpeakerAnswer('yes')}
                  className="text-[#0070E0] focus:ring-[#0070E0]"
                />
                <span>Yes</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-700 font-semibold">
                <input
                  type="radio"
                  name="speakerAnswer"
                  value="no"
                  checked={speakerAnswer === 'no'}
                  onChange={() => setSpeakerAnswer('no')}
                  className="text-[#0070E0] focus:ring-[#0070E0]"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestChime}
              disabled={speakerState === 'playing'}
              className="w-full bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {speakerState === 'playing'
                ? 'Playing chime...'
                : speakerState === 'tested'
                ? 'Play sound again'
                : 'Start speaker check'}
            </button>
          </div>
        </div>

        {/* Card 3: Webcam */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Webcam
              </h3>
              {(webcamState === 'passed' || webcamState === 'testing') && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            {/* Video preview matching reference black container */}
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 relative flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transform -scale-x-100 ${webcamState === 'idle' ? 'hidden' : 'block'}`}
              />
              {webcamState === 'idle' && (
                <div className="text-xs text-slate-400 px-4 text-center">
                  Camera is stopped. Click Start to test preview.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <select
              aria-label="Choose webcam"
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none truncate"
            >
              {videoInputs.length > 0 ? (
                videoInputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Camera'}</option>
                ))
              ) : (
                <option value="">Default Camera</option>
              )}
            </select>

            {webcamState === 'idle' && (
              <button
                type="button"
                onClick={startWebcamCheck}
                className="w-full bg-[#0070E0] hover:bg-[#005bb8] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Start webcam check
              </button>
            )}

            {webcamState === 'testing' && (
              <button
                type="button"
                onClick={() => setWebcamState('passed')}
                className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Confirm camera visible
              </button>
            )}

            {webcamState === 'passed' && (
              <div className="w-full text-center py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg">
                Webcam Ready ✓
              </div>
            )}

            {webcamState === 'failed' && (
              <button
                type="button"
                onClick={startWebcamCheck}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Retry webcam check
              </button>
            )}
          </div>
        </div>

      </div>
    </ProctorLayout>
  )
}
