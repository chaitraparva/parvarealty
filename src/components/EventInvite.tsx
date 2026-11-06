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
.ev-in{background:rgba(255,255,255,0.05);border:1px solid rgba(201,164,74,0.3);color:${IVORY};border-radius:12px;padding:13px 15px;font:500 15px ${SANS};width:100%;outline:none}
.ev-in:focus{border-color:#C9A44A;box-shadow:0 0 0 3px rgba(201,164,74,0.15)}
.ev-in::placeholder{color:rgba(240,235,224,0.35)}
.ev-frame{position:fixed;inset:10px;border:1px solid rgba(201,164,74,0.32);pointer-events:none;z-index:25;box-shadow:inset 0 0 0 6px rgba(0,0,0,0),inset 0 0 0 7px rgba(201,164,74,0.10)}
.ev-wrap{position:relative;min-height:100%;display:flex;flex-direction:column}
.ev-photo-box{position:relative;width:100%;height:40vh;height:40svh;min-height:230px;flex:none;overflow:hidden}
.ev-glow{position:absolute;left:15%;right:15%;top:8%;bottom:10%;border-radius:50%;background:radial-gradient(circle,rgba(232,201,126,0.30),transparent 68%);filter:blur(10px)}
.ev-photo-resp{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 14%;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0%,#000 14%,#000 62%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0%,#000 14%,#000 62%,transparent 100%)}
.ev-brand{position:absolute;top:26px;left:0;right:0;z-index:3;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px;font-size:22px}
.ev-brand-bar{width:1px;height:20px;background:rgba(201,164,74,0.6)}
.ev-brand-group{font-size:11px;letter-spacing:0.4em;color:rgba(240,235,224,0.8)}
.ev-brand-presents{font-style:italic;font-size:18px;color:#E8C97E}
.ev-text{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:0 20px 28px;margin-top:-44px}
.ev-br{display:none}
.ev-eyebrow{display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:0.3em;color:#D4AF5A;font-weight:600}
.ev-line{width:34px;height:1.5px;background:#C9A44A;flex:none}
.ev-tagline{font-style:italic;font-size:clamp(1.05rem,4.6vw,1.6rem);line-height:1.2;margin-top:10px;color:#F0EBE0}
.ev-name{font-weight:700;font-size:clamp(2.3rem,11.4vw,5rem);line-height:0.95;margin:8px 0 0;letter-spacing:0.01em;white-space:nowrap}
.ev-facts{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 8px;margin-top:10px;font-size:clamp(9.5px,2.6vw,12.5px);letter-spacing:0.14em;color:rgba(240,235,224,0.82);font-weight:600}
.ev-when{display:flex;flex-direction:row;align-items:center;gap:14px;margin-top:16px;max-width:560px;text-align:left}
.ev-datebox{width:84px;padding:7px 0 6px;border:1px solid rgba(201,164,74,0.6);background:rgba(201,164,74,0.06);text-align:center;flex:none}
.ev-date-sm{font-size:10px;letter-spacing:0.3em;padding-left:0.3em;font-weight:600}
.ev-date-big{font-weight:700;font-size:38px;line-height:1;font-variant-numeric:lining-nums}
.ev-msg{font-size:clamp(0.95rem,3.9vw,1.25rem);line-height:1.35;color:rgba(240,235,224,0.9);margin:0;text-align:left}
.ev-actions{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:20px;width:100%}
.ev-cta{display:inline-flex;align-items:center;justify-content:center;gap:14px;height:56px;padding:0 30px;border-radius:999px;width:min(100%,360px);
  background:linear-gradient(100deg,#B8913A 0%,#F3D98B 45%,#E8C97E 62%,#C9A44A 100%);color:#1a1306;font-weight:700;font-size:15px;letter-spacing:0.16em;
  box-shadow:inset 0 2px 0 rgba(255,245,215,0.65),0 12px 40px rgba(201,164,74,0.35)}
.ev-actions-side{text-align:center}
.ev-invite-only{font-size:11px;letter-spacing:0.3em;color:#D4AF5A;font-weight:600}
.ev-continue{margin-top:6px;font-size:13px;letter-spacing:0.1em;color:rgba(240,235,224,0.7);text-decoration:underline;text-underline-offset:5px}

/* Tablet portrait: a little more air */
@media (min-width:600px){
  .ev-photo-box{height:48vh;height:48svh}
  .ev-text{justify-content:center;padding-bottom:44px}
  .ev-name{font-size:clamp(3.6rem,10vw,6rem)}
  .ev-tagline{margin-top:14px}.ev-facts{margin-top:16px}
  .ev-datebox{width:112px;padding:10px 0 9px}.ev-date-big{font-size:48px}.ev-date-sm{font-size:11px}
  .ev-cta{height:62px}.ev-actions{margin-top:26px}
  .ev-eyebrow{font-size:13px}.ev-line{width:48px}
  .ev-facts{font-size:13px}
  .ev-when{flex-direction:row;text-align:left;gap:26px}
  .ev-msg{text-align:left}
  .ev-actions{flex-direction:row;justify-content:center;gap:30px}
  .ev-actions-side{text-align:left}
}

/* Landscape screens (laptops, desktops, TVs, landscape tablets): text left, photo full-height right */
@media (min-width:900px) and (min-aspect-ratio:11/10){
  .ev-frame{inset:18px}
  .ev-wrap{flex-direction:row-reverse;min-height:100vh;min-height:100svh}
  .ev-photo-box{width:46%;height:auto;min-height:100vh;min-height:100svh}
  .ev-glow{left:5%;right:5%;top:5%;bottom:20%}
  .ev-photo-resp{object-position:center 12%;
    -webkit-mask-image:linear-gradient(to right,transparent 0%,#000 36%),linear-gradient(to bottom,#000 82%,transparent 100%);-webkit-mask-composite:source-in;
    mask-image:linear-gradient(to right,transparent 0%,#000 36%),linear-gradient(to bottom,#000 82%,transparent 100%);mask-composite:intersect}
  .ev-brand{top:6vh;left:6vw;right:auto;justify-content:flex-start;font-size:clamp(22px,1.9vw,34px)}
  .ev-brand-bar{height:clamp(20px,1.6vw,30px)}
  .ev-brand-group{font-size:clamp(11px,0.85vw,15px)}
  .ev-brand-presents{font-size:clamp(17px,1.4vw,24px)}
  .ev-text{align-items:flex-start;text-align:left;margin-top:0;padding:clamp(90px,15vh,170px) 2vw clamp(40px,7vh,90px) 6vw}
  .ev-eyebrow{font-size:clamp(12px,0.95vw,17px)}
  .ev-line-end{display:none}
  .ev-line{width:clamp(40px,3vw,60px)}
  .ev-tagline{font-size:clamp(1.3rem,min(2.3vw,4.2vh),2.6rem);margin-top:clamp(12px,2.6vh,30px)}
  .ev-br{display:inline}
  .ev-name{font-size:clamp(4rem,min(7.4vw,14.5vh),9rem);line-height:0.9;margin-top:clamp(8px,2vh,24px);white-space:normal}
  .ev-facts{justify-content:flex-start;font-size:clamp(11px,0.9vw,16px);letter-spacing:0.22em;margin-top:clamp(12px,2.4vh,26px)}
  .ev-when{flex-direction:row;align-items:center;max-width:min(52vw,900px);gap:clamp(18px,2vw,36px);margin-top:clamp(20px,4.5vh,52px)}
  .ev-datebox{width:clamp(110px,8.5vw,160px);padding:clamp(8px,1.4vh,16px) 0}
  .ev-date-sm{font-size:clamp(11px,0.8vw,14px)}
  .ev-date-big{font-size:clamp(44px,min(3.8vw,7.2vh),70px)}
  .ev-msg{font-size:clamp(1.05rem,min(1.5vw,2.9vh),1.75rem)}
  .ev-actions{flex-direction:row;justify-content:flex-start;align-items:center;gap:clamp(20px,2vw,36px);margin-top:clamp(22px,4.5vh,50px);width:auto}
  .ev-cta{width:auto;height:clamp(56px,7.5vh,80px);padding:0 clamp(28px,2.4vw,44px);font-size:clamp(14px,1vw,19px)}
  .ev-actions-side{text-align:left}
  .ev-invite-only{font-size:clamp(11px,0.75vw,14px)}
  .ev-continue{font-size:clamp(13px,0.85vw,16px)}
}
/* Short landscape screens (small laptops / landscape phones): tighten vertical spacing */
@media (min-width:900px) and (min-aspect-ratio:11/10) and (max-height:620px){
  .ev-text{padding-top:72px;padding-bottom:28px}
  .ev-when{margin-top:16px}.ev-actions{margin-top:18px}
}
/* Landscape phones (wide but short, under 900px): side by side, compact */
@media (max-width:899px) and (orientation:landscape) and (max-height:500px){
  .ev-wrap{flex-direction:row-reverse}
  .ev-photo-box{width:42%;height:auto;min-height:100vh}
  .ev-photo-resp{-webkit-mask-image:linear-gradient(to right,transparent 0%,#000 35%);mask-image:linear-gradient(to right,transparent 0%,#000 35%)}
  .ev-brand{top:14px;left:24px;right:auto;justify-content:flex-start;font-size:18px}
  .ev-text{align-items:flex-start;text-align:left;margin-top:0;padding:46px 12px 14px 28px;justify-content:center}
  .ev-line-end{display:none}
  .ev-tagline{font-size:1rem;margin-top:8px}
  .ev-name{font-size:2.2rem;margin-top:4px}
  .ev-facts{justify-content:flex-start;margin-top:8px;font-size:10px}
  .ev-when{flex-direction:row;margin-top:12px;gap:14px}
  .ev-datebox{width:84px;padding:6px 0}.ev-date-big{font-size:32px}
  .ev-msg{font-size:0.85rem;text-align:left}
  .ev-actions{flex-direction:row;justify-content:flex-start;margin-top:10px;gap:18px;width:auto}
  .ev-cta{height:48px;width:auto;font-size:13px;padding:0 22px}
  .ev-actions-side{text-align:left}
}
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
              <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#C9A44A', fontWeight: 500 }}>AN EVENING WITH MAHESH BHUPATHI · SAT 14 NOV</div>
              <div className="ev-gold mt-2" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 32, lineHeight: 1.05 }}>Reserve Your Seat</div>
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
        <span className="hidden sm:inline" style={{ opacity: 0.85 }}>· An evening with a legend</span>
        <span className="whitespace-nowrap" style={{ opacity: 0.85 }}>· 14 Nov</span>
        <button onClick={() => setFormOpen(true)} className="ml-1 sm:ml-2 underline whitespace-nowrap" style={{ color: GOLD, textUnderlineOffset: 3, fontWeight: 600 }}>
          Reserve your seat →
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
            <span style={{ fontSize: 9, letterSpacing: '0.22em', color: '#C9A44A', fontWeight: 600 }}>AN EVENING WITH A LEGEND · 14 NOV</span>
            <span style={{ fontSize: 13, color: IVORY, fontWeight: 600 }}>Reserve your seat</span>
          </span>
        </button>
      )}

      {/* Opening screen — fully responsive invitation (fills phones, tablets, laptops, big screens) */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="An evening with Mahesh Bhupathi, hosted by Parva Group, Saturday 14 November 2026"
          className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden transition-opacity duration-500"
          style={{ opacity: shown ? 1 : 0, background: 'radial-gradient(ellipse 70% 60% at 75% 30%, rgba(201,164,74,0.16), transparent 70%), linear-gradient(160deg,#0f0c08 0%,#0a0806 60%,#0c0906 100%)', color: IVORY, fontFamily: SANS }}
        >
          <button onClick={close} aria-label="Close and go to the website" className="fixed z-30" style={{ top: 14, right: 18, color: 'rgba(240,235,224,0.75)', fontSize: 32, lineHeight: 1 }}>×</button>
          <div className="ev-frame" aria-hidden="true" />

          <div className="ev-wrap">
            {/* Photo */}
            <div className="ev-photo-box">
              <div className="ev-glow" aria-hidden="true" />
              <img src={maheshImg} alt="Mahesh Bhupathi" className="ev-photo-resp" />
            </div>

            {/* Brand */}
            <div className="ev-brand">
              <span className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, letterSpacing: '0.36em' }}>PARVA</span>
              <span className="ev-brand-bar" />
              <span className="ev-brand-group">GROUP</span>
              <span className="ev-brand-presents" style={{ fontFamily: SERIF }}>presents</span>
            </div>

            {/* Text */}
            <div className="ev-text">
              <div className="ev-eyebrow">
                <span className="ev-line" />
                <span>AN EVENING WITH A LEGEND</span>
                <span className="ev-line ev-line-end" />
              </div>
              <div className="ev-tagline" style={{ fontFamily: SERIF }}>Champions are made in moments like these.</div>
              <h2 className="ev-name ev-gold" style={{ fontFamily: SERIF }}>Mahesh<br className="ev-br" /> Bhupathi</h2>
              <div className="ev-facts">
                <span>12 GRAND SLAM TITLES</span>
                <span style={{ color: GOLD }}>◆</span>
                <span>FIRST INDIAN GRAND SLAM CHAMPION</span>
              </div>

              <div className="ev-when">
                <div className="ev-datebox">
                  <div className="ev-date-sm" style={{ color: '#D4AF5A' }}>SAT</div>
                  <div className="ev-date-big ev-gold" style={{ fontFamily: SERIF }}>14</div>
                  <div className="ev-date-sm">NOV 2026</div>
                </div>
                <p className="ev-msg" style={{ fontFamily: SERIF }}>
                  Join Parva Group for an intimate, invite-only evening — stories from the world's biggest courts, the mindset behind every win, and a rare chance to meet the man himself.
                </p>
              </div>

              <div className="ev-actions">
                <button onClick={() => setFormOpen(true)} className="ev-btn ev-cta">
                  <span>RESERVE MY SEAT</span>
                  <span style={{ fontSize: '1.35em', lineHeight: 1 }}>→</span>
                </button>
                <div className="ev-actions-side">
                  <div className="ev-invite-only">STRICTLY BY INVITATION</div>
                  <button onClick={close} className="ev-continue">Continue to website</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formOpen && <InviteForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
