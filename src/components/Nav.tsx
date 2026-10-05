import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import logoImg from '../imports/logo.png'

const links = [
  { label: 'Properties', href: '#properties' },
  { label: 'Why Dubai', href: '#why-dubai' },
  { label: 'Why Parva', href: '#why-parva' },
  { label: 'Calculator', href: '#calculator' },
]


function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}

export default function Nav() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = links.map(l => document.querySelector(l.href))
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
    }, { threshold: 0.3 })
    sections.forEach(s => s && obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const go = (href: string) => {
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const isLight = theme === 'light'

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
      style={{
        top: 'var(--sold-strip-h, 0px)',
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(32px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(32px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,164,74,0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => go('#hero')} className="flex items-center gap-3.5">
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: '#000', boxShadow: '0 0 12px rgba(201,164,74,0.2)', border: '1px solid rgba(201,164,74,0.25)' }}
          >
            <img
              src={logoImg}
              alt="Parva Realty"
              className="w-6 h-6 object-contain"
              style={{ filter: 'brightness(1.15) contrast(1.1)', mixBlendMode: 'lighten' }}
            />
          </div>
          <div className="leading-none">
            <div
              className="font-cinzel text-[0.82rem] font-bold tracking-[0.22em]"
              style={{ color: isLight ? '#1C1409' : '#F0EBE0' }}
            >
              PARVA
            </div>
            <div className="font-dm-mono text-[0.48rem] tracking-[0.3em] text-[#C9A44A] mt-[2px]">REALTY</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {links.map(l => {
            const isActive = activeSection === l.href.slice(1)
            return (
              <button
                key={l.href}
                onClick={() => go(l.href)}
                className="relative font-outfit text-[0.7rem] tracking-[0.15em] uppercase transition-colors duration-300"
                style={{ color: isActive ? '#C9A44A' : 'var(--nav-link)' }}
              >
                {l.label}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg,transparent,#C9A44A,transparent)' }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: isLight ? 'rgba(201,164,74,0.12)' : 'rgba(201,164,74,0.08)',
              border: '1px solid rgba(201,164,74,0.3)',
              color: '#C9A44A',
            }}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Admin Portal */}
          <a
            href="/admin/login"
            id="nav-admin-btn"
            title="Admin Portal"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'rgba(201,164,74,0.06)',
              border: '1px solid rgba(201,164,74,0.2)',
              color: 'rgba(201,164,74,0.55)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </a>

          <div className="w-px h-4" style={{ background: 'var(--nav-divider)' }} />
          <button onClick={() => go('#consultation')} className="btn-gold">
            Book Dubai Visit
          </button>
        </div>


        {/* Mobile right */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(201,164,74,0.1)',
              border: '1px solid rgba(201,164,74,0.28)',
              color: '#C9A44A',
            }}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Admin Portal (mobile) */}
          <a
            href="/admin/login"
            title="Admin Portal"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(201,164,74,0.06)',
              border: '1px solid rgba(201,164,74,0.2)',
              color: 'rgba(201,164,74,0.55)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </a>

          {/* Hamburger */}
          <button
            className="w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-[1.5px] bg-[#C9A44A] transition-all duration-300 origin-center
              ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#C9A44A] transition-all duration-300
              ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#C9A44A] transition-all duration-300 origin-center
              ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>

      </div>

      {/* Mobile dropdown */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-500"
        style={{ maxHeight: menuOpen ? '400px' : '0', opacity: menuOpen ? 1 : 0 }}
      >
        <div
          className="border-t border-[rgba(201,164,74,0.1)] px-6 py-5 flex flex-col gap-1"
          style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(32px)' }}
        >
          {links.map(l => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="text-left py-3 font-outfit text-sm tracking-[0.12em] uppercase border-b last:border-0"
              style={{
                color: activeSection === l.href.slice(1) ? '#C9A44A' : 'var(--nav-link)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {l.label}
            </button>
          ))}
          <button onClick={() => go('#consultation')} className="btn-gold mt-4 justify-center">
            Book Dubai Visit
          </button>
        </div>
      </div>
    </header>
  )
}
