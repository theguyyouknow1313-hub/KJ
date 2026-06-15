import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useApp } from './App'

const S = {
  page: { minHeight:'100vh', background:'#0A0E1A', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  card: { background:'#111827', border:'1px solid #1F2937', borderRadius:24, padding:36, width:'100%', maxWidth:440 },
  back: { display:'flex', alignItems:'center', gap:6, color:'#6B7280', fontSize:13, fontWeight:600, marginBottom:28, cursor:'pointer', background:'none', border:'none' },
  logo: { display:'flex', alignItems:'center', gap:10, marginBottom:28 },
  logoIcon: { width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:20, color:'#fff' },
  logoText: { fontWeight:800, fontSize:20, color:'#F9FAFB' },
  title: { fontSize:24, fontWeight:800, color:'#F9FAFB', marginBottom:6 },
  subtitle: { fontSize:14, color:'#6B7280', marginBottom:28, lineHeight:1.5 },
  label: { fontSize:13, fontWeight:600, color:'#D1D5DB', marginBottom:6, display:'block' },
  input: { width:'100%', padding:'12px 14px', background:'#1F2937', border:'1px solid #374151', borderRadius:10, color:'#F9FAFB', fontSize:14, outline:'none', marginBottom:16 },
  checkRow: { display:'flex', alignItems:'flex-start', gap:10, marginBottom:14 },
  check: { width:18, height:18, accentColor:'#6366F1', marginTop:2, flexShrink:0 },
  checkLabel: { fontSize:13, color:'#9CA3AF', lineHeight:1.5 },
  checkLink: { color:'#818CF8', textDecoration:'underline', cursor:'pointer' },
  btn: { width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:8 },
  btnDisabled: { opacity:0.5, cursor:'not-allowed' },
  error: { background:'#1C0909', border:'1px solid #7F1D1D', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#FCA5A5', marginBottom:16 },
  login: { textAlign:'center', marginTop:20, fontSize:13, color:'#6B7280' },
}

export default function Register() {
  const navigate = useNavigate()
  const { loginUser } = useApp()
  const [form, setForm] = useState({ name:'', email:'', phone:'' })
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit() {
    if (!form.name.trim()) return setError('Please enter your name.')
    if (!form.email.trim() || !form.email.includes('@')) return setError('Please enter a valid email.')
    if (!terms) return setError('Please accept the Terms & Conditions to continue.')
    setLoading(true)
    try {
      if (isLogin) {
        // Login: find by email
        const { data, error: err } = await supabase
          .from('sakha_users').select('*').eq('email', form.email.toLowerCase().trim()).single()
        if (err || !data) {
          setError('No account found with this email. Please register.')
          setLoading(false)
          return
        }
        loginUser(data)
        navigate('/quiz')
      } else {
        // Register
        const { data: existing } = await supabase
          .from('users').select('id').eq('email', form.email.toLowerCase().trim()).single()
        if (existing) {
          setError('An account with this email already exists. Please log in instead.')
          setLoading(false)
          setIsLogin(true)
          return
        }
        const { data, error: err } = await supabase.from('users').insert({
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          phone: form.phone.trim() || null,
          terms_accepted: true,
          marketing_consent: marketing,
        }).select().single()
        if (err) throw err
        loginUser(data)
        navigate('/quiz')
      }
    } catch(e) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <button style={S.back} onClick={() => navigate('/')}>← Back to Sakha</button>

        <div style={S.logo}>
          <div style={S.logoIcon}>S</div>
          <span style={S.logoText}>Sakha</span>
        </div>

        <div style={S.title}>{isLogin ? 'Welcome back' : 'Begin your journey'}</div>
        <div style={S.subtitle}>
          {isLogin ? 'Log in with your registered email to continue.' : 'Create your free Sakha account. Takes 30 seconds.'}
        </div>

        {error && <div style={S.error}>{error}</div>}

        {!isLogin && (
          <>
            <label style={S.label}>Your Name *</label>
            <input style={S.input} name="name" placeholder="e.g. Rahul Kumar" value={form.name} onChange={handleChange} />
          </>
        )}

        <label style={S.label}>Email Address *</label>
        <input style={S.input} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />

        {!isLogin && (
          <>
            <label style={S.label}>Phone Number <span style={{ color:'#6B7280', fontWeight:400 }}>(optional — for updates)</span></label>
            <input style={S.input} name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
          </>
        )}

        <div style={S.checkRow}>
          <input type="checkbox" style={S.check} checked={terms} onChange={e => setTerms(e.target.checked)} id="terms" />
          <label htmlFor="terms" style={S.checkLabel}>
            I agree to the <span style={S.checkLink}>Terms & Conditions</span> and <span style={S.checkLink}>Privacy Policy</span>. I understand Sakha is a self-awareness tool, not a clinical diagnosis.
          </label>
        </div>

        {!isLogin && (
          <div style={S.checkRow}>
            <input type="checkbox" style={S.check} checked={marketing} onChange={e => setMarketing(e.target.checked)} id="marketing" />
            <label htmlFor="marketing" style={S.checkLabel}>
              I consent to receive updates about Sakha, new features, book launches, and Young Tulip initiatives via email/SMS. I can unsubscribe anytime.
            </label>
          </div>
        )}

        <button
          style={{ ...S.btn, ...(loading || (!terms && !isLogin) ? S.btnDisabled : {}) }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : isLogin ? 'Log In →' : 'Create Account & Begin →'}
        </button>

        <div style={S.login}>
          {isLogin ? (
            <>New to Sakha? <span style={{ color:'#818CF8', cursor:'pointer' }} onClick={() => setIsLogin(false)}>Create account</span></>
          ) : (
            <>Already have an account? <span style={{ color:'#818CF8', cursor:'pointer' }} onClick={() => setIsLogin(true)}>Log in</span></>
          )}
        </div>
      </div>
    </div>
  )
}
