import { useState, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import PropertyDetailModal, { type Property } from './PropertyDetailModal'
import { getProperties } from '../store/propertyStore'
import OwnerRequests from './OwnerRequests'
// Append Unsplash sizing params only for remote URLs; leave local assets untouched
const imgSrc = (src: string, w: number, h: number) =>
  src.startsWith('http') ? `${src}?w=${w}&h=${h}&fit=crop&auto=format` : src

import samanaExterior from '../imports/image-7.png'
import samanaBedroom  from '../imports/image-8.png'
import samanaPool     from '../imports/image-9.png'
import samanaAmenity  from '../imports/image-10.png'
import aurestaHero    from '../imports/image-11.png'
import aurestaImg2    from '../imports/image-12.png'
import aurestaImg3    from '../imports/image-13.png'
import aurestaImg4    from '../imports/image-14.png'
import aurestaImg5    from '../imports/image-15.png'
import sunsetHero     from '../imports/image-16.png'
import sunsetImg2     from '../imports/image-17.png'
import sunsetImg3     from '../imports/image-18.png'
import sunsetImg4     from '../imports/image-19.png'
import symphonyHero   from '../imports/image-20.png'
import symphonyImg2   from '../imports/image-21.png'
import symphonyImg3   from '../imports/image-22.png'
import symphonyImg4   from '../imports/image-23.png'
import austinHero     from '../imports/image-24.png'
import austinImg2     from '../imports/image-25.png'
import austinImg3     from '../imports/image-26.png'
import austinImg4     from '../imports/image-27.png'
import tigerSkyHero   from '../imports/image-28.png'
import tigerSkyImg2   from '../imports/image-29.png'
import tigerSkyImg3   from '../imports/image-30.png'
import serenzHero     from '../imports/image-31.png'
import serenzImg2     from '../imports/image-32.png'
import serenzImg3     from '../imports/image-33.png'
import serenzImg4     from '../imports/image-34.png'
import serenzImg5     from '../imports/image-35.png'
import serenzImg6     from '../imports/image-36.png'
import biancaHero     from '../imports/image-37.png'
import biancaImg2     from '../imports/image-38.png'
import biancaImg3     from '../imports/image-39.png'
import biancaImg4     from '../imports/image-40.png'
import biancaImg5     from '../imports/image-41.png'
import biancaImg6     from '../imports/image-42.png'
import portofinoHero  from '../imports/image-43.png'
import portofinoImg2  from '../imports/image-44.png'
import portofinoImg3  from '../imports/image-45.png'
import portofinoImg4  from '../imports/image-46.png'
import enreHero       from '../imports/image-47.png'
import enreImg2       from '../imports/image-48.png'
import enreImg3       from '../imports/image-49.png'
import enreImg4       from '../imports/image-50.png'
import enreImg5       from '../imports/image-51.png'
import enreImg6       from '../imports/image-52.png'
import enreImg7       from '../imports/image-53.png'
import timezHero      from '../imports/image-54.png'
import timezImg2      from '../imports/image-55.png'
import timezImg3      from '../imports/image-56.png'
import timezImg4      from '../imports/image-57.png'
import timezImg5      from '../imports/image-58.png'
import greenzHero     from '../imports/image-59.png'
import greenzImg2     from '../imports/image-60.png'
import greenzImg3     from '../imports/image-61.png'
import greenzImg4     from '../imports/image-62.png'
import mbExterior from '../imports/image.png'
import mbLiving   from '../imports/image-1.png'
import mbInterior from '../imports/image-2.png'
import mbBath     from '../imports/image-3.png'
import mbPool     from '../imports/image-4.png'
import mbSpa      from '../imports/image-5.png'
import mbBedroom  from '../imports/image-6.png'

type Tier = 'Entry / Value' | 'Mid-Range' | 'Premium' | 'Luxury'

const tierConfig: Record<Tier, { color: string; bg: string; border: string }> = {
  'Entry / Value': { color: '#4A7C59', bg: 'rgba(74,124,89,0.12)', border: 'rgba(74,124,89,0.3)' },
  'Mid-Range':     { color: '#3A72A8', bg: 'rgba(58,114,168,0.12)', border: 'rgba(58,114,168,0.3)' },
  'Premium':       { color: '#7B5EA7', bg: 'rgba(123,94,167,0.12)', border: 'rgba(123,94,167,0.3)' },
  'Luxury':        { color: '#C9A44A', bg: 'rgba(201,164,74,0.12)', border: 'rgba(201,164,74,0.35)' },
}

// Gallery image pool — contextual shots for each property
const G = {
  pool:        'https://images.unsplash.com/photo-1701929362885-86e7b25d3b77', // infinity pool skyline
  lobby:       'https://images.unsplash.com/photo-1719474818087-f334f1e92985', // rooftop city view
  bedroom:     'https://images.unsplash.com/photo-1779648596373-274e9d81ad80', // modern bedroom
  bedroom2:    'https://images.unsplash.com/photo-1781473377323-fff4569c1eb2', // bedroom with TV
  green:       'https://images.unsplash.com/photo-1743819455744-05417bf55cea', // building green lawn
  aerial:      'https://images.unsplash.com/photo-1640877268187-2fa6b2ed7a5f', // aerial Dubai community
  island:      'https://images.unsplash.com/photo-1732645023408-6e99df42f09e', // island in water
  night:       'https://images.unsplash.com/photo-1608991156162-3c55b3cf05d3', // Dubai night skyline
  sunset:      'https://images.unsplash.com/photo-1768463852019-4881a17a1c0e', // boat sails sunset skyline
  atlantis:    'https://images.unsplash.com/photo-1786991810391-e28ee367c3aa', // Atlantis Palm Jumeirah aerial
  palmaerial:  'https://images.unsplash.com/photo-1764212193268-dba11709dc38', // coastal city aerial Dubai
  poolbuild:   'https://images.unsplash.com/photo-1524234599372-a5bd0194758d', // pool near city buildings
  lounge:      'https://images.unsplash.com/photo-1586611292717-f828b167408c', // lounge chairs pool
  tropical:    'https://images.unsplash.com/photo-1780734323790-6f18edf42997', // tropical island aerial
  villahouse:  'https://images.unsplash.com/photo-1782720829237-ec146b0afe0a', // luxury house with palms
  greentrees:  'https://images.unsplash.com/photo-1626227187853-6e334338e437', // building among green trees
  nighttop:    'https://images.unsplash.com/photo-1739900292622-a7f860175aad', // city night from top
  watersunset: 'https://images.unsplash.com/photo-1773393776477-61773dfc8a09', // hotel on water sunset
  jvcaerial:   'https://images.unsplash.com/photo-1647845594306-b239d70798a7', // JVC/Dubai mid-rise aerial
  jvccircular: 'https://images.unsplash.com/photo-1642715350691-7ffde05661c4', // aerial circular residential
  businessbay: 'https://images.unsplash.com/photo-1617449512807-7401d38e5c29', // Business Bay canal street
  bbacanal:    'https://images.unsplash.com/photo-1591609073408-f3d66d8fc11d', // Business Bay skyline
  mbbuilding:  'https://images.unsplash.com/photo-1740671167535-9e5670359626', // Mercedes-Benz logo tower
  townhouses:  'https://images.unsplash.com/photo-1743819458014-f5cf74f175e3', // colorful Dubai townhouses
  cityaerial:  'https://images.unsplash.com/photo-1721170628992-ddd25faa162e', // aerial city with green trees
  ainisland:   'https://images.unsplash.com/photo-1784285827951-d11105694e2a', // Ain Dubai island ferris
  burjnight:   'https://images.unsplash.com/photo-1559717201-fbb671ff56b7', // Burj Khalifa night highways
}


const zones = ['All', 'JVC', 'Dubai South', 'Business Bay', 'Downtown', 'Dubai Islands', 'Dubailand', 'Silicon Oasis', 'Academic City', 'Meydan']
const tiers: Array<'All' | Tier> = ['All', 'Entry / Value', 'Mid-Range', 'Premium', 'Luxury']

export default function PropertyCatalogue() {
  const { ref, visible } = useInView(0.01)
  const [properties, setProperties] = useState<Property[]>([])
  useEffect(() => { setProperties(getProperties()) }, [])
  const [zone, setZone] = useState('All')
  const [tier, setTier] = useState<'All' | Tier>('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('views')

  // Listen for zone filter events dispatched by the interactive map
  useEffect(() => {
    const handler = (e: Event) => {
      const z = (e as CustomEvent<{ zone: string }>).detail.zone
      setZone(z)
      setTier('All')
      setSearch('')
    }
    window.addEventListener('parva:filterZone', handler)
    return () => window.removeEventListener('parva:filterZone', handler)
  }, [])
  const [watchlist, setWatchlist] = useState<number[]>([])
  const [compare, setCompare] = useState<number[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [detailProp, setDetailProp] = useState<Property | null>(null)

  const toggleWatch = (id: number) =>
    setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  const toggleCompare = (id: number) => {
    if (compare.includes(id)) {
      setCompare(c => c.filter(x => x !== id))
    } else if (compare.length < 3) {
      setCompare(c => [...c, id])
    }
  }

  const filtered = properties
    .filter(p => {
      if (zone !== 'All' && p.zone !== zone) return false
      if (tier !== 'All' && p.tier !== tier) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.location.toLowerCase().includes(search.toLowerCase()) &&
          !p.developer.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'yield') return b.rentalYield - a.rentalYield
      if (sort === 'views') return b.views - a.views
      if (sort === 'appreciation') return b.appreciation - a.appreciation
      if (sort === 'price-asc') return parseFloat(a.priceAED.replace(/[^0-9.]/g, '')) - parseFloat(b.priceAED.replace(/[^0-9.]/g, ''))
      if (sort === 'price-desc') return parseFloat(b.priceAED.replace(/[^0-9.]/g, '')) - parseFloat(a.priceAED.replace(/[^0-9.]/g, ''))
      return 0
    })

  const compareProps = properties.filter(p => compare.includes(p.id))

  return (
    <>
      <div
        className="py-28 px-6 relative"
        style={{ background: 'linear-gradient(180deg,#060606 0%,#0d0c09 100%)' }}
        ref={ref}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-12 ${visible ? 'in-view-fade-up d-0' : ''}`}>
            <div className="section-label mb-5">Curated Inventory</div>
            <h2 className="section-heading text-4xl md:text-6xl mb-5">Property Catalogue</h2>
            <div className="gold-divider mx-auto mb-6" />
            <p className="font-outfit text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-m)' }}>
              12 personally vetted off-plan projects across four investment tiers. Select up to 3 to compare side-by-side.
            </p>
          </div>

          {/* Owner options: Exchange / Sell your property */}
          <OwnerRequests />

          {/* Filter panel */}
          <div className={`glass rounded-2xl p-5 mb-8 ${visible ? 'in-view-scale d-1' : ''}`}>
            {/* Search */}
            <div className="relative mb-4">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15"
                viewBox="0 0 24 24" fill="none" stroke="rgba(201,164,74,0.3)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text" placeholder="Search by project name, location, or developer…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tier pills */}
            <div className="flex gap-2 flex-wrap mb-3">
              {tiers.map(t => {
                const cfg = t !== 'All' ? tierConfig[t as Tier] : null
                const active = tier === t
                return (
                  <button
                    key={t} onClick={() => setTier(t)}
                    className="px-3.5 py-1.5 rounded-full font-outfit text-xs font-semibold transition-all"
                    style={{
                      background: active ? (cfg ? cfg.bg : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.04)',
                      color: active ? (cfg ? cfg.color : 'var(--text-h)') : 'var(--text-f)',
                      border: active ? `1px solid ${cfg ? cfg.border : 'rgba(255,255,255,0.2)'}` : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Zone pills */}
              <div className="flex gap-2 flex-wrap">
                {zones.map(z => (
                  <button
                    key={z} onClick={() => setZone(z)}
                    className="px-3.5 py-1.5 rounded-full font-outfit text-xs font-medium transition-all"
                    style={{
                      background: zone === z ? 'linear-gradient(135deg,#C9A44A,#E8C97E)' : 'rgba(255,255,255,0.05)',
                      color: zone === z ? '#060606' : 'var(--text-m)',
                      border: zone === z ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {z}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sort} onChange={e => setSort(e.target.value)}
                className="w-auto min-w-[180px]"
              >
                <option value="views">Sort: Most Viewed</option>
                <option value="yield">Sort: Rental Yield</option>
                <option value="appreciation">Sort: Capital Appreciation</option>
                <option value="price-asc">Sort: Price — Low to High</option>
                <option value="price-desc">Sort: Price — High to Low</option>
              </select>
            </div>
          </div>

          {/* Results + compare bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="font-dm-mono text-xs" style={{ color: 'var(--text-f)' }}>
              {filtered.length} of {properties.length} properties · {watchlist.length} saved
            </div>
            {compare.length > 0 && (
              <button
                onClick={() => setShowCompare(v => !v)}
                className="flex items-center gap-2 font-outfit text-xs font-semibold text-[#C9A44A] hover:text-[#E8C97E] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Compare {compare.length} selected
              </button>
            )}
          </div>

          {/* Compare panel */}
          {showCompare && compare.length > 0 && (
            <div className="glass-gold rounded-2xl p-6 mb-8 overflow-x-auto"
              style={{ border: '1px solid rgba(201,164,74,0.25)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-cinzel text-base font-semibold" style={{ color: 'var(--text-h)' }}>Side-by-Side Comparison</div>
                <button onClick={() => { setCompare([]); setShowCompare(false) }}
                  className="font-outfit text-xs" style={{ color: 'var(--text-f)' }}>Clear All</button>
              </div>
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr>
                    <td className="font-dm-mono text-[0.6rem] tracking-widest uppercase pb-3 pr-4" style={{ color: 'var(--text-f)' }}>Metric</td>
                    {compareProps.map(p => (
                      <td key={p.id} className="pb-3 pr-4">
                        <div className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-h)' }}>{p.name}</div>
                        <div className="font-outfit text-[0.65rem]" style={{ color: 'var(--text-f)' }}>{p.developer}</div>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Tier', vals: compareProps.map(p => p.tier) },
                    { label: 'Price', vals: compareProps.map(p => p.price) },
                    { label: 'Unit Types', vals: compareProps.map(p => p.unitTypes) },
                    { label: 'Rental Yield', vals: compareProps.map(p => `${p.rentalYield}%`) },
                    { label: 'Capital Apprec.', vals: compareProps.map(p => `${p.appreciation}%`) },
                    { label: 'Combined ROI', vals: compareProps.map(p => `${(p.rentalYield + p.appreciation).toFixed(1)}%`) },
                    { label: 'Size', vals: compareProps.map(p => p.area) },
                    { label: 'Handover', vals: compareProps.map(p => p.completion) },
                  ].map(row => (
                    <tr key={row.label} className="border-t border-white/5">
                      <td className="py-2.5 pr-4 font-dm-mono text-[0.6rem] tracking-widest uppercase" style={{ color: 'var(--text-f)' }}>{row.label}</td>
                      {row.vals.map((v, i) => (
                        <td key={i} className="py-2.5 pr-4 font-outfit text-sm"
                          style={{ color: row.label === 'Rental Yield' ? '#22A861' : row.label === 'Price' || row.label === 'Combined ROI' ? '#C9A44A' : 'var(--text-b)' }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {compareProps.length > 0 && (
                <div className="mt-5 flex gap-3">
                  {compareProps.map(p => (
                    <button key={p.id} onClick={() => setDetailProp(p)} className="btn-outline-gold text-xs py-2 px-4">
                      Full Details — {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((p, i) => {
              const inCompare = compare.includes(p.id)
              const inWatch = watchlist.includes(p.id)
              const combinedROI = p.rentalYield + p.appreciation
              const tc = tierConfig[p.tier]
              return (
                <div
                  key={p.id}
                  className={`glass card-lift rounded-2xl overflow-hidden group flex flex-col cursor-pointer ${visible ? `in-view-fade-up d-${Math.min(i, 8)}` : ''}`}
                  style={{
                    border: inCompare ? '1px solid rgba(201,164,74,0.35)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: inCompare ? '0 0 0 1px rgba(201,164,74,0.15)' : 'none',
                  }}
                  onClick={() => setDetailProp(p)}
                >
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden bg-[#111] flex-shrink-0">
                    <img
                      src={imgSrc(p.image, 600, 400)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top,rgba(6,6,6,0.85) 0%,transparent 55%)' }} />

                    {/* Tag */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-dm-mono text-[0.55rem] tracking-widest font-bold uppercase text-white"
                      style={{ background: p.tagCol }}>
                      {p.tag}
                    </div>

                    {/* Watchlist */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleWatch(p.id) }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: inWatch ? 'rgba(201,164,74,0.25)' : 'rgba(6,6,6,0.55)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24"
                        fill={inWatch ? '#C9A44A' : 'none'}
                        stroke={inWatch ? '#C9A44A' : '#DDD9D2'} strokeWidth="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                    </button>

                    {/* Compare toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleCompare(p.id) }}
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full font-outfit text-[0.6rem] font-semibold transition-all"
                      style={{
                        background: inCompare ? 'rgba(201,164,74,0.9)' : 'rgba(6,6,6,0.55)',
                        color: inCompare ? '#060606' : 'var(--text-b)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {inCompare ? '✓ Selected' : '+ Compare'}
                    </button>

                    {/* Tier badge */}
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded font-dm-mono text-[0.5rem] tracking-wider font-bold uppercase"
                      style={{
                        background: tc.bg,
                        color: tc.color,
                        border: `1px solid ${tc.border}`,
                        backdropFilter: 'blur(8px)',
                      }}>
                      {p.tier}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col gap-3.5 flex-1">
                    <div>
                      <h3 className="font-cinzel text-base font-semibold leading-tight" style={{ color: 'var(--text-h)' }}>
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C9A44A" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span className="font-outfit text-xs" style={{ color: 'var(--text-f)' }}>{p.location}</span>
                        </div>
                        <span className="font-dm-mono text-[0.55rem]" style={{ color: 'var(--text-ff)' }}>by {p.developer}</span>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="flex gap-2 flex-wrap">
                      {[p.unitTypes, p.area, p.completion].map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-lg font-outfit text-[0.62rem]"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-m)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Standout */}
                    <p className="font-outfit text-[0.7rem] leading-relaxed italic line-clamp-2"
                      style={{ color: 'var(--text-ff)', borderLeft: `2px solid ${tc.color}`, paddingLeft: '0.6rem' }}>
                      {p.standout}
                    </p>

                    {/* Price + dual yield chips */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-cinzel text-xl font-bold text-gradient-gold">{p.price}</div>
                        <div className="font-dm-mono text-[0.58rem] mt-0.5" style={{ color: 'var(--text-ff)' }}>{p.priceAED}</div>
                      </div>
                      <div className="flex gap-3 text-right">
                        <div>
                          <div className="font-cinzel text-base font-bold" style={{ color: '#22A861' }}>{p.rentalYield}%</div>
                          <div className="font-dm-mono text-[0.5rem]" style={{ color: 'var(--text-f)' }}>Yield</div>
                        </div>
                        <div>
                          <div className="font-cinzel text-base font-bold" style={{ color: '#C9A44A' }}>{p.appreciation}%</div>
                          <div className="font-dm-mono text-[0.5rem]" style={{ color: 'var(--text-f)' }}>Capital</div>
                        </div>
                      </div>
                    </div>

                    {/* Combined ROI bar */}
                    <div>
                      <div className="flex justify-between font-dm-mono text-[0.58rem] mb-1.5" style={{ color: 'var(--text-f)' }}>
                        <span>Combined Annual ROI</span>
                        <span style={{ color: '#C9A44A' }}>{combinedROI.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${Math.min((combinedROI / 30) * 100, 100)}%`,
                            background: 'linear-gradient(90deg,#C9A44A,#E8C97E)',
                            animation: visible ? `barGrow 1s ease-out ${0.3 + i * 0.08}s both` : 'none',
                          }} />
                      </div>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(201,164,74,0.2)" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      <span className="font-dm-mono text-[0.58rem]" style={{ color: 'var(--text-ff)' }}>
                        {p.views.toLocaleString()} views this month
                      </span>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); setDetailProp(p) }}
                      className="btn-gold justify-center mt-auto"
                    >
                      View Details & Enquire
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="font-cinzel text-xl" style={{ color: 'var(--text-ff)' }}>No properties match your filters</div>
              <button onClick={() => { setZone('All'); setTier('All'); setSearch('') }} className="btn-outline-gold mt-6">
                Clear All Filters
              </button>
            </div>
          )}

          {/* More properties callout */}
          <div
            className="mt-12 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,rgba(201,164,74,0.08) 0%,rgba(201,164,74,0.03) 50%,rgba(123,94,167,0.06) 100%)',
              border: '1px solid rgba(201,164,74,0.22)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(201,164,74,0.07) 0%,transparent 65%)' }}
            />
            <div className="relative z-10">
              <div className="section-label mb-4">Beyond This Catalogue</div>
              <h3 className="font-cinzel text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-h)' }}>
                We Have Many More Property Options
              </h3>
              <p className="font-playfair italic text-lg mb-2" style={{ color: 'rgba(232,201,126,0.75)' }}>
                Every investor's situation is unique — so is our advice.
              </p>
              <p className="font-outfit text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: 'var(--text-m)' }}>
                What you see here is a curated shortlist. Our full portfolio spans 50+ off-plan and ready projects across every Dubai district and budget. Connect with a Parva advisor and we will personally match you to the right opportunity — based on your goals, timeline, and capital.
              </p>
              <button
                className="btn-gold px-10 py-4 text-sm"
                onClick={() => document.querySelector('#consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Connect With Us to Explore the Opportunity
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 rounded-xl font-outfit text-[0.68rem] text-center leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-ff)' }}>
            Prices & availability are indicative and subject to change. AED 1 ≈ ₹26.06 (approx). Parva Realty confirms current inventory, live unit pricing, PSF, and payment plan before any client commitment. This is not financial advice.
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detailProp && (
        <PropertyDetailModal
          property={detailProp}
          onClose={() => setDetailProp(null)}
        />
      )}
    </>
  )
}
