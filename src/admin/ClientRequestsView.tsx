import { useCallback, useEffect, useState } from 'react'
import {
  listRequests,
  setRequestStatus,
  deleteRequest,
  type PropertyRequest,
  type RequestType,
} from '../store/requestStore'
import { isBackendConfigured } from '../lib/supabase'

type Filter = 'all' | RequestType

const TYPE_STYLE: Record<RequestType, { label: string; color: string; bg: string }> = {
  exchange: { label: 'Exchange', color: '#3A72A8', bg: 'rgba(58,114,168,0.15)' },
  sell: { label: 'Sell', color: '#C9A44A', bg: 'rgba(201,164,74,0.15)' },
}

function waLink(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}`
}

export default function ClientRequestsView({ onCountChange }: { onCountChange?: (newCount: number) => void }) {
  const [items, setItems] = useState<PropertyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await listRequests()
      setItems(list)
      onCountChange?.(list.filter(r => r.status === 'new').length)
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Could not load requests.'
      setError(
        m === 'NOT_SIGNED_IN'
          ? 'Your admin account is not connected to the database. Sign out and sign in again. If this keeps happening, this admin email must also be added in Supabase (Authentication → Users, and the site_admins table).'
          : m,
      )
    }
    setLoading(false)
  }, [onCountChange])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (r: PropertyRequest) => {
    const next: PropertyRequest['status'] = r.status === 'new' ? 'contacted' : 'new'
    try {
      await setRequestStatus(r.id, next)
      setItems(list => {
        const updated = list.map(x => (x.id === r.id ? { ...x, status: next } : x))
        onCountChange?.(updated.filter(x => x.status === 'new').length)
        return updated
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const remove = async (r: PropertyRequest) => {
    try {
      await deleteRequest(r)
      setItems(list => {
        const updated = list.filter(x => x.id !== r.id)
        onCountChange?.(updated.filter(x => x.status === 'new').length)
        return updated
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
    setConfirmDelete(null)
  }

  const shown = items.filter(r => filter === 'all' || r.type === filter)
  const count = (f: Filter) => items.filter(r => f === 'all' || r.type === f).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-cinzel text-xl font-bold" style={{ color: '#F0EBE0' }}>Client Requests</h2>
          <p className="font-outfit text-sm mt-1" style={{ color: 'rgba(240,235,224,0.45)' }}>
            Exchange and sell requests submitted from the Property Catalogue
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'exchange', 'sell'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-outfit text-xs px-3.5 py-1.5 rounded-full transition-all"
              style={{
                background: filter === f ? 'rgba(201,164,74,0.18)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#E8C97E' : 'rgba(240,235,224,0.55)',
                border: filter === f ? '1px solid rgba(201,164,74,0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {f === 'all' ? 'All' : TYPE_STYLE[f].label} ({count(f)})
            </button>
          ))}
          <button
            onClick={load}
            className="font-outfit text-xs px-3.5 py-1.5 rounded-full"
            style={{ border: '1px solid rgba(201,164,74,0.25)', color: '#C9A44A' }}
          >
            Refresh
          </button>
        </div>
      </div>

      {!isBackendConfigured && (
        <div className="rounded-xl p-4 mb-6 font-outfit text-xs leading-relaxed" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#F4A3A3' }}>
          Demo mode: Supabase keys are not set, so requests are only saved in this browser. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel to receive requests from all visitors.
        </div>
      )}

      {loading && <div className="font-outfit text-sm py-16 text-center" style={{ color: 'rgba(240,235,224,0.4)' }}>Loading requests…</div>}

      {!loading && error && (
        <div className="rounded-xl p-4 font-outfit text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#F4A3A3' }}>
          {error}
        </div>
      )}

      {!loading && !error && shown.length === 0 && (
        <div className="font-outfit text-sm py-16 text-center" style={{ color: 'rgba(240,235,224,0.4)' }}>No requests yet.</div>
      )}

      {!loading && !error && shown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {shown.map(r => {
            const t = TYPE_STYLE[r.type]
            const contacted = r.status === 'contacted'
            return (
              <div
                key={r.id}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: contacted ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(201,164,74,0.28)',
                  opacity: contacted ? 0.75 : 1,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-outfit text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: t.bg, color: t.color }}>
                      {t.label}
                    </span>
                    <span
                      className="font-outfit text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: contacted ? 'rgba(34,168,97,0.12)' : 'rgba(239,68,68,0.12)',
                        color: contacted ? '#22A861' : '#F87171',
                      }}
                    >
                      {contacted ? 'Contacted' : 'New'}
                    </span>
                  </div>
                  <span className="font-dm-mono text-[0.65rem]" style={{ color: 'rgba(240,235,224,0.4)' }}>
                    {new Date(r.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 font-outfit text-sm">
                  <dt style={{ color: 'rgba(240,235,224,0.45)' }}>Email</dt>
                  <dd><a href={`mailto:${r.email}`} className="hover:underline" style={{ color: '#E8C97E' }}>{r.email}</a></dd>
                  <dt style={{ color: 'rgba(240,235,224,0.45)' }}>Mobile</dt>
                  <dd className="flex items-center gap-3 flex-wrap">
                    <a href={`tel:${r.phone}`} className="hover:underline" style={{ color: '#E8C97E' }}>{r.phone}</a>
                    <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,168,97,0.12)', color: '#22A861' }}>
                      WhatsApp
                    </a>
                  </dd>
                  <dt style={{ color: 'rgba(240,235,224,0.45)' }}>Address</dt>
                  <dd className="whitespace-pre-line" style={{ color: '#F0EBE0' }}>{r.address}</dd>
                  <dt style={{ color: 'rgba(240,235,224,0.45)' }}>Location</dt>
                  <dd className="flex items-center gap-3 flex-wrap" style={{ color: '#F0EBE0' }}>
                    {r.location}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.address}, ${r.location}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline"
                      style={{ color: 'rgba(201,164,74,0.8)' }}
                    >
                      Map
                    </a>
                  </dd>
                  <dt style={{ color: 'rgba(240,235,224,0.45)' }}>Declaration</dt>
                  <dd style={{ color: 'rgba(240,235,224,0.7)' }}>
                    {r.type === 'exchange' ? 'Confirmed owner (no broker / third party)' : 'Agreed to 2–3% platform fee'}
                  </dd>
                </dl>

                {r.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {r.photos.map((src, i) => (
                      <button key={i} onClick={() => setLightbox({ photos: r.photos, index: i })} className="w-20 h-16 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(201,164,74,0.2)' }}>
                        <img src={src} alt={`Property photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-auto pt-1">
                  <button
                    onClick={() => toggleStatus(r)}
                    className="font-outfit text-xs px-3.5 py-2 rounded-lg"
                    style={{ background: 'rgba(201,164,74,0.12)', border: '1px solid rgba(201,164,74,0.3)', color: '#E8C97E' }}
                  >
                    {contacted ? 'Mark as new' : 'Mark as contacted'}
                  </button>
                  {confirmDelete === r.id ? (
                    <>
                      <button onClick={() => remove(r)} className="font-outfit text-xs px-3.5 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171' }}>
                        Confirm delete
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="font-outfit text-xs px-3 py-2" style={{ color: 'rgba(240,235,224,0.5)' }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(r.id)} className="font-outfit text-xs px-3.5 py-2 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.45)' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightbox(null)}>
          <img src={lightbox.photos[lightbox.index]} alt="" className="max-w-full max-h-[85vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          {lightbox.photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white text-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                onClick={e => { e.stopPropagation(); setLightbox(l => l && { ...l, index: (l.index - 1 + l.photos.length) % l.photos.length }) }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white text-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                onClick={e => { e.stopPropagation(); setLightbox(l => l && { ...l, index: (l.index + 1) % l.photos.length }) }}
              >
                ›
              </button>
            </>
          )}
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  )
}
