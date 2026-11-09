import { useEffect, useState } from 'react'
import maheshImg from '../imports/mahesh-bhupathi.webp'
import { submitInvite } from '../store/inviteStore'

// Event: Mahesh Bhupathi at Parva Group — 14 November 2026.
// The whole announcement (opening screen, top strip, floating button) hides itself
// automatically after the event day ends (Dubai time).
const HIDE_AFTER = new Date('2026-11-15T00:00:00+04:00')
const SEEN_KEY = 'parva-event-invite-seen'
const STRIP_H = '36px'
// Poster artboard size (same as the design image)
const ART_W = 738
const ART_H = 1600
// Wide layout for laptops / desktops / TVs
const WIDE_W = 1760
const WIDE_H = 900

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
.ev-photo{-webkit-mask-image:linear-gradient(to bottom,transparent 0%,#000 8%,#000 86%,transparent 100%),linear-gradient(to right,transparent 0%,#000 16%);-webkit-mask-composite:source-in;mask-image:linear-gradient(to bottom,transparent 0%,#000 8%,#000 86%,transparent 100%),linear-gradient(to right,transparent 0%,#000 16%);mask-composite:intersect}
.ev-in{background:rgba(255,255,255,0.05);border:1px solid rgba(201,164,74,0.3);color:${IVORY};border-radius:12px;padding:13px 15px;font:500 15px ${SANS};width:100%;outline:none}
.ev-in:focus{border-color:#C9A44A;box-shadow:0 0 0 3px rgba(201,164,74,0.15)}
.ev-in::placeholder{color:rgba(240,235,224,0.35)}
.ev-photo-w{-webkit-mask-image:linear-gradient(to bottom,transparent 0%,#000 7%,#000 80%,transparent 100%),linear-gradient(to right,transparent 0%,#000 18%,#000 82%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(to bottom,transparent 0%,#000 7%,#000 80%,transparent 100%),linear-gradient(to right,transparent 0%,#000 18%,#000 82%,transparent 100%);mask-composite:intersect}
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
  const [scale, setScale] = useState(1)
  const [wide, setWide] = useState(false)

  // Fit the whole invitation on any screen (phone, laptop, 4K) — text stays razor sharp because it is real text
  useEffect(() => {
    if (!open) return
    const fit = () => {
      const vw = window.visualViewport?.width ?? window.innerWidth
      const vh = window.visualViewport?.height ?? window.innerHeight
      const isWide = vw / vh >= 1.1 && vw >= 700 // landscape screens get the wide layout
      setWide(isWide)
      setScale(isWide ? Math.min(vw / WIDE_W, vh / WIDE_H) : Math.min(vw / ART_W, (vh - 8) / ART_H))
    }
    fit()
    window.addEventListener('resize', fit)
    window.visualViewport?.addEventListener('resize', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.visualViewport?.removeEventListener('resize', fit)
    }
  }, [open])

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

      {/* Opening screen — the invitation, laid out exactly like the 738×1600 poster and scaled to fit the screen */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Parva Group welcomes Mahesh Bhupathi as our new partner, 14 November"
          className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500"
          style={{ opacity: shown ? 1 : 0, background: wide ? 'linear-gradient(180deg,#0e0b07,#080604)' : 'radial-gradient(ellipse at 50% 40%, #1a140b 0%, #050403 70%)', color: IVORY, fontFamily: SANS, overflow: 'hidden' }}
        >
          <button onClick={close} aria-label="Close and go to the website" className="absolute z-20" style={{ top: 10, right: 14, color: 'rgba(240,235,224,0.7)', fontSize: 32, lineHeight: 1 }}>×</button>

          {wide ? (
            <div style={{ width: WIDE_W * scale, height: WIDE_H * scale, position: 'relative', flex: 'none' }}>
              <div
                className="absolute top-0 left-0"
                style={{
                  width: WIDE_W,
                  height: WIDE_H,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  background:
                    'radial-gradient(ellipse 30% 55% at 50% 38%, rgba(201,164,74,0.26), transparent 70%), radial-gradient(ellipse 60% 22% at 50% 100%, rgba(201,164,74,0.14), transparent 70%)',
                }}
              >
                {/* Gold sweeps */}
                <svg viewBox="0 0 1760 900" width={1760} height={900} className="absolute top-0 left-0 pointer-events-none" aria-hidden="true">
                  <path d="M1760 26 C1660 66 1560 106 1460 160" stroke="#C9A44A" strokeWidth="1.6" fill="none" opacity="0.55" />
                  <path d="M0 120 C180 160 330 230 470 330" stroke="#C9A44A" strokeWidth="1.2" fill="none" opacity="0.35" />
                  <defs>
                    <linearGradient id="evWaveW" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#F3D98B" stopOpacity="0.85" />
                      <stop offset="0.5" stopColor="#C9A44A" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#F3D98B" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>
                  <path d="M0 820 C400 900 700 860 880 860 C1060 860 1360 900 1760 820" stroke="url(#evWaveW)" strokeWidth="2.4" fill="none" />
                  <path d="M0 860 C420 920 720 890 880 890 C1040 890 1340 920 1760 860" stroke="url(#evWaveW)" strokeWidth="1.2" fill="none" opacity="0.6" />
                </svg>

                {/* PARVA GROUP header */}
                <div className="absolute" style={{ left: 120, right: 120, top: 38, display: 'flex', alignItems: 'center', gap: 34 }}>
                  <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                  <div className="text-center">
                    <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 46, letterSpacing: '0.42em', paddingLeft: '0.42em', lineHeight: 1 }}>PARVA</div>
                    <div style={{ fontSize: 16, letterSpacing: '0.38em', paddingLeft: '0.38em', color: 'rgba(240,235,224,0.8)', marginTop: 8 }}>GROUP</div>
                  </div>
                  <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
                </div>

                {/* Photo (centre) */}
                <img src={maheshImg} alt="Mahesh Bhupathi" className="ev-photo-w absolute" style={{ left: 560, top: 120, width: 640, height: 780, objectFit: 'cover', objectPosition: 'center top' }} />

                {/* Left: invitation title */}
                <div className="absolute text-center" style={{ left: 60, width: 560, top: 235 }}>
                  <div style={{ fontSize: 20, letterSpacing: '0.24em', color: '#D4AF5A', fontWeight: 500 }}>A NEW PARTNERSHIP</div>
                  <div style={{ width: 80, height: 2, background: '#C9A44A', margin: '26px auto 32px' }} />
                  <div style={{ fontSize: 28, letterSpacing: '0.36em', paddingLeft: '0.36em', color: IVORY, fontWeight: 500 }}>WELCOMING</div>
                  <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 104, lineHeight: 0.92, marginTop: 14 }}>
                    MAHESH<br />BHUPATHI
                  </div>
                  <div style={{ fontSize: 24, letterSpacing: '0.24em', paddingLeft: '0.24em', color: IVORY, fontWeight: 500, marginTop: 26 }}>AS OUR NEW PARTNER</div>
                </div>

                {/* Right: date, message, button */}
                <div className="absolute text-center" style={{ left: 1110, width: 620, top: 200 }}>
                  <div className="flex items-center justify-center" style={{ gap: 16 }}>
                    <span style={{ width: 46, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                    <span style={{ fontSize: 17, letterSpacing: '0.34em', paddingLeft: '0.34em', color: '#D4AF5A', fontWeight: 500 }}>SAVE THE DATE</span>
                    <span style={{ width: 46, height: 1.5, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
                  </div>
                  <div className="flex items-center justify-center" style={{ gap: 28, marginTop: 18 }}>
                    <span className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 96, lineHeight: 0.85, fontVariantNumeric: 'lining-nums' }}>14</span>
                    <span style={{ width: 1.5, height: 78, background: 'linear-gradient(180deg,transparent,#C9A44A 20%,#E8C97E 50%,#C9A44A 80%,transparent)' }} />
                    <span className="flex flex-col items-start" style={{ gap: 7 }}>
                      <span className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 43, lineHeight: 1, letterSpacing: '0.08em' }}>NOVEMBER</span>
                      <span style={{ fontSize: 16, letterSpacing: '0.32em', color: IVORY, fontWeight: 500, opacity: 0.85 }}>SATURDAY · 2026</span>
                    </span>
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 31, lineHeight: 1.28, color: 'rgba(240,235,224,0.94)', marginTop: 30 }}>
                    Be there as we begin a new chapter<br />and celebrate a landmark partnership<br />with{' '}
                    <span style={{ color: GOLD, fontWeight: 600 }}>Mahesh Bhupathi</span> at Parva Group.
                  </p>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="ev-btn flex items-center mx-auto"
                    style={{
                      marginTop: 36, width: 480, height: 88, borderRadius: 18, padding: '0 36px 0 44px',
                      background: 'linear-gradient(100deg,#B8913A 0%,#F3D98B 45%,#E8C97E 62%,#C9A44A 100%)',
                      color: '#1a1306',
                      boxShadow: 'inset 0 2px 0 rgba(255,245,215,0.65), inset 0 -2px 0 rgba(120,90,30,0.4), 0 14px 44px rgba(201,164,74,0.35)',
                    }}
                  >
                    <PersonPlusIcon size={34} />
                    <span style={{ width: 2, height: 40, background: 'rgba(26,19,6,0.55)', margin: '0 24px' }} />
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: 18, letterSpacing: '0.13em', whiteSpace: 'nowrap' }}>JOIN THE CELEBRATION</span>
                  </button>
                  <div className="flex items-center" style={{ gap: 14, marginTop: 34 }}>
                    <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                    <span style={{ color: GOLD, fontSize: 20, lineHeight: 1 }}>✦</span>
                    <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
                  </div>
                  <div style={{ marginTop: 20, fontSize: 17, letterSpacing: '0.3em', paddingLeft: '0.3em', color: '#D4AF5A', fontWeight: 500 }}>AN EVENING TO REMEMBER</div>
                  <div style={{ marginTop: 10, fontSize: 16, letterSpacing: '0.35em', paddingLeft: '0.35em', color: 'rgba(240,235,224,0.85)' }}>PARVA GROUP</div>
                  <button onClick={close} style={{ marginTop: 26, fontSize: 16, letterSpacing: '0.14em', color: 'rgba(240,235,224,0.7)', textDecoration: 'underline', textUnderlineOffset: 5 }}>
                    Continue to website →
                  </button>
                </div>
              </div>
            </div>
          ) : (
          <div style={{ width: ART_W * scale, height: ART_H * scale, position: 'relative', flex: 'none' }}>
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{
                width: ART_W,
                height: ART_H,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                background:
                  'radial-gradient(ellipse 55% 30% at 85% 22%, rgba(201,164,74,0.28), transparent 70%), radial-gradient(ellipse 80% 25% at 50% 96%, rgba(201,164,74,0.16), transparent 70%), linear-gradient(180deg,#0f0c08 0%,#090705 55%,#0b0906 100%)',
                boxShadow: '0 0 0 1px rgba(201,164,74,0.15), 0 30px 90px rgba(0,0,0,0.8)',
              }}
            >
              {/* Top-right gold sweep */}
              <svg viewBox="0 0 738 700" width={738} height={700} className="absolute top-0 left-0 pointer-events-none" aria-hidden="true">
                <path d="M738 20 C640 90 560 160 470 260" stroke="#C9A44A" strokeWidth="1.6" fill="none" opacity="0.7" />
                <path d="M738 0 C600 120 520 210 430 330" stroke="#C9A44A" strokeWidth="0.8" fill="none" opacity="0.35" />
              </svg>

              {/* Photo */}
              <img src={maheshImg} alt="Mahesh Bhupathi" className="ev-photo absolute" style={{ left: 300, top: 160, width: 438, height: 540, objectFit: 'cover' }} />

              {/* PARVA GROUP header */}
              <div className="absolute" style={{ left: 38, right: 38, top: 76, display: 'flex', alignItems: 'center', gap: 28 }}>
                <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                <div className="text-center">
                  <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 46, letterSpacing: '0.42em', paddingLeft: '0.42em', lineHeight: 1 }}>PARVA</div>
                  <div style={{ fontSize: 17, letterSpacing: '0.38em', paddingLeft: '0.38em', color: 'rgba(240,235,224,0.8)', marginTop: 8 }}>GROUP</div>
                </div>
                <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
              </div>

              {/* Left text block */}
              <div className="absolute text-center" style={{ left: 30, width: 400, top: 276 }}>
                <div style={{ fontSize: 18, letterSpacing: '0.22em', color: '#D4AF5A', fontWeight: 500 }}>A NEW PARTNERSHIP</div>
                <div style={{ width: 70, height: 2, background: '#C9A44A', margin: '24px auto 30px' }} />
                <div style={{ fontSize: 25, letterSpacing: '0.36em', paddingLeft: '0.36em', color: IVORY, fontWeight: 500 }}>WELCOMING</div>
                <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 82, lineHeight: 0.92, marginTop: 10 }}>
                  MAHESH<br />BHUPATHI
                </div>
                <div style={{ fontSize: 21, letterSpacing: '0.2em', paddingLeft: '0.2em', color: IVORY, fontWeight: 500, marginTop: 22, whiteSpace: 'nowrap' }}>AS OUR NEW PARTNER</div>
              </div>

              {/* Gold line */}
              <div className="absolute" style={{ left: 100, right: 98, top: 680, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A 15%,#E8C97E 50%,#C9A44A 85%,transparent)' }} />

              {/* Date */}
              <div className="absolute" style={{ left: 0, right: 0, top: 722 }}>
                <div className="flex items-center justify-center" style={{ gap: 16 }}>
                  <span style={{ width: 46, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                  <span style={{ fontSize: 18, letterSpacing: '0.34em', paddingLeft: '0.34em', color: '#D4AF5A', fontWeight: 500 }}>SAVE THE DATE</span>
                  <span style={{ width: 46, height: 1.5, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
                </div>
                <div className="flex items-center justify-center" style={{ gap: 30, marginTop: 16 }}>
                  <span className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 100, lineHeight: 0.85, fontVariantNumeric: 'lining-nums' }}>14</span>
                  <span style={{ width: 1.5, height: 82, background: 'linear-gradient(180deg,transparent,#C9A44A 20%,#E8C97E 50%,#C9A44A 80%,transparent)' }} />
                  <span className="flex flex-col items-start" style={{ gap: 8 }}>
                    <span className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 45, lineHeight: 1, letterSpacing: '0.08em' }}>NOVEMBER</span>
                    <span style={{ fontSize: 17, letterSpacing: '0.32em', color: IVORY, fontWeight: 500, opacity: 0.85 }}>SATURDAY · 2026</span>
                  </span>
                </div>
              </div>

              <p className="absolute text-center" style={{ left: 60, right: 60, top: 878, fontFamily: SERIF, fontStyle: 'italic', fontSize: 33, lineHeight: 1.25, color: 'rgba(240,235,224,0.94)' }}>
                Be there as we begin a new chapter<br />and celebrate a landmark partnership with<br />
                <span style={{ color: GOLD, fontWeight: 600 }}>Mahesh Bhupathi</span> at Parva Group.
              </p>

              {/* Request an invite */}
              <button
                onClick={() => setFormOpen(true)}
                className="ev-btn absolute flex items-center"
                style={{
                  left: 117, width: 504, top: 1055, height: 98, borderRadius: 18, padding: '0 40px 0 50px',
                  background: 'linear-gradient(100deg,#B8913A 0%,#F3D98B 45%,#E8C97E 62%,#C9A44A 100%)',
                  color: '#1a1306',
                  boxShadow: 'inset 0 2px 0 rgba(255,245,215,0.65), inset 0 -2px 0 rgba(120,90,30,0.4), 0 14px 44px rgba(201,164,74,0.35)',
                }}
              >
                <PersonPlusIcon size={38} />
                <span style={{ width: 2, height: 44, background: 'rgba(26,19,6,0.55)', margin: '0 26px' }} />
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: 19, letterSpacing: '0.13em', whiteSpace: 'nowrap' }}>JOIN THE CELEBRATION</span>
              </button>

              {/* Divider */}
              <div className="absolute flex items-center" style={{ left: 100, right: 98, top: 1200, gap: 16 }}>
                <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
                <span style={{ color: GOLD, fontSize: 24, lineHeight: 1 }}>✦</span>
                <span style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
              </div>

              <div className="absolute text-center" style={{ left: 0, right: 0, top: 1266, fontSize: 19, letterSpacing: '0.3em', paddingLeft: '0.3em', color: '#D4AF5A', fontWeight: 500 }}>
                AN EVENING TO REMEMBER
              </div>
              <div className="absolute text-center" style={{ left: 0, right: 0, top: 1313, fontSize: 18, letterSpacing: '0.35em', paddingLeft: '0.35em', color: 'rgba(240,235,224,0.85)' }}>
                PARVA GROUP
              </div>

              {/* Flowing gold waves */}
              <svg viewBox="0 0 738 280" width={738} height={280} className="absolute left-0 pointer-events-none" style={{ top: 1330 }} aria-hidden="true">
                <defs>
                  <linearGradient id="evWave" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#F3D98B" stopOpacity="0.9" />
                    <stop offset="0.5" stopColor="#C9A44A" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#F3D98B" />
                  </linearGradient>
                  <linearGradient id="evGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#C9A44A" stopOpacity="0.22" />
                    <stop offset="1" stopColor="#C9A44A" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d="M0 30 C160 110 330 150 460 140 C580 130 670 90 738 60 L738 280 L0 280Z" fill="url(#evGlow)" />
                <path d="M0 30 C160 110 330 150 460 140 C580 130 670 90 738 60" stroke="url(#evWave)" strokeWidth="3" fill="none" />
                <path d="M0 120 C200 190 380 200 520 180 C620 165 690 140 738 120" stroke="url(#evWave)" strokeWidth="1.6" fill="none" opacity="0.7" />
                <path d="M0 200 C220 250 420 250 738 200" stroke="url(#evWave)" strokeWidth="1" fill="none" opacity="0.5" />
              </svg>

              <button onClick={close} className="absolute" style={{ left: 0, right: 0, top: 1380, fontSize: 17, letterSpacing: '0.14em', color: 'rgba(240,235,224,0.7)', textDecoration: 'underline', textUnderlineOffset: 5 }}>
                Continue to website →
              </button>
            </div>
          </div>
          )}
        </div>
      )}

      {formOpen && <InviteForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
