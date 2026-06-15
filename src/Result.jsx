import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './App'
import { PERSONALITY_TYPES, LANGUAGES } from './lib/ai'
import { LAYERS, getRiskLevel, DIM_NAMES } from './lib/questions'

export default function Result() {
  const navigate = useNavigate()
  const { user, config } = useApp()
  const [result, setResult] = useState(null)
  const [lang, setLang] = useState(user?.preferred_language || 'english')
  const [tab, setTab] = useState('overview')
  const [showPaywall, setShowPaywall] = useState(false)
  const [crisisVisible, setCrisisVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sakha_assessment')
    if (!saved) { navigate('/quiz'); return }
    const r = JSON.parse(saved)
    setResult(r)
    if (r.overall >= 65) setCrisisVisible(true)
  }, [])

  if (!result) return null

  const typeData = PERSONALITY_TYPES[result.personalityType] || PERSONALITY_TYPES.seeker
  const risk = getRiskLevel(result.overall)
  const typeName = typeData.names[lang] || typeData.names.english
  const reportPrice = config.report_price || 49
  const reportFree = config.report_free || false

  function handleUnlockReport() {
    if (reportFree) {
      setTab('report')
    } else {
      setShowPaywall(true)
    }
  }

  function initiatePayment() {
    // Razorpay integration
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: reportPrice * 100,
      currency: 'INR',
      name: 'Sakha',
      description: 'Full Diagnostic Report',
      prefill: { name: user?.name, email: user?.email, contact: user?.phone || '' },
      theme: { color: '#6366F1' },
      handler: function(response) {
        setShowPaywall(false)
        setTab('report')
        // Update payment in DB
        import('../lib/supabase').then(({ supabase }) => {
          supabase.from('assessments').update({ paid:true, payment_id:response.razorpay_payment_id, payment_amount:reportPrice, payment_gateway:'razorpay' })
            .eq('user_id', user.id).order('created_at', { ascending:false }).limit(1)
        })
      },
    }
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } else {
      alert('Payment loading... Please try again in a moment.')
    }
  }

  const S = {
    page: { minHeight:'100vh', background:'#0A0E1A' },
    nav: { padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1F2937' },
    navLogo: { fontWeight:800, color:'#F9FAFB', fontSize:15 },
    navBtn: { padding:'7px 14px', borderRadius:8, border:'1px solid #374151', background:'transparent', color:'#9CA3AF', fontSize:12, fontWeight:600, cursor:'pointer' },
    body: { maxWidth:760, margin:'0 auto', padding:'24px 16px 60px' },
    crisisBox: { background:'#1C0909', border:'1px solid #7F1D1D', borderRadius:14, padding:'16px 20px', marginBottom:24, fontSize:13, color:'#FCA5A5', lineHeight:1.7 },
    heroCard: { borderRadius:24, padding:32, marginBottom:24, textAlign:'center', background: typeData.gradient, position:'relative', overflow:'hidden' },
    heroEmoji: { fontSize:64, marginBottom:12, display:'block' },
    heroType: { fontSize:28, fontWeight:900, color:'#fff', marginBottom:4 },
    heroTypeSub: { fontSize:14, color:'rgba(255,255,255,0.7)', marginBottom:16 },
    heroTagline: { fontSize:16, color:'rgba(255,255,255,0.9)', fontStyle:'italic', marginBottom:20 },
    langRow: { display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginTop:8 },
    langBtn: { padding:'5px 12px', borderRadius:99, border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', fontSize:11, fontWeight:600, cursor:'pointer', textTransform:'capitalize' },
    langBtnActive: { background:'rgba(255,255,255,0.25)', border:'1px solid rgba(255,255,255,0.6)', color:'#fff' },
    riskCard: { background:'#111827', border:`1px solid ${risk.color}40`, borderRadius:16, padding:20, marginBottom:20, display:'flex', alignItems:'center', gap:16 },
    riskEmoji: { fontSize:40 },
    riskInfo: {},
    riskPct: { fontSize:32, fontWeight:900, color:risk.color },
    riskLabel: { fontSize:15, fontWeight:700, color:risk.color },
    riskDesc: { fontSize:13, color:'#6B7280', marginTop:2 },
    tabs: { display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' },
    tab: { padding:'8px 14px', borderRadius:8, border:'1px solid #1F2937', background:'transparent', color:'#6B7280', fontWeight:600, fontSize:13, cursor:'pointer' },
    tabActive: { background:'#1F2937', color:'#F9FAFB', border:'1px solid #374151' },
    section: { background:'#111827', border:'1px solid #1F2937', borderRadius:16, padding:22, marginBottom:16 },
    sectionTitle: { fontWeight:800, fontSize:15, color:'#F9FAFB', marginBottom:16 },
    insightText: { fontSize:14, color:'#D1D5DB', lineHeight:1.8, whiteSpace:'pre-wrap' },
    strengthRow: { display:'flex', gap:12, marginBottom:12 },
    strengthCard: { flex:1, background:'#0D1117', borderRadius:12, padding:14 },
    strengthLabel: { fontSize:11, fontWeight:700, color:'#6B7280', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 },
    strengthText: { fontSize:13, color:'#D1D5DB', lineHeight:1.5 },
    barRow: { marginBottom:10 },
    barLabel: { display:'flex', justifyContent:'space-between', marginBottom:4 },
    barName: { fontSize:13, fontWeight:600, color:'#D1D5DB' },
    barPct: { fontSize:12, color:'#6B7280' },
    barBg: { height:8, background:'#1F2937', borderRadius:99, overflow:'hidden' },
    paywallCard: { background:'linear-gradient(135deg,#1E1B4B,#1E1440)', border:'1px solid #4338CA40', borderRadius:20, padding:28, textAlign:'center', marginBottom:20 },
    paywallTitle: { fontSize:22, fontWeight:800, color:'#F9FAFB', marginBottom:8 },
    paywallDesc: { fontSize:14, color:'#9CA3AF', marginBottom:20, lineHeight:1.6 },
    paywallPrice: { fontSize:40, fontWeight:900, color:'#818CF8', marginBottom:4 },
    paywallSub: { fontSize:13, color:'#6B7280', marginBottom:24 },
    paywallFeatures: { textAlign:'left', marginBottom:24 },
    paywallFeature: { fontSize:13, color:'#D1D5DB', marginBottom:8, display:'flex', gap:8 },
    paywallBtn: { width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontWeight:800, fontSize:16, cursor:'pointer' },
    taBtn: { width:'100%', padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:12 },
    retakeBtn: { width:'100%', padding:'13px', borderRadius:12, border:'1px solid #374151', background:'transparent', color:'#9CA3AF', fontWeight:600, fontSize:14, cursor:'pointer', marginTop:10 },
  }

  return (
    <div style={S.page}>
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <nav style={S.nav}>
        <span style={S.navLogo}>Sakha</span>
        <div style={{ display:'flex', gap:8 }}>
          <button style={S.navBtn} onClick={() => navigate('/profile')}>My Profile</button>
          <button style={S.navBtn} onClick={() => navigate('/quiz')}>Retake</button>
        </div>
      </nav>

      <div style={S.body}>
        {/* Crisis Banner */}
        {crisisVisible && (
          <div style={S.crisisBox}>
            🚨 <strong>We see you.</strong> Your assessment shows significant pressure right now. Please know you are not alone.<br />
            <strong style={{ color:'#FBBF24' }}>iCall: 9152987821</strong> &nbsp;|&nbsp; <strong style={{ color:'#FBBF24' }}>Tele-MANAS: 14416</strong> &nbsp;|&nbsp; Free · Confidential · 24/7
            <br /><span style={{ color:'#9CA3AF', fontSize:11, marginTop:4, display:'block' }}>These are trained counsellors, not automated systems. You can just talk.</span>
          </div>
        )}

        {/* Personality Hero */}
        <div style={S.heroCard}>
          <span style={S.heroEmoji}>{typeData.emoji}</span>
          <div style={S.heroType}>{typeName}</div>
          <div style={S.heroTypeSub}>Your Sakha Personality Type</div>
          <div style={S.heroTagline}>"{typeData.tagline}"</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', maxWidth:400, margin:'0 auto 16px', lineHeight:1.6 }}>
            {typeData.description}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>View name in your language:</div>
          <div style={S.langRow}>
            {LANGUAGES.map(l => (
              <button key={l} style={{ ...S.langBtn, ...(lang===l ? S.langBtnActive : {}) }} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Score */}
        <div style={S.riskCard}>
          <div style={S.riskEmoji}>{risk.emoji}</div>
          <div style={S.riskInfo}>
            <div style={S.riskPct}>{result.overall}% Dropout Risk</div>
            <div style={S.riskLabel}>{risk.label}</div>
            <div style={S.riskDesc}>Integration Index: {result.integrationIndex}/35 nodes balanced</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {['overview','layers','dimensions','report'].map(t => (
            <button key={t} style={{ ...S.tab, ...(tab===t ? S.tabActive : {}) }} onClick={() => t==='report' ? handleUnlockReport() : setTab(t)}>
              {t==='report' ? (reportFree ? '📄 Full Report' : `📄 Full Report — ₹${reportPrice}`) : t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <>
            <div style={S.section}>
              <div style={S.sectionTitle}>Sakha's Message for You</div>
              <div style={S.insightText}>{result.insight}</div>
            </div>
            <div style={S.section}>
              <div style={S.sectionTitle}>Your Type Profile</div>
              <div style={S.strengthRow}>
                <div style={S.strengthCard}>
                  <div style={S.strengthLabel}>Your Strength</div>
                  <div style={S.strengthText}>{typeData.strength}</div>
                </div>
                <div style={S.strengthCard}>
                  <div style={S.strengthLabel}>Your Challenge</div>
                  <div style={S.strengthText}>{typeData.challenge}</div>
                </div>
              </div>
              <div style={{ ...S.strengthCard, marginTop:0 }}>
                <div style={S.strengthLabel}>You remind us of</div>
                <div style={S.strengthText}>{typeData.famousLike}</div>
              </div>
            </div>
          </>
        )}

        {/* Layers */}
        {tab === 'layers' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Risk by Developmental Layer</div>
            {LAYERS.map(l => {
              const lr = result.byLayer[l.id]
              const pct = Math.round((lr.points / lr.max) * 100)
              const rl = getRiskLevel(pct)
              return (
                <div key={l.id} style={S.barRow}>
                  <div style={S.barLabel}>
                    <span style={{ ...S.barName, color:l.color }}>{l.name} <span style={{ color:'#4B5563', fontWeight:400 }}>— {l.desc}</span></span>
                    <span style={{ ...S.barPct, color:rl.color }}>{rl.emoji} {pct}%</span>
                  </div>
                  <div style={S.barBg}>
                    <div style={{ height:'100%', background:l.color, borderRadius:99, width:`${pct}%`, transition:'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Dimensions */}
        {tab === 'dimensions' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>PECMS Dimension Breakdown</div>
            {['P','E','C','M','S'].map((d, i) => {
              const dr = result.byDim[d]
              const pct = Math.round((dr.points / dr.max) * 100)
              const rl = getRiskLevel(pct)
              const colors = ['#2563EB','#DC2626','#7C3AED','#16A34A','#D97706']
              return (
                <div key={d} style={{ ...S.barRow, marginBottom:18 }}>
                  <div style={S.barLabel}>
                    <span style={{ ...S.barName, color:colors[i] }}>{DIM_NAMES[d]}</span>
                    <span style={{ ...S.barPct, color:rl.color }}>{rl.emoji} {pct}%</span>
                  </div>
                  <div style={{ ...S.barBg, height:10 }}>
                    <div style={{ height:'100%', background:colors[i], borderRadius:99, width:`${pct}%`, transition:'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Report (paid or free) */}
        {tab === 'report' && !showPaywall && (
          <div style={S.section}>
            <div style={{ fontFamily:'Georgia,serif' }}>
              <div style={{ borderBottom:'2px solid #6366F1', paddingBottom:14, marginBottom:20 }}>
                <div style={{ fontSize:11, color:'#6B7280', fontFamily:'Inter,sans-serif', marginBottom:4 }}>SAKHA DIAGNOSTIC REPORT · PECMS × 7-LAYER FRAMEWORK</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#F9FAFB', fontFamily:'Inter,sans-serif' }}>Student Dropout Risk Assessment</div>
                <div style={{ fontSize:12, color:'#6B7280', fontFamily:'Inter,sans-serif', marginTop:6 }}>
                  {user?.name} · {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})} · Young Tulip / Sakha v1.0
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:14, fontFamily:'Inter,sans-serif', marginBottom:8, color:'#F9FAFB' }}>EXECUTIVE SUMMARY</div>
                <div style={{ fontSize:14, lineHeight:1.8, color:'#D1D5DB' }}>
                  This student's PECMS × 7-Layer diagnostic indicates a <strong style={{ color:risk.color }}>{getRiskLevel(result.overall).label.toLowerCase()}</strong> for academic dropout at <strong style={{ color:risk.color }}>{result.overall}%</strong>. Personality type identified: <strong style={{ color:typeData.color }}>{typeData.names.english}</strong>. Integration Index: <strong>{result.integrationIndex}/35</strong> nodes balanced.
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:14, fontFamily:'Inter,sans-serif', marginBottom:12, color:'#F9FAFB' }}>AI INSIGHT</div>
                <div style={{ fontSize:13, lineHeight:1.8, color:'#D1D5DB', background:'#0D1117', padding:16, borderRadius:10, whiteSpace:'pre-wrap' }}>{result.insight}</div>
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:14, fontFamily:'Inter,sans-serif', marginBottom:12, color:'#F9FAFB' }}>LAYER ANALYSIS</div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #1F2937' }}>
                      {['Layer','Description','Risk %','Status'].map(h => (
                        <th key={h} style={{ padding:'8px 10px', textAlign:'left', color:'#6B7280', fontWeight:600, fontFamily:'Inter,sans-serif' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LAYERS.map(l => {
                      const lr = result.byLayer[l.id]
                      const pct = Math.round((lr.points / lr.max) * 100)
                      const rl = getRiskLevel(pct)
                      return (
                        <tr key={l.id} style={{ borderBottom:'1px solid #111827' }}>
                          <td style={{ padding:'8px 10px', color:l.color, fontWeight:700, fontFamily:'Inter,sans-serif' }}>{l.name}</td>
                          <td style={{ padding:'8px 10px', color:'#6B7280', fontFamily:'Inter,sans-serif' }}>{l.desc}</td>
                          <td style={{ padding:'8px 10px', fontWeight:700, fontFamily:'Inter,sans-serif', color:'#F9FAFB' }}>{pct}%</td>
                          <td style={{ padding:'8px 10px', color:rl.color, fontWeight:700, fontFamily:'Inter,sans-serif' }}>{rl.label}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ background:'#0D1117', borderRadius:10, padding:14, fontSize:11, color:'#4B5563', fontFamily:'Inter,sans-serif', lineHeight:1.6 }}>
                Disclaimer: This report uses the Mother Source PECMS × 7-Layer framework by Young Tulip. It is a self-reported tool for educational support and not a substitute for clinical psychological assessment. Created by Kunaal Jaiswal, IIITDM Kancheepuram.
              </div>
            </div>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && (
          <div style={S.paywallCard}>
            <div style={S.paywallTitle}>Unlock Your Full Report</div>
            <div style={S.paywallDesc}>Get the complete diagnostic — layer breakdown, intervention sequence, and personalized action plan.</div>
            <div style={S.paywallPrice}>₹{reportPrice}</div>
            <div style={S.paywallSub}>One-time payment · No subscription · Yours forever</div>
            <div style={S.paywallFeatures}>
              {['Complete 35-node analysis with scores','Priority intervention sequence','Personalized AI insight','Downloadable PDF report','Privacy protected — only you see this'].map(f => (
                <div key={f} style={S.paywallFeature}><span style={{ color:'#22C55E' }}>✓</span> {f}</div>
              ))}
            </div>
            <button style={S.paywallBtn} onClick={initiatePayment}>Pay ₹{reportPrice} & Unlock Report</button>
            <div style={{ fontSize:12, color:'#4B5563', marginTop:12 }}>Powered by Razorpay · UPI, Cards, Netbanking accepted</div>
            <button style={{ ...S.retakeBtn, marginTop:12, border:'none', background:'none', fontSize:12 }} onClick={() => setShowPaywall(false)}>← Go back</button>
          </div>
        )}

        {/* CTA */}
        <button style={S.taBtn} onClick={() => navigate('/quiz')}>Take Assessment Again (90 days recommended)</button>
        <button style={S.retakeBtn} onClick={() => navigate('/profile')}>View My Profile →</button>
      </div>
    </div>
  )
}
