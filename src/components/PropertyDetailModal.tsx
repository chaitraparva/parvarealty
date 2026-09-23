import { useState, useEffect } from 'react'

export type Property = {
  id: number
  name: string
  location: string
  type: string
  bedrooms: number
  unitTypes: string
  area: string
  price: string
  priceAED: string
  rentalYield: number
  appreciation: number
  developer: string
  completion: string
  tag: string
  tagCol: string
  tier: 'Entry / Value' | 'Mid-Range' | 'Premium' | 'Luxury'
  standout: string
  image: string
  gallery: string[]
  zone: string
  views: number
  floors: number
  totalUnits: number
  amenities: string[]
  paymentPlan: { milestone: string; pct: number }[]
  handoverQuarter: string
  minDeposit: string
  description: string
  country?: 'Dubai' | 'India' // missing = Dubai
}

// Only Unsplash images accept resize params (signed photo URLs would break)
const sized = (src: string, q: string) => (src.includes('images.unsplash.com') ? `${src}?${q}` : src)

const tierConfig = {
  'Entry / Value': { color: '#4A7C59', border: 'rgba(74,124,89,0.4)' },
  'Mid-Range': { color: '#3A72A8', border: 'rgba(58,114,168,0.4)' },
  'Premium': { color: '#7B5EA7', border: 'rgba(123,94,167,0.4)' },
  'Luxury': { color: '#C9A44A', border: 'rgba(201,164,74,0.4)' },
}

type Props = { property: Property; onClose: () => void; onEnquire?: (p: Property) => void }

