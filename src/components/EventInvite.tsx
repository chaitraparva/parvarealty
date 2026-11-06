import { useEffect, useState } from 'react'
import maheshImg from '../imports/mahesh-bhupathi.webp'
import { submitInvite } from '../store/inviteStore'

// Event: Mahesh Bhupathi at Parva Group — 14 November 2026.
// The whole announcement (opening screen, top strip, floating button) hides itself
// automatically after the event day ends (Dubai time).
const HIDE_AFTER = new Date('2026-11-15T00:00:00+04:00')
const SEEN_KEY = 'parva-event-invite-seen'
const STRIP_H = '36px'

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&display=swap'
const SERIF = "'Cormorant Garamond', 'Playfair Display', serif"
const SANS = "'Montserrat', 'Outfit', sans-serif"
const GOLD = '#E8C97E'
const IVORY = '#F0EBE0'

const CSS = `
.ev-gold{background:linear-gradient(100deg,#A9822F 0%,#F3D98B 38%,#C9A44A 60%,#F6E3A6 80%,#B8913A 100%);background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:evGold 7s linear infinite}
@keyframes evGold{to{background-position:-200% center}}
.ev-btn{transition:transform .25s ease,box-shadow .25s ease,filter .25s ease}
.ev-btn:hover{transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 0 0 1px rgba(255,236,180,.5),0 14px 40px rgba(201,164,74,.45)}
.ev-photo{-webkit-mask-image:linear-gradient(to bottom,#000 72%,transparent 100%),linear-gradient(to right,transparent 0%,#000 22%);
  -webkit-mask-composite:source-in;mask-image:linear-gradient(to bottom,#000 72%,transparent 100%),linear-gradient(to right,transparent 0%,#000 22%);mask-composite:intersect}
.ev-in{background:rgba(255,255,255,0.05);border:1px solid rgba(201,164,74,0.3);color:${IVORY};border-radius:12px;padding:13px 15px;font:500 15px ${SANS};width:100%;outline:none}
.ev-in:focus{border-color:#C9A44A;box-shadow:0 0 0 3px rgba(201,164,74,0.15)}
.ev-in::placeholder{color:rgba(240,235,224,0.35)}
@media (prefers-reduced-motion:reduce){.ev-gold{animation:none}}
`

function PersonPlusIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.9 3.1-7 7-7 1.6 0 3 .5 4.2 1.4" />
      <path d="M5 13v5M2.5 15.5h5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke={GOLD} strokeWidth="2" aria-hidden="true">
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M6 19h36M15 5v9M33 5v9" strokeLinecap="round" />
      {[0, 1, 2, 3].map(c => [0, 1, 2].map(r => (
        <rect key={`${c}-${r}`} x={12 + c * 7} y={24 + r * 5.5} width="3.4" height="3" fill={GOLD} stroke="none" />
      )))}
    </svg>
  )
}

/** Thin gold rule with an optional centred sparkle. */
function Rule({ sparkle = false, width = '100%' }: { sparkle?: boolean; width?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mx-auto" style={{ width }}>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
      {sparkle && <span style={{ color: GOLD, fontSize: 16, lineHeight: 1 }}>✦</span>}
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
    </div>
  )
}

