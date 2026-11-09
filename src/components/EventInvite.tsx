import { useEffect, useRef, useState } from 'react'
import partnerImg from '../imports/mahesh-bhupathi-partner.webp'
import { submitInvite, cleanPhone } from '../store/inviteStore'

// Partnership announcement: Parva Group welcomes Mahesh Bhupathi — celebration on 14 November 2026.
// Everything here (opening announcement, top strip, floating button) hides itself
// automatically after the event day ends (Dubai time).
const HIDE_AFTER = new Date('2026-11-15T00:00:00+04:00')
const SEEN_KEY = 'parva-event-invite-seen'
const DONE_KEY = 'parva-event-registered'
const STRIP_H = '36px'

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,500;1,600&family=Montserrat:wght@400;500;600;700&display=swap'
const SERIF = "'Cormorant Garamond', 'Playfair Display', serif"
const SANS = "'Montserrat', 'Outfit', sans-serif"
const GOLD = '#E8C97E'
const IVORY = '#F0EBE0'

const CSS = `
.ev-gold{background:linear-gradient(100deg,#A9822F 0%,#F3D98B 38%,#C9A44A 60%,#F6E3A6 80%,#B8913A 100%);background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:evGold 7s linear infinite}
@keyframes evGold{to{background-position:-200% center}}
.ev-btn{transition:transform .25s ease,box-shadow .25s ease,filter .25s ease}
.ev-btn:hover{transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 0 0 1px rgba(255,236,180,.5),0 14px 40px rgba(201,164,74,.45)}
.ev-btn:focus-visible{outline:2px solid ${GOLD};outline-offset:3px}
.ev-in{background:rgba(255,255,255,0.05);border:1px solid rgba(201,164,74,0.3);color:${IVORY};border-radius:12px;padding:13px 15px;font:500 16px ${SANS};width:100%;outline:none}
.ev-in:focus{border-color:#C9A44A;box-shadow:0 0 0 3px rgba(201,164,74,0.15)}
.ev-in[aria-invalid="true"]{border-color:#E57373}
.ev-in::placeholder{color:rgba(240,235,224,0.35)}

/* ───────── Partnership announcement ───────── */
.pa{position:fixed;inset:0;z-index:100;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
  color:${IVORY};font-family:${SANS};transition:opacity .5s ease;
  background:radial-gradient(ellipse 70% 45% at 72% 22%,rgba(201,164,74,.20),transparent 70%),linear-gradient(180deg,#100c07 0%,#080604 55%,#0b0906 100%)}
.pa-close{position:fixed;z-index:10;top:max(10px,env(safe-area-inset-top));right:12px;width:42px;height:42px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:26px;line-height:1;color:rgba(240,235,224,.8);
  background:rgba(8,6,4,.55);border:1px solid rgba(201,164,74,.35);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.pa-close:hover{color:#fff;border-color:#C9A44A}
.pa-close:focus-visible{outline:2px solid ${GOLD};outline-offset:2px}
.pa-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:clamp(60px,9svh,200px);pointer-events:none}
.pa-sweep{position:absolute;top:0;right:0;width:min(70vw,620px);height:auto;pointer-events:none;opacity:.8}

.pa-shell{position:relative;min-height:100%;max-width:560px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;
  padding:max(16px,env(safe-area-inset-top)) 18px max(30px,calc(env(safe-area-inset-bottom) + 22px));gap:clamp(8px,1.5svh,16px)}

.pa-brand{display:flex;align-items:center;gap:16px;width:100%;padding:0 40px}
.pa-rule{flex:1;height:1px;background:linear-gradient(90deg,transparent,#C9A44A)}
.pa-rule.r{background:linear-gradient(90deg,#C9A44A,transparent)}
.pa-parva{font-family:${SERIF};font-weight:600;font-size:clamp(24px,4.2svh,40px);letter-spacing:.42em;padding-left:.42em;line-height:1}
.pa-group{font-size:clamp(9px,1.3svh,12px);letter-spacing:.5em;padding-left:.5em;color:rgba(240,235,224,.75);margin-top:5px}

/* Hero: name on the left, photo on the right (phone & tablet portrait) */
.pa-hero{position:relative;width:calc(100% + 36px);margin:0 -18px;height:clamp(220px,37svh,400px);overflow:hidden}
.pa-photo{position:absolute;right:0;top:0;bottom:0;width:58%;margin:0}
.pa-glow{position:absolute;left:50%;top:40%;width:130%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;
  background:radial-gradient(circle,rgba(243,217,139,.30) 0%,rgba(201,164,74,.12) 40%,transparent 68%);pointer-events:none}
.pa-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:52% 0%;display:block;
  -webkit-mask-image:linear-gradient(to bottom,#000 70%,transparent 99%),linear-gradient(to right,transparent 0%,#000 22%);-webkit-mask-composite:source-in;
  mask-image:linear-gradient(to bottom,#000 70%,transparent 99%),linear-gradient(to right,transparent 0%,#000 22%);mask-composite:intersect}
.pa-title{position:absolute;left:18px;top:50%;transform:translateY(-50%);width:55%;z-index:2;display:flex;flex-direction:column;align-items:center;text-shadow:0 2px 18px rgba(0,0,0,.65)}
.pa-eyebrow{font-size:clamp(9.5px,2.6vw,13px);letter-spacing:.26em;padding-left:.26em;color:#D4AF5A;font-weight:600;white-space:nowrap}
.pa-dash{width:44px;height:1.5px;background:#C9A44A;margin:clamp(8px,1.4svh,14px) 0}
.pa-welcome{font-size:clamp(12px,3.6vw,18px);letter-spacing:.38em;padding-left:.38em;font-weight:500}
.pa-name{font-family:${SERIF};font-weight:600;font-size:clamp(29px,9.4vw,56px);line-height:.95;margin:clamp(4px,.8svh,8px) 0 0;letter-spacing:.01em;white-space:nowrap}
.pa-partner{font-size:clamp(10px,3vw,15px);letter-spacing:.26em;padding-left:.26em;font-weight:500;margin-top:clamp(8px,1.4svh,14px);white-space:nowrap}

.pa-line{width:84%;height:1px;background:linear-gradient(90deg,transparent,#C9A44A 15%,#E8C97E 50%,#C9A44A 85%,transparent)}

.pa-info{display:flex;flex-direction:column;align-items:center;width:100%;gap:clamp(8px,1.6svh,16px)}
.pa-save{display:flex;align-items:center;gap:12px;font-size:clamp(10px,1.5svh,13px);letter-spacing:.34em;padding-left:.34em;color:#D4AF5A;font-weight:500}
.pa-save span{width:34px;height:1px;background:#C9A44A}
.pa-save span:first-child{background:linear-gradient(90deg,transparent,#C9A44A)}
.pa-save span:last-child{background:linear-gradient(90deg,#C9A44A,transparent)}
.pa-date{display:flex;align-items:center;justify-content:center;gap:clamp(14px,4vw,24px)}
.pa-dd{font-family:${SERIF};font-weight:600;font-size:clamp(46px,8svh,84px);line-height:.85;font-variant-numeric:lining-nums}
.pa-vbar{width:1.5px;align-self:stretch;min-height:48px;background:linear-gradient(180deg,transparent,#C9A44A 20%,#E8C97E 50%,#C9A44A 80%,transparent)}
.pa-month{display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left}
.pa-mm{font-family:${SERIF};font-weight:600;font-size:clamp(22px,3.8svh,38px);line-height:1;letter-spacing:.08em}
.pa-day{font-size:clamp(9.5px,1.4svh,13px);letter-spacing:.3em;font-weight:500;color:rgba(240,235,224,.85)}
.pa-copy{font-family:${SERIF};font-style:italic;font-size:clamp(16px,2.5svh,23px);line-height:1.35;color:rgba(240,235,224,.92);margin:0;max-width:26em;text-wrap:balance}
.pa-copy b{font-weight:600;color:${GOLD}}
.pa-cta{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;width:min(100%,380px);height:clamp(50px,7svh,64px);border-radius:14px;
  background:linear-gradient(100deg,#B8913A 0%,#F3D98B 45%,#E8C97E 62%,#C9A44A 100%);color:#1a1306;font-weight:700;font-size:clamp(12px,1.75svh,15px);letter-spacing:.16em;white-space:nowrap;
  box-shadow:inset 0 2px 0 rgba(255,245,215,.6),inset 0 -2px 0 rgba(120,90,30,.35),0 12px 36px rgba(201,164,74,.32)}
.pa-cta::after{content:'';position:absolute;top:0;bottom:0;width:38%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,250,230,.55),transparent);transform:skewX(-20deg);animation:paShine 5s 1.8s ease-in-out infinite}
@keyframes paShine{0%{left:-60%}35%,100%{left:130%}}
.pa-cta-bar{width:1px;height:24px;background:rgba(26,19,6,.45);margin:0 16px}
.pa-foot{display:flex;flex-direction:column;align-items:center;gap:clamp(6px,1.1svh,10px);width:100%}
.pa-star{display:flex;align-items:center;gap:14px;width:84%;color:${GOLD};font-size:16px;line-height:1}
.pa-star span{flex:1;height:1px;background:linear-gradient(90deg,transparent,#C9A44A)}
.pa-star span:last-child{background:linear-gradient(90deg,#C9A44A,transparent)}
.pa-remember{font-size:clamp(10px,1.5svh,13px);letter-spacing:.32em;padding-left:.32em;color:#D4AF5A;font-weight:500}
.pa-pg{font-size:clamp(9px,1.35svh,12px);letter-spacing:.4em;padding-left:.4em;color:rgba(240,235,224,.75)}
.pa-skip{position:relative;z-index:2;font-size:clamp(12px,1.6svh,14px);letter-spacing:.12em;color:rgba(240,235,224,.72);text-decoration:underline;text-underline-offset:5px;padding:4px 8px}
.pa-skip:hover{color:#fff}

/* entrance */
@keyframes paUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes paIn{from{opacity:0}to{opacity:1}}
.pa-brand{animation:paUp .8s ease both}
.pa-photo{animation:paIn 1.2s .1s ease both}
.pa-title{animation:paIn 1s .3s ease both}
.pa-info{animation:paUp .9s .45s ease both}

/* Small / short phones */
@media (max-height:700px) and (max-aspect-ratio:4/5){
  .pa-hero{height:clamp(200px,36svh,300px)}
  .pa-pg{display:none}
}
@media (max-height:600px) and (max-aspect-ratio:4/5){
  .pa-copy{font-size:15px}
  .pa-hero{height:33svh}
}

/* Tablet portrait */
@media (min-width:600px) and (max-aspect-ratio:6/5){
  .pa-shell{max-width:720px;padding-left:32px;padding-right:32px;gap:clamp(12px,2svh,24px)}
  .pa-hero{width:calc(100% + 64px);margin:0 -32px;height:clamp(320px,38svh,520px)}
  .pa-copy{font-size:clamp(19px,2.3svh,24px)}.pa-save,.pa-remember{font-size:14px}.pa-day{font-size:13px}.pa-dd{font-size:84px}.pa-mm{font-size:40px}
  .pa-title{left:32px;width:56%}
  .pa-eyebrow{font-size:14px}.pa-welcome{font-size:20px}.pa-partner{font-size:16px}
  .pa-name{font-size:clamp(56px,8.6vw,84px)}
  .pa-cta{width:min(100%,440px)}
}

/* Laptop / desktop / TV: three-column composition */
@media (min-width:960px) and (min-aspect-ratio:6/5){
  .pa{overflow:hidden;background:radial-gradient(ellipse 34% 55% at 50% 42%,rgba(201,164,74,.22),transparent 70%),linear-gradient(180deg,#0f0b07,#070504)}
  .pa-shell{max-width:max(1600px,150vh);height:100%;min-height:0;display:grid;grid-template-columns:1fr minmax(0,1fr) 1fr;grid-template-rows:auto 1fr;
    align-items:center;column-gap:clamp(16px,2.5vw,106px);row-gap:0;padding:0 clamp(28px,4vw,176px)}
  .pa-brand{grid-column:1/-1;grid-row:1;padding:clamp(20px,4.6vh,106px) 0 0;max-width:max(1200px,110vh);justify-self:center}
  .pa-parva{font-size:clamp(30px,4.8vh,110px)}.pa-group{font-size:clamp(10px,1.5vh,31px)}
  .pa-hero{display:contents}
  .pa-title{position:relative;left:auto;top:auto;transform:none;width:auto;grid-column:1;grid-row:2;justify-self:end;padding-bottom:7vh;text-shadow:none}
  .pa-eyebrow{font-size:clamp(12px,1.8vh,35px)}
  .pa-dash{width:64px;margin:2.6vh 0}
  .pa-welcome{font-size:clamp(16px,2.8vh,57px)}
  .pa-name{font-size:clamp(56px,min(6.2vw,11vh),260px);margin-top:1.2vh}
  .pa-partner{font-size:clamp(13px,2.2vh,48px);margin-top:2.4vh}
  .pa-photo{position:relative;grid-column:2;grid-row:2;align-self:end;justify-self:center;width:165%;max-width:none;height:auto;aspect-ratio:1.02;max-height:min(80vh,calc(100vh - 130px));right:auto}
  .pa-glow{top:42%;width:95%}
  .pa-photo img{object-position:50% 0%;
    -webkit-mask-image:linear-gradient(to bottom,#000 74%,transparent 99%),linear-gradient(to right,transparent 0%,#000 16%,#000 84%,transparent 100%);
    mask-image:linear-gradient(to bottom,#000 74%,transparent 99%),linear-gradient(to right,transparent 0%,#000 16%,#000 84%,transparent 100%)}
  .pa-line{display:none}
  .pa-info{grid-column:3;grid-row:2;justify-self:start;max-width:max(480px,46vh);gap:clamp(12px,2.4vh,57px);padding-bottom:7vh}
  .pa-save{font-size:clamp(11px,1.6vh,31px)}
  .pa-dd{font-size:clamp(60px,10vh,229px)}.pa-mm{font-size:clamp(28px,4.4vh,101px)}.pa-day{font-size:clamp(11px,1.5vh,31px)}
  .pa-copy{font-size:clamp(18px,2.7vh,57px)}
  .pa-cta{height:clamp(54px,7.6vh,158px);font-size:clamp(13px,1.8vh,35px);width:min(100%,max(420px,40vh))}
  .pa-waves{height:16vh}
  .pa-remember{font-size:clamp(11px,1.5vh,30px)}.pa-pg{font-size:clamp(10px,1.3vh,26px)}.pa-skip{font-size:clamp(13px,1.6vh,32px)}
  .pa-dash{width:clamp(64px,6vh,130px)}.pa-cta-bar{height:clamp(24px,3vh,60px)}.pa-cta svg{width:clamp(22px,2.6vh,52px);height:auto}
  .pa-close{width:clamp(42px,4.4vh,90px);height:clamp(42px,4.4vh,90px);font-size:clamp(26px,2.8vh,56px)}
  .pa-shell{padding-bottom:0}
}

/* Phones held sideways */
@media (max-height:520px) and (min-aspect-ratio:6/5){
  .pa{overflow-y:auto}
  .pa-shell{max-width:none;display:grid;grid-template-columns:1fr minmax(0,.8fr) 1fr;grid-template-rows:auto auto;align-items:center;
    gap:8px 18px;padding:10px 60px 12px 20px}
  .pa-brand{grid-column:1/-1;padding:0 40px}
  .pa-hero{display:contents}
  .pa-title{position:relative;left:auto;top:auto;transform:none;width:auto;grid-column:1;grid-row:2}
  .pa-name{font-size:clamp(26px,8vh,40px)}
  .pa-photo{position:relative;grid-column:2;grid-row:2;align-self:end;width:100%;height:min(74vh,300px)}
  .pa-line,.pa-copy,.pa-pg{display:none}
  .pa-info{grid-column:3;grid-row:2;gap:8px}
  .pa-dd{font-size:44px}.pa-mm{font-size:22px}
  .pa-waves{display:none}
}

@media (prefers-reduced-motion:reduce){.ev-gold,.pa-brand,.pa-photo,.pa-title,.pa-info,.pa-cta::after{animation:none}.pa{transition:none}}
`

function PersonPlusIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.9 3.1-7 7-7 1.6 0 3 .5 4.2 1.4" />
      <path d="M5 13v5M2.5 15.5h5" />
    </svg>
  )
}

// ─── Registration modal ──────────────────────────────────────────────────────
function InviteForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [trap, setTrap] = useState('') // hidden field: bots fill it, people don't
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(() => {
    try { return sessionStorage.getItem(DONE_KEY) === '1' } catch { return false }
  })
  const sending = useRef(false)

  const nameErr = name.trim().replace(/\s+/g, ' ').length < 2 ? 'Please enter your full name.' : ''
  const phoneErr = !phone.trim() ? 'Please enter your phone number.' : !cleanPhone(phone) ? 'Please enter a valid phone number with country code.' : ''

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !sending.current) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending.current) return // block double submits
    setTouched(true)
    setError('')
    if (nameErr || phoneErr) return
    if (trap) { setDone(true); return }
    sending.current = true
    setBusy(true)
    try {
      await submitInvite(name, phone)
      try { sessionStorage.setItem(DONE_KEY, '1') } catch { /* ignore */ }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
    sending.current = false
    setBusy(false)
  }

  const label = { fontSize: 10.5, letterSpacing: '0.22em', color: 'rgba(201,164,74,0.9)', fontWeight: 600 } as const
  const hint = { fontSize: 12, marginTop: 6, color: '#F28B82' } as const

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget && !sending.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Join the celebration — registration"
    >
      <div
        className="relative w-full rounded-2xl"
        style={{
          maxWidth: 430,
          maxHeight: 'calc(100svh - 32px)',
          overflowY: 'auto',
          padding: '36px 26px 28px',
          background: 'linear-gradient(180deg,#17120a,#0b0906)',
          border: '1px solid rgba(201,164,74,0.4)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 50px rgba(201,164,74,0.12)',
          fontFamily: SANS,
          color: IVORY,
        }}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-4" style={{ color: 'rgba(240,235,224,0.55)', fontSize: 28, lineHeight: 1 }}>×</button>

        {done ? (
          <div className="text-center py-4" role="status">
            <div className="mx-auto mb-5 flex items-center justify-center" style={{ width: 66, height: 66, borderRadius: '50%', border: '1px solid rgba(201,164,74,0.6)', color: GOLD, fontSize: 30 }}>✓</div>
            <div className="ev-gold" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 32, lineHeight: 1.1 }}>
              You're registered{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}!
            </div>
            <p className="mt-3" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, color: 'rgba(240,235,224,0.88)' }}>
              Thank you for joining us. Our team will call you shortly to confirm your place on 14 November.
            </p>
            <button onClick={onClose} className="ev-btn mt-7 px-9 py-3 rounded-full" style={{ background: 'linear-gradient(90deg,#B8913A,#E8C97E)', color: '#120d04', fontWeight: 700, fontSize: 12, letterSpacing: '0.2em' }}>
              DONE
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="text-center mb-6">
              <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#C9A44A', fontWeight: 600 }}>NEW PARTNERSHIP · 14 NOV</div>
              <div className="ev-gold mt-2" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 34, lineHeight: 1.05 }}>Join the Celebration</div>
              <p className="mt-2" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: 'rgba(240,235,224,0.75)' }}>
                Reserve your place for an evening with Mahesh Bhupathi.
              </p>
            </div>

            <label className="block mb-4">
              <span className="block mb-2" style={label}>FULL NAME *</span>
              <input
                className="ev-in" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                autoComplete="name" maxLength={100} required autoFocus aria-invalid={touched && !!nameErr}
              />
              {touched && nameErr && <span className="block" style={hint}>{nameErr}</span>}
            </label>

            <label className="block">
              <span className="block mb-2" style={label}>PHONE NUMBER *</span>
              <input
                className="ev-in" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+971 50 123 4567" autoComplete="tel" maxLength={20} required aria-invalid={touched && !!phoneErr}
              />
              {touched && phoneErr
                ? <span className="block" style={hint}>{phoneErr}</span>
                : <span className="block" style={{ fontSize: 11.5, marginTop: 6, color: 'rgba(240,235,224,0.42)' }}>Please include your country code.</span>}
            </label>

            {/* Hidden from people; catches spam bots */}
            <input value={trap} onChange={e => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

            {error && <p className="mt-4" role="alert" style={{ fontSize: 13, color: '#F28B82' }}>{error}</p>}

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="ev-btn w-full mt-6 rounded-full flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-wait"
              style={{ height: 54, background: 'linear-gradient(90deg,#B8913A,#F3D98B 55%,#C9A44A)', color: '#120d04', fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', boxShadow: '0 8px 30px rgba(201,164,74,0.3)' }}
            >
              {busy ? 'REGISTERING…' : 'REGISTER NOW'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function EventInvite() {
  const active = Date.now() < HIDE_AFTER.getTime()
  const [open, setOpen] = useState(() => {
    if (!active) return false
    try { return sessionStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
  })
  const [shown, setShown] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  // Fonts for this announcement only
  useEffect(() => {
    if (!active || document.getElementById('parva-event-fonts')) return
    const link = document.createElement('link')
    link.id = 'parva-event-fonts'
    link.rel = 'stylesheet'
    link.href = FONTS_URL
    document.head.appendChild(link)
  }, [active])

  // Push the fixed nav below the top strip (Nav.tsx reads --sold-strip-h)
  useEffect(() => {
    if (!active) return
    document.documentElement.style.setProperty('--sold-strip-h', STRIP_H)
    return () => { document.documentElement.style.removeProperty('--sold-strip-h') }
  }, [active])

  // Fade in + lock page scroll while the announcement is up
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => setShown(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !formOpen) close() }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, formOpen])

  function close() {
    setShown(false)
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setTimeout(() => setOpen(false), 400)
  }

  if (!active) return null

  return (
    <>
      <style>{CSS}</style>

      {/* Top strip above the nav */}
      <div
        className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-3"
        style={{ height: STRIP_H, background: 'linear-gradient(90deg,#1a1408,#3a2c10,#1a1408)', borderBottom: '1px solid rgba(201,164,74,0.4)', color: IVORY, fontFamily: SANS, fontSize: 12 }}
      >
        <span className="hidden sm:inline" style={{ opacity: 0.85 }}>Welcoming</span>
        <span className="whitespace-nowrap" style={{ color: GOLD, fontWeight: 600, letterSpacing: '0.12em' }}>MAHESH BHUPATHI</span>
        <span className="hidden sm:inline" style={{ opacity: 0.85 }}>as our new partner</span>
        <span className="whitespace-nowrap" style={{ opacity: 0.85 }}>· 14 Nov</span>
        <button onClick={() => setFormOpen(true)} className="ml-1 sm:ml-2 underline whitespace-nowrap" style={{ color: GOLD, textUnderlineOffset: 3, fontWeight: 600 }}>
          Join →
        </button>
      </div>

      {/* Small floating button (bottom-left; WhatsApp/chat sit bottom-right) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open the Mahesh Bhupathi partnership announcement"
          className="ev-btn fixed z-40 flex items-center gap-3 rounded-2xl text-left"
          style={{ left: 16, bottom: 22, padding: '10px 14px', background: 'rgba(10,8,4,0.9)', border: '1px solid rgba(201,164,74,0.5)', boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 24px rgba(201,164,74,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', fontFamily: SANS }}
        >
          <img src={partnerImg} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', objectPosition: '52% 12%', border: '1px solid rgba(201,164,74,0.6)', background: '#1a140a' }} />
          <span className="flex flex-col">
            <span style={{ fontSize: 9, letterSpacing: '0.22em', color: '#C9A44A', fontWeight: 600 }}>NEW PARTNERSHIP · 14 NOV</span>
            <span style={{ fontSize: 13, color: IVORY, fontWeight: 600 }}>Join the celebration</span>
          </span>
        </button>
      )}

      {/* Opening announcement — real, responsive website layout */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pa-heading"
          className="pa"
          style={{ opacity: shown ? 1 : 0 }}
        >
          <button onClick={close} aria-label="Close announcement and continue to the website" className="pa-close">×</button>

          <svg className="pa-sweep" viewBox="0 0 620 420" aria-hidden="true">
            <path d="M620 18 C520 70 430 140 340 250" stroke="#C9A44A" strokeWidth="1.4" fill="none" opacity="0.55" />
            <path d="M620 0 C490 100 400 190 300 330" stroke="#C9A44A" strokeWidth="0.8" fill="none" opacity="0.25" />
          </svg>
          <svg className="pa-waves" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="paWave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#F3D98B" stopOpacity="0.85" />
                <stop offset="0.5" stopColor="#C9A44A" stopOpacity="0.35" />
                <stop offset="1" stopColor="#F3D98B" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="paGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#C9A44A" stopOpacity="0.16" />
                <stop offset="1" stopColor="#C9A44A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 70 C250 170 750 170 1000 70 L1000 200 L0 200Z" fill="url(#paGlow)" />
            <path d="M0 70 C250 170 750 170 1000 70" stroke="url(#paWave)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M0 130 C260 200 740 200 1000 130" stroke="url(#paWave)" strokeWidth="1" fill="none" opacity="0.55" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="pa-shell">
            <header className="pa-brand">
              <span className="pa-rule" />
              <div>
                <div className="ev-gold pa-parva">PARVA</div>
                <div className="pa-group">GROUP</div>
              </div>
              <span className="pa-rule r" />
            </header>

            <div className="pa-hero">
              <figure className="pa-photo">
                <span className="pa-glow" aria-hidden="true" />
                <img src={partnerImg} alt="Mahesh Bhupathi" />
              </figure>
              <div className="pa-title">
                <div className="pa-eyebrow">A NEW PARTNERSHIP</div>
                <span className="pa-dash" aria-hidden="true" />
                <div className="pa-welcome">WELCOMING</div>
                <h1 id="pa-heading" className="ev-gold pa-name">MAHESH<br />BHUPATHI</h1>
                <div className="pa-partner">AS OUR NEW PARTNER</div>
              </div>
            </div>

            <span className="pa-line" aria-hidden="true" />

            <section className="pa-info" aria-label="Event details">
              <div className="pa-save"><span />SAVE THE DATE<span /></div>
              <div className="pa-date">
                <span className="ev-gold pa-dd">14</span>
                <span className="pa-vbar" aria-hidden="true" />
                <span className="pa-month">
                  <span className="ev-gold pa-mm">NOVEMBER</span>
                  <span className="pa-day">SATURDAY · 2026</span>
                </span>
              </div>
              <p className="pa-copy">
                Be there as we begin a new chapter and celebrate a landmark partnership with <b>Mahesh Bhupathi</b> at Parva Group.
              </p>
              <button onClick={() => setFormOpen(true)} className="ev-btn pa-cta">
                <PersonPlusIcon size={22} />
                <span className="pa-cta-bar" aria-hidden="true" />
                JOIN THE CELEBRATION
              </button>
              <div className="pa-foot">
                <div className="pa-star" aria-hidden="true"><span />✦<span /></div>
                <div className="pa-remember">AN EVENING TO REMEMBER</div>
                <div className="pa-pg">PARVA GROUP</div>
                <button onClick={close} className="pa-skip">Continue to website →</button>
              </div>
            </section>
          </div>
        </div>
      )}

      {formOpen && <InviteForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
