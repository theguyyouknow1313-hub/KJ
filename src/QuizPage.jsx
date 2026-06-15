import { useState } from 'react'
import { QUESTIONS, LAYERS } from './lib/framework.js'

const SCALE = [
  { v: -2, labelA: 'Strongly A', short: 'A↓↓', color: '#DC2626' },
  { v: -1, labelA: 'Mostly A',   short: 'A↓',  color: '#F97316' },
  { v:  0, labelA: 'Neither',    short: '✓',    color: '#16A34A' },
  { v:  1, labelA: 'Mostly B',   short: 'B↑',   color: '#8B5CF6' },
  { v:  2, labelA: 'Strongly B', short: 'B↑↑',  color: '#6D28D9' },
]

export default function QuizPage({ onComplete }) {
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState({})
  const [animDir, setAnimDir]   = useState(1)

  const q        = QUESTIONS[current]
  const layer    = LAYERS.find(l => l.id === q.layer)
  const answered = Object.keys(answers).length
  const progress = Math.round((answered / QUESTIONS.length) * 100)
  const layerNum = LAYERS.findIndex(l => l.id === q.layer) + 1

  function answer(val) {
    setAnswers(a => ({ ...a, [current]: val }))
  }

  function goNext() {
    if (current < QUESTIONS.length - 1) {
      setAnimDir(1)
      setCurrent(c => c + 1)
    }
  }

  function goPrev() {
    if (current > 0) {
      setAnimDir(-1)
      setCurrent(c => c - 1)
    }
  }

  function submit() {
    // Fill unanswered with 0 (balanced)
    const filled = {}
    QUESTIONS.forEach((_, i) => { filled[i] = answers[i] ?? 0 })
    onComplete(filled)
  }

  const isLast     = current === QUESTIONS.length - 1
  const curAnswer  = answers[current] ?? null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        background: '#111827', borderBottom: '1px solid #1E293B',
        padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>Sakha</span>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, #6366F1, #EC4899)` }} />
          </div>
        </div>
        <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {current + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Layer band */}
      <div style={{
        background: layer.color + '18', borderBottom: `2px solid ${layer.color}30`,
        padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 99, background: layer.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: layer.color }}>
          Layer {layerNum}: {layer.name}
        </span>
        <span style={{ fontSize: 12, color: '#475569' }}>—</span>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>{layer.desc}</span>
      </div>

      {/* Question card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
        <div className="card fade-in" style={{ width: '100%', maxWidth: 640, border: `1px solid ${layer.color}30` }}>

          {/* Focus tag */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: layer.color + '20', color: layer.color,
              borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700
            }}>{layer.name}</span>
            <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>📌 {q.focus}</span>
          </div>

          {/* Instruction */}
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 18 }}>
            Which statement describes your <strong style={{ color: '#F1F5F9' }}>typical pattern</strong>? Not your best day — your usual pattern.
          </p>

          {/* Two statements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {/* Statement A */}
            <div style={{
              background: '#0A0F1E', border: '1px solid #DC262640',
              borderRadius: 12, padding: 16,
              outline: curAnswer !== null && curAnswer < 0 ? `2px solid #DC2626` : 'none'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 8, letterSpacing: 0.5 }}>STATEMENT A</div>
              <p style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.6 }}>{q.a}</p>
            </div>
            {/* Statement B */}
            <div style={{
              background: '#0A0F1E', border: '1px solid #7C3AED40',
              borderRadius: 12, padding: 16,
              outline: curAnswer !== null && curAnswer > 0 ? `2px solid #7C3AED` : 'none'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 8, letterSpacing: 0.5 }}>STATEMENT B</div>
              <p style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.6 }}>{q.b}</p>
            </div>
          </div>

          {/* Scale buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {SCALE.map(s => (
              <button key={s.v} onClick={() => answer(s.v)} style={{
                flex: 1, padding: '12px 4px', borderRadius: 10,
                border: curAnswer === s.v ? 'none' : '1px solid #334155',
                background: curAnswer === s.v ? s.color : '#111827',
                color: curAnswer === s.v ? '#fff' : '#94A3B8',
                fontWeight: curAnswer === s.v ? 800 : 500,
                fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                lineHeight: 1.3, textAlign: 'center'
              }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{s.short}</div>
                <div style={{ fontSize: 10, opacity: 0.85 }}>{s.v === 0 ? 'Neither' : s.v < 0 ? 'More A' : 'More B'}</div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={goPrev} disabled={current === 0}
              style={{ flex: 1, opacity: current === 0 ? 0.4 : 1 }}>
              ← Back
            </button>
            {isLast ? (
              <button className="btn-primary" onClick={submit} style={{ flex: 2 }}>
                ✓ See My Results
              </button>
            ) : (
              <button className="btn-primary" onClick={goNext} style={{ flex: 2 }}>
                {curAnswer !== null ? 'Next →' : 'Skip →'}
              </button>
            )}
          </div>

          {/* Question dots — layer groups */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 20, flexWrap: 'wrap' }}>
            {QUESTIONS.map((qq, i) => {
              const l = LAYERS.find(ll => ll.id === qq.layer)
              return (
                <button key={i} onClick={() => setCurrent(i)} style={{
                  width: 8, height: 8, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                  background: i === current ? l.color : answers[i] !== undefined ? l.color + '80' : '#334155',
                  transform: i === current ? 'scale(1.4)' : 'scale(1)',
                  transition: 'all 0.15s'
                }} title={`Q${i+1}: ${qq.focus}`} />
              )
            })}
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 8 }}>
            {answered} answered · {QUESTIONS.length - answered} remaining
          </p>
        </div>
      </div>
    </div>
  )
}
