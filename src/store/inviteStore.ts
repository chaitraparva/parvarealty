// ─────────────────────────────────────────────────────────────────────────────
// "Request an Invite" for the Mahesh Bhupathi event (front page)
// Live mode  → Supabase table `event_invites` (see supabase/event_invites.sql)
// Demo mode  → browser localStorage (only when Supabase env keys are not set)
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase'

export type InviteStatus = 'new' | 'contacted'

export interface EventInvite {
  id: string
  createdAt: string
  name: string
  phone: string
  status: InviteStatus
}

const TABLE = 'event_invites'
const LOCAL_INVITES = 'parva_event_invites'

function readLocal(): EventInvite[] {
  try {
    const raw = localStorage.getItem(LOCAL_INVITES)
    return raw ? (JSON.parse(raw) as EventInvite[]) : []
  } catch {
    return []
  }
}

function writeLocal(list: EventInvite[]) {
  localStorage.setItem(LOCAL_INVITES, JSON.stringify(list))
}

/** Keeps +, digits, spaces, brackets and dashes; returns '' if it isn't a usable phone number. */
export function cleanPhone(raw: string): string {
  const p = raw.trim().replace(/[^0-9+ ()-]/g, '').replace(/\s+/g, ' ')
  const digits = p.replace(/[^0-9]/g, '')
  if (digits.length < 7 || digits.length > 15) return ''
  return p.slice(0, 20)
}

// ─── Website visitor ────────────────────────────────────────────────────────
export async function submitInvite(name: string, phone: string): Promise<void> {
  const full_name = name.trim().replace(/\s+/g, ' ').slice(0, 100)
  const cleaned = cleanPhone(phone)
  if (full_name.length < 2) throw new Error('Please enter your full name.')
  if (!cleaned) throw new Error('Please enter a valid phone number.')

  if (supabase) {
    // No .select() — visitors are allowed to add a row but not to read the table
    const { error } = await supabase.from(TABLE).insert({ full_name, phone: cleaned })
    if (error) throw new Error('Could not send your request. Please try again or contact us on WhatsApp.')
    return
  }

  const list = readLocal()
  list.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), name: full_name, phone: cleaned, status: 'new' })
  writeLocal(list)
}

// ─── Admin ──────────────────────────────────────────────────────────────────
type Row = { id: string; created_at: string; full_name: string; phone: string; status: InviteStatus }

export async function listInvites(): Promise<EventInvite[]> {
  if (supabase) {
    const { data: s } = await supabase.auth.getSession()
    if (!s.session) throw new Error('NOT_SIGNED_IN')
    const { data, error } = await supabase.from(TABLE).select('id, created_at, full_name, phone, status').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return ((data ?? []) as Row[]).map(r => ({ id: r.id, createdAt: r.created_at, name: r.full_name, phone: r.phone, status: r.status }))
  }
  return readLocal()
}

export async function setInviteStatus(id: string, status: InviteStatus): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from(TABLE).update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  writeLocal(readLocal().map(r => (r.id === id ? { ...r, status } : r)))
}

export async function deleteInvite(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  writeLocal(readLocal().filter(r => r.id !== id))
}
