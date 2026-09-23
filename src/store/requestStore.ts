// ─────────────────────────────────────────────────────────────────────────────
// Client property requests: "Exchange your property" and "Sell your property"
// Live mode  → Supabase (Auth + table `property_requests` + private bucket `property-photos`)
// Demo mode  → browser localStorage (only when Supabase env keys are not set)
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase'
import type { Property } from '../components/PropertyDetailModal'

export type RequestType = 'exchange' | 'sell'
export type RequestStatus = 'new' | 'contacted'

export type Tier = 'Entry / Value' | 'Mid-Range' | 'Premium' | 'Luxury'

/** Property listing details the client fills in (same fields as the admin property form). */
export interface ListingDetails {
  propertyName: string
  developer: string
  location: string
  city: string
  propertyType: string
  unitTypes: string
  tier: Tier
  price: string
  priceAED: string
  rentalYield: number
  appreciation: number
  minDeposit: string
  area: string
  completion: string
  floors: number
  totalUnits: number
  bedrooms: number
  handoverQuarter: string
  standout: string
  description: string
  amenities: string[]
  paymentPlan: { milestone: string; pct: number }[]
}

export interface ClientUser {
  email: string
  phone: string
}

export interface PropertyRequest {
  id: string
  createdAt: string
  type: RequestType
  name: string
  email: string
  phone: string
  address: string
  location: string
  photos: string[] // displayable URLs
  photoPaths: string[] // storage paths (live mode)
  status: RequestStatus
  verified: boolean
  details: ListingDetails | null
}

export interface NewRequest {
  type: RequestType
  name: string
  email: string
  phone: string
  address: string
  location: string
  details: ListingDetails
  photos: Blob[]
}

const BUCKET = 'property-photos'
const TABLE = 'property_requests'
const LOCAL_USERS = 'parva_client_users'
const LOCAL_SESSION = 'parva_client_session'
const LOCAL_REQUESTS = 'parva_property_requests'

// ─── Helpers ────────────────────────────────────────────────────────────────
function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('Could not read photo'))
    r.readAsDataURL(blob)
  })
}

/** Resize a photo to max 1600px and re-encode as JPEG so uploads stay small. */
export async function compressPhoto(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', quality))
    return blob ?? file
  } catch {
    return file
  }
}

// ─── Client auth ────────────────────────────────────────────────────────────
export async function getClientUser(): Promise<ClientUser | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const u = data.session?.user
    if (!u?.email) return null
    return { email: u.email, phone: (u.user_metadata?.phone as string) ?? '' }
  }
  return readLocal<ClientUser | null>(LOCAL_SESSION, null)
}

export type AuthResult = { ok: true; user: ClientUser } | { ok: false; message: string; needsConfirm?: boolean }

export async function clientSignUp(email: string, password: string, phone: string): Promise<AuthResult> {
  email = email.trim().toLowerCase()
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone }, emailRedirectTo: window.location.origin + '/#properties' },
    })
    if (error) return { ok: false, message: error.message }
    if (!data.session) {
      return {
        ok: false,
        needsConfirm: true,
        message: 'We sent a confirmation link to your email. Please confirm it, then log in here.',
      }
    }
    return { ok: true, user: { email, phone } }
  }
  const users = readLocal<Array<ClientUser & { password: string }>>(LOCAL_USERS, [])
  if (users.some(u => u.email === email)) return { ok: false, message: 'An account with this email already exists. Please log in.' }
  users.push({ email, password, phone })
  localStorage.setItem(LOCAL_USERS, JSON.stringify(users))
  const user = { email, phone }
  localStorage.setItem(LOCAL_SESSION, JSON.stringify(user))
  return { ok: true, user }
}

