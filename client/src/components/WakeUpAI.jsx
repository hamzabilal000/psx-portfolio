import { useEffect, useRef, useState } from 'react'
import api from '../api'

/**
 * Shows when an AI feature fails because the service is sleeping.
 * Pings /gemini/status every 15s and calls onReady() when it's up.
 *
 * Props:
 *   onReady()   — called when the service comes online, so parent can retry
 *   compact     — smaller inline variant (for chat bubble / verdict card)
 */
function WakeUpAI({ onReady, compact = false }) {
  const [dots, setDots]         = useState(0)
  const [elapsed, setElapsed]   = useState(0)
  const [checking, setChecking] = useState(false)
  const [ready, setReady]       = useState(false)
  const timerRef = useRef(null)
  const pollRef  = useRef(null)

  useEffect(() => {
    // Tick seconds
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    // Animate dots
    const dotTimer = setInterval(() => setDots(d => (d + 1) % 4), 500)
    // Auto-poll every 15s
    pollRef.current = setInterval(ping, 15000)
    ping()  // immediate first ping

    return () => {
      clearInterval(timerRef.current)
      clearInterval(dotTimer)
      clearInterval(pollRef.current)
    }
  }, [])

  async function ping() {
    setChecking(true)
    try {
      const res = await api.get('/gemini/status')
      if (res.data?.data?.status === 'ready') {
        setReady(true)
        clearInterval(timerRef.current)
        clearInterval(pollRef.current)
        setTimeout(() => onReady?.(), 600)
      }
    } catch {}
    setChecking(false)
  }

  if (ready) {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '12px' : '24px', animation: 'fadeSlideUp 0.4s ease' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
        <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: compact ? '12px' : '14px', margin: 0 }}>
          AI service is online! Loading...
        </p>
      </div>
    )
  }

  const dotStr = '.'.repeat(dots)

  if (compact) {
    return (
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#f59e0b',
            animation: 'ai-dot 1.2s ease-in-out infinite alternate',
          }} />
          <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
            AI warming up{dotStr}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '11px', marginLeft: 'auto' }}>{elapsed}s</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '11px', margin: '0 0 8px', lineHeight: 1.5 }}>
          The AI service is starting up — usually 30–60 seconds on first use.
        </p>
        <button
          onClick={ping}
          disabled={checking}
          className="btn-ghost"
          style={{ fontSize: '11px', padding: '5px 12px' }}
        >
          {checking ? 'Checking...' : '↺ Check Now'}
        </button>
      </div>
    )
  }

  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      animation: 'fadeSlideUp 0.4s ease both',
    }}>
      {/* Pulsing satellite icon */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
        <div style={{
          position: 'absolute', inset: '-14px', borderRadius: '50%',
          border: '2px solid rgba(245,158,11,0.15)',
          animation: 'pulse-ring 2s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '-7px', borderRadius: '50%',
          border: '2px solid rgba(245,158,11,0.2)',
          animation: 'pulse-ring 2s ease-out 0.7s infinite',
        }} />
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(245,158,11,0.08)',
          border: '2px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '30px',
        }}>📡</div>
      </div>

      <h3 style={{ color: 'var(--white)', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
        AI Service Is Starting Up
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 6px', lineHeight: 1.7, maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
        The AI service runs on free hosting and sleeps when idle.
        It usually takes <strong style={{ color: 'var(--white)' }}>30–60 seconds</strong> to wake up.
      </p>
      <p style={{ color: '#f59e0b', fontSize: '12px', margin: '0 0 28px' }}>
        Checking automatically every 15 seconds{dotStr} ({elapsed}s elapsed)
      </p>

      {/* Progress bar */}
      <div style={{
        width: '240px', height: '4px', background: 'var(--border)',
        borderRadius: '4px', margin: '0 auto 24px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, (elapsed / 60) * 100)}%`,
          background: 'linear-gradient(90deg, #f59e0b, #b9ff66)',
          borderRadius: '4px',
          transition: 'width 1s linear',
        }} />
      </div>

      <button
        onClick={ping}
        disabled={checking}
        className="btn-primary"
        style={{ opacity: checking ? 0.7 : 1 }}
      >
        {checking
          ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0d0d0d', animation: 'rotate-glow 0.7s linear infinite', display: 'inline-block' }} />
              Checking...
            </span>
          : '↺ Check Now'
        }
      </button>

      {elapsed >= 70 && (
        <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '20px', opacity: 0.7 }}>
          Taking longer than usual? Try refreshing the page or wait a bit more.
        </p>
      )}
    </div>
  )
}

export default WakeUpAI
