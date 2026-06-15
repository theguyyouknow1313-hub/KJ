import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './App'
import { QUESTIONS, LAYERS, DIM_NAMES, calcDropoutRisk } from './lib/questions'
import { assignPersonalityType, generatePersonalityInsight } from './lib/ai'
import { supabase } from './lib/supabase'

const LAYER_COLORS = { M1:'#DC2626', M2:'#EA580C', M3:'#CA8A04', M4:'#16A34A', M5:'#2563EB', M6:'#7C3AED', M7:'#DB2777' }

export default function Quiz() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const q = QUESTIONS[current]
  const layerColor = LAYER_COLORS[q.layer]
  const layerInfo = LAYERS.find(l => l.id === q.layer)
  const answered = Object.keys(answers).length
  const progress = Math.round((answered / QUESTIONS.length) * 100)
  const currentAnswer = answers[current] ?? null

  function selectAnswer(val) {
    setAnswers(prev => ({ ...prev, [current]: val }))
  }

  function goNext() {
    if (current < QUESTIONS.length - 1) setCurrent(c => c + 1)
  }

  function goPrev() {
    if (current > 0) setCurrent(c => c - 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    const filled = {}
    QUESTIONS.forEach((_, i) => { filled[i] = answers[i] ?? 0 })
    const result = calcDropoutRisk(filled)
    const personalityType = assignPersonalityType(result)
    const insight = await generatePersonalityInsight(personalityType, result, user.name)
    const fullResult = { ...result, personalityType, insight: insight.text, aiSource: insight.source }

    // Save to Supabase
    try {
      await supabase.from('assessments').insert({
        user_id: user.id,
        answers: filled,
        overall_risk: result.overall,
        by_layer: result.byLayer,
        by_dim: result.byDim,
        integration_index: result.integrationIndex,
        personality_type: personalityType,
        ai_insight: insight.text,
        ai_source: insight.source,
        paid: false,
      })
    } catch(e) { console.log('Save failed silently', e) }

    // Crisis flag
    if (result.overall >= 70) {
      try {
        await supabase.from('crisis_events').insert({
          risk_level: result.overall,
          resource_shown: 'iCall + Tele-MANAS',
        })
      } catch(e) {}
    }

    localStorage.setItem('sakha_assessment', JSON.stringify(fullResult))
    navigate('/result')
  }

  const S = {
    page: { minHeight:'100vh', background:'#0A0E1A', display:'flex', flexDirection:'column' },
    topbar: { position:'sticky', top:0, zIndex:10, background:'#0A0E1A', borderBottom:'1px solid #1F2937', padding:'12px 20px' },
    topRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
    logo: { fontWeight:800, color:'#F9FAFB', fontSize:15 },
    count: { fontSize:13, color:'#6B7280', fontWeight:600 },
    progressBg: { height:4, background:'#1F2937', borderRadius:99, overflow:'hidden' },
    progressFill: { height:'100%', background:`linear-gradient(90deg, ${layerColor}, #6366F1)`, borderRadius:99, transition:'width 0.3s ease', width:`${progress}%` },
    layerBadge: { display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:`${layerColor}15`, borderRadius:8, marginBottom:20, margin:'12px 20px 0' },
    layerDot: { width:8, height:8, borderRadius:99, background:layerColor },
    layerText: { fontSize:12, fontWeight:700, color:layerColor },
    body: { flex:1, maxWidth:680, margin:'0 auto', width:'100%', padding:'20px 16px 40px' },
    qCard: { background:'#111827', border:`1px solid ${layerColor}30`, borderRadius:20, padding:24, marginBottom:20 },
    qMeta: { display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' },
    qBadge: { fontSize:11, fontWeight:700, borderRadius:6, padding:'3px 10px' },
    qFocus: { fontSize:13, color:'#6B7280', fontStyle:'italic', marginBottom:16 },
    stmtGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 },
    stmtA: { background:'#1C0A0A', border:'1px solid #7F1D1D30', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#D1D5DB', lineHeight:1.5 },
    stmtB: { background:'#0D0A1C', border:'1px solid #4C1D9530', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#D1D5DB', lineHeight:1.5 },
    stmtTag: { fontWeight:700, fontSize:11, marginBottom:6 },
    scaleRow: { display:'flex', gap:6 },
    scaleLegend: { display:'flex', justifyContent:'space-between', fontSize:11, color:'#4B5563', marginTop:8 },
    navRow: { display:'flex', gap:10 },
    navBtn: { flex:1, padding:'13px', borderRadius:12, border:'none', fontWeight:700, fontSize:14, cursor:'pointer' },
    skipNote: { textAlign:'center', fontSize:12, color:'#4B5563', marginTop:10 },
    crisisBox: { background:'#0D1117', border:'1px solid #374151', borderRadius:12, padding:'14px 16px', fontSize:12, color:'#6B7280', textAlign:'center', lineHeight:1.6, marginTop:20 },
  }

  function ScaleBtn({ val }) {
    const selected = currentAnswer === val
    const labels = { '-2':'←←', '-1':'←', '0':'✓', '1':'→', '2':'→→' }
    const colors = { '-2':'#DC2626', '-1':'#EA580C', '0':'#16A34A', '1':'#7C3AED', '2':'#6D28D9' }
    const descs = { '-2':'Strongly A', '-1':'Mostly A', '0':'Balanced', '1':'Mostly B', '2':'Strongly B' }
    return (
      <button
        onClick={() => selectAnswer(val)}
        style={{
          flex:1, padding:'10px 4px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
          border: selected ? `2px solid ${colors[val]}` : '2px solid #1F2937',
          background: selected ? colors[val] : '#1F2937',
          color: selected ? '#fff' : '#6B7280',
          fontWeight: selected ? 800 : 500,
          fontSize:13, lineHeight:1.3, textAlign:'center',
        }}
      >
        {labels[val]}<br/><span style={{ fontSize:10, opacity:.85 }}>{descs[val]}</span>
      </button>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={S.topRow}>
          <div style={S.logo}>Sakha</div>
          <div style={S.count}>{answered}/{QUESTIONS.length} answered</div>
        </div>
        <div style={S.progressBg}><div style={S.progressFill} /></div>
      </div>

      <div style={{ ...S.layerBadge, margin:'12px 20px 0' }}>
        <div style={S.layerDot} />
        <span style={S.layerText}>{layerInfo.name} Layer — {layerInfo.desc}</span>
      </div>

      <div style={S.body}>
        <div style={S.qCard}>
          <div style={S.qMeta}>
            <span style={{ ...S.qBadge, background:`${layerColor}20`, color:layerColor }}>{layerInfo.name}</span>
            <span style={{ ...S.qBadge, background:'#1F2937', color:'#9CA3AF' }}>{DIM_NAMES[q.dim]}</span>
            <span style={{ ...S.qBadge, background:'#1F2937', color:'#6B7280' }}>#{current+1} of {QUESTIONS.length}</span>
          </div>
          <div style={S.qFocus}>📌 {q.focus}</div>

          <div style={S.stmtGrid}>
            <div style={S.stmtA}>
              <div style={{ ...S.stmtTag, color:'#F87171' }}>STATEMENT A</div>
              {q.a}
            </div>
            <div style={S.stmtB}>
              <div style={{ ...S.stmtTag, color:'#A78BFA' }}>STATEMENT B</div>
              {q.b}
            </div>
          </div>

          <div style={{ fontSize:12, color:'#4B5563', marginBottom:10, textAlign:'center' }}>
            Which describes you more? Choose balanced if neither fits.
          </div>
          <div style={S.scaleRow}>
            {[-2,-1,0,1,2].map(v => <ScaleBtn key={v} val={v} />)}
          </div>
          <div style={S.scaleLegend}>
            <span>← Strongly A</span>
            <span>Balanced ✓</span>
            <span>Strongly B →</span>
          </div>
        </div>

        <div style={S.navRow}>
          <button onClick={goPrev} disabled={current===0} style={{ ...S.navBtn, background: current===0 ? '#1F2937':'#1F2937', color: current===0 ? '#374151':'#D1D5DB', border:'1px solid #374151' }}>
            ← Previous
          </button>
          {current < QUESTIONS.length - 1 ? (
            <button onClick={goNext} style={{ ...S.navBtn, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', border:'none', flex:2 }}>
              {currentAnswer !== null ? 'Next →' : 'Skip →'}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ ...S.navBtn, background:submitting?'#1F2937':'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', border:'none', flex:2 }}>
              {submitting ? 'Generating your report...' : '✓ See My Results'}
            </button>
          )}
        </div>

        <div style={S.skipNote}>
          {QUESTIONS.length - answered} questions remaining &nbsp;·&nbsp;
          Skipped questions are scored as balanced
        </div>

        {current >= 28 && (
          <div style={S.crisisBox}>
            These questions explore deep personal experiences. If anything brings up difficult feelings,<br/>
            <strong style={{ color:'#F9FAFB' }}>iCall: 9152987821</strong> &nbsp;|&nbsp; <strong style={{ color:'#F9FAFB' }}>Tele-MANAS: 14416</strong>
          </div>
        )}
      </div>
    </div>
  )
}