export async function clientLogIn(email: string, password: string): Promise<AuthResult> {
  email = email.trim().toLowerCase()
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { ok: false, message: error?.message ?? 'Invalid email or password.' }
    return { ok: true, user: { email, phone: (data.user.user_metadata?.phone as string) ?? '' } }
  }
  const users = readLocal<Array<ClientUser & { password: string }>>(LOCAL_USERS, [])
  const found = users.find(u => u.email === email && u.password === password)
  if (!found) return { ok: false, message: 'Invalid email or password.' }
  const user = { email: found.email, phone: found.phone }
  localStorage.setItem(LOCAL_SESSION, JSON.stringify(user))
  return { ok: true, user }
}

export async function clientLogOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
  localStorage.removeItem(LOCAL_SESSION)
}

// ─── Submit a request (client) ──────────────────────────────────────────────
export async function submitRequest(req: NewRequest): Promise<void> {
  if (supabase) {
    const { data: s } = await supabase.auth.getSession()
    const uid = s.session?.user.id
    if (!uid) throw new Error('Your login has expired. Please log in again.')

    const folder = `${uid}/${Date.now()}`
    const paths: string[] = []
    for (let i = 0; i < req.photos.length; i++) {
      const path = `${folder}/photo-${i + 1}.jpg`
      const { error } = await supabase.storage.from(BUCKET).upload(path, req.photos[i], {
        contentType: req.photos[i].type || 'image/jpeg',
        upsert: false,
      })
      if (error) throw new Error('Photo upload failed: ' + error.message)
      paths.push(path)
    }

    const { error } = await supabase.from(TABLE).insert({
      user_id: uid,
      request_type: req.type,
      full_name: req.name,
      email: req.email,
      phone: req.phone,
      property_address: req.address,
      property_location: req.location,
      details: req.details,
      photo_paths: paths,
      owner_confirmed: req.type === 'exchange',
      fee_accepted: req.type === 'sell',
    })
    if (error) throw new Error('Could not submit: ' + error.message)
    return
  }

  // Demo mode
  const photos = await Promise.all(req.photos.map(blobToDataUrl))
  const list = readLocal<PropertyRequest[]>(LOCAL_REQUESTS, [])
  list.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type: req.type,
    name: req.name,
    email: req.email,
    phone: req.phone,
    address: req.address,
    location: req.location,
    photos,
    photoPaths: [],
    status: 'new',
    verified: false,
    details: req.details,
  })
  try {
    localStorage.setItem(LOCAL_REQUESTS, JSON.stringify(list))
  } catch {
    throw new Error('Browser storage is full (demo mode). Connect Supabase to store photos online.')
  }
}

// ─── Admin side ─────────────────────────────────────────────────────────────
/** Signs the admin into Supabase too, so the database lets them read client requests. */
export async function adminBackendSignIn(email: string, password: string): Promise<string | null> {
  if (!supabase) return null
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
  return error ? error.message : null
}

export async function adminBackendSignOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
}

type Row = {
  id: string
  created_at: string
  request_type: RequestType
  full_name: string | null
  email: string
  phone: string
  property_address: string
  property_location: string
  photo_paths: string[] | null
  status: RequestStatus
  verified: boolean | null
  details: ListingDetails | null
}

export async function listRequests(): Promise<PropertyRequest[]> {
  if (supabase) {
    const { data: s } = await supabase.auth.getSession()
    if (!s.session) throw new Error('NOT_SIGNED_IN')
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as Row[]

    const allPaths = rows.flatMap(r => r.photo_paths ?? [])
    const urlByPath = new Map<string, string>()
    if (allPaths.length) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(allPaths, 60 * 60)
      signed?.forEach(s => { if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl) })
    }

    return rows.map(r => ({
      id: r.id,
      createdAt: r.created_at,
      type: r.request_type,
      name: r.full_name ?? '',
      email: r.email,
      phone: r.phone,
      address: r.property_address,
      location: r.property_location,
      photoPaths: r.photo_paths ?? [],
      photos: (r.photo_paths ?? []).map(p => urlByPath.get(p)).filter((u): u is string => !!u),
      status: r.status,
      verified: !!r.verified,
      details: r.details,
    }))
  }
  return readLocal<PropertyRequest[]>(LOCAL_REQUESTS, []).map(r => ({ ...r, verified: !!r.verified, details: r.details ?? null }))
}

