import { useEffect, useState } from 'react'

// Reveal date: 25 October 2026, midnight Dubai time (GST, UTC+4)
const REVEAL_DATE = new Date('2026-10-25T00:00:00+04:00')
const SEEN_KEY = 'parva-sold-teaser-seen'
const STRIP_H = '36px'
// Parva's WhatsApp (same number used in the footer and chat button)
const GUESS_WHATSAPP_URL =
  'https://wa.me/971564227855?text=' +
  encodeURIComponent("Hi Parva! I saw that Parva is evolving. My guess for who's joined the Parva Group is: ")

// Fonts used only on the announcement screen (loaded on demand, rest of the site unchanged)
const TEASER_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,500;1,600&family=Montserrat:wght@400;500;600&display=swap'
const SERIF = "'Cormorant Garamond', 'Playfair Display', serif"
const DISPLAY = "'Bodoni Moda', 'Playfair Display', serif"
const SANS = "'Montserrat', 'Outfit', sans-serif"

const TEASER_CSS = `
.pt-gold{background:linear-gradient(100deg,#A9822F 0%,#F3D98B 35%,#C9A44A 55%,#F6E3A6 75%,#B8913A 100%);background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:ptGold 6s linear infinite}
@keyframes ptGold{to{background-position:-200% center}}
.pt-glow{filter:drop-shadow(0 0 18px rgba(201,164,74,0.35))}
.pt-q{transition:transform .3s ease;animation:ptPulseRing 3s ease-in-out infinite}
@keyframes ptPulseRing{0%,100%{box-shadow:0 0 30px rgba(201,164,74,0.2),inset 0 0 20px rgba(201,164,74,0.12)}50%{box-shadow:0 0 55px rgba(201,164,74,0.45),inset 0 0 24px rgba(201,164,74,0.2)}}
.group:hover .pt-q{transform:scale(1.06)}
@media (prefers-reduced-motion:reduce){.pt-gold,.pt-q{animation:none}}
`

