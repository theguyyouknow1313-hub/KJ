import { useState } from 'react'
import { LANGUAGES } from './lib/framework.js'

const EDUCATION_LEVELS = [
  'Class 9-10', 'Class 11-12', 'Preparing for JEE/NEET',
  'Preparing for UPSC/State PSC', 'Diploma / Polytechnic',
  'Undergraduate (B.Tech/BSc/BA etc)', 'Postgraduate', 'Dropped out', 'Other'
]

export default function IntakePage({ onSubmit }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '',
    educationLevel: '', language: 'english', agreedToTerms: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function validate() {
    const e = {}
    if (!form.name.trim())                       e.name  = 'Your name is required'
    if (!/\S+@\S+\.\S+/.test(form.email))        e.email = 'Enter a valid email'
    if (!/^[6-9]\d{9}$/.test(form.phone))        e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.agreedToTerms)                      e.terms = 'Please agree to continue'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 480 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #6366F1, #EC4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 28, fontWeight: 900, color: '#fff'
        }}>S</div>

        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 10 }}>
          Sakha <span style={{ color: '#6366F1' }}>v1</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.7 }}>
          A 35-question self-awareness diagnostic for Indian students.<br />
          Know your patterns. Understand your risks. Find your path.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {[['35', 'Questions'], ['7', 'Life Layers'], ['~8', 'Minutes'], ['Free', 'Always']].map(([n, l]) => (
            <div key={l} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '10px 16px', minWidth: 72, textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#6366F1' }}>{n}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Let's start with you</h2>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Full Name *</label>
          <input className="input" placeholder="Your name" value={form.name}
            onChange={e => set('name', e.target.value)} />
          {errors.name && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Email *</label>
          <input className="input" type="email" placeholder="your@email.com" value={form.email}
            onChange={e => set('email', e.target.value)} />
          {errors.email && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Mobile Number * <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>(for updates)</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: '12px 14px', color: '#94A3B8', fontSize: 15, whiteSpace: 'nowrap' }}>+91</div>
            <input className="input" type="tel" placeholder="9876543210" value={form.phone}
              onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </div>
          {errors.phone && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors.phone}</div>}
        </div>

        {/* City */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">City / District</label>
          <input className="input" placeholder="e.g. Gorakhpur, Kushinagar" value={form.city}
            onChange={e => set('city', e.target.value)} />
        </div>

        {/* Education */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Current Stage</label>
          <select className="input" value={form.educationLevel}
            onChange={e => set('educationLevel', e.target.value)}>
            <option value="">Select your stage</option>
            {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Language preference */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">Preferred Language for Results</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LANGUAGES.map(l => (
              <button key={l.key}
                onClick={() => set('language', l.key)}
                style={{
                  padding: '8px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                  border: form.language === l.key ? 'none' : '1px solid #334155',
                  background: form.language === l.key ? 'linear-gradient(135deg, #6366F1, #EC4899)' : '#1E293B',
                  color: form.language === l.key ? '#fff' : '#94A3B8',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div style={{ marginBottom: 20, background: '#111827', borderRadius: 10, padding: 16 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.agreedToTerms}
              onChange={e => set('agreedToTerms', e.target.checked)}
              style={{ marginTop: 3, accentColor: '#6366F1', width: 16, height: 16 }} />
            <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              I agree that Sakha may contact me via email and phone for product updates, book launches,
              and new features. My data will never be sold.{' '}
              <button onClick={() => setShowTerms(true)}
                style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Read full terms
              </button>
            </span>
          </label>
          {errors.terms && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 8 }}>{errors.terms}</div>}
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Starting...' : 'Begin My Assessment →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 14 }}>
          Diagnostic is free. Full report ₹49. Your data is private and safe.
        </p>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div onClick={() => setShowTerms(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Terms & Privacy</h3>
            <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8 }}>
              <p><strong style={{ color: '#F1F5F9' }}>What we collect:</strong> Your name, email, phone number, city, education level, and diagnostic responses.</p>
              <br />
              <p><strong style={{ color: '#F1F5F9' }}>Why we collect it:</strong> To generate your diagnostic report, track your progress over time, and notify you about product updates, new features, and book launches from Sakha / Young Tulip.</p>
              <br />
              <p><strong style={{ color: '#F1F5F9' }}>What we will never do:</strong> We will never sell your data. We will never share your individual results with anyone without your explicit consent. Institutional clients only receive anonymous, aggregated data.</p>
              <br />
              <p><strong style={{ color: '#F1F5F9' }}>Your rights:</strong> You can request deletion of your data at any time by emailing us. You can opt out of communications at any time.</p>
              <br />
              <p><strong style={{ color: '#F1F5F9' }}>Data storage:</strong> Your data is stored securely on Supabase (PostgreSQL) servers with encryption at rest.</p>
              <br />
              <p style={{ fontSize: 12, color: '#475569' }}>Sakha v1.0 · Young Tulip · Developed by Kunaal Jaiswal, IIITDM Kancheepuram</p>
            </div>
            <button className="btn-primary" onClick={() => setShowTerms(false)} style={{ marginTop: 20 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
