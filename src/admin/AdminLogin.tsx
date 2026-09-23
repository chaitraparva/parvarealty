import { useState } from 'react'
import { useNavigate } from 'react-router'
import { adminLogin } from '../store/propertyStore'
import { adminBackendSignIn } from '../store/requestStore'
import logoImg from '../imports/logo.png'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(async () => {
      if (adminLogin(email, password)) {
        // Also sign in to the database so client requests can be read
        // (if this fails, the Client Requests tab shows what to fix; property management still works)
        await adminBackendSignIn(email, password)
        navigate('/admin')
      } else {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#060606' }}
    >
      {/* Subtle background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,164,74,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: '#000',
              border: '1px solid rgba(201,164,74,0.35)',
              boxShadow: '0 0 32px rgba(201,164,74,0.18)',
            }}
          >
            <img src={logoImg} alt="Parva Realty" className="w-10 h-10 object-contain" style={{ mixBlendMode: 'lighten' }} />
          </div>
          <div className="font-cinzel text-xl font-bold tracking-widest" style={{ color: '#F0EBE0' }}>PARVA REALTY</div>
          <div className="font-dm-mono text-[0.52rem] tracking-[0.3em] mt-1" style={{ color: '#C9A44A' }}>ADMIN PORTAL</div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,164,74,0.15)' }}
        >
          <h1 className="font-cinzel text-lg font-bold mb-1" style={{ color: '#F0EBE0' }}>Sign In</h1>
          <p className="font-outfit text-sm mb-7" style={{ color: 'rgba(240,235,224,0.45)' }}>
            Enter your admin credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="font-dm-mono text-[0.52rem] tracking-widest uppercase block mb-2" style={{ color: 'rgba(201,164,74,0.7)' }}>
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@parvarealty.ae"
                autoComplete="username"
                required
                className="w-full rounded-xl px-4 py-3 font-outfit text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(201,164,74,0.2)',
                  color: '#F0EBE0',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-dm-mono text-[0.52rem] tracking-widest uppercase block mb-2" style={{ color: 'rgba(201,164,74,0.7)' }}>
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl px-4 py-3 font-outfit text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(201,164,74,0.2)',
                  color: '#F0EBE0',
                }}
              />
              {error && <p className="font-outfit text-xs mt-2" style={{ color: '#EF4444' }}>{error}</p>}
            </div>

            <button
              id="admin-signin-btn"
              type="submit"
              disabled={loading || !email || !password}
              className="btn-gold justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center font-dm-mono text-[0.48rem] mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2025 Parva Realty · Admin Access Only
        </p>
      </div>
    </div>
  )
}
