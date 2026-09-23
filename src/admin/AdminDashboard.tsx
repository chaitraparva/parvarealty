import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  getProperties,
  saveProperties,
  adminLogout,
  isAdminLoggedIn,
  defaultProperties,
  resetProperties,
  getAdminSession,
  getActivityLog,
  logActivity,
  getAdmins,
  saveAdmins,
} from '../store/propertyStore'
import type { AdminUser, ActivityEntry } from '../store/propertyStore'
import type { Property } from '../components/PropertyDetailModal'
import logoImg from '../imports/logo.png'
import ClientRequestsView from './ClientRequestsView'
import { listRequests, adminBackendSignOut } from '../store/requestStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const TIERS = ['Entry / Value', 'Mid-Range', 'Premium', 'Luxury'] as const
const ZONES = ['JVC', 'Dubai South', 'Business Bay', 'Downtown', 'Dubai Islands', 'Dubailand', 'Silicon Oasis', 'Academic City', 'Meydan', 'Other']

const emptyProperty = (): Omit<Property, 'id'> => ({
  name: '',
  location: '',
  type: 'Apartment',
  bedrooms: 1,
  unitTypes: '',
  area: '',
  price: '',
  priceAED: '',
  rentalYield: 7,
  appreciation: 8,
  developer: '',
  completion: '',
  tag: 'NEW',
  tagCol: '#C9A44A',
  tier: 'Mid-Range',
  standout: '',
  description: '',
  image: '',
  gallery: [],
  zone: 'JVC',
  views: 0,
  floors: 0,
  totalUnits: 0,
  minDeposit: '',
  handoverQuarter: '',
  amenities: [],
  paymentPlan: [],
})

// ─── Reusable UI Primitives ───────────────────────────────────────────────────
function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`admin-input ${props.className ?? ''}`}
    />
  )
}

function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`admin-input ${props.className ?? ''}`}
    />
  )
}

function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={`admin-input ${props.className ?? ''}`}
    />
  )
}

function AdminLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="admin-label">{children}</label>
  )
}

// ─── Image Helpers ────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }
  return (
    <div className="flex flex-col gap-2">
      <AdminLabel>{label}</AdminLabel>
      <div className="flex gap-2 items-start">
        {value && (
          <img src={value} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" style={{ border: '1px solid rgba(201,164,74,0.2)' }} />
        )}
        <div className="flex-1 flex flex-col gap-1.5">
          <label
            className="cursor-pointer text-center py-2 px-3 rounded-lg font-outfit text-xs transition-all hover:opacity-80"
            style={{ background: 'rgba(201,164,74,0.1)', border: '1px solid rgba(201,164,74,0.25)', color: '#C9A44A' }}
          >
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <AdminInput
            type="text"
            value={typeof value === 'string' && value.startsWith('http') ? value : ''}
            onChange={e => onChange(e.target.value)}
            placeholder="Or paste image URL"
            className="text-xs"
          />
        </div>
      </div>
    </div>
  )
}

function GalleryUpload({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    Promise.all(files.map(file => new Promise<string>(res => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.readAsDataURL(file)
    }))).then(results => onChange([...value, ...results]))
  }
  return (
    <div className="flex flex-col gap-2">
      <AdminLabel>Gallery Images ({value.length})</AdminLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img} alt="" className="w-16 h-12 object-cover rounded-lg" style={{ border: '1px solid rgba(201,164,74,0.2)' }} />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >×</button>
          </div>
        ))}
      </div>
      <label
        className="cursor-pointer text-center py-2 px-3 rounded-lg font-outfit text-xs transition-all hover:opacity-80 w-fit"
        style={{ background: 'rgba(201,164,74,0.1)', border: '1px solid rgba(201,164,74,0.25)', color: '#C9A44A' }}
      >
        + Add Gallery Images
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
      </label>
    </div>
  )
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-cinzel text-base font-bold mb-4 pb-2" style={{ color: '#C9A44A', borderBottom: '1px solid rgba(201,164,74,0.15)' }}>
      {children}
    </h2>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────
type EditState = (Omit<Property, 'id'> & { id?: number }) | null
type Tab = 'properties' | 'requests' | 'activity' | 'admins'

