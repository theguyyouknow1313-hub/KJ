import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './App'
import { supabase } from './lib/supabase'
import { ARCHETYPES as PERSONALITY_TYPES, LANGUAGES, getRiskLevel } from './lib/framework'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logoutUser } = useApp()
  const [history, setHistory] = useState([])
  const [declaredType, setDeclaredType] = useState(user?.self_declared_type || '')
  const [prefLang, setPrefLang] = useState(user?.preferred_language || 'english')
  const [driftAlert, setDriftAlert] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const { data } = await supabase.from('assessments')
        .select('*').eq('user_id', user.id).order('created_at', { ascending:false }).limit(10)
      if (data) {
        setHistory(data)
        checkDrift(data)
      }
    } catch(e) {}
    setLoading(false)
  }

  function checkDrift(assessments) {
    if (assessments.length < 3 || !declaredType) return
    const recent3 = assessments.slice(0,3).map(a => a.personality_type)
    const mostCommon = recent3.sort((a,b) => recent3.filter(v=>v===a).length - recent3.filter(v=>v===b).length).pop()
    if (mostCommon !== declaredType) {
      setDriftAlert({ observed: mostCommon, declared: declaredType, count: 3 })
    }
  }

  async function savePreferences() {
    setSaving(true)
    try {
      await supabase.from('users').update({ self_declared_type:declaredType, preferred_language:prefLang }).eq('id', user.id)
    } catch(e) {}
    setSaving(false)
  }

  const S = {
    page: { minHeight:'100vh', background:'#0A0E1A' },
    nav: { padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1F2937' },
    body: { maxWidth:680, margin:'0 auto', padding:'24px 16px 60px' },
    section: { background:'#111827', border:'1px solid #1F2937', borderRadius:16, padding:22, marginBottom:16 },
    sectionTitle: { fontWeight:800, fontSize:15, color:'#F9FAFB', marginBottom:16 },
    avatar: { width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:28, color:'#fff', marginBottom:16 },
    userName: { fontSize:22, fontWeight:800, color:'#F9FAFB', marginBottom:4 },
    userEmail: { fontSize:14, color:'#6B7280', marginBottom:16 },
    label: { fontSize:13, fontWeight:600, color:'#9CA3AF', marginBottom:6, display:'block' },
    select: { width:'100%', padding:'10px 12px', background:'#1F2937', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:13, outline:'none', marginBottom:12 },
    driftBox: { background:'#1C1520', border:'1px solid #7C3AED40', borderRadius:14, padding:18, marginBottom:16 },
    driftTitle: { fontWeight:800, color:'#A78BFA', marginBottom:8 },
    driftText: { fontSize:13, color:'#D1D5DB', lineHeight:1.6 },
    histCard: { background:'#0D1117', borderRadius:12, padding:14, marginBottom:10, display:'flex', alignItems:'center', gap:12 },
    histEmoji: { fontSize:28, flexShrink:0 },
    histInfo: {},
    histType: { fontWeight:700, fontSize:14, color:'#F9FAFB' },
    histRisk: { fontSize:13, marginTop:2 },
    histDate: { fontSize:12, color:'#4B5563', marginTop:2 },
    btn: { width:'100%', padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' },
    logoutBtn: { width:'100%', padding:'12px', borderRadius:10, border:'1px solid #374151', background:'transparent', color:'#6B7280', fontWeight:600, fontSize:14, cursor:'pointer', marginTop:10 },
    navBtn: { padding:'7px 14px', borderRadius:8, border:'1px solid #374151', background:'transparent', color:'#9CA3AF', fontSize:12, fontWeight:600, cursor:'pointer' },
  }

  const types = Object.values(PERSONALITY_TYPES)

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={{ fontWeight:800, color:'#F9FAFB', fontSize:15 }}>Sakha</span>
        <div style={{ display:'flex', gap:8 }}>
          <button style={S.navBtn} onClick={() => navigate('/')}>Home</button>
          <button style={S.navBtn} onClick={() => navigate('/quiz')}>New Assessment</button>
        </div>
      </nav>

      <div style={S.body}>
        {/* Profile Header */}
        <div style={S.section}>
          <div style={S.avatar}>{user?.name?.[0]?.toUpperCase() || 'S'}</div>
          <div style={S.userName}>{user?.name}</div>
          <div style={S.userEmail}>{user?.email} {user?.phone && `· ${user.phone}`}</div>
          <div style={{ fontSize:12, color:'#4B5563' }}>Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month:'long', year:'numeric' })}</div>
        </div>

        {/* Drift Alert */}
        {driftAlert && (
          <div style={S.driftBox}>
            <div style={S.driftTitle}>🪞 Sakha has something to share with you</div>
            <div style={S.driftText}>
              You have identified yourself as <strong style={{ color:'#A78BFA' }}>{PERSONALITY_TYPES[driftAlert.declared]?.names.english || driftAlert.declared}</strong>.
              But your last {driftAlert.count} assessments consistently show patterns of a <strong style={{ color:'#A78BFA' }}>{PERSONALITY_TYPES[driftAlert.observed]?.names.english || driftAlert.observed}</strong>.
              <br /><br />
              This is not a correction — it is a mirror. You can keep your declared type, or update it to match what your data shows. What matters is the truth you are willing to see.
            </div>
          </div>
        )}

        {/* Preferences */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Your Identity & Preferences</div>

          <label style={S.label}>I identify as (self-declared personality type)</label>
          <select style={S.select} value={declaredType} onChange={e => setDeclaredType(e.target.value)}>
            <option value="">— Choose your type —</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.emoji} {t.names.english} — {t.tagline}</option>
            ))}
          </select>
          {declaredType && (
            <div style={{ fontSize:12, color:'#6B7280', marginBottom:12, fontStyle:'italic' }}>
              {PERSONALITY_TYPES[declaredType]?.description}
            </div>
          )}

          <label style={S.label}>Preferred language for personality type name</label>
          <select style={S.select} value={prefLang} onChange={e => setPrefLang(e.target.value)}>
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
          {declaredType && (
            <div style={{ fontSize:13, color:'#6366F1', marginBottom:12 }}>
              Your type in {prefLang}: <strong>{PERSONALITY_TYPES[declaredType]?.names[prefLang] || PERSONALITY_TYPES[declaredType]?.names.english}</strong>
            </div>
          )}

          <button style={S.btn} onClick={savePreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Assessment History */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Assessment History</div>
          {loading ? (
            <div style={{ color:'#4B5563', fontSize:13 }}>Loading...</div>
          ) : history.length === 0 ? (
            <div style={{ color:'#4B5563', fontSize:13 }}>No assessments yet. <span style={{ color:'#6366F1', cursor:'pointer' }} onClick={() => navigate('/quiz')}>Take your first →</span></div>
          ) : (
            history.map((a, i) => {
              const t = PERSONALITY_TYPES[a.personality_type]
              const rl = getRiskLevel(a.overall_risk)
              return (
                <div key={a.id} style={S.histCard}>
                  <div style={S.histEmoji}>{t?.emoji || '🧠'}</div>
                  <div style={S.histInfo}>
                    <div style={S.histType}>{t?.names.english || a.personality_type}</div>
                    <div style={{ ...S.histRisk, color:rl.color }}>{rl.emoji} {a.overall_risk}% dropout risk · {rl.label}</div>
                    <div style={S.histDate}>{new Date(a.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                  </div>
                  {i === 0 && <span style={{ marginLeft:'auto', fontSize:11, background:'#1F2937', padding:'3px 8px', borderRadius:99, color:'#6366F1', fontWeight:700 }}>Latest</span>}
                </div>
              )
            })
          )}
        </div>

        <button style={S.logoutBtn} onClick={() => { logoutUser(); navigate('/') }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
