import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reading market fundamentals...',
  'Analyzing financial ratios...',
  'Comparing dividend history...',
  'Calculating risk profiles...',
  'Reviewing 5-year performance...',
  'Cross-referencing PSX data...',
  'Running sector analysis...',
  'Building your insight...',
]

/**
 * mode="full"  — centered card, use for whole-page loading states
 * mode="inline" — compact, use inside cards / verdict sections
 * mode="chat"  — tiny dots with message for chat widgets
 */
function AIThinking({ mode = 'full', label = 'AI is analyzing' }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const msg = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 2800)
    const sec = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => { clearInterval(msg); clearInterval(sec) }
  }, [])

  /* ── CHAT MODE ─────────────────────────────────────── */
  if (mode === 'chat') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 0' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '7px', height: '7px', borderRadius: '50%', background: 'var(--lime)',
              animation: `ai-dot 1.4s ${i * 0.22}s infinite ease-in-out`,
            }} />
          ))}
          <span key={msgIdx} style={{
            color: 'var(--muted)', fontSize: '11px', marginLeft: '6px',
            animation: 'fadeSlideUp 0.35s ease both',
          }}>{MESSAGES[msgIdx]}</span>
        </div>
        {elapsed >= 15 && (
          <p style={{ color: '#f59e0b', fontSize: '11px', margin: 0, animation: 'fadeSlideUp 0.4s ease' }}>
            ⏳ AI is warming up — may take up to 60s...
          </p>
        )}
      </div>
    )
  }

  /* ── INLINE MODE ────────────────────────────────────── */
  if (mode === 'inline') {
    return (
      <div style={{ textAlign: 'center', padding: '28px 20px' }}>
        <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(185,255,102,0.12)' }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: '#b9ff66',
            animation: 'rotate-glow 1s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '8px', borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: 'rgba(185,255,102,0.35)',
            animation: 'rotate-glow 1.6s linear infinite reverse',
          }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✦</div>
        </div>
        <p key={msgIdx} style={{
          color: 'var(--white)', fontSize: '13px', fontWeight: 600, margin: '0 0 8px',
          animation: 'fadeSlideUp 0.4s ease both',
        }}>{MESSAGES[msgIdx]}</p>
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '8px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)',
              animation: `ai-dot 1.4s ${i * 0.22}s infinite ease-in-out`,
            }} />
          ))}
        </div>
        {elapsed >= 12 && elapsed < 30 && (
          <p style={{ color: '#f59e0b', fontSize: '12px', margin: 0, animation: 'fadeSlideUp 0.4s ease' }}>
            ⏳ Still crunching numbers, almost there...
          </p>
        )}
        {elapsed >= 30 && (
          <p style={{ color: '#f59e0b', fontSize: '12px', margin: 0, animation: 'fadeSlideUp 0.4s ease' }}>
            🔄 Server warming up on Render — can take up to 60 seconds on first use.
          </p>
        )}
      </div>
    )
  }

  /* ── FULL MODE (default) ────────────────────────────── */
  return (
    <div style={{
      textAlign: 'center', padding: '80px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Outer glow rings */}
      <div style={{ position: 'relative', width: '96px', height: '96px', marginBottom: '28px' }}>
        <div style={{
          position: 'absolute', inset: '-12px', borderRadius: '50%',
          border: '1px solid rgba(185,255,102,0.08)',
          animation: 'pulse-ring 2.4s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '-6px', borderRadius: '50%',
          border: '1px solid rgba(185,255,102,0.12)',
          animation: 'pulse-ring 2.4s ease-out 0.8s infinite',
        }} />
        {/* Spinning border */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(185,255,102,0.1)' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid transparent', borderTopColor: '#b9ff66',
          animation: 'rotate-glow 1.1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '10px', borderRadius: '50%',
          border: '2px solid transparent', borderTopColor: 'rgba(185,255,102,0.4)',
          animation: 'rotate-glow 1.7s linear infinite reverse',
        }} />
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: '18px', borderRadius: '50%',
          background: 'rgba(185,255,102,0.06)', border: '1px solid rgba(185,255,102,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
        }}>✦</div>
      </div>

      <h3 style={{ color: 'var(--white)', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
        {label}
      </h3>

      <p key={msgIdx} style={{
        color: 'var(--muted)', fontSize: '14px', margin: '0 0 14px',
        animation: 'fadeSlideUp 0.4s ease both',
        minHeight: '22px',
      }}>{MESSAGES[msgIdx]}</p>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime)',
            animation: `ai-dot 1.4s ${i * 0.22}s infinite ease-in-out`,
          }} />
        ))}
      </div>

      {elapsed >= 15 && elapsed < 35 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '10px', padding: '10px 18px', maxWidth: '340px',
          animation: 'fadeSlideUp 0.4s ease',
        }}>
          <p style={{ color: '#f59e0b', fontSize: '13px', margin: 0 }}>
            ⏳ Still working — the AI is crunching your profile...
          </p>
        </div>
      )}
      {elapsed >= 35 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '10px', padding: '12px 20px', maxWidth: '380px',
          animation: 'fadeSlideUp 0.4s ease',
        }}>
          <p style={{ color: '#f59e0b', fontSize: '13px', margin: '0 0 4px', fontWeight: 700 }}>
            🔄 Server is warming up
          </p>
          <p style={{ color: 'rgba(245,158,11,0.8)', fontSize: '12px', margin: 0 }}>
            Running on Render's free tier — the AI service can take up to 60 seconds to wake up on first use. Hang tight!
          </p>
        </div>
      )}
    </div>
  )
}

export default AIThinking
