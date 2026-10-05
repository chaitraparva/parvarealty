import { useEffect, useState } from 'react'

// Reveal date: 25 October 2026, midnight Dubai time (GST, UTC+4)
const REVEAL_DATE = new Date('2026-10-25T00:00:00+04:00')
const SEEN_KEY = 'parva-sold-teaser-seen'
const STRIP_H = '36px'

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
        className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-4 font-outfit text-[12px] sm:text-[13px] tracking-wide"
        style={{
          height: STRIP_H,
          background: 'linear-gradient(90deg,#1a1408,#3a2c10,#1a1408)',
          borderBottom: '1px solid rgba(201,164,74,0.4)',
          color: '#F0EBE0',
        }}
      >
        <span className="font-cinzel tracking-[0.12em]" style={{ color: '#E8C97E', fontWeight: 600 }}>WE'RE SOLD.</span>
        <span className="hidden sm:inline">Guess who bought Parva Group?</span>
        <span className="whitespace-nowrap">
          {time.done ? 'Revealed today' : `Revealed in ${time.days} day${time.days === 1 ? '' : 's'}`} · 25 October
        </span>
        <button
          onClick={() => setOpen(true)}
          className="ml-1 sm:ml-2 underline underline-offset-[3px] whitespace-nowrap"
          style={{ color: '#E8C97E' }}
        >
          Guess now →
        </button>
      </div>

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

            <div
              className="w-[92px] h-[92px] rounded-full mx-auto mb-4 flex items-center justify-center font-cinzel text-[44px]"
              style={{ border: '1px solid rgba(201,164,74,0.5)', color: '#E8C97E', boxShadow: '0 0 40px rgba(201,164,74,0.25)' }}
            >
              ?
            </div>
            <div className="font-cinzel tracking-[0.2em] text-[15px] mb-9" style={{ color: '#E8C97E' }}>
              GUESS WHO?
            </div>

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
