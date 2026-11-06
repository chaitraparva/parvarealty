import { useCallback, useEffect, useState } from 'react'
import { listInvites, setInviteStatus, deleteInvite, type EventInvite } from '../store/inviteStore'
import { isBackendConfigured } from '../lib/supabase'

function waLink(phone: string) {
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.length === 10) digits = '91' + digits // Indian number typed without country code
  return `https://wa.me/${digits}`
}

function downloadCsv(items: EventInvite[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows = [
    ['Name', 'Phone', 'Requested on', 'Status'],
    ...items.map(i => [i.name, i.phone, new Date(i.createdAt).toLocaleString('en-IN'), i.status === 'new' ? 'New' : 'Contacted']),
  ]
  const blob = new Blob([rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mahesh-bhupathi-event-invites.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function EventInvitesView({ onCountChange }: { onCountChange?: (newCount: number) => void }) {
  const [items, setItems] = useState<EventInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await listInvites()
      setItems(list)
      onCountChange?.(list.filter(i => i.status === 'new').length)
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Could not load invite requests.'
      setError(
        m === 'NOT_SIGNED_IN'
          ? 'Your admin account is not connected to the database. Sign out and sign in again. This admin email must also be in Supabase (Authentication → Users, and the site_admins table).'
          : m.includes('event_invites')
            ? 'The invites table is not set up yet. Run supabase/event_invites.sql in Supabase → SQL Editor.'
            : m,
      )
    }
    setLoading(false)
  }, [onCountChange])

  useEffect(() => { load() }, [load])

  const toggle = async (i: EventInvite) => {
    const next = i.status === 'new' ? 'contacted' : 'new'
    try {
      await setInviteStatus(i.id, next)
      setItems(list => {
        const updated = list.map(x => (x.id === i.id ? { ...x, status: next } : x))
        onCountChange?.(updated.filter(x => x.status === 'new').length)
        return updated
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteInvite(id)
      setItems(list => {
        const updated = list.filter(x => x.id !== id)
        onCountChange?.(updated.filter(x => x.status === 'new').length)
        return updated
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
    setConfirmDelete(null)
  }

  const newCount = items.filter(i => i.status === 'new').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-cinzel text-xl font-bold" style={{ color: '#F0EBE0' }}>Event Invites</h2>
          <p className="font-outfit text-sm mt-1" style={{ color: 'rgba(240,235,224,0.45)' }}>
            "Request an Invite" for Mahesh Bhupathi at Parva Group · 14 November. {items.length} total, {newCount} new.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => downloadCsv(items)}
            disabled={!items.length}
            className="font-outfit text-xs px-3.5 py-1.5 rounded-full disabled:opacity-40"
            style={{ background: 'rgba(201,164,74,0.18)', color: '#E8C97E', border: '1px solid rgba(201,164,74,0.4)' }}
          >
            Download Excel (CSV)
          </button>
          <button onClick={load} className="font-outfit text-xs px-3.5 py-1.5 rounded-full" style={{ border: '1px solid rgba(201,164,74,0.25)', color: '#C9A44A' }}>
            Refresh
          </button>
        </div>
      </div>

      {!isBackendConfigured && (
        <div className="rounded-xl p-4 mb-6 font-outfit text-xs leading-relaxed" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#F4A3A3' }}>
          Demo mode: Supabase keys are not set, so invite requests are only saved in this browser.
        </div>
      )}

      {loading && <div className="font-outfit text-sm py-16 text-center" style={{ color: 'rgba(240,235,224,0.4)' }}>Loading invite requests…</div>}

      {!loading && error && (
        <div className="rounded-xl p-4 font-outfit text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#F4A3A3' }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="font-outfit text-sm py-16 text-center" style={{ color: 'rgba(240,235,224,0.4)' }}>No invite requests yet.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,164,74,0.15)' }}>
          <div className="hidden md:grid grid-cols-[1.4fr_1.4fr_1fr_auto] gap-4 px-5 py-3 font-dm-mono text-[0.55rem] tracking-widest uppercase" style={{ background: 'rgba(201,164,74,0.06)', color: 'rgba(201,164,74,0.75)' }}>
            <div>Name</div><div>Phone</div><div>Requested on</div><div className="text-right">Status / Actions</div>
          </div>
          {items.map((i, idx) => {
            const contacted = i.status === 'contacted'
            return (
              <div
                key={i.id}
                className="grid grid-cols-1 md:grid-cols-[1.4fr_1.4fr_1fr_auto] gap-2 md:gap-4 px-5 py-4 items-center font-outfit text-sm"
                style={{ borderTop: idx ? '1px solid rgba(255,255,255,0.06)' : 'none', opacity: contacted ? 0.7 : 1 }}
              >
                <div className="font-semibold" style={{ color: '#F0EBE0' }}>{i.name}</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <a href={`tel:${i.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline" style={{ color: '#E8C97E' }}>{i.phone}</a>
                  <a href={waLink(i.phone)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,168,97,0.12)', color: '#22A861' }}>
                    WhatsApp
                  </a>
                </div>
                <div className="font-dm-mono text-[0.7rem]" style={{ color: 'rgba(240,235,224,0.5)' }}>
                  {new Date(i.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    onClick={() => toggle(i)}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: contacted ? 'rgba(34,168,97,0.12)' : 'rgba(239,68,68,0.12)',
                      color: contacted ? '#22A861' : '#F87171',
                      border: contacted ? '1px solid rgba(34,168,97,0.35)' : '1px solid rgba(239,68,68,0.35)',
                    }}
                    title="Click to change"
                  >
                    {contacted ? '✓ Contacted' : 'New'}
                  </button>
                  {confirmDelete === i.id ? (
                    <>
                      <button onClick={() => remove(i.id)} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171' }}>Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1" style={{ color: 'rgba(240,235,224,0.5)' }}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(i.id)} className="text-xs px-3 py-1 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,224,0.45)' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