/** Flowing gold waves like the poster's bottom edge. */
function Waves() {
  return (
    <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="absolute left-0 right-0 bottom-0 w-full pointer-events-none" style={{ height: 150 }} aria-hidden="true">
      <defs>
        <linearGradient id="evWave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8A6A25" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#F3D98B" />
          <stop offset="1" stopColor="#8A6A25" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="evGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9A44A" stopOpacity="0.18" />
          <stop offset="1" stopColor="#C9A44A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 70 C150 140 330 40 600 105 L600 160 L0 160Z" fill="url(#evGlow)" />
      <path d="M0 70 C150 140 330 40 600 105" stroke="url(#evWave)" strokeWidth="2.2" fill="none" />
      <path d="M0 95 C170 150 360 70 600 128" stroke="url(#evWave)" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M0 118 C200 160 380 100 600 148" stroke="url(#evWave)" strokeWidth="0.8" fill="none" opacity="0.5" />
    </svg>
  )
}

// ─── Request-an-invite form (modal) ──────────────────────────────────────────
function InviteForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [trap, setTrap] = useState('') // hidden field: bots fill it, people don't
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError('')
    if (trap) { setDone(true); return }
    setBusy(true)
    try {
      await submitInvite(name, phone)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
    setBusy(false)
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Request an invite"
    >
      <div
        className="relative w-full rounded-2xl"
        style={{
          maxWidth: 420,
          padding: '34px 28px 28px',
          background: 'linear-gradient(180deg,#17120a,#0b0906)',
          border: '1px solid rgba(201,164,74,0.4)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 50px rgba(201,164,74,0.12)',
          fontFamily: SANS,
          color: IVORY,
        }}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-4" style={{ color: 'rgba(240,235,224,0.5)', fontSize: 26, lineHeight: 1 }}>×</button>

        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-5 flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(201,164,74,0.6)', color: GOLD, fontSize: 30 }}>✓</div>
            <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 30, lineHeight: 1.1 }}>Thank you{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}!</div>
            <p className="mt-3" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: 'rgba(240,235,224,0.85)' }}>
              Your invite request has been received. Our team will call you soon to confirm your place.
            </p>
            <button onClick={onClose} className="ev-btn mt-7 px-8 py-3 rounded-full" style={{ background: 'linear-gradient(90deg,#B8913A,#E8C97E)', color: '#120d04', fontWeight: 700, fontSize: 12, letterSpacing: '0.2em' }}>
              DONE
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="text-center mb-6">
              <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#C9A44A', fontWeight: 500 }}>MAHESH BHUPATHI · 14 NOVEMBER</div>
              <div className="ev-gold mt-2" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 32, lineHeight: 1.05 }}>Request an Invite</div>
            </div>

            <label className="block mb-4">
              <span className="block mb-2" style={{ fontSize: 10.5, letterSpacing: '0.22em', color: 'rgba(201,164,74,0.85)', fontWeight: 600 }}>FULL NAME</span>
              <input className="ev-in" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoComplete="name" maxLength={100} required autoFocus />
            </label>

            <label className="block mb-2">
              <span className="block mb-2" style={{ fontSize: 10.5, letterSpacing: '0.22em', color: 'rgba(201,164,74,0.85)', fontWeight: 600 }}>PHONE NUMBER</span>
              <input className="ev-in" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 123 4567" autoComplete="tel" maxLength={20} required />
            </label>
            <p style={{ fontSize: 11.5, color: 'rgba(240,235,224,0.4)' }}>Please include your country code.</p>

            {/* Hidden from people; catches spam bots */}
            <input value={trap} onChange={e => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

            {error && <p className="mt-4" style={{ fontSize: 13, color: '#F87171' }}>{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="ev-btn w-full mt-6 py-3.5 rounded-full flex items-center justify-center gap-3 disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg,#B8913A,#F3D98B 55%,#C9A44A)', color: '#120d04', fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', boxShadow: '0 8px 30px rgba(201,164,74,0.3)' }}
            >
              {busy ? 'SENDING…' : 'SEND REQUEST'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function EventInvite() {
  const active = Date.now() < HIDE_AFTER.getTime()
  const [open, setOpen] = useState(() => {
    if (!active) return false
    try { return sessionStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
  })
  const [shown, setShown] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  // Fonts for this announcement only
  useEffect(() => {
    if (!active || document.getElementById('parva-event-fonts')) return
    const link = document.createElement('link')
    link.id = 'parva-event-fonts'
    link.rel = 'stylesheet'
    link.href = FONTS_URL
    document.head.appendChild(link)
  }, [active])

  // Push the fixed nav below the top strip (Nav.tsx reads --sold-strip-h)
  useEffect(() => {
    if (!active) return
    document.documentElement.style.setProperty('--sold-strip-h', STRIP_H)
    return () => { document.documentElement.style.removeProperty('--sold-strip-h') }
  }, [active])

  // Fade in + lock page scroll while the opening screen is up
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => setShown(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !formOpen) close() }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, formOpen])

  function close() {
    setShown(false)
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setTimeout(() => setOpen(false), 400)
  }

  if (!active) return null

  return (
    <>
      <style>{CSS}</style>

      {/* Top strip above the nav */}
      <div
        className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-3"
        style={{ height: STRIP_H, background: 'linear-gradient(90deg,#1a1408,#3a2c10,#1a1408)', borderBottom: '1px solid rgba(201,164,74,0.4)', color: IVORY, fontFamily: SANS, fontSize: 12 }}
      >
        <span className="whitespace-nowrap" style={{ color: GOLD, fontWeight: 600, letterSpacing: '0.12em' }}>MAHESH BHUPATHI</span>
        <span className="hidden sm:inline" style={{ opacity: 0.85 }}>at Parva Group</span>
        <span className="whitespace-nowrap" style={{ opacity: 0.85 }}>· 14 Nov</span>
        <button onClick={() => setFormOpen(true)} className="ml-1 sm:ml-2 underline whitespace-nowrap" style={{ color: GOLD, textUnderlineOffset: 3, fontWeight: 600 }}>
          Request an invite →
        </button>
      </div>

      {/* Small floating button (bottom-left; WhatsApp/chat sit bottom-right) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open the Mahesh Bhupathi event invitation"
          className="ev-btn fixed z-40 flex items-center gap-3 rounded-2xl text-left"
          style={{ left: 16, bottom: 22, padding: '10px 14px', background: 'rgba(10,8,4,0.9)', border: '1px solid rgba(201,164,74,0.5)', boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 24px rgba(201,164,74,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', fontFamily: SANS }}
        >
          <img src={maheshImg} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid rgba(201,164,74,0.6)', background: '#1a140a' }} />
          <span className="flex flex-col">
            <span style={{ fontSize: 9, letterSpacing: '0.22em', color: '#C9A44A', fontWeight: 600 }}>EXCLUSIVE EVENT · 14 NOV</span>
            <span style={{ fontSize: 13, color: IVORY, fontWeight: 600 }}>Request an invite</span>
          </span>
        </button>
      )}

      {/* Opening screen — the invitation */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Exclusive event: Mahesh Bhupathi at Parva Group, 14 November"
          className="fixed inset-0 z-[100] overflow-y-auto transition-opacity duration-500"
          style={{ opacity: shown ? 1 : 0, background: 'rgba(3,3,2,0.97)', color: IVORY, fontFamily: SANS }}
        >
          <div
            className="relative mx-auto min-h-full overflow-hidden"
            style={{
              maxWidth: 640,
              background:
                'radial-gradient(ellipse 70% 40% at 80% 18%, rgba(201,164,74,0.22), transparent 70%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(201,164,74,0.12), transparent 70%), linear-gradient(180deg,#0e0b07,#070604)',
              boxShadow: '0 0 0 1px rgba(201,164,74,0.12)',
            }}
          >
            <button onClick={close} aria-label="Close and go to the website" className="absolute z-20" style={{ top: 12, right: 16, color: 'rgba(240,235,224,0.6)', fontSize: 30, lineHeight: 1 }}>×</button>

            {/* Top-right gold sweep */}
            <svg viewBox="0 0 300 300" className="absolute pointer-events-none" style={{ top: -40, right: -60, width: 360, height: 360, opacity: 0.35 }} aria-hidden="true">
              <path d="M20 300 C120 220 200 120 300 20" stroke="#C9A44A" strokeWidth="1.2" fill="none" />
              <path d="M60 300 C150 230 230 140 300 70" stroke="#C9A44A" strokeWidth="0.6" fill="none" opacity="0.6" />
            </svg>

            <div className="relative px-5 sm:px-8" style={{ paddingTop: 30, paddingBottom: 170 }}>
              {/* PARVA GROUP header */}
              <div className="flex items-center gap-4">
                <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                <div className="text-center">
                  <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 34, letterSpacing: '0.45em', paddingLeft: '0.45em', lineHeight: 1 }}>PARVA</div>
                  <div style={{ fontSize: 12, letterSpacing: '0.4em', paddingLeft: '0.4em', color: 'rgba(240,235,224,0.75)', marginTop: 6 }}>GROUP</div>
                </div>
                <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
              </div>

              {/* Hero: text left, photo right */}
              <div className="relative" style={{ minHeight: 'clamp(300px, 70vw, 400px)', marginTop: 18 }}>
                <div aria-hidden="true" className="absolute" style={{ right: '2%', top: '2%', width: '62%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.35), rgba(201,164,74,0.08) 55%, transparent 70%)', filter: 'blur(6px)' }} />
                <img
                  src={maheshImg}
                  alt="Mahesh Bhupathi"
                  className="ev-photo absolute"
                  style={{ right: -18, bottom: 0, width: '68%', maxWidth: 430, height: 'auto' }}
                />
                <div className="relative z-10" style={{ width: '62%', paddingTop: 'clamp(28px, 7vw, 54px)' }}>
                  <div style={{ fontSize: 'clamp(10px, 2.6vw, 13px)', letterSpacing: '0.28em', color: '#C9A44A', fontWeight: 500 }}>AN EXCLUSIVE EVENT</div>
                  <div style={{ width: 54, height: 1, background: '#C9A44A', margin: '16px 0 18px' }} />
                  <div style={{ fontSize: 'clamp(14px, 3.8vw, 20px)', letterSpacing: '0.38em', color: IVORY, fontWeight: 500 }}>INVITING</div>
                  <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.2rem, 10vw, 3.7rem)', lineHeight: 0.95, marginTop: 8, letterSpacing: '0.01em' }}>
                    MAHESH<br />BHUPATHI
                  </div>
                  <div style={{ fontSize: 'clamp(12px, 3.4vw, 18px)', letterSpacing: '0.3em', color: IVORY, fontWeight: 500, marginTop: 14 }}>TO PARVA GROUP</div>
                </div>
              </div>

              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#C9A44A 20%,#C9A44A 80%,transparent)', margin: '6px 0 30px' }} />

              {/* Date */}
              <div className="text-center" style={{ fontSize: 'clamp(11px, 3vw, 14px)', letterSpacing: '0.24em', color: IVORY, fontWeight: 500 }}>
                JOIN US FOR AN EXCITING EVENT ON
              </div>
              <div className="flex items-center justify-center gap-4 sm:gap-5" style={{ marginTop: 18 }}>
                <CalendarIcon />
                <span style={{ width: 1, height: 52, background: 'rgba(201,164,74,0.7)' }} />
                <span className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.2rem, 9vw, 3.4rem)', lineHeight: 1, fontVariantNumeric: 'lining-nums' }}>
                  NOVEMBER 14<sup style={{ fontSize: '0.42em', verticalAlign: 'super', marginLeft: 2 }}>TH</sup>
                </span>
              </div>

              <p className="text-center mx-auto" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 4.6vw, 1.55rem)', lineHeight: 1.35, color: 'rgba(240,235,224,0.92)', maxWidth: 520, marginTop: 26 }}>
                Be a part of this special occasion and experience an inspiring interaction with{' '}
                <span style={{ color: GOLD, fontWeight: 600 }}>Mahesh Bhupathi</span> at Parva Group.
              </p>

              {/* Request an invite */}
              <div className="flex justify-center" style={{ marginTop: 32 }}>
                <button
                  onClick={() => setFormOpen(true)}
                  className="ev-btn flex items-center rounded-2xl"
                  style={{
                    width: 'min(100%, 420px)',
                    padding: '18px 26px',
                    background: 'linear-gradient(100deg,#B8913A 0%,#F3D98B 45%,#E8C97E 60%,#C9A44A 100%)',
                    color: '#1a1306',
                    boxShadow: 'inset 0 1px 0 rgba(255,245,215,0.6), 0 10px 34px rgba(201,164,74,0.35)',
                  }}
                >
                  <PersonPlusIcon size={26} />
                  <span style={{ width: 1, height: 30, background: 'rgba(26,19,6,0.5)', margin: '0 18px' }} />
                  <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 'clamp(14px, 3.8vw, 17px)', letterSpacing: '0.16em' }}>REQUEST AN INVITE</span>
                </button>
              </div>

              <div style={{ marginTop: 34 }}><Rule sparkle width="88%" /></div>

              <div className="text-center" style={{ marginTop: 26, fontSize: 'clamp(11px, 3vw, 14px)', letterSpacing: '0.3em', color: '#C9A44A', fontWeight: 500 }}>
                DON'T MISS THIS EXCLUSIVE EVENT
              </div>
              <div className="text-center" style={{ marginTop: 12, fontSize: 'clamp(11px, 2.8vw, 13px)', letterSpacing: '0.4em', color: 'rgba(240,235,224,0.8)' }}>
                PARVA GROUP
              </div>

              <div className="text-center" style={{ marginTop: 28, position: 'relative', zIndex: 5 }}>
                <button onClick={close} style={{ fontSize: 12, letterSpacing: '0.12em', color: 'rgba(240,235,224,0.6)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                  Continue to website →
                </button>
              </div>
            </div>

            <Waves />
          </div>
        </div>
      )}

      {formOpen && <InviteForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
