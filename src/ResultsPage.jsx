import { useState, useEffect } from 'react'
import { ARCHETYPES, LAYERS, DIMS, getRiskLevel, LANGUAGES } from './lib/framework.js'
import { generateInsight } from './lib/ai.js'

// Crisis resources
const CRISIS_RESOURCES = [
  { name: 'iCall', number: '9152987821', desc: 'Free counselling for students' },
  { name: 'Tele-MANAS', number: '14416', desc: 'Govt mental health helpline (free)' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 crisis support' },
]

function CrisisModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, border: '1px solid #DC262660' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>💙</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>You are not alone.</h3>
        <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          Your responses suggest you may be going through a very difficult time. That is real, and it matters. 
          Please consider reaching out to someone today.
        </p>
        {CRISIS_RESOURCES.map(r => (
          <div key={r.name} style={{ background: '#111827', borderRadius: 10, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{r.desc}</div>
            </div>
            <a href={`tel:${r.number}`} style={{
              background: '#16A34A', color: '#fff', padding: '8px 14px',
              borderRadius: 8, fontSize: 13, fontWeight: 700
            }}>{r.number}</a>
          </div>
        ))}
        <button className="btn-primary" onClick={onClose} style={{ marginTop: 10 }}>Continue to my results</button>
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="progress-track" style={{ height: 10 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{pct}%</div>
    </div>
  )
}

export default function ResultsPage({ scores, archetypeKey, user, submissionId, config, onReset }) {
  const [lang, setLang]           = useState(user?.language || 'english')
  const [tab, setTab]             = useState('overview')
  const [aiReport, setAiReport]   = useState(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [showCrisis, setShowCrisis] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paidUnlocked, setPaidUnlocked] = useState(false)
  const [selfDeclared, setSelfDeclared]  = useState(null)

  const archetype   = ARCHETYPES[archetypeKey]
  const risk        = getRiskLevel(scores.overallRisk)
  const isFree      = config?.report_free === 'true'
  const price       = config?.report_price_inr || '49'

  // Detect crisis on mount
  useEffect(() => {
    if (scores.answers?.[1] === -2 || scores.answers?.[0] === -2) {
      setShowCrisis(true)
    }
  }, [])

  // Generate AI report
  useEffect(() => {
    async function load() {
      setAiLoading(true)
      try {
        const { report } = await generateInsight(scores, archetypeKey, lang)
        setAiReport(report)
      } catch { setAiReport(null) }
      setAiLoading(false)
    }
    load()
  }, [archetypeKey, lang])

  const typeName = archetype.names[lang] || archetype.names.english

  // Critical nodes
  const criticalNodes = Object.values(scores.layerRisk)
    .flatMap(l => l.nodes || [])
    .filter(n => n.score === -2)
    .sort((a, b) => LAYERS.findIndex(l => l.id === a.layer) - LAYERS.findIndex(l => l.id === b.layer))

  const TABS = ['overview', 'layers', 'ai-insight', 'full-report']

  const canSeeFullReport = isFree || paidUnlocked

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}

      {/* Top bar */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1E293B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>Sakha</span>
        <button className="btn-ghost" onClick={onReset} style={{ fontSize: 13, padding: '6px 14px' }}>↩ New Assessment</button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Personality Card */}
        <div className="fade-in" style={{
          background: `linear-gradient(135deg, ${archetype.color}22, #1E293B)`,
          border: `1px solid ${archetype.color}50`,
          borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center'
        }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{archetype.emoji}</div>

          {/* Language switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {LANGUAGES.map(l => (
              <button key={l.key} onClick={() => setLang(l.key)} style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                border: lang === l.key ? 'none' : '1px solid #334155',
                background: lang === l.key ? archetype.color : '#1E293B',
                color: lang === l.key ? '#fff' : '#94A3B8',
                cursor: 'pointer'
              }}>{l.label}</button>
            ))}
          </div>

          <div style={{ fontSize: 32, fontWeight: 900, color: archetype.color, marginBottom: 4 }}>{typeName}</div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 16, fontStyle: 'italic' }}>
            {archetype.tagline.english}
          </div>

          {/* Risk badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: risk.bg + '30', borderRadius: 99, padding: '6px 16px' }}>
            <span style={{ fontSize: 16 }}>{risk.emoji}</span>
            <span style={{ fontWeight: 700, color: risk.color, fontSize: 14 }}>{scores.overallRisk}% Dropout Risk</span>
            <span style={{ color: '#94A3B8', fontSize: 12 }}>·</span>
            <span style={{ color: '#94A3B8', fontSize: 12 }}>{scores.integrationIndex}/35 balanced</span>
          </div>

          {/* Self-declare type */}
          <div style={{ marginTop: 20, background: '#111827', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>
              This is what your data says. What do <em>you</em> call yourself?
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.values(ARCHETYPES).map(a => (
                <button key={a.key} onClick={() => setSelfDeclared(a.key)} style={{
                  padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: selfDeclared === a.key ? 'none' : '1px solid #334155',
                  background: selfDeclared === a.key ? a.color : '#1E293B',
                  color: selfDeclared === a.key ? '#fff' : '#94A3B8'
                }}>
                  {a.emoji} {a.names[lang] || a.names.english}
                </button>
              ))}
            </div>
            {selfDeclared && selfDeclared !== archetypeKey && (
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 10 }}>
                💡 You chose <strong style={{ color: ARCHETYPES[selfDeclared].color }}>{ARCHETYPES[selfDeclared].names[lang]}</strong> — 
                your data suggests <strong style={{ color: archetype.color }}>{typeName}</strong>. 
                Sakha will watch your history and let you know what it sees.
              </p>
            )}
            {selfDeclared && selfDeclared === archetypeKey && (
              <p style={{ fontSize: 12, color: '#16A34A', marginTop: 10 }}>
                ✓ Your self-perception matches your diagnostic pattern.
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { if (t === 'full-report' && !canSeeFullReport) { setShowPaywall(true); return } setTab(t) }} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
              background: tab === t ? 'linear-gradient(135deg, #6366F1, #EC4899)' : '#1E293B',
              color: tab === t ? '#fff' : '#94A3B8',
              fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
              {t === 'overview' ? '📊 Overview' : t === 'layers' ? '🔢 Layers' : t === 'ai-insight' ? '✨ AI Insight' : `📄 Full Report ${canSeeFullReport ? '' : `(₹${price})`}`}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="fade-in">
            {/* Archetype description */}
            <div className="card" style={{ marginBottom: 16, border: `1px solid ${archetype.color}30` }}>
              <h3 style={{ fontWeight: 800, marginBottom: 12, color: archetype.color }}>About Your Type</h3>
              <p style={{ color: '#CBD5E1', lineHeight: 1.7, fontSize: 14, marginBottom: 16 }}>{archetype.description.english}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#111827', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', marginBottom: 8 }}>✦ STRENGTHS</div>
                  {archetype.strengths.map(s => <div key={s} style={{ fontSize: 13, color: '#CBD5E1', marginBottom: 4 }}>· {s}</div>)}
                </div>
                <div style={{ background: '#111827', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F97316', marginBottom: 8 }}>↗ GROWTH EDGES</div>
                  {archetype.growth.map(g => <div key={g} style={{ fontSize: 13, color: '#CBD5E1', marginBottom: 4 }}>· {g}</div>)}
                </div>
              </div>
            </div>

            {/* Critical nodes */}
            {criticalNodes.length > 0 && (
              <div className="card" style={{ border: '1px solid #DC262630', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 12, color: '#DC2626' }}>🚨 Needs Immediate Attention</h3>
                {criticalNodes.slice(0, 5).map((n, i) => {
                  const l = LAYERS.find(ll => ll.id === n.layer)
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < Math.min(criticalNodes.length, 5) - 1 ? '1px solid #1E293B' : 'none' }}>
                      <span style={{ background: l.color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{l.name}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{n.focus}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{n.a}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* LAYERS TAB */}
        {tab === 'layers' && (
          <div className="card fade-in">
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Risk by Developmental Layer</h3>
            {LAYERS.map(l => {
              const lr = scores.layerRisk[l.id]
              const pct = Math.round((lr.points / lr.max) * 100)
              const rl = getRiskLevel(pct)
              return (
                <div key={l.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: l.color }}>{l.name}</span>
                      <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 8 }}>{l.desc}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: rl.color }}>{rl.emoji} {pct}%</span>
                  </div>
                  <ProgressBar value={lr.points} max={lr.max} color={l.color} />
                </div>
              )
            })}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1E293B' }}>
              <h4 style={{ fontWeight: 700, marginBottom: 16, color: '#94A3B8' }}>By PECMS Dimension</h4>
              {Object.entries(DIMS).map(([d, name], i) => {
                const dr = scores.dimRisk[d]
                const pct = Math.round((dr.points / (dr.max || 1)) * 100)
                const colors = ['#2563EB', '#DC2626', '#7C3AED', '#16A34A', '#EA580C']
                return (
                  <div key={d} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: colors[i], fontSize: 14 }}>{name}</span>
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>{pct}%</span>
                    </div>
                    <ProgressBar value={dr.points} max={dr.max || 1} color={colors[i]} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AI INSIGHT TAB */}
        {tab === 'ai-insight' && (
          <div className="fade-in">
            {aiLoading ? (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinning" style={{ width: 36, height: 36, border: '3px solid #334155', borderTopColor: '#6366F1', borderRadius: 99, margin: '0 auto 16px' }} />
                <p style={{ color: '#94A3B8' }}>Sakha is reading your pattern...</p>
              </div>
            ) : aiReport ? (
              <div>
                {/* Headline */}
                <div className="card" style={{ textAlign: 'center', marginBottom: 16, border: '1px solid #6366F130', background: 'linear-gradient(135deg, #6366F110, #EC489910)' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.4, color: '#F1F5F9' }}>{aiReport.headline}</p>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <p style={{ color: '#CBD5E1', lineHeight: 1.8, fontSize: 15 }}>{aiReport.body}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div className="card" style={{ border: '1px solid #16A34A30' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', marginBottom: 8 }}>✦ YOUR STRENGTH</div>
                    <p style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.6 }}>{aiReport.strength}</p>
                  </div>
                  <div className="card" style={{ border: '1px solid #F9731630' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#F97316', marginBottom: 8 }}>⚡ YOUR CHALLENGE</div>
                    <p style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.6 }}>{aiReport.challenge}</p>
                  </div>
                </div>

                <div className="card" style={{ border: '1px solid #6366F130', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', marginBottom: 8 }}>→ FIRST STEP TODAY</div>
                  <p style={{ fontSize: 15, color: '#F1F5F9', lineHeight: 1.6, fontWeight: 600 }}>{aiReport.first_step}</p>
                </div>

                {aiReport.message_to_self && (
                  <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>WHEN THINGS GET HARD, SAY:</div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', fontStyle: 'italic', lineHeight: 1.5 }}>"{aiReport.message_to_self}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#94A3B8' }}>AI insight unavailable. Add your Gemini API key in .env to enable this feature.</p>
              </div>
            )}
          </div>
        )}

        {/* FULL REPORT TAB */}
        {tab === 'full-report' && canSeeFullReport && (
          <div className="card fade-in" style={{ fontFamily: 'Georgia, serif' }}>
            <div style={{ borderBottom: '3px solid #6366F1', paddingBottom: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>SAKHA DIAGNOSTIC REPORT · PECMS × 7-LAYER FRAMEWORK</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>Student Self-Awareness Report</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: 6 }}>
                {user?.name} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Sakha v1 · Young Tulip
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>EXECUTIVE SUMMARY</div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: '#CBD5E1' }}>
                This student's PECMS × 7-Layer diagnostic identifies them as a <strong style={{ color: archetype.color }}>{typeName} ({archetypeKey})</strong> archetype
                with an overall dropout risk score of <strong>{scores.overallRisk}%</strong> ({risk.label}).
                {scores.integrationIndex} out of 35 diagnostic nodes are currently in a balanced state (Integration Index: {scores.integrationIndex}/35).
                {criticalNodes.length > 0 && ` ${criticalNodes.length} nodes are in critical deviation and require immediate attention.`}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>LAYER BREAKDOWN</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#111827' }}>
                    {['Layer', 'Description', 'Risk %', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Risk %' || h === 'Status' ? 'right' : 'left', fontFamily: 'Inter, sans-serif', color: '#94A3B8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LAYERS.map(l => {
                    const lr = scores.layerRisk[l.id]
                    const pct = Math.round((lr.points / lr.max) * 100)
                    const rl = getRiskLevel(pct)
                    return (
                      <tr key={l.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: l.color, fontFamily: 'Inter, sans-serif' }}>{l.name}</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>{l.desc}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{pct}%</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: rl.color, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{rl.emoji} {rl.label}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {aiReport && (
              <div style={{ marginBottom: 20, background: '#111827', borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>AI-GENERATED INSIGHT</div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#CBD5E1', marginBottom: 10 }}><strong>Pattern:</strong> {aiReport.headline}</p>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#CBD5E1', marginBottom: 10 }}>{aiReport.body}</p>
                <p style={{ fontSize: 14, color: '#CBD5E1' }}><strong>First step:</strong> {aiReport.first_step}</p>
              </div>
            )}

            <div style={{ background: '#111827', borderRadius: 10, padding: 16, fontSize: 11, color: '#475569', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
              <strong>Disclaimer:</strong> This report is generated using the Mother Source PECMS × 7-Layer framework (Young Tulip / Kunaal Jaiswal, IIITDM Kancheepuram).
              It is a self-reported diagnostic tool for educational support purposes only and is not a substitute for clinical psychological assessment.
              If you are in crisis, please contact iCall (9152987821) or Tele-MANAS (14416).
            </div>
          </div>
        )}

        {/* PAYWALL MODAL */}
        {showPaywall && (
          <div onClick={() => setShowPaywall(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 400, border: '1px solid #6366F140' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Unlock Full Report</h3>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#6366F1', marginBottom: 4 }}>₹{price}</div>
                <p style={{ color: '#94A3B8', fontSize: 13 }}>One time. No subscription. Your report forever.</p>
              </div>

              <div style={{ background: '#111827', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                {[
                  'Complete 35-node diagnostic breakdown',
                  'AI-generated personal insight (Claude premium)',
                  'Layer-by-layer intervention sequence',
                  'Downloadable PDF report',
                  'Track progress across reassessments',
                ].map(f => <div key={f} style={{ fontSize: 13, color: '#CBD5E1', marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: '#16A34A' }}>✓</span>{f}</div>)}
              </div>

              <button className="btn-primary" onClick={() => {
                // Razorpay integration
                if (window.Razorpay) {
                  const rzp = new window.Razorpay({
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: parseInt(price) * 100,
                    currency: 'INR',
                    name: 'Sakha',
                    description: 'Full Diagnostic Report',
                    handler: function(response) {
                      setPaidUnlocked(true)
                      setShowPaywall(false)
                      setTab('full-report')
                    },
                    prefill: { name: user?.name, email: user?.email, contact: `91${user?.phone}` },
                    theme: { color: '#6366F1' }
                  })
                  rzp.open()
                } else {
                  alert('Payment gateway loading... Add Razorpay script to index.html')
                }
              }}>Pay ₹{price} & Unlock</button>

              <button className="btn-ghost" onClick={() => setShowPaywall(false)} style={{ width: '100%', marginTop: 10 }}>Maybe later</button>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 12 }}>Secured by Razorpay · Your data is safe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