/** Admin: mark a request verified (shows on the website) or not verified (hidden). */
export async function setRequestVerified(id: string, verified: boolean): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from(TABLE)
      .update({ verified, verified_at: verified ? new Date().toISOString() : null })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  const list = readLocal<PropertyRequest[]>(LOCAL_REQUESTS, []).map(r => (r.id === id ? { ...r, verified } : r))
  localStorage.setItem(LOCAL_REQUESTS, JSON.stringify(list))
}

// ─── Public website: verified Indian properties ─────────────────────────────
// Only listing details + photos are public. Name, email, mobile and address are never sent.

/** Stable numeric id from a uuid (the catalogue uses numeric ids). */
function numericId(uuid: string): number {
  return parseInt(uuid.replace(/-/g, '').slice(0, 12), 16)
}

function toProperty(id: string, d: ListingDetails, photos: string[]): Property {
  const location = [d.location, d.city].filter(Boolean).join(', ')
  return {
    id: numericId(id),
    name: d.propertyName,
    location,
    type: d.propertyType,
    bedrooms: d.bedrooms || 0,
    unitTypes: d.unitTypes,
    area: d.area,
    price: d.price,
    priceAED: d.priceAED,
    rentalYield: d.rentalYield || 0,
    appreciation: d.appreciation || 0,
    developer: d.developer || 'Owner',
    completion: d.completion || '—',
    tag: 'VERIFIED',
    tagCol: '#22A861',
    tier: d.tier,
    standout: d.standout || d.description,
    description: d.description,
    image: photos[0] ?? '',
    gallery: photos.slice(1),
    zone: d.city,
    views: 0,
    floors: d.floors || 0,
    totalUnits: d.totalUnits || 0,
    amenities: d.amenities ?? [],
    paymentPlan: d.paymentPlan ?? [],
    handoverQuarter: d.handoverQuarter || '—',
    minDeposit: d.minDeposit || '—',
    country: 'India',
  }
}

export async function listVerifiedIndianProperties(): Promise<Property[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.rpc('get_verified_indian_properties')
      if (error || !data) return []
      const rows = data as { id: string; details: ListingDetails; photo_paths: string[] | null }[]
      const allPaths = rows.flatMap(r => r.photo_paths ?? [])
      const urlByPath = new Map<string, string>()
      if (allPaths.length) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(allPaths, 60 * 60 * 24)
        signed?.forEach(s => { if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl) })
      }
      return rows
        .map(r => toProperty(r.id, r.details, (r.photo_paths ?? []).map(p => urlByPath.get(p)).filter((u): u is string => !!u)))
        .filter(p => p.image)
    }
    return readLocal<PropertyRequest[]>(LOCAL_REQUESTS, [])
      .filter(r => r.verified && r.details && r.photos.length)
      .map(r => toProperty(r.id, r.details!, r.photos))
  } catch {
    return []
  }
}

export async function setRequestStatus(id: string, status: RequestStatus): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from(TABLE).update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  const list = readLocal<PropertyRequest[]>(LOCAL_REQUESTS, []).map(r => (r.id === id ? { ...r, status } : r))
  localStorage.setItem(LOCAL_REQUESTS, JSON.stringify(list))
}

export async function deleteRequest(req: PropertyRequest): Promise<void> {
  if (supabase) {
    if (req.photoPaths.length) await supabase.storage.from(BUCKET).remove(req.photoPaths)
    const { error } = await supabase.from(TABLE).delete().eq('id', req.id)
    if (error) throw new Error(error.message)
    return
  }
  const list = readLocal<PropertyRequest[]>(LOCAL_REQUESTS, []).filter(r => r.id !== req.id)
  localStorage.setItem(LOCAL_REQUESTS, JSON.stringify(list))
}