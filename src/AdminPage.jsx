import { useState, useEffect } from 'react'
import { getConfig, updateConfig, getAdminStats, getAllSubmissions } from './lib/db.js'
import { ARCHETYPES } from './lib/framework.js'

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'sakha-admin-2025'

export default function AdminPage({ onBack }) {
  const [authed, setAuthed]     = useState(false)
  const [password, setPassword] = useState('')
  const [config, setConfig]     = useState({})
  const [stats, setStats]       = useState({})
  const [submissions, setSubs]  = useState([])
  const [tab, setTab]           = useState('dashboard')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState('')

  function login() {
    if (password === ADMIN_SECRET) setAuthed(true)
    else alert('Wrong password')
  }

  useEffect(() => {
    if (!authed) return
    async function load() {
      const [cfg, st, subs] = await Promise.all([getConfig(), getAdminStats(), getAllSubmissions(50)])
      setConfig(cfg)
      setStats(st)
      setSubs(subs)
    }
    load()
  }, [authed])

  async function save(key, value) {
    setSaving(true)
    try {
      await updateConfig(key, value)
      setConfig(c => ({ ...c, [key]: value }))
      setSaved(key)
      setTimeout(() => setSaved(''), 2000)
    } catch (e) { alert('Save failed: ' + e.message) }
    setSaving(false)
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card" style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
          <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Sakha Admin</h2>
          <input className="input" type="password" placeholder="Admin password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ marginBottom: 12 }} />
          <button className="btn-primary" onClick={login}>Login</button>
          <button className="btn-ghost" onClick={onBack} style={{ width: '100%', marginTop: 10 }}>← Back to App</button>
        </div>
      </div>
    )
  }

  const TABS = ['dashboard', 'pricing', 'ai-config', 'users', 'api']

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1E293B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Sakha Admin</span>
          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 10 }}>v1</span>
        </div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13, padding: '6px 14px' }}>← App</button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: tab === t ? 'linear-gradient(135deg, #6366F1, #EC4899)' : '#1E293B',
              color: tab === t ? '#fff' : '#94A3B8',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Users', value: stats.totalUsers || 0, color: '#6366F1', emoji: '👥' },
                { label: 'Assessments', value: stats.totalSubmissions || 0, color: '#16A34A', emoji: '📊' },
                { label: 'Paid Reports', value: stats.paidReports || 0, color: '#CA8A04', emoji: '💰' },
                { label: 'Revenue', value: `₹${(stats.paidReports || 0) * parseInt(config.report_price_inr || 49)}`, color: '#EC4899', emoji: '📈' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick config panel */}
            <div className="card">
              <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Quick Controls</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#111827', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>REPORT MODE</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['true', 'false'].map(v => (
                      <button key={v} onClick={() => save('report_free', v)} style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                        background: config.report_free === v ? (v === 'true' ? '#16A34A' : '#6366F1') : '#1E293B',
                        color: config.report_free === v ? '#fff' : '#94A3B8',
                      }}>{v === 'true' ? '🆓 Free' : '💰 Paid'}</button>
                    ))}
                  </div>
                  {saved === 'report_free' && <div style={{ fontSize: 11, color: '#16A34A', marginTop: 6 }}>✓ Saved</div>}
                </div>

                <div style={{ background: '#111827', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>ACTIVE GATEWAY</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['razorpay', 'cashfree'].map(v => (
                      <button key={v} onClick={() => save('active_gateway', v)} style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                        background: config.active_gateway === v ? '#6366F1' : '#1E293B',
                        color: config.active_gateway === v ? '#fff' : '#94A3B8',
                        textTransform: 'capitalize'
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRICING */}
        {tab === 'pricing' && (
          <div className="card fade-in">
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Pricing & Access Control</h3>

            <ConfigRow label="Report Price (₹)" key2="report_price_inr" config={config} onSave={save} saved={saved} type="number" hint="Set to 0 to make free, or use toggle above" />
            <ConfigRow label="Report Free Mode" key2="report_free" config={config} onSave={save} saved={saved} type="toggle" options={['true', 'false']} />
            <ConfigRow label="Premium Enabled" key2="premium_enabled" config={config} onSave={save} saved={saved} type="toggle" options={['true', 'false']} />
            <ConfigRow label="API Price Per Call (₹)" key2="api_price_per_call" config={config} onSave={save} saved={saved} type="number" />
            <ConfigRow label="API Access Enabled" key2="api_access_enabled" config={config} onSave={save} saved={saved} type="toggle" options={['true', 'false']} />
          </div>
        )}

        {/* AI CONFIG */}
        {tab === 'ai-config' && (
          <div className="card fade-in">
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>AI Model Configuration</h3>
            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Free users → Gemini Flash → Groq (fallback). Premium users → Claude Haiku/Sonnet.
              Update API keys in your .env file. Model selection below controls which tier uses which.
            </p>
            <ConfigRow label="Free Tier Model" key2="ai_model_free" config={config} onSave={save} saved={saved} type="select" options={['gemini', 'groq']} />
            <ConfigRow label="Premium Tier Model" key2="ai_model_premium" config={config} onSave={save} saved={saved} type="select" options={['claude', 'gemini', 'groq']} />
            <ConfigRow label="Crisis Popup" key2="crisis_popup_enabled" config={config} onSave={save} saved={saved} type="toggle" options={['true', 'false']} />

            <div style={{ background: '#111827', borderRadius: 12, padding: 16, marginTop: 20 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>API KEYS (set in .env file)</div>
              {[
                ['VITE_GEMINI_API_KEY', 'Gemini Flash', 'console.cloud.google.com'],
                ['VITE_GROQ_API_KEY', 'Groq (Llama)', 'console.groq.com'],
                ['VITE_RAZORPAY_KEY_ID', 'Razorpay', 'dashboard.razorpay.com'],
                ['VITE_CASHFREE_APP_ID', 'Cashfree', 'merchant.cashfree.com'],
              ].map(([key, name, url]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E293B', fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{name}</span>
                    <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>{key}</span>
                  </div>
                  <a href={`https://${url}`} target="_blank" style={{ color: '#6366F1', fontSize: 12 }}>Get Key →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="fade-in">
            <div className="card">
              <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Recent Submissions ({submissions.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#111827' }}>
                      {['Name', 'Email', 'City', 'Type', 'Risk %', 'Paid', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => {
                      const arch = ARCHETYPES[s.personality_type]
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #1E293B' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>{s.sakha_users?.name || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{s.sakha_users?.email || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{s.sakha_users?.city || '—'}</td>
                          <td style={{ padding: '8px 10px' }}>
                            {arch ? <span style={{ color: arch.color, fontWeight: 700 }}>{arch.emoji} {s.personality_type}</span> : '—'}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 700 }}>{s.overall_risk}%</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ color: s.is_paid ? '#16A34A' : '#94A3B8', fontWeight: 700 }}>{s.is_paid ? '✓ Paid' : 'Free'}</span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#94A3B8', whiteSpace: 'nowrap', fontSize: 11 }}>
                            {new Date(s.created_at).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {submissions.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>No submissions yet. Share Sakha to get started.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API */}
        {tab === 'api' && (
          <div className="card fade-in">
            <h3 style={{ fontWeight: 800, marginBottom: 16 }}>API Access (Future)</h3>
            <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              When enabled, external developers can call your Sakha prediction engine via API.
              Each call is billed at your set price per call. This turns Sakha into a platform.
            </p>
            <div style={{ background: '#111827', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>SAMPLE API CALL (when enabled)</div>
              <pre style={{ fontSize: 12, color: '#6EE7B7', lineHeight: 1.6, overflowX: 'auto' }}>
{`POST https://your-supabase-url/functions/v1/sakha-predict
Authorization: Bearer YOUR_API_KEY

{
  "answers": { "0": -1, "1": 0, ... },
  "user_lang": "english"
}

Response:
{
  "archetype": "BUILDER",
  "risk": 32,
  "report": { ... },
  "credits_remaining": 47
}`}
              </pre>
            </div>
            <ConfigRow label="API Access Enabled" key2="api_access_enabled" config={config} onSave={save} saved={saved} type="toggle" options={['true', 'false']} />
            <ConfigRow label="Price Per API Call (₹)" key2="api_price_per_call" config={config} onSave={save} saved={saved} type="number" />
          </div>
        )}
      </div>
    </div>
  )
}

function ConfigRow({ label, key2, config, onSave, saved, type, options, hint }) {
  const [val, setVal] = useState(config[key2] || '')
  useEffect(() => setVal(config[key2] || ''), [config])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1E293B', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {type === 'number' && (
          <input className="input" type="number" value={val} onChange={e => setVal(e.target.value)}
            style={{ width: 100, textAlign: 'right' }} />
        )}
        {type === 'toggle' && options && (
          <div style={{ display: 'flex', gap: 6 }}>
            {options.map(o => (
              <button key={o} onClick={() => setVal(o)} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: val === o ? '#6366F1' : '#1E293B',
                color: val === o ? '#fff' : '#94A3B8'
              }}>{o === 'true' ? 'On' : o === 'false' ? 'Off' : o}</button>
            ))}
          </div>
        )}
        {type === 'select' && options && (
          <select className="input" value={val} onChange={e => setVal(e.target.value)} style={{ width: 140 }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        <button onClick={() => onSave(key2, val)} style={{
          padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: saved === key2 ? '#16A34A' : '#6366F1',
          color: '#fff', fontWeight: 700, fontSize: 13
        }}>{saved === key2 ? '✓' : 'Save'}</button>
      </div>
    </div>
  )
}
