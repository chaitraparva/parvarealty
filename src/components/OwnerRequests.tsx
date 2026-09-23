import { useEffect, useState } from 'react'
import {
  getClientUser,
  clientLogIn,
  clientSignUp,
  clientLogOut,
  submitRequest,
  compressPhoto,
  type ClientUser,
  type RequestType,
  type Tier,
} from '../store/requestStore'

type Step = 'intro' | 'auth' | 'form' | 'done'
const MAX_PHOTOS = 10

const OPTIONS: { type: RequestType; title: string; subtitle?: string; text: string; cta: string }[] = [
  {
    type: 'exchange',
    title: 'Exchange Your Property',
    subtitle: 'Sell in India · Buy in Dubai',
    text: 'Own a property in India and want to buy a property in Dubai? Share your India property details and photos with us. For owners only.',
    cta: 'Exchange Property',
  },
  {
    type: 'sell',
    title: 'Sell Your Property',
    text: 'Want to sell your property in India? Share the details and photos with us and our team will get in touch.',
    cta: 'Sell Property',
  },
]

export default function OwnerRequests() {
  const [active, setActive] = useState<RequestType | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {OPTIONS.map(o => (
          <div
            key={o.type}
            className="glass rounded-2xl p-6 md:p-7 flex flex-col gap-4"
            style={{ border: '1px solid rgba(201,164,74,0.22)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,164,74,0.12)', border: '1px solid rgba(201,164,74,0.3)', color: '#C9A44A' }}
              >
                {o.type === 'exchange' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-semibold" style={{ color: 'var(--text-h)' }}>{o.title}</h3>
                {o.subtitle && (
                  <div className="font-outfit text-xs font-semibold tracking-wide mt-0.5" style={{ color: '#C9A44A' }}>{o.subtitle}</div>
                )}
              </div>
            </div>
            <p className="font-outfit text-sm leading-relaxed" style={{ color: 'var(--text-m)' }}>{o.text}</p>
            <button className="btn-gold justify-center mt-auto self-start" onClick={() => setActive(o.type)}>
              {o.cta}
            </button>
          </div>
        ))}
      </div>

      {active && <RequestModal type={active} onClose={() => setActive(null)} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function RequestModal({ type, onClose }: { type: RequestType; onClose: () => void }) {
  const [step, setStep] = useState<Step>('intro')
  const [agreed, setAgreed] = useState(false)
  const [user, setUser] = useState<ClientUser | null>(null)

  useEffect(() => {
    getClientUser().then(setUser)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const title = type === 'exchange' ? 'Exchange Your Property' : 'Sell Your Property'

  const continueFromIntro = () => setStep(user ? 'form' : 'auth')

  return (
    <div
      className="fixed inset-0 z-[250] flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full ${step === 'form' ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl my-8 relative`}
        style={{ background: 'var(--bg-a)', border: '1px solid rgba(201,164,74,0.25)', boxShadow: '0 30px 90px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div className="font-cinzel text-lg font-semibold" style={{ color: 'var(--text-h)' }}>{title}</div>
            {type === 'exchange' && (
              <div className="font-outfit text-xs font-semibold mt-0.5" style={{ color: '#C9A44A' }}>Sell in India · Buy in Dubai</div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ border: '1px solid var(--border-base)', color: 'var(--text-m)' }}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {step === 'intro' && (
            <div className="flex flex-col gap-5">
              {type === 'exchange' ? (
                <Notice heading="Owners only">
                  This service is only for property owners. Third parties and brokers are not allowed.
                </Notice>
              ) : (
                <Notice heading="Platform fee">
                  A platform fee of 2–3% of the final sale value will be charged by Parva Realty.
                </Notice>
              )}
              <Check checked={agreed} onChange={setAgreed}>
                {type === 'exchange'
                  ? 'I confirm I am the owner of this property and I am not a broker or third party.'
                  : 'I understand and agree to the 2–3% platform fee.'}
              </Check>
              <button className="btn-gold justify-center disabled:opacity-40 disabled:cursor-not-allowed" disabled={!agreed} onClick={continueFromIntro}>
                Continue
              </button>
            </div>
          )}

          {step === 'auth' && (
            <AuthStep onDone={u => { setUser(u); setStep('form') }} />
          )}

          {step === 'form' && user && (
            <FormStep
              type={type}
              user={user}
              onDone={() => setStep('done')}
              onSwitchAccount={async () => { await clientLogOut(); setUser(null); setStep('auth') }}
            />
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,168,97,0.12)', border: '1px solid rgba(34,168,97,0.4)', color: '#22A861' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="font-cinzel text-xl font-semibold" style={{ color: 'var(--text-h)' }}>Thank you</div>
              <p className="font-outfit text-base" style={{ color: 'var(--text-m)' }}>
                We have received your details. We will connect with you soon.
              </p>
              <button className="btn-outline-gold mt-2" onClick={onClose}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Login / Create account ─────────────────────────────────────────────────
function AuthStep({ onDone }: { onDone: (u: ClientUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const res = mode === 'login'
      ? await clientLogIn(email, password)
      : await clientSignUp(email, password, phone.trim())
    setBusy(false)
    if (res.ok) return onDone(res.user)
    if (res.needsConfirm) { setMode('login'); setMsg({ text: res.message, ok: true }); return }
    setMsg({ text: res.message })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex rounded-full p-1" style={{ background: 'var(--bg-card-xs)', border: '1px solid var(--border-subtle)' }}>
        {(['login', 'signup'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setMsg(null) }}
            className="flex-1 py-2 rounded-full font-outfit text-sm font-semibold transition-all"
            style={{
              background: mode === m ? 'linear-gradient(135deg,#C9A44A,#E8C97E)' : 'transparent',
              color: mode === m ? '#060606' : 'var(--text-m)',
            }}
          >
            {m === 'login' ? 'Log in' : 'Create account'}
          </button>
        ))}
      </div>

      <Field label="Email">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
      </Field>
      {mode === 'signup' && (
        <Field label="Mobile number">
          <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="+91 98765 43210" pattern="[+0-9 ()-]{7,20}" />
        </Field>
      )}
      <Field label="Password">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
        />
      </Field>

      {msg && (
        <p className="font-outfit text-sm" style={{ color: msg.ok ? '#22A861' : '#EF4444' }}>{msg.text}</p>
      )}

      <button type="submit" className="btn-gold justify-center disabled:opacity-50" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'login' ? 'Log in & continue' : 'Create account & continue'}
      </button>
    </form>
  )
}

// ─── Property details form ──────────────────────────────────────────────────
const TIERS: Tier[] = ['Entry / Value', 'Mid-Range', 'Premium', 'Luxury']
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Row House', 'Plot / Land', 'Commercial']

type FormState = {
  fullName: string
  phone: string
  address: string
  propertyName: string
  developer: string
  location: string
  city: string
  propertyType: string
  unitTypes: string
  tier: Tier
  price: string
  priceAED: string
  rentalYield: string
  appreciation: string
  minDeposit: string
  area: string
  completion: string
  floors: string
  totalUnits: string
  bedrooms: string
  handoverQuarter: string
  standout: string
  description: string
  amenities: string
  paymentPlan: { milestone: string; pct: string }[]
}

const num = (v: string) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function FormStep({ type, user, onDone, onSwitchAccount }: {
  type: RequestType
  user: ClientUser
  onDone: () => void
  onSwitchAccount: () => void
}) {
  const [f, setF] = useState<FormState>({
    fullName: '', phone: user.phone, address: '',
    propertyName: '', developer: '', location: '', city: '', propertyType: 'Apartment', unitTypes: '', tier: 'Mid-Range',
    price: '', priceAED: '', rentalYield: '', appreciation: '', minDeposit: '', area: '',
    completion: '', floors: '', totalUnits: '', bedrooms: '', handoverQuarter: '', standout: '', description: '',
    amenities: '', paymentPlan: [],
  })
  const [photos, setPhotos] = useState<{ blob: Blob; url: string }[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF(prev => ({ ...prev, [k]: v }))
  const bind = (k: Exclude<keyof FormState, 'paymentPlan' | 'tier'>) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value),
  })

  useEffect(() => () => photos.forEach(p => URL.revokeObjectURL(p.url)), []) // eslint-disable-line react-hooks/exhaustive-deps

  const addPhotos = async (files: FileList | null) => {
    if (!files) return
    const room = MAX_PHOTOS - photos.length
    const picked = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, room)
    const blobs = await Promise.all(picked.map(file => compressPhoto(file)))
    setPhotos(p => [...p, ...blobs.map(blob => ({ blob, url: URL.createObjectURL(blob) }))])
    setError('')
  }

  const removePhoto = (i: number) => {
    setPhotos(p => {
      URL.revokeObjectURL(p[i].url)
      return p.filter((_, j) => j !== i)
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (photos.length === 0) { setError('Please add at least one photo of the property.'); return }
    setBusy(true)
    setError('')
    try {
      await submitRequest({
        type,
        name: f.fullName.trim(),
        email: user.email,
        phone: f.phone.trim(),
        address: f.address.trim(),
        location: [f.location.trim(), f.city.trim()].filter(Boolean).join(', '),
        details: {
          propertyName: f.propertyName.trim(),
          developer: f.developer.trim(),
          location: f.location.trim(),
          city: f.city.trim(),
          propertyType: f.propertyType,
          unitTypes: f.unitTypes.trim(),
          tier: f.tier,
          price: f.price.trim(),
          priceAED: f.priceAED.trim(),
          rentalYield: num(f.rentalYield),
          appreciation: num(f.appreciation),
          minDeposit: f.minDeposit.trim(),
          area: f.area.trim(),
          completion: f.completion.trim(),
          floors: Math.round(num(f.floors)),
          totalUnits: Math.round(num(f.totalUnits)),
          bedrooms: Math.round(num(f.bedrooms)),
          handoverQuarter: f.handoverQuarter.trim(),
          standout: f.standout.trim(),
          description: f.description.trim(),
          amenities: f.amenities.split(',').map(a => a.trim()).filter(Boolean),
          paymentPlan: f.paymentPlan
            .filter(pp => pp.milestone.trim())
            .map(pp => ({ milestone: pp.milestone.trim(), pct: Math.round(num(pp.pct)) })),
        },
        photos: photos.map(p => p.blob),
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  const grid = 'grid grid-cols-1 sm:grid-cols-2 gap-4'

  return (
    <form onSubmit={submit} className="flex flex-col gap-7">
      {/* Contact (private) */}
      <section className="flex flex-col gap-4">
        <SectionTitle note="Only shared with Parva. Not shown on the website.">Your Details</SectionTitle>
        <div className={grid}>
          <Field label="Full name *">
            <input type="text" required {...bind('fullName')} autoComplete="name" placeholder="Your full name" />
          </Field>
          <Field label="Mobile number *">
            <input type="tel" required {...bind('phone')} placeholder="+91 98765 43210" pattern="[+0-9 ()-]{7,20}" />
          </Field>
        </div>
        <Field label="Email">
          <input type="email" value={user.email} readOnly style={{ opacity: 0.7 }} />
          <button type="button" onClick={onSwitchAccount} className="font-outfit text-xs mt-1.5 underline" style={{ color: 'var(--text-f)' }}>
            Not you? Log out
          </button>
        </Field>
        <Field label="Full property address *">
          <textarea required rows={2} {...bind('address')} placeholder="Flat / house no., building, street, area, pincode" />
        </Field>
      </section>

      {/* Basic information */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Basic Information</SectionTitle>
        <div className={grid}>
          <Field label="Property name *">
            <input type="text" required {...bind('propertyName')} placeholder="e.g. Prestige Lakeside, Flat 4B" />
          </Field>
          <Field label="Developer / builder">
            <input type="text" {...bind('developer')} placeholder="e.g. Prestige Group" />
          </Field>
          <Field label="Location / area *">
            <input type="text" required {...bind('location')} placeholder="e.g. Whitefield" />
          </Field>
          <Field label="City *">
            <input type="text" required {...bind('city')} placeholder="e.g. Bengaluru" />
          </Field>
          <Field label="Property type *">
            <select required {...bind('propertyType')}>
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Unit type *">
            <input type="text" required {...bind('unitTypes')} placeholder="e.g. 2 BHK" />
          </Field>
          <Field label="Tier *">
            <select required value={f.tier} onChange={e => set('tier', e.target.value as Tier)}>
              {TIERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      </section>

      {/* Pricing */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Pricing & Returns</SectionTitle>
        <div className={grid}>
          <Field label="Expected price (INR) *">
            <input type="text" required {...bind('price')} placeholder="e.g. ₹1.2 Cr" />
          </Field>
          <Field label="Price (AED)">
            <input type="text" {...bind('priceAED')} placeholder="e.g. ~AED 520K" />
          </Field>
          <Field label="Rental yield (%)">
            <input type="number" step="0.1" min="0" {...bind('rentalYield')} placeholder="e.g. 3.5" />
          </Field>
          <Field label="Appreciation (%)">
            <input type="number" step="0.1" min="0" {...bind('appreciation')} placeholder="e.g. 6" />
          </Field>
          <Field label="Token / min. deposit">
            <input type="text" {...bind('minDeposit')} placeholder="e.g. ₹5L" />
          </Field>
          <Field label="Area (sq ft) *">
            <input type="text" required {...bind('area')} placeholder="e.g. 1,250 sq ft" />
          </Field>
        </div>
      </section>

      {/* Project details */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Property Details</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Bedrooms *">
            <input type="number" min="0" required {...bind('bedrooms')} placeholder="e.g. 2" />
          </Field>
          <Field label="Floors">
            <input type="number" min="0" {...bind('floors')} placeholder="e.g. 14" />
          </Field>
          <Field label="Total units">
            <input type="number" min="0" {...bind('totalUnits')} placeholder="e.g. 240" />
          </Field>
          <Field label="Completion / year built">
            <input type="text" {...bind('completion')} placeholder="e.g. 2019 / Ready" />
          </Field>
          <Field label="Handover">
            <input type="text" {...bind('handoverQuarter')} placeholder="e.g. Immediate" />
          </Field>
        </div>
        <Field label="Standout (short highlight)">
          <input type="text" {...bind('standout')} placeholder="One line about why this property is special" />
        </Field>
        <Field label="Full description *">
          <textarea required rows={4} {...bind('description')} placeholder="Describe the property, condition, facing, parking, nearby places…" />
        </Field>
        <Field label="Amenities (separate with commas)">
          <input type="text" {...bind('amenities')} placeholder="e.g. Gym, Swimming pool, Covered parking, 24/7 security" />
        </Field>
      </section>

      {/* Payment plan */}
      <section className="flex flex-col gap-3">
        <SectionTitle>Payment Plan</SectionTitle>
        {f.paymentPlan.map((pp, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={pp.milestone}
              onChange={e => set('paymentPlan', f.paymentPlan.map((x, j) => (j === i ? { ...x, milestone: e.target.value } : x)))}
              placeholder="Milestone, e.g. On agreement"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={pp.pct}
              onChange={e => set('paymentPlan', f.paymentPlan.map((x, j) => (j === i ? { ...x, pct: e.target.value } : x)))}
              placeholder="%"
              style={{ width: 80, flexShrink: 0 }}
            />
            <button
              type="button"
              onClick={() => set('paymentPlan', f.paymentPlan.filter((_, j) => j !== i))}
              aria-label="Remove milestone"
              className="text-lg px-2 flex-shrink-0"
              style={{ color: '#EF4444' }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set('paymentPlan', [...f.paymentPlan, { milestone: '', pct: '' }])}
          className="self-start font-outfit text-xs px-4 py-2 rounded-lg"
          style={{ background: 'rgba(201,164,74,0.08)', border: '1px solid rgba(201,164,74,0.25)', color: '#C9A44A' }}
        >
          + Add milestone
        </button>
      </section>

      {/* Photos */}
      <section className="flex flex-col gap-3">
        <SectionTitle note="The first photo is used as the cover.">{`Property Photos * (${photos.length}/${MAX_PHOTOS})`}</SectionTitle>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {photos.map((p, i) => (
            <div key={p.url} className="relative aspect-square rounded-lg overflow-hidden" style={{ border: i === 0 ? '2px solid #C9A44A' : '1px solid var(--border-subtle)' }}>
              <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 inset-x-0 text-center font-outfit text-[0.55rem] font-semibold py-0.5" style={{ background: 'rgba(201,164,74,0.9)', color: '#060606' }}>
                  COVER
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label
              className="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer font-outfit text-xs gap-1"
              style={{ border: '1px dashed rgba(201,164,74,0.45)', color: '#C9A44A', background: 'rgba(201,164,74,0.05)' }}
            >
              <span className="text-xl leading-none">+</span>
              Add
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { addPhotos(e.target.files); e.target.value = '' }}
              />
            </label>
          )}
        </div>
      </section>

      {error && <p className="font-outfit text-sm" style={{ color: '#EF4444' }}>{error}</p>}

      <button type="submit" className="btn-gold justify-center disabled:opacity-50" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}

function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="pb-2" style={{ borderBottom: '1px solid rgba(201,164,74,0.15)' }}>
      <div className="font-cinzel text-sm font-semibold" style={{ color: '#C9A44A' }}>{children}</div>
      {note && <div className="font-outfit text-[0.7rem] mt-0.5" style={{ color: 'var(--text-f)' }}>{note}</div>}
    </div>
  )
}

// ─── Small UI pieces ────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-outfit text-xs font-semibold mb-1.5" style={{ color: 'var(--text-m)' }}>{label}</div>
      {children}
    </div>
  )
}

function Notice({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(201,164,74,0.08)', border: '1px solid rgba(201,164,74,0.3)' }}>
      <div className="font-cinzel text-base font-semibold mb-1.5" style={{ color: '#C9A44A' }}>{heading}</div>
      <p className="font-outfit text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{children}</p>
    </div>
  )
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 18, height: 18, padding: 0, marginTop: 2, flexShrink: 0, accentColor: '#C9A44A' }}
      />
      <span className="font-outfit text-sm leading-relaxed" style={{ color: 'var(--text-b)' }}>{children}</span>
    </label>
  )
}