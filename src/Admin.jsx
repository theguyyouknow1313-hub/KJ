import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sakha_admin_2024'

export default function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [config, setConfig] = useState(null)
  const [stats, setStats] = useState({ users:0, assessments:0, paid:0, revenue:0 })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (authed) { loadConfig(); loadStats() }
  }, [authed])

  async function loadConfig() {
    const { data } = await supabase.from('admin_config').select('*').eq('id','singleton').single()
    if (data) setConfig(data)
  }

  async function loadStats() {
    const [{ count:users }, { count:assessments }, { data:paid }] = await Promise.all([
      supabase.from('sakha_users').select('*', { count:'exact', head:true }),
      supabase.from('assessments').select('*', { count:'exact', head:true }),
      supabase.from('assessments').select('payment_amount').eq('paid', true),
    ])
    const revenue = (paid || []).reduce((sum, a) => sum + (a.payment_amount || 0), 0)
    setStats({ users: users||0, assessments: assessments||0, paid: (paid||[]).length, revenue })
  }

  async function loadUsers() {
    setLoadingUsers(true)
    const { data } = await supabase.from('sakha_users').select('*').order('created_at', { ascending:false }).limit(50)
    if (data) setUsers(data)
    setLoadingUsers(false)
  }

  async function saveConfig() {
    setSaving(true)
    await supabase.from('admin_config').update({ ...config, updated_at: new Date().toISOString() }).eq('id','singleton')
    setSaving(false)
    alert('Config saved!')
  }

  async function togglePremium(userId, current) {
    await supabase.from('sakha_users').update({ is_premium: !current }).eq('id', userId)
    loadUsers()
  }

  const S = {
    page: { minHeight:'100vh', background:'#050810' },
    loginPage: { minHeight:'100vh', background:'#050810', display:'flex', alignItems:'center', justifyContent:'center' },
    loginCard: { background:'#0D1117', border:'1px solid #1F2937', borderRadius:20, padding:32, width:'100%', maxWidth:360, textAlign:'center' },
    title: { fontSize:22, fontWeight:800, color:'#F9FAFB', marginBottom:6 },
    sub: { fontSize:14, color:'#4B5563', marginBottom:24 },
    input: { width:'100%', padding:'12px 14px', background:'#1F2937', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:14, outline:'none', marginBottom:12 },
    btn: { width:'100%', padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#DC2626,#991B1B)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' },
    nav: { padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1F2937', background:'#0D1117' },
    body: { maxWidth:900, margin:'0 auto', padding:'24px 16px 60px' },
    statGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:24 },
    statCard: { background:'#0D1117', border:'1px solid #1F2937', borderRadius:14, padding:18 },
    statNum: { fontSize:32, fontWeight:900, color:'#F9FAFB' },
    statLabel: { fontSize:12, color:'#4B5563', marginTop:2 },
    section: { background:'#0D1117', border:'1px solid #1F2937', borderRadius:16, padding:22, marginBottom:16 },
    sectionTitle: { fontWeight:800, fontSize:15, color:'#F9FAFB', marginBottom:16 },
    label: { fontSize:13, fontWeight:600, color:'#9CA3AF', marginBottom:6, display:'block' },
    configInput: { width:'100%', padding:'10px 12px', background:'#111827', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:13, outline:'none', marginBottom:12 },
    configSelect: { width:'100%', padding:'10px 12px', background:'#111827', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:13, outline:'none', marginBottom:12 },
    saveBtn: { padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' },
    toggleRow: { display:'flex', alignItems:'center', gap:12, marginBottom:12 },
    toggle: { width:44, height:24, borderRadius:99, cursor:'pointer', transition:'background 0.2s', position:'relative', border:'none' },
    toggleKnob: { width:20, height:20, background:'#fff', borderRadius:99, position:'absolute', top:2, transition:'left 0.2s' },
    tabs: { display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' },
    tab: { padding:'8px 16px', borderRadius:8, border:'1px solid #1F2937', background:'transparent', color:'#6B7280', fontWeight:600, fontSize:13, cursor:'pointer' },
    tabActive: { background:'#1F2937', color:'#F9FAFB', border:'1px solid #374151' },
    userRow: { display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #111827' },
    userAvatar: { width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:15, flexShrink:0 },
    userInfo: { flex:1 },
    userName: { fontWeight:600, color:'#F9FAFB', fontSize:14 },
    userEmail: { fontSize:12, color:'#4B5563' },
    premiumBadge: { fontSize:11, padding:'3px 8px', borderRadius:99, fontWeight:700, cursor:'pointer' },
  }

  if (!authed) {
    return (
      <div style={S.loginPage}>
        <div style={S.loginCard}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔐</div>
          <div style={S.title}>Sakha Admin</div>
          <div style={S.sub}>Enter your admin password to continue</div>
          <input style={S.input} type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (password === ADMIN_PASSWORD ? setAuthed(true) : alert('Wrong password'))} />
          <button style={S.btn} onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : alert('Wrong password')}>
            Enter Admin Panel
          </button>
          <div style={{ fontSize:12, color:'#374151', marginTop:12 }}>Set VITE_ADMIN_PASSWORD in .env to change</div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#fff', fontSize:14 }}>A</div>
          <span style={{ fontWeight:800, color:'#F9FAFB', fontSize:15 }}>Sakha Admin</span>
        </div>
        <button style={{ ...S.saveBtn, background:'transparent', border:'1px solid #374151', color:'#6B7280' }} onClick={() => navigate('/')}>← Back to App</button>
      </nav>

      <div style={S.body}>
        {/* Stats */}
        <div style={S.statGrid}>
          {[['👥', stats.users, 'Total Users'],['📊', stats.assessments, 'Assessments'],['💰', stats.paid, 'Paid Reports'],[`₹`, stats.revenue, 'Revenue (₹)']].map(([icon, val, label]) => (
            <div key={label} style={S.statCard}>
              <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
              <div style={S.statNum}>{val}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {['dashboard','pricing','ai_config','users','api'].map(t => (
            <button key={t} style={{ ...S.tab, ...(tab===t ? S.tabActive : {}) }}
              onClick={() => { setTab(t); if(t==='users') loadUsers() }}>
              {t.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && config && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Quick Overview</div>
            <div style={{ fontSize:13, color:'#6B7280', lineHeight:2 }}>
              <div>Report Status: <strong style={{ color: config.report_free ? '#22C55E':'#FBBF24' }}>{config.report_free ? 'FREE for all users' : `₹${config.report_price} per report`}</strong></div>
              <div>Active AI: <strong style={{ color:'#818CF8' }}>{config.active_ai || 'gemini'}</strong></div>
              <div>Active Gateway: <strong style={{ color:'#818CF8' }}>{config.active_gateway || 'razorpay'}</strong></div>
              <div>Maintenance Mode: <strong style={{ color: config.maintenance_mode ? '#DC2626':'#22C55E' }}>{config.maintenance_mode ? 'ON' : 'OFF'}</strong></div>
            </div>
          </div>
        )}

        {/* Pricing */}
        {tab === 'pricing' && config && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Pricing & Access Control</div>

            <div style={S.toggleRow}>
              <button
                style={{ ...S.toggle, background: config.report_free ? '#16A34A':'#374151' }}
                onClick={() => setConfig(c => ({ ...c, report_free: !c.report_free }))}
              >
                <div style={{ ...S.toggleKnob, left: config.report_free ? 22:2 }} />
              </button>
              <span style={{ fontSize:13, color:'#D1D5DB', fontWeight:600 }}>
                Reports are {config.report_free ? <span style={{ color:'#22C55E' }}>FREE</span> : <span style={{ color:'#FBBF24' }}>PAID</span>} for all users
              </span>
            </div>

            {!config.report_free && (
              <>
                <label style={S.label}>Report Price (₹)</label>
                <input style={S.configInput} type="number" value={config.report_price} onChange={e => setConfig(c => ({ ...c, report_price: parseInt(e.target.value) }))} />
              </>
            )}

            <label style={S.label}>Institution Base Price (₹/month)</label>
            <input style={S.configInput} type="number" value={config.institution_base_price || 5000} onChange={e => setConfig(c => ({ ...c, institution_base_price: parseInt(e.target.value) }))} />

            <label style={S.label}>API Price per Call (₹)</label>
            <input style={S.configInput} type="number" value={config.api_price_per_call || 5} onChange={e => setConfig(c => ({ ...c, api_price_per_call: parseInt(e.target.value) }))} />

            <label style={S.label}>Active Payment Gateway</label>
            <select style={S.configSelect} value={config.active_gateway || 'razorpay'} onChange={e => setConfig(c => ({ ...c, active_gateway: e.target.value }))}>
              <option value="razorpay">Razorpay</option>
              <option value="cashfree">Cashfree</option>
            </select>

            <div style={S.toggleRow}>
              <button
                style={{ ...S.toggle, background: config.maintenance_mode ? '#DC2626':'#374151' }}
                onClick={() => setConfig(c => ({ ...c, maintenance_mode: !c.maintenance_mode }))}
              >
                <div style={{ ...S.toggleKnob, left: config.maintenance_mode ? 22:2 }} />
              </button>
              <span style={{ fontSize:13, color:'#D1D5DB' }}>Maintenance Mode {config.maintenance_mode ? '(App is DOWN)':'(App is live)'}</span>
            </div>

            <button style={S.saveBtn} onClick={saveConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save Pricing Config'}
            </button>
          </div>
        )}

        {/* AI Config */}
        {tab === 'ai_config' && config && (
          <div style={S.section}>
            <div style={S.sectionTitle}>AI Provider Configuration</div>

            <label style={S.label}>Active AI (free tier)</label>
            <select style={S.configSelect} value={config.active_ai || 'gemini'} onChange={e => setConfig(c => ({ ...c, active_ai: e.target.value }))}>
              <option value="gemini">Gemini Flash (Google — Free tier)</option>
              <option value="groq">Groq + Llama (Free, very fast)</option>
              <option value="cascade">Gemini → Groq cascade (Recommended)</option>
            </select>

            <label style={S.label}>Gemini API Key</label>
            <input style={S.configInput} type="password" placeholder="AIza..." value={config.gemini_key || ''} onChange={e => setConfig(c => ({ ...c, gemini_key: e.target.value }))} />

            <label style={S.label}>Groq API Key (fallback)</label>
            <input style={S.configInput} type="password" placeholder="gsk_..." value={config.groq_key || ''} onChange={e => setConfig(c => ({ ...c, groq_key: e.target.value }))} />

            <label style={S.label}>Claude API Key (premium users only)</label>
            <input style={S.configInput} type="password" placeholder="sk-ant-..." value={config.claude_key || ''} onChange={e => setConfig(c => ({ ...c, claude_key: e.target.value }))} />

            <div style={{ background:'#0A0E1A', borderRadius:10, padding:12, fontSize:12, color:'#4B5563', marginBottom:12, lineHeight:1.6 }}>
              💡 Cascade order: Gemini (free) → Groq (free fallback) → Claude (premium only). Keys set here are used server-side. Frontend keys via .env file are for local dev only.
            </div>

            <button style={S.saveBtn} onClick={saveConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save AI Config'}
            </button>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>User Management</div>
            {loadingUsers ? (
              <div style={{ color:'#4B5563' }}>Loading users...</div>
            ) : users.map(u => (
              <div key={u.id} style={S.userRow}>
                <div style={S.userAvatar}>{u.name?.[0]?.toUpperCase() || '?'}</div>
                <div style={S.userInfo}>
                  <div style={S.userName}>{u.name}</div>
                  <div style={S.userEmail}>{u.email} {u.phone && `· ${u.phone}`}</div>
                  <div style={{ fontSize:11, color:'#374151', marginTop:2 }}>
                    Joined {new Date(u.created_at).toLocaleDateString('en-IN')} · Marketing: {u.marketing_consent ? '✓':'✗'}
                  </div>
                </div>
                <button
                  style={{ ...S.premiumBadge, background: u.is_premium ? '#1E1B4B':'#1F2937', color: u.is_premium ? '#818CF8':'#4B5563', border: u.is_premium ? '1px solid #4338CA':'1px solid #374151' }}
                  onClick={() => togglePremium(u.id, u.is_premium)}
                >
                  {u.is_premium ? '⭐ Premium' : 'Free'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* API */}
        {tab === 'api' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>API Access Management</div>
            <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.7, marginBottom:16 }}>
              External developers and institutions can call the Sakha prediction API. Each call is billed at ₹{config?.api_price_per_call || 5} per analysis. API keys are managed below.
            </div>
            <div style={{ background:'#0A0E1A', borderRadius:10, padding:14, fontSize:12, color:'#4B5563', fontFamily:'monospace', marginBottom:16, lineHeight:1.8 }}>
              POST https://your-domain.com/api/predict<br/>
              Header: X-Sakha-Key: YOUR_API_KEY<br/>
              Body: {'{'}answers: {'{'}0:-1, 1:0, ...35 nodes{'}'}{'}'}
            </div>
            <div style={{ color:'#374151', fontSize:13 }}>API key management coming in v1.1 — contact admin@skunaaljaiswal.com to request access.</div>
          </div>
        )}
      </div>
    </div>
  )
}