// ─── Property Editor View ─────────────────────────────────────────────────────
function PropertyEditor({
  editing,
  setEditing,
  isNew,
  onSave,
}: {
  editing: NonNullable<EditState>
  setEditing: (v: EditState) => void
  isNew: boolean
  onSave: () => void
}) {
  return (
    <div className="min-h-screen" style={{ background: '#060606', color: '#F0EBE0' }}>
      <style>{`
        .admin-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,164,74,0.2); color: #F0EBE0; border-radius: 10px; padding: 10px 14px; font-family: var(--font-outfit, sans-serif); font-size: 0.875rem; width: 100%; outline: none; transition: border-color 0.2s; }
        .admin-input:focus { border-color: rgba(201,164,74,0.5); }
        .admin-label { font-family: var(--font-dm-mono, monospace); font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(201,164,74,0.7); display: block; margin-bottom: 4px; }
        textarea.admin-input { resize: vertical; min-height: 80px; }
        select.admin-input option { background: #111; color: #F0EBE0; }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(6,6,6,0.95)', borderBottom: '1px solid rgba(201,164,74,0.12)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="font-outfit text-sm hover:opacity-70 transition-opacity" style={{ color: '#C9A44A' }}>
            ← Back
          </button>
          <div className="w-px h-4" style={{ background: 'rgba(201,164,74,0.2)' }} />
          <span className="font-cinzel text-sm font-bold" style={{ color: '#F0EBE0' }}>
            {isNew ? 'Add New Property' : `Edit: ${editing.name}`}
          </span>
        </div>
        <button onClick={onSave} className="btn-gold">Save Property</button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Basic Info */}
        <section>
          <SectionHeading>Basic Information</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <AdminLabel>Property Name *</AdminLabel>
              <AdminInput value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Auresta Tower" />
            </div>
            <div>
              <AdminLabel>Developer *</AdminLabel>
              <AdminInput value={editing.developer} onChange={e => setEditing({ ...editing, developer: e.target.value })} placeholder="e.g. Tiger Properties" />
            </div>
            <div>
              <AdminLabel>Location</AdminLabel>
              <AdminInput value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="e.g. Jumeirah Village Circle" />
            </div>
            <div>
              <AdminLabel>Zone</AdminLabel>
              <AdminSelect value={editing.zone} onChange={e => setEditing({ ...editing, zone: e.target.value })}>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>Property Type</AdminLabel>
              <AdminInput value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} placeholder="e.g. Apartment" />
            </div>
            <div>
              <AdminLabel>Unit Types</AdminLabel>
              <AdminInput value={editing.unitTypes} onChange={e => setEditing({ ...editing, unitTypes: e.target.value })} placeholder="e.g. Studio / 1BR / 2BR" />
            </div>
            <div>
              <AdminLabel>Tier</AdminLabel>
              <AdminSelect value={editing.tier} onChange={e => setEditing({ ...editing, tier: e.target.value as Property['tier'] })}>
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>Tag Label</AdminLabel>
              <AdminInput value={editing.tag} onChange={e => setEditing({ ...editing, tag: e.target.value })} placeholder="e.g. HIGH YIELD" />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <SectionHeading>Pricing & Returns</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <AdminLabel>Price (INR)</AdminLabel>
              <AdminInput value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} placeholder="e.g. ₹2.22 Cr" />
            </div>
            <div>
              <AdminLabel>Price (AED)</AdminLabel>
              <AdminInput value={editing.priceAED} onChange={e => setEditing({ ...editing, priceAED: e.target.value })} placeholder="e.g. ~AED 850K" />
            </div>
            <div>
              <AdminLabel>Rental Yield (%)</AdminLabel>
              <AdminInput type="number" step="0.1" value={editing.rentalYield} onChange={e => setEditing({ ...editing, rentalYield: parseFloat(e.target.value) })} />
            </div>
            <div>
              <AdminLabel>Appreciation (%)</AdminLabel>
              <AdminInput type="number" step="0.1" value={editing.appreciation} onChange={e => setEditing({ ...editing, appreciation: parseFloat(e.target.value) })} />
            </div>
            <div>
              <AdminLabel>Min Deposit</AdminLabel>
              <AdminInput value={editing.minDeposit} onChange={e => setEditing({ ...editing, minDeposit: e.target.value })} placeholder="e.g. ₹10L (AED 40K)" />
            </div>
            <div>
              <AdminLabel>Area Range (sq ft / sq m)</AdminLabel>
              <AdminInput value={editing.area} onChange={e => setEditing({ ...editing, area: e.target.value })} placeholder="e.g. 480 – 750 sq ft" />
            </div>
          </div>
        </section>

        {/* Project Details */}
        <section>
          <SectionHeading>Project Details</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <AdminLabel>Completion Quarter</AdminLabel>
              <AdminInput value={editing.completion} onChange={e => setEditing({ ...editing, completion: e.target.value })} placeholder="e.g. Q2 2027" />
            </div>
            <div>
              <AdminLabel>Floors</AdminLabel>
              <AdminInput type="number" value={editing.floors} onChange={e => setEditing({ ...editing, floors: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <AdminLabel>Total Units</AdminLabel>
              <AdminInput type="number" value={editing.totalUnits} onChange={e => setEditing({ ...editing, totalUnits: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <AdminLabel>Bedrooms</AdminLabel>
              <AdminInput type="number" value={editing.bedrooms} onChange={e => setEditing({ ...editing, bedrooms: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <AdminLabel>Handover Quarter</AdminLabel>
              <AdminInput value={editing.handoverQuarter} onChange={e => setEditing({ ...editing, handoverQuarter: e.target.value })} placeholder="e.g. Q4 2027" />
            </div>
            <div>
              <AdminLabel>Views</AdminLabel>
              <AdminInput type="number" value={editing.views} onChange={e => setEditing({ ...editing, views: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <AdminLabel>Standout (short pitch)</AdminLabel>
              <AdminTextarea value={editing.standout} onChange={e => setEditing({ ...editing, standout: e.target.value })} placeholder="One compelling reason to invest..." />
            </div>
            <div>
              <AdminLabel>Full Description</AdminLabel>
              <AdminTextarea style={{ minHeight: '120px' }} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Detailed property description..." />
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section>
          <SectionHeading>Amenities</SectionHeading>
          <div className="flex flex-wrap gap-2 mb-3">
            {(editing.amenities || []).map((a, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-outfit text-xs" style={{ background: 'rgba(201,164,74,0.08)', border: '1px solid rgba(201,164,74,0.2)', color: '#C9A44A' }}>
                {a}
                <button type="button" onClick={() => setEditing({ ...editing, amenities: editing.amenities.filter((_, j) => j !== i) })} className="hover:opacity-60 transition-opacity">×</button>
              </span>
            ))}
          </div>
          <AdminInput
            placeholder="Type an amenity and press Enter"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) { setEditing({ ...editing, amenities: [...(editing.amenities || []), val] });(e.target as HTMLInputElement).value = '' }
              }
            }}
          />
        </section>

        {/* Payment Plan */}
        <section>
          <SectionHeading>Payment Plan</SectionHeading>
          <div className="flex flex-col gap-2 mb-3">
            {(editing.paymentPlan || []).map((pp, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,164,74,0.1)' }}>
                <AdminInput
                  className="flex-1"
                  value={pp.milestone}
                  onChange={e => { const p = [...editing.paymentPlan]; p[i] = { ...p[i], milestone: e.target.value }; setEditing({ ...editing, paymentPlan: p }) }}
                  placeholder="Milestone label"
                />
                <AdminInput
                  className="w-20"
                  type="number"
                  value={pp.pct}
                  onChange={e => { const p = [...editing.paymentPlan]; p[i] = { ...p[i], pct: parseInt(e.target.value) || 0 }; setEditing({ ...editing, paymentPlan: p }) }}
                />
                <span className="font-dm-mono text-xs flex-shrink-0" style={{ color: 'rgba(201,164,74,0.6)' }}>%</span>
                <button type="button" onClick={() => setEditing({ ...editing, paymentPlan: editing.paymentPlan.filter((_, j) => j !== i) })} className="text-red-400 hover:opacity-70 transition-opacity text-lg leading-none">×</button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEditing({ ...editing, paymentPlan: [...(editing.paymentPlan || []), { milestone: '', pct: 0 }] })}
            className="font-outfit text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(201,164,74,0.08)', border: '1px solid rgba(201,164,74,0.2)', color: '#C9A44A' }}
          >
            + Add Milestone
          </button>
        </section>

        {/* Images */}
        <section>
          <SectionHeading>Images</SectionHeading>
          <div className="flex flex-col gap-5">
            <ImageUpload
              label="Hero / Cover Image *"
              value={typeof editing.image === 'string' ? editing.image : ''}
              onChange={v => setEditing({ ...editing, image: v })}
            />
            <GalleryUpload
              value={editing.gallery as string[]}
              onChange={v => setEditing({ ...editing, gallery: v })}
            />
          </div>
        </section>

        {/* Bottom save */}
        <div className="flex gap-3 pb-8">
          <button onClick={onSave} className="btn-gold flex-1 justify-center">Save Property</button>
          <button onClick={() => setEditing(null)} className="flex-1 font-outfit text-sm py-3 rounded-xl transition-all hover:opacity-80" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.5)' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Activity Log View ────────────────────────────────────────────────────────
function ActivityLogView() {
  const [log, setLog] = useState<ActivityEntry[]>([])

  useEffect(() => {
    setLog(getActivityLog())
  }, [])

  const actionColor = (a: ActivityEntry['action']) => {
    if (a === 'Added') return '#22A861'
    if (a === 'Deleted') return '#EF4444'
    return '#C9A44A'
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cinzel text-xl font-bold" style={{ color: '#F0EBE0' }}>Activity Log</h2>
          <p className="font-outfit text-sm mt-1" style={{ color: 'rgba(240,235,224,0.4)' }}>{log.length} recorded actions</p>
        </div>
        {log.length > 0 && (
          <button
            onClick={() => { localStorage.removeItem('parva_activity_log'); setLog([]) }}
            className="font-outfit text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)' }}
          >
            Clear Log
          </button>
        )}
      </div>

      {log.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,164,74,0.1)' }}>
          <div className="font-cinzel text-sm mb-2" style={{ color: 'rgba(240,235,224,0.3)' }}>No activity recorded yet</div>
          <div className="font-outfit text-xs" style={{ color: 'rgba(240,235,224,0.2)' }}>Actions by admins will appear here</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {log.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(201,164,74,0.08)' }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-cinzel text-sm font-bold"
                style={{ background: 'rgba(201,164,74,0.12)', color: '#C9A44A', border: '1px solid rgba(201,164,74,0.2)' }}
              >
                {entry.name.charAt(0).toUpperCase()}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-outfit text-sm font-semibold" style={{ color: '#F0EBE0' }}>{entry.name}</span>
                  <span
                    className="font-dm-mono text-[0.48rem] tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: actionColor(entry.action) + '20', border: `1px solid ${actionColor(entry.action)}40`, color: actionColor(entry.action) }}
                  >
                    {entry.action.toUpperCase()}
                  </span>
                  <span className="font-outfit text-sm truncate" style={{ color: 'rgba(240,235,224,0.6)' }}>"{entry.propertyName}"</span>
                </div>
                <div className="font-dm-mono text-[0.45rem] tracking-wider mt-1" style={{ color: 'rgba(240,235,224,0.25)' }}>
                  {entry.email} · {formatDate(entry.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Manage Admins View ───────────────────────────────────────────────────────
function ManageAdminsView() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newAdmin, setNewAdmin] = useState<Omit<AdminUser, 'role'> & { role: 'admin' | 'super-admin' }>({
    email: '', name: '', password: '', role: 'admin',
  })
  const [addError, setAddError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setAdmins(getAdmins()) }, [])

  const handleSaveAdmin = () => {
    if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
      setAddError('All fields are required.')
      return
    }
    if (admins.find(a => a.email.toLowerCase() === newAdmin.email.toLowerCase())) {
      setAddError('An admin with this email already exists.')
      return
    }
    const updated = [...admins, { ...newAdmin }]
    saveAdmins(updated)
    setAdmins(updated)
    setNewAdmin({ email: '', name: '', password: '', role: 'admin' })
    setShowAdd(false)
    setAddError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleRemove = (email: string) => {
    // Can't remove the core super-admin
    if (email === 'chaitra@parvarealty.ae') return
    const updated = admins.filter(a => a.email !== email)
    saveAdmins(updated)
    setAdmins(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cinzel text-xl font-bold" style={{ color: '#F0EBE0' }}>Manage Admins</h2>
          <p className="font-outfit text-sm mt-1" style={{ color: 'rgba(240,235,224,0.4)' }}>{admins.length} admin accounts</p>
        </div>
        <button id="add-admin-btn" onClick={() => { setShowAdd(true); setAddError('') }} className="btn-gold">
          + Add Admin
        </button>
      </div>

      {/* Admin list */}
      <div className="flex flex-col gap-3 mb-6">
        {admins.map(admin => (
          <div
            key={admin.email}
            className="flex items-center gap-4 px-5 py-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(201,164,74,0.08)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-cinzel text-sm font-bold"
              style={{
                background: admin.role === 'super-admin' ? 'rgba(201,164,74,0.15)' : 'rgba(255,255,255,0.05)',
                color: admin.role === 'super-admin' ? '#C9A44A' : 'rgba(240,235,224,0.6)',
                border: admin.role === 'super-admin' ? '1px solid rgba(201,164,74,0.35)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-outfit text-sm font-semibold" style={{ color: '#F0EBE0' }}>{admin.name}</span>
                {admin.role === 'super-admin' && (
                  <span
                    className="font-dm-mono text-[0.45rem] tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(201,164,74,0.12)', border: '1px solid rgba(201,164,74,0.3)', color: '#C9A44A' }}
                  >
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <div className="font-dm-mono text-[0.45rem] tracking-wider mt-0.5" style={{ color: 'rgba(240,235,224,0.3)' }}>
                {admin.email}
              </div>
            </div>
            {admin.email !== 'chaitra@parvarealty.ae' && (
              <button
                onClick={() => handleRemove(admin.email)}
                className="font-outfit text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
                style={{ border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add admin modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-md rounded-2xl p-7" style={{ background: '#0d0c09', border: '1px solid rgba(201,164,74,0.2)' }}>
            <style>{`
              .admin-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,164,74,0.2); color: #F0EBE0; border-radius: 10px; padding: 10px 14px; font-family: var(--font-outfit,sans-serif); font-size: 0.875rem; width: 100%; outline: none; transition: border-color 0.2s; }
              .admin-input:focus { border-color: rgba(201,164,74,0.5); }
              .admin-label { font-family: var(--font-dm-mono,monospace); font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(201,164,74,0.7); display: block; margin-bottom: 4px; }
              select.admin-input option { background: #111; color: #F0EBE0; }
            `}</style>
            <h3 className="font-cinzel text-base font-bold mb-5" style={{ color: '#F0EBE0' }}>Add New Admin</h3>
            <div className="flex flex-col gap-4">
              <div>
                <AdminLabel>Full Name</AdminLabel>
                <AdminInput value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="e.g. Ravi Kumar" />
              </div>
              <div>
                <AdminLabel>Email Address</AdminLabel>
                <AdminInput type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="admin@parvarealty.ae" />
              </div>
              <div>
                <AdminLabel>Password</AdminLabel>
                <AdminInput type="text" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} placeholder="e.g. Ravi@2026" />
              </div>
              <div>
                <AdminLabel>Role</AdminLabel>
                <AdminSelect value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as AdminUser['role'] })}>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </AdminSelect>
              </div>
              {addError && <p className="font-outfit text-xs" style={{ color: '#EF4444' }}>{addError}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={handleSaveAdmin} className="btn-gold flex-1 justify-center">Add Admin</button>
                <button onClick={() => { setShowAdd(false); setAddError('') }} className="flex-1 font-outfit text-sm py-3 rounded-xl transition-all hover:opacity-80" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.5)' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-outfit text-sm flex items-center gap-2" style={{ background: 'rgba(34,168,97,0.15)', border: '1px solid rgba(34,168,97,0.4)', color: '#22A861' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          Admin added successfully
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [editing, setEditing] = useState<EditState>(null)
  const [isNew, setIsNew] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('properties')
  const [newRequests, setNewRequests] = useState(0)
  const [session, setSession] = useState<{ email: string; name: string; role: 'super-admin' | 'admin' } | null>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) { navigate('/admin/login'); return }
    setProperties(getProperties())
    setSession(getAdminSession())
    listRequests().then(l => setNewRequests(l.filter(r => r.status === 'new').length)).catch(() => {})
  }, [navigate])

  const isSuperAdmin = session?.role === 'super-admin'

  const logout = async () => { adminLogout(); await adminBackendSignOut(); navigate('/admin/login') }

  const startEdit = (p: Property) => { setEditing({ ...p, gallery: [...(p.gallery as string[])] }); setIsNew(false) }

  const startNew = () => {
    setEditing({ ...emptyProperty(), gallery: [] })
    setIsNew(true)
  }

  const saveEdit = () => {
    if (!editing) return
    let updated: Property[]
    if (isNew) {
      const newId = Math.max(0, ...properties.map(p => p.id)) + 1
      updated = [...properties, { ...editing, id: newId } as Property]
      logActivity('Added', editing.name || 'Unnamed Property')
    } else {
      updated = properties.map(p => p.id === editing.id ? { ...editing } as Property : p)
      logActivity('Updated', editing.name || 'Unnamed Property')
    }
    setProperties(updated)
    saveProperties(updated)
    setEditing(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const deleteProperty = (id: number) => {
    const prop = properties.find(p => p.id === id)
    const updated = properties.filter(p => p.id !== id)
    setProperties(updated)
    saveProperties(updated)
    if (prop) logActivity('Deleted', prop.name)
    setDeleteConfirm(null)
  }

  const handleReset = () => {
    resetProperties()
    setProperties(defaultProperties)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // If editing a property, show the full editor view
  if (editing !== null) {
    return <PropertyEditor editing={editing} setEditing={setEditing} isNew={isNew} onSave={saveEdit} />
  }

  const TABS: { id: Tab; label: string; superOnly?: boolean }[] = [
    { id: 'properties', label: 'Properties' },
    { id: 'requests', label: 'Client Requests' },
    { id: 'activity', label: 'Activity Log', superOnly: true },
    { id: 'admins', label: 'Manage Admins', superOnly: true },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#060606', color: '#F0EBE0' }}>
      <style>{`
        .admin-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,164,74,0.2); color: #F0EBE0; border-radius: 10px; padding: 10px 14px; font-family: var(--font-outfit,sans-serif); font-size: 0.875rem; width: 100%; outline: none; }
        .admin-label { font-family: var(--font-dm-mono,monospace); font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(201,164,74,0.7); display: block; margin-bottom: 4px; }
        select.admin-input option { background: #111; color: #F0EBE0; }
      `}</style>

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(6,6,6,0.97)', borderBottom: '1px solid rgba(201,164,74,0.12)', backdropFilter: 'blur(20px)' }}>
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#000', border: '1px solid rgba(201,164,74,0.25)' }}>
            <img src={logoImg} alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'lighten' }} />
          </div>
          <div>
            <div className="font-cinzel text-sm font-bold" style={{ color: '#F0EBE0' }}>Admin Dashboard</div>
            <div className="font-dm-mono text-[0.42rem] tracking-widest" style={{ color: '#C9A44A' }}>PARVA REALTY · PROPERTY MANAGEMENT</div>
          </div>
        </div>

        {/* Right: user info + actions */}
        <div className="flex items-center gap-3">
          {session && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(201,164,74,0.06)', border: '1px solid rgba(201,164,74,0.12)' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel text-xs font-bold"
                style={{ background: 'rgba(201,164,74,0.15)', color: '#C9A44A' }}
              >
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-outfit text-xs font-semibold" style={{ color: '#F0EBE0' }}>{session.name}</div>
                {isSuperAdmin && (
                  <div className="font-dm-mono text-[0.4rem] tracking-widest" style={{ color: '#C9A44A' }}>SUPER ADMIN</div>
                )}
              </div>
            </div>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer" className="font-outfit text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80" style={{ border: '1px solid rgba(201,164,74,0.2)', color: 'rgba(201,164,74,0.7)' }}>
            View Site ↗
          </a>
          <button id="admin-logout-btn" onClick={logout} className="font-outfit text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.4)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="px-6 flex gap-1 pt-5" style={{ borderBottom: '1px solid rgba(201,164,74,0.08)' }}>
        {TABS.filter(t => !t.superOnly || isSuperAdmin).map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className="font-outfit text-sm px-5 py-3 rounded-t-xl transition-all relative"
            style={{
              color: activeTab === tab.id ? '#F0EBE0' : 'rgba(240,235,224,0.4)',
              background: activeTab === tab.id ? 'rgba(201,164,74,0.08)' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #C9A44A' : '2px solid transparent',
            }}
          >
            {tab.label}
            {tab.id === 'requests' && newRequests > 0 && (
              <span className="ml-1.5 font-outfit text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full align-middle" style={{ background: '#C9A44A', color: '#060606' }}>
                {newRequests}
              </span>
            )}
            {tab.superOnly && (
              <span className="ml-1.5 font-dm-mono text-[0.4rem] tracking-widest px-1.5 py-0.5 rounded-full align-middle" style={{ background: 'rgba(201,164,74,0.15)', color: '#C9A44A' }}>
                SA
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <>
            {/* Stats + actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-cinzel text-2xl font-bold mb-1" style={{ color: '#F0EBE0' }}>Property Inventory</h1>
                <p className="font-outfit text-sm" style={{ color: 'rgba(240,235,224,0.4)' }}>{properties.length} properties · Click Edit on any card to modify</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="font-outfit text-xs px-4 py-2.5 rounded-xl transition-all hover:opacity-80" style={{ border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}>
                  Reset to Default
                </button>
                <button id="add-property-btn" onClick={startNew} className="btn-gold">+ Add Property</button>
              </div>
            </div>

            {/* Saved toast */}
            {saved && (
              <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-outfit text-sm flex items-center gap-2" style={{ background: 'rgba(34,168,97,0.15)', border: '1px solid rgba(34,168,97,0.4)', color: '#22A861' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                Changes saved successfully
              </div>
            )}

            {/* Property grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {properties.map(p => (
                <div
                  key={p.id}
                  className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,164,74,0.12)' }}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-[#111]">
                    <img
                      src={typeof p.image === 'string' ? p.image : ''}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: 'brightness(0.8)' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(6,6,6,0.7) 0%,transparent 50%)' }} />
                    <div className="absolute top-3 left-3">
                      <span className="font-dm-mono text-[0.48rem] tracking-widest px-2 py-1 rounded-full" style={{ background: p.tagCol + '22', border: `1px solid ${p.tagCol}55`, color: p.tagCol }}>
                        {p.tag}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <button
                        onClick={() => startEdit(p)}
                        className="px-3 py-1.5 rounded-lg font-outfit text-xs transition-all hover:opacity-90"
                        style={{ background: 'rgba(201,164,74,0.9)', color: '#060606' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="px-3 py-1.5 rounded-lg font-outfit text-xs transition-all hover:opacity-90"
                        style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="font-cinzel text-sm font-bold mb-0.5 truncate" style={{ color: '#F0EBE0' }}>{p.name}</div>
                    <div className="font-outfit text-xs mb-3" style={{ color: 'rgba(240,235,224,0.45)' }}>{p.developer} · {p.location}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(201,164,74,0.06)', border: '1px solid rgba(201,164,74,0.12)' }}>
                        <div className="font-cinzel text-xs font-bold" style={{ color: '#C9A44A' }}>{p.rentalYield}%</div>
                        <div className="font-dm-mono text-[0.42rem] mt-0.5" style={{ color: 'rgba(240,235,224,0.3)' }}>YIELD</div>
                      </div>
                      <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(34,168,97,0.06)', border: '1px solid rgba(34,168,97,0.15)' }}>
                        <div className="font-cinzel text-xs font-bold" style={{ color: '#22A861' }}>{p.appreciation}%</div>
                        <div className="font-dm-mono text-[0.42rem] mt-0.5" style={{ color: 'rgba(240,235,224,0.3)' }}>APPREC.</div>
                      </div>
                      <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="font-cinzel text-xs font-bold truncate" style={{ color: '#F0EBE0' }}>{p.tier.split('/')[0].trim()}</div>
                        <div className="font-dm-mono text-[0.42rem] mt-0.5" style={{ color: 'rgba(240,235,224,0.3)' }}>TIER</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="font-cinzel text-sm font-bold" style={{ color: '#C9A44A' }}>{p.price}</div>
                      <div className="font-dm-mono text-[0.48rem]" style={{ color: 'rgba(240,235,224,0.35)' }}>{p.priceAED}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ACTIVITY LOG TAB (super-admin only) */}
        {activeTab === 'requests' && <ClientRequestsView onCountChange={setNewRequests} />}

        {activeTab === 'activity' && isSuperAdmin && <ActivityLogView />}

        {/* MANAGE ADMINS TAB (super-admin only) */}
        {activeTab === 'admins' && isSuperAdmin && <ManageAdminsView />}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#0d0c09', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h3 className="font-cinzel text-base font-bold mb-2" style={{ color: '#F0EBE0' }}>Delete Property?</h3>
            <p className="font-outfit text-sm mb-6" style={{ color: 'rgba(240,235,224,0.5)' }}>
              "{properties.find(p => p.id === deleteConfirm)?.name}" will be permanently removed from the inventory.
            </p>
            <div className="flex gap-3">
              <button onClick={() => deleteProperty(deleteConfirm)} className="flex-1 py-2.5 rounded-xl font-outfit text-sm transition-all hover:opacity-80" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444' }}>
                Yes, Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl font-outfit text-sm transition-all hover:opacity-80" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.5)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
