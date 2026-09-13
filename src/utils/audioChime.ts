/**
 * Synthesize authentic OnVUE speaker test chime using Web Audio API
 */
export function playOnVueChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioContextClass()

      // Tone 1: 587.33 Hz (D5) -> Tone 2: 880 Hz (A5) bell chime
      const now = ctx.currentTime

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        // Envelope: quick attack, smooth exponential decay
        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      }

      playTone(523.25, now, 0.7)          // C5
      playTone(659.25, now + 0.18, 0.7)   // E5
      playTone(783.99, now + 0.36, 1.2)   // G5

      setTimeout(() => {
        ctx.close().catch(() => {})
        resolve()
      }, 1600)
    } catch {
      resolve()
    }
  })
}
