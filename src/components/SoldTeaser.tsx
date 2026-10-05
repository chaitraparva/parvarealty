import { useEffect, useState } from 'react'

// Reveal date: 25 October 2026, midnight Dubai time (GST, UTC+4)
const REVEAL_DATE = new Date('2026-10-25T00:00:00+04:00')
const SEEN_KEY = 'parva-sold-teaser-seen'
const STRIP_H = '36px'
// Parva's WhatsApp (same number used in the footer and chat button)
const GUESS_WHATSAPP_URL =
  'https://wa.me/971564227855?text=' +
  encodeURIComponent("Hi Parva! I saw that Parva Group is sold. I want to win the prize. My guess for who bought it is: ")

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
    const text = "Parva Group is sold! Guess who bought it? The name will be revealed on 25 October."
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title: "We're Sold — Parva Group", text, url })
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
        <span className="font-cinzel tracking-[0.08em] sm:tracking-[0.12em] whitespace-nowrap" style={{ color: '#E8C97E', fontWeight: 600 }}>WE'RE SOLD.</span>
        <span className="hidden sm:inline">Guess who bought Parva Group?</span>
        <span className="whitespace-nowrap">
          {time.done ? 'Revealed today' : `Revealed in ${time.days} day${time.days === 1 ? '' : 's'}`} · 25 October
        </span>
        <button
          onClick={() => setOpen(true)}
          className="ml-1 sm:ml-2 underline underline-offset-[3px] whitespace-nowrap"
          style={{ color: '#E8C97E' }}
        >
          Guess &amp; win →
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
          className="fixed inset-0 z-[100] overflow-y-auto font-outfit transition-opacity duration-500"
          style={{
            opacity: shown ? 1 : 0,
            background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(201,164,74,0.10), transparent 70%), rgba(4,4,4,0.94)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#F0EBE0',
          }}
        >
          <div className="min-h-full flex flex-col items-center justify-center text-center px-6 py-16">
            <div className="hidden sm:block absolute top-7 left-1/2 -translate-x-1/2 font-cinzel tracking-[0.35em] text-[14px]" style={{ color: '#C9A44A' }}>
              PARVA REALTY
            </div>

            <div className="text-[11px] tracking-[0.38em] uppercase mb-6" style={{ color: '#C9A44A' }}>
              An announcement from Parva Group
            </div>

            <h1
              className="font-cinzel leading-none m-0"
              style={{
                fontSize: 'clamp(3rem, 9vw, 7.2rem)',
                background: 'linear-gradient(90deg,#B8913A,#F3D98B,#C9A44A)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              We're Sold.
            </h1>

            <p
              className="font-playfair italic mx-auto mt-5 mb-9 max-w-[620px]"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', color: 'rgba(232,201,126,0.85)' }}
            >
              Parva Group has found its new partner. A name you know. A move you won't expect.
            </p>

            <a
              href={GUESS_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send your guess to Parva on WhatsApp"
              className="group flex flex-col items-center mb-9"
            >
              <div
                className="w-[92px] h-[92px] rounded-full mx-auto mb-4 flex items-center justify-center font-cinzel text-[44px] transition-transform duration-300 group-hover:scale-105"
                style={{ width: 92, height: 92, borderRadius: '50%', border: '1px solid rgba(201,164,74,0.5)', color: '#E8C97E', boxShadow: '0 0 40px rgba(201,164,74,0.25)' }}
              >
                ?
              </div>
              <div className="font-cinzel tracking-[0.2em] text-[15px] mb-1.5" style={{ color: '#E8C97E' }}>
                GUESS WHO?
              </div>
              <div className="font-playfair italic text-[14px] sm:text-[15px] mb-4" style={{ color: 'rgba(240,235,224,0.75)' }}>
                Guess it right &amp; win an exclusive prize.
              </div>
              <span
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] tracking-[0.15em] uppercase transition-all duration-300 group-hover:brightness-110"
                style={{ background: 'linear-gradient(90deg,#B8913A,#E8C97E)', color: '#0a0a0a', fontWeight: 600, boxShadow: '0 0 24px rgba(201,164,74,0.3)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.23-4.25 9.47-9.47 9.47zm8.06-17.53A11.33 11.33 0 0 0 12.04.64C5.76.64.64 5.75.64 12.04c0 2.01.52 3.97 1.52 5.7L.55 23.36l5.75-1.51a11.37 11.37 0 0 0 5.73 1.46h.01c6.28 0 11.4-5.11 11.4-11.4 0-3.04-1.19-5.9-3.34-8.05z" />
                </svg>
                Guess &amp; Win
              </span>
            </a>

            <div className="flex gap-3 sm:gap-3.5 justify-center mb-3">
              {units.map(u => (
                <div key={u.l} className="min-w-[68px] sm:min-w-[78px] px-1.5 py-3" style={{ border: '1px solid rgba(201,164,74,0.3)' }}>
                  <span className="block font-cinzel text-[28px] sm:text-[32px]" style={{ color: '#F0EBE0' }}>{u.v}</span>
                  <small className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A44A' }}>{u.l}</small>
                </div>
              ))}
            </div>

            <div className="text-[13px] tracking-wide mb-8" style={{ color: 'rgba(240,235,224,0.6)' }}>
              The name will be revealed on <b style={{ color: '#E8C97E' }}>25 October 2026</b>
            </div>

            <div className="flex gap-3.5 justify-center flex-wrap">
              <button
                onClick={close}
                className="px-7 py-3.5 text-[12px] font-semibold tracking-[0.15em] uppercase"
                style={{ background: 'linear-gradient(90deg,#B8913A,#E8C97E)', color: '#0a0a0a' }}
              >
                Enter Website
              </button>
              <button
                onClick={share}
                className="px-7 py-3.5 text-[12px] tracking-[0.15em] uppercase"
                style={{ border: '1px solid rgba(201,164,74,0.5)', color: '#E8C97E' }}
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