function getTimeLeft() {
  const diff = Math.max(0, REVEAL_DATE.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function SoldTeaser() {
  const [open, setOpen] = useState(() => {
    try { return sessionStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
  })
  const [time, setTime] = useState(getTimeLeft)
  const [shown, setShown] = useState(false)

  // Load the announcement-screen fonts once
  useEffect(() => {
    if (document.getElementById('parva-teaser-fonts')) return
    const link = document.createElement('link')
    link.id = 'parva-teaser-fonts'
    link.rel = 'stylesheet'
    link.href = TEASER_FONTS_URL
    document.head.appendChild(link)
  }, [])

  // Live countdown
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fade-in + lock page scroll while the announcement is open
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => setShown(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Push the fixed nav down below the top strip
  useEffect(() => {
    document.documentElement.style.setProperty('--sold-strip-h', STRIP_H)
    return () => { document.documentElement.style.removeProperty('--sold-strip-h') }
  }, [])

  function close() {
    setShown(false)
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setTimeout(() => setOpen(false), 400)
  }

  async function share() {
    const text = "Parva is evolving! Guess who's joined the Parva Group? The big reveal is on 25 October 2026."
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title: "Parva Is Evolving", text, url })
        return
      }
    } catch { /* user cancelled — fall back below */ }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener')
  }

  const units = [
    { v: String(time.days), l: 'Days' },
    { v: pad(time.hours), l: 'Hours' },
    { v: pad(time.mins), l: 'Mins' },
    { v: pad(time.secs), l: 'Secs' },
  ]

  return (
    <>
      {/* Top strip — always visible above the nav */}
      <div
        className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 font-outfit text-[11px] sm:text-[13px] tracking-wide"
        style={{
          height: STRIP_H,
          background: 'linear-gradient(90deg,#1a1408,#3a2c10,#1a1408)',
          borderBottom: '1px solid rgba(201,164,74,0.4)',
          color: '#F0EBE0',
        }}
      >
        <span className="font-cinzel tracking-[0.08em] sm:tracking-[0.12em] whitespace-nowrap" style={{ color: '#E8C97E', fontWeight: 600 }}>PARVA IS EVOLVING</span>
        <span className="hidden sm:inline">Guess who's joined the Parva Group?</span>
        <span className="whitespace-nowrap">
          {time.done ? 'Revealed today' : `${time.days} day${time.days === 1 ? '' : 's'}`}
          <span className="hidden sm:inline">{time.done ? '' : ' to the reveal'} · 25 October</span>
        </span>
        <button
          onClick={() => setOpen(true)}
          className="ml-1 sm:ml-2 underline underline-offset-[3px] whitespace-nowrap"
          style={{ color: '#E8C97E' }}
        >
          Guess →
        </button>
      </div>

      {/* Small floating countdown — bottom-left (WhatsApp/chat buttons are bottom-right) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open the Parva Group announcement"
          className="fixed bottom-5 left-4 sm:bottom-8 sm:left-5 z-40 flex flex-col items-start px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-outfit text-left transition-transform duration-300 hover:scale-105"
          style={{
            background: 'rgba(10,8,4,0.88)',
            border: '1px solid rgba(201,164,74,0.45)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45), 0 0 24px rgba(201,164,74,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: '#C9A44A' }}>
            {time.done ? 'Revealed today' : 'The reveal in'}
          </span>
          <span className="font-cinzel text-[15px] sm:text-[17px] tabular-nums whitespace-nowrap" style={{ color: '#F0EBE0' }}>
            {time.days}d {pad(time.hours)}h {pad(time.mins)}m {pad(time.secs)}s
          </span>
        </button>
      )}

      {/* Full-screen announcement */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Parva Group announcement"
          className="fixed inset-0 z-[100] overflow-y-auto transition-opacity duration-500"
          style={{
            opacity: shown ? 1 : 0,
            fontFamily: SANS,
            background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(201,164,74,0.12), transparent 70%), rgba(4,4,4,0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#F0EBE0',
          }}
        >
          <style>{TEASER_CSS}</style>
          <div className="min-h-full flex flex-col items-center justify-center text-center px-6 py-14">
            <div
              className="hidden sm:block mb-7 text-[12px]"
              style={{ fontFamily: SANS, letterSpacing: '0.5em', color: '#C9A44A', fontWeight: 500 }}
            >
              PARVA REALTY
            </div>

            <div className="pt-glow">
            <h1
              className="pt-gold m-0"
              style={{
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 'clamp(2.4rem, 7vw, 5.8rem)',
                lineHeight: 1.05,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Parva Is Evolving
            </h1>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4" style={{ color: '#E8C97E' }}>
              <span className="h-px w-6 sm:w-16" style={{ background: 'linear-gradient(90deg,transparent,#C9A44A)' }} />
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 'clamp(1.05rem, 2vw, 1.4rem)', letterSpacing: '0.45em', paddingLeft: '0.45em' }}>
                WE ARE SOLD
              </span>
              <span className="h-px w-6 sm:w-16" style={{ background: 'linear-gradient(90deg,#C9A44A,transparent)' }} />
            </div>

            <p
              className="mx-auto mt-6 mb-9 max-w-[620px]"
              style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.15rem, 2.2vw, 1.6rem)', lineHeight: 1.45, color: 'rgba(232,201,126,0.9)' }}
            >
              Parva Group has found its new stake.
              <br />
              A name you know.
            </p>

            <a
              href={GUESS_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send your guess to Parva on WhatsApp"
              className="group flex flex-col items-center mb-10"
            >
              {/* Mystery name plate — a blurred, classified name instead of a "?" */}
              {/* Gold circle with a question mark */}
              <div
                className="pt-q mb-6 flex items-center justify-center"
                aria-hidden="true"
                style={{ width: 96, height: 96, borderRadius: '50%', border: '1.5px solid rgba(201,164,74,0.65)', background: 'radial-gradient(circle at 50% 40%, rgba(201,164,74,0.14), rgba(10,8,4,0.6) 70%)', boxShadow: '0 0 40px rgba(201,164,74,0.25), inset 0 0 20px rgba(201,164,74,0.12)' }}
              >
                <span className="pt-gold" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 50, lineHeight: 1 }}>?</span>
              </div>

              <div
                className="mb-5 px-2"
                style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 'clamp(1.1rem, 2.1vw, 1.5rem)', letterSpacing: '0.1em', color: '#E8C97E' }}
              >
                GUESS WHO'S JOINED THE PARVA GROUP
              </div>
              <span
                className="inline-flex items-center px-10 py-3 uppercase transition-all duration-300 group-hover:brightness-110"
                style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.3em', background: 'linear-gradient(90deg,#B8913A,#E8C97E)', color: '#0a0a0a', fontWeight: 600, boxShadow: '0 0 24px rgba(201,164,74,0.3)' }}
              >
                Guess
              </span>
            </a>

            <div className="flex gap-3 sm:gap-3.5 justify-center mb-4">
              {units.map(u => (
                <div key={u.l} className="min-w-[68px] sm:min-w-[80px] px-1.5 py-3" style={{ border: '1px solid rgba(201,164,74,0.3)', background: 'rgba(201,164,74,0.04)' }}>
                  <span className="block" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', lineHeight: 1.1, color: '#F0EBE0', fontVariantNumeric: 'lining-nums tabular-nums' }}>{u.v}</span>
                  <small style={{ fontFamily: SANS, fontSize: 9, letterSpacing: '0.3em', color: '#C9A44A', fontWeight: 500 }}>{u.l.toUpperCase()}</small>
                </div>
              ))}
            </div>

            <div className="mb-3" style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.18em', color: 'rgba(240,235,224,0.6)' }}>
              THE BIG REVEAL AWAITS ON <b style={{ color: '#E8C97E', fontWeight: 600, whiteSpace: 'nowrap' }}>25 OCTOBER 2026</b>
            </div>

            <div className="mb-9" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'rgba(232,201,126,0.9)' }}>
              The future of Parva begins here.
            </div>

            <div className="flex gap-3.5 justify-center flex-wrap">
              <button
                onClick={close}
                className="px-8 py-3.5 uppercase"
                style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.22em', fontWeight: 600, background: 'linear-gradient(90deg,#B8913A,#E8C97E)', color: '#0a0a0a' }}
              >
                Enter Website
              </button>
              <button
                onClick={share}
                className="px-8 py-3.5 uppercase"
                style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.22em', fontWeight: 500, border: '1px solid rgba(201,164,74,0.5)', color: '#E8C97E' }}
              >
                Share the Mystery
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