function ROIProjection({ yield: y, appreciation: a }: { yield: number; appreciation: number }) {
  const priceBase = 100
  const rows = [1, 3, 5, 7].map(yr => {
    const capitalValue = priceBase * Math.pow(1 + a / 100, yr)
    const rentalIncome = Array.from({ length: yr }, (_, i) => priceBase * Math.pow(1 + a / 100, i) * (y / 100)).reduce((s, v) => s + v, 0)
    return { yr, capitalGain: capitalValue - priceBase, rentalIncome, total: capitalValue - priceBase + rentalIncome }
  })
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[380px]">
        <thead>
          <tr className="border-b border-white/10">
            {['Hold Period', 'Capital Gain', 'Rental Income', 'Total Return'].map(h => (
              <th key={h} className="text-left pb-2 pr-3 font-dm-mono text-[0.55rem] tracking-widest uppercase"
                style={{ color: 'var(--text-f)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.yr} className="border-b border-white/5">
              <td className="py-2.5 pr-3 font-cinzel text-xs font-semibold" style={{ color: 'var(--text-h)' }}>{r.yr} yr</td>
              <td className="py-2.5 pr-3 font-outfit text-xs" style={{ color: '#C9A44A' }}>+{r.capitalGain.toFixed(1)}%</td>
              <td className="py-2.5 pr-3 font-outfit text-xs" style={{ color: '#22A861' }}>+{r.rentalIncome.toFixed(1)}%</td>
              <td className="py-2.5 font-cinzel text-sm font-bold" style={{ color: 'var(--text-h)' }}>+{r.total.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-outfit text-[0.6rem] mt-2 italic" style={{ color: 'var(--text-ff)' }}>
        Indicative projections based on current yield and appreciation rates. Not financial advice.
      </p>
    </div>
  )
}

function EnquiryForm({ property, onSuccess }: { property: Property; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', budget: '', visitInterest: false, message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k: string, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.phone.trim() || form.phone.length < 8) e.phone = 'Valid phone required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: '91189180-6cf6-448d-8965-be5e8aff701b',
          subject: `Property Enquiry — ${property.name} (${property.location})`,
          from_name: 'Parva Realty Website',
          replyto: form.email,
          name: form.name,
          phone: form.phone,
          email: form.email,
          property: `${property.name} — ${property.location}`,
          price: property.price,
          budget: form.budget,
          dubai_visit_interest: form.visitInterest ? 'Yes' : 'No',
          message: form.message || '(no message)',
        }),
      })
    } catch (_) {
      // show success regardless of network error
    }
    setSubmitting(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-dm-mono text-[0.58rem] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-f)' }}>
            Full Name *
          </label>
          <input
            type="text" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Arjun Sharma"
            className={errors.name ? 'border-red-500/60' : ''}
          />
          {errors.name && <p className="text-red-400 text-[0.6rem] mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block font-dm-mono text-[0.58rem] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-f)' }}>
            Phone / WhatsApp *
          </label>
          <input
            type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={errors.phone ? 'border-red-500/60' : ''}
          />
          {errors.phone && <p className="text-red-400 text-[0.6rem] mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <label className="block font-dm-mono text-[0.58rem] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-f)' }}>
          Email Address *
        </label>
        <input
          type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="arjun@email.com"
          className={errors.email ? 'border-red-500/60' : ''}
        />
        {errors.email && <p className="text-red-400 text-[0.6rem] mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block font-dm-mono text-[0.58rem] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-f)' }}>
          Investment Budget
        </label>
        <select value={form.budget} onChange={e => set('budget', e.target.value)}>
          <option value="">Select budget range</option>
          <option>Up to ₹2 Cr (AED ~800K)</option>
          <option>₹2 Cr – ₹5 Cr (AED 800K–2M)</option>
          <option>₹5 Cr – ₹10 Cr (AED 2M–4M)</option>
          <option>₹10 Cr – ₹20 Cr (AED 4M–8M)</option>
          <option>₹20 Cr+ (AED 8M+)</option>
        </select>
      </div>
      <div>
        <label className="block font-dm-mono text-[0.58rem] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-f)' }}>
          Message (Optional)
        </label>
        <textarea
          value={form.message} onChange={e => set('message', e.target.value)}
          rows={3}
          placeholder={`I'm interested in ${property.name}. Please share more details on…`}
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => set('visitInterest', !form.visitInterest)}
          className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
          style={{
            background: form.visitInterest ? 'rgba(201,164,74,0.2)' : 'rgba(255,255,255,0.05)',
            border: form.visitInterest ? '1.5px solid #C9A44A' : '1.5px solid rgba(255,255,255,0.2)',
          }}
        >
          {form.visitInterest && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#C9A44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="font-outfit text-xs leading-relaxed" style={{ color: 'var(--text-m)' }}>
          I'm interested in the <span style={{ color: '#C9A44A' }}>₹10L refundable deposit + Dubai visit</span> programme — please include this in my brief.
        </span>
      </label>
      <button type="submit" disabled={submitting} className="btn-gold justify-center mt-2 disabled:opacity-60">
        {submitting ? 'Sending…' : 'Send Enquiry — A Senior Advisor Will Call Within 24hrs'}
      </button>
      <p className="text-center font-outfit text-[0.62rem]" style={{ color: 'var(--text-ff)' }}>
        Your details are private and never shared with third parties.
      </p>
    </form>
  )
}

function EnquirySuccess({ property, onClose }: { property: Property; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-5">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(34,168,97,0.15)', border: '1.5px solid rgba(34,168,97,0.3)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22A861" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <div>
        <h3 className="font-cinzel text-xl font-bold mb-2" style={{ color: 'var(--text-h)' }}>
          Enquiry Received
        </h3>
        <p className="font-outfit text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-m)' }}>
          A senior Parva Realty advisor will contact you within <span style={{ color: '#C9A44A' }}>24 hours</span> with a personalised brief for <strong style={{ color: 'var(--text-h)' }}>{property.name}</strong>.
        </p>
      </div>
      <div className="glass rounded-xl p-4 w-full max-w-xs text-left">
        <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: 'var(--text-f)' }}>What happens next</div>
        {[
          'Advisor reviews your brief & budget',
          'Personalised property report sent to you',
          'Live price & availability confirmed',
          'Dubai visit planning begins (if opted)',
        ].map((s, i) => (
          <div key={i} className="flex gap-2.5 items-start mb-2 last:mb-0">
            <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 font-cinzel text-[0.5rem] font-bold"
              style={{ background: 'rgba(201,164,74,0.12)', color: '#C9A44A', border: '1px solid rgba(201,164,74,0.25)' }}>
              {i + 1}
            </div>
            <span className="font-outfit text-[0.72rem]" style={{ color: 'var(--text-m)' }}>{s}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="btn-outline-gold">
        Close & Continue Browsing
      </button>
    </div>
  )
}

export default function PropertyDetailModal({ property: p, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'enquire'>('overview')
  const [enquirySent, setEnquirySent] = useState(false)
  const allImages = [p.image, ...p.gallery]
  const tc = tierConfig[p.tier]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler) }
  }, [onClose])

  const combinedROI = p.rentalYield + p.appreciation

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ background: 'rgba(6,6,6,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-4xl my-auto rounded-3xl overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg,#111009 0%,#0a0a09 100%)', border: '1px solid rgba(201,164,74,0.18)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(6,6,6,0.7)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 flex-shrink-0 bg-[#111]">
          <img
            src={sized(allImages[activeImg], 'w=900&h=400&fit=crop&auto=format')}
            alt={p.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(10,10,9,1) 0%,rgba(10,10,9,0.3) 50%,transparent 100%)' }} />

          {/* Tier + Tag */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-2.5 py-1 rounded-full font-dm-mono text-[0.55rem] tracking-widest font-bold uppercase"
              style={{ background: 'rgba(6,6,6,0.7)', color: tc.color, border: `1px solid ${tc.border}`, backdropFilter: 'blur(8px)' }}>
              {p.tier}
            </span>
            <span className="px-2.5 py-1 rounded-full font-dm-mono text-[0.55rem] tracking-widest font-bold uppercase text-white"
              style={{ background: p.tagCol }}>
              {p.tag}
            </span>
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="w-10 h-7 rounded overflow-hidden flex-shrink-0 transition-all"
                  style={{
                    border: activeImg === i ? '2px solid #C9A44A' : '2px solid rgba(255,255,255,0.2)',
                    opacity: activeImg === i ? 1 : 0.6,
                  }}
                >
                  <img src={sized(img, 'w=80&h=56&fit=crop')} className="w-full h-full object-cover" loading="lazy" alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Nav arrows */}
          {allImages.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(6,6,6,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-b)" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(6,6,6,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-b)" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Name + key metrics strip */}
        <div className="px-6 pt-5 pb-4 border-b border-white/8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--text-h)' }}>{p.name}</h2>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C9A44A" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span className="font-outfit text-xs" style={{ color: 'var(--text-m)' }}>{p.location}</span>
                </div>
                <span className="font-dm-mono text-[0.6rem]" style={{ color: 'var(--text-ff)' }}>by {p.developer}</span>
                <span className="font-dm-mono text-[0.6rem]" style={{ color: 'var(--text-ff)' }}>Handover {p.completion}</span>
              </div>
            </div>
            <div className="flex gap-5 flex-shrink-0">
              <div className="text-right">
                <div className="font-cinzel text-xl font-bold text-gradient-gold">{p.price}</div>
                <div className="font-dm-mono text-[0.58rem]" style={{ color: 'var(--text-ff)' }}>{p.priceAED}</div>
              </div>
            </div>
          </div>

          {/* ROI chips */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {[
              { label: 'Rental Yield', val: `${p.rentalYield}%`, col: '#22A861' },
              { label: 'Capital Apprec.', val: `${p.appreciation}%`, col: '#C9A44A' },
              { label: 'Combined ROI', val: `${combinedROI.toFixed(1)}%`, col: '#E8C97E' },
              { label: 'Min. Deposit', val: p.minDeposit, col: 'var(--text-m)' },
            ].map(m => (
              <div key={m.label} className="px-3.5 py-2 rounded-xl flex flex-col items-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="font-cinzel text-base font-bold" style={{ color: m.col }}>{m.val}</span>
                <span className="font-dm-mono text-[0.5rem] tracking-widest uppercase" style={{ color: 'var(--text-f)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8">
          {(['overview', 'financials', 'enquire'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 py-3.5 font-dm-mono text-[0.6rem] tracking-widest uppercase transition-all"
              style={{
                color: activeTab === t ? '#C9A44A' : 'var(--text-f)',
                borderBottom: activeTab === t ? '2px solid #C9A44A' : '2px solid transparent',
              }}
            >
              {t === 'overview' ? 'Overview' : t === 'financials' ? 'Financials & ROI' : 'Enquire Now'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-7">
              {/* Description */}
              <p className="font-outfit text-sm leading-relaxed" style={{ color: 'var(--text-m)' }}>{p.description}</p>

              {/* Specs grid */}
              <div>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: 'var(--text-f)' }}>Property Specifications</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Unit Types', val: p.unitTypes },
                    { label: 'Size Range', val: p.area },
                    { label: 'Developer', val: p.developer },
                    { label: 'Total Floors', val: `${p.floors} floors` },
                    { label: 'Total Units', val: `${p.totalUnits} units` },
                    { label: 'Handover', val: p.completion },
                    { label: 'Property Type', val: p.type },
                    { label: 'Location', val: p.location },
                    { label: 'Min. Deposit', val: p.minDeposit },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="font-dm-mono text-[0.5rem] tracking-widest uppercase mb-1" style={{ color: 'var(--text-f)' }}>{s.label}</div>
                      <div className="font-outfit text-sm font-semibold" style={{ color: 'var(--text-b)' }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why it stands out */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(201,164,74,0.05)', border: `1px solid ${tc.border}` }}>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-2" style={{ color: tc.color }}>Why It Stands Out</div>
                <p className="font-playfair italic text-sm leading-relaxed" style={{ color: 'var(--text-m)' }}>{p.standout}</p>
              </div>

              {/* Amenities */}
              <div>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: 'var(--text-f)' }}>Amenities & Features</div>
                <div className="flex flex-wrap gap-2">
                  {p.amenities.map(a => (
                    <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-outfit text-[0.68rem]"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-m)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#C9A44A" opacity="0.5" /></svg>
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment plan */}
              <div>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: 'var(--text-f)' }}>Payment Plan</div>
                <div className="space-y-2">
                  {p.paymentPlan.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-cinzel text-[0.6rem] font-bold"
                        style={{ background: 'rgba(201,164,74,0.1)', color: '#C9A44A', border: '1px solid rgba(201,164,74,0.25)' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="font-outfit text-xs" style={{ color: 'var(--text-m)' }}>{step.milestone}</span>
                          <span className="font-cinzel text-xs font-bold" style={{ color: '#C9A44A' }}>{step.pct}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${step.pct}%`, background: 'linear-gradient(90deg,#C9A44A,#E8C97E)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setActiveTab('enquire')} className="btn-gold justify-center">
                Enquire About This Property
              </button>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="flex flex-col gap-7">
              {/* Key metrics */}
              <div>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: 'var(--text-f)' }}>Investment Metrics</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Gross Rental Yield', val: `${p.rentalYield}%`, sub: 'per annum', col: '#22A861' },
                    { label: 'Capital Appreciation', val: `${p.appreciation}%`, sub: 'per annum', col: '#C9A44A' },
                    { label: 'Combined ROI', val: `${combinedROI.toFixed(1)}%`, sub: 'per annum', col: '#E8C97E' },
                  ].map(m => (
                    <div key={m.label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="font-cinzel text-3xl font-bold mb-1" style={{ color: m.col }}>{m.val}</div>
                      <div className="font-dm-mono text-[0.5rem] tracking-widest uppercase" style={{ color: 'var(--text-f)' }}>{m.label}</div>
                      <div className="font-outfit text-[0.65rem] mt-0.5" style={{ color: 'var(--text-ff)' }}>{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI projection */}
              <div>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: 'var(--text-f)' }}>Return Projection (per ₹100 invested)</div>
                <ROIProjection yield={p.rentalYield} appreciation={p.appreciation} />
              </div>

              {/* INR investment context */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(201,164,74,0.05)', border: '1px solid rgba(201,164,74,0.15)' }}>
                <div className="font-dm-mono text-[0.58rem] tracking-widest uppercase mb-2" style={{ color: '#C9A44A' }}>Investment Context for Indian Buyers</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Starting Price', val: p.price },
                    { label: 'AED Equivalent', val: p.priceAED },
                    { label: 'Min. Entry Deposit', val: p.minDeposit },
                    { label: 'LRS Limit (per FY)', val: '₹5 Cr (~USD 250K)' },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="font-dm-mono text-[0.5rem] tracking-widest uppercase" style={{ color: 'var(--text-f)' }}>{r.label}</div>
                      <div className="font-outfit font-semibold mt-0.5" style={{ color: 'var(--text-b)' }}>{r.val}</div>
                    </div>
                  ))}
                </div>
                <p className="font-outfit text-[0.65rem] mt-3 leading-relaxed" style={{ color: 'var(--text-ff)' }}>
                  AED 1 ≈ ₹26.06. Confirm current rate before committing funds. Parva Realty assists with LRS paperwork at no extra cost.
                </p>
              </div>

              <button onClick={() => setActiveTab('enquire')} className="btn-gold justify-center">
                Get a Personalised Financial Analysis
              </button>
            </div>
          )}

          {activeTab === 'enquire' && (
            enquirySent
              ? <EnquirySuccess property={p} onClose={onClose} />
              : (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-cinzel text-lg font-semibold mb-1" style={{ color: 'var(--text-h)' }}>
                      Enquire About {p.name}
                    </h3>
                    <p className="font-outfit text-xs leading-relaxed" style={{ color: 'var(--text-m)' }}>
                      A senior Parva Realty advisor will contact you within 24 hours with availability, live pricing, and a tailored investment brief.
                    </p>
                  </div>
                  <EnquiryForm property={p} onSuccess={() => setEnquirySent(true)} />
                </div>
              )
          )}
        </div>
      </div>
    </div>
  )
}