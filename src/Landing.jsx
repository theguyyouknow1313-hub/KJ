import { useNavigate } from 'react-router-dom'
import { useApp } from './App'

const S = {
  page: { minHeight:'100vh', background:'#0A0E1A', display:'flex', flexDirection:'column' },
  nav: { padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1F2937' },
  logo: { display:'flex', alignItems:'center', gap:10 },
  logoIcon: { width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:18, color:'#fff' },
  logoText: { fontWeight:800, fontSize:18, color:'#F9FAFB' },
  hero: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', textAlign:'center' },
  badge: { display:'inline-flex', alignItems:'center', gap:6, background:'#1F2937', border:'1px solid #374151', borderRadius:99, padding:'6px 14px', fontSize:12, color:'#9CA3AF', marginBottom:32, fontWeight:600 },
  title: { fontSize:'clamp(36px,6vw,72px)', fontWeight:900, lineHeight:1.1, marginBottom:20, letterSpacing:-2 },
  titleAccent: { background:'linear-gradient(135deg,#6366F1,#A78BFA,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  subtitle: { fontSize:'clamp(16px,2vw,20px)', color:'#9CA3AF', maxWidth:520, lineHeight:1.7, marginBottom:40 },
  ctaRow: { display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:60 },
  btnPrimary: { padding:'14px 32px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer' },
  btnSecondary: { padding:'14px 32px', borderRadius:12, border:'1px solid #374151', background:'transparent', color:'#D1D5DB', fontWeight:600, fontSize:16, cursor:'pointer' },
  stats: { display:'flex', gap:40, justifyContent:'center', flexWrap:'wrap', marginBottom:60 },
  stat: { textAlign:'center' },
  statNum: { fontSize:32, fontWeight:900, color:'#F9FAFB' },
  statLabel: { fontSize:13, color:'#6B7280', marginTop:2 },
  cards: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, maxWidth:800, width:'100%', margin:'0 auto 60px' },
  card: { background:'#111827', border:'1px solid #1F2937', borderRadius:16, padding:'20px', textAlign:'left' },
  cardIcon: { fontSize:28, marginBottom:12 },
  cardTitle: { fontWeight:700, fontSize:15, color:'#F9FAFB', marginBottom:6 },
  cardDesc: { fontSize:13, color:'#6B7280', lineHeight:1.5 },
  crisis: { background:'#111827', border:'1px solid #1F2937', borderRadius:12, padding:'16px 24px', maxWidth:500, margin:'0 auto 40px', fontSize:13, color:'#6B7280', textAlign:'center', lineHeight:1.6 },
  footer: { borderTop:'1px solid #1F2937', padding:'20px 24px', textAlign:'center', fontSize:12, color:'#4B5563' },
}

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useApp()

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoIcon}>S</div>
          <span style={S.logoText}>Sakha</span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {user ? (
            <>
              <button onClick={() => navigate('/profile')} style={{ ...S.btnSecondary, padding:'8px 16px', fontSize:13 }}>My Profile</button>
              <button onClick={() => navigate('/quiz')} style={{ ...S.btnPrimary, padding:'8px 16px', fontSize:13 }}>Take Assessment</button>
            </>
          ) : (
            <button onClick={() => navigate('/register')} style={{ ...S.btnPrimary, padding:'8px 20px', fontSize:14 }}>Begin →</button>
          )}
        </div>
      </nav>

      <div style={S.hero}>
        <div style={S.badge}>
          <span style={{ width:6, height:6, borderRadius:99, background:'#22C55E', display:'inline-block' }} />
          India's First PECMS Student Diagnostic
        </div>

        <h1 style={S.title}>
          <span>Know who you are.</span><br />
          <span style={S.titleAccent}>Before the system decides.</span>
        </h1>

        <p style={S.subtitle}>
          Sakha maps your inner state across 7 layers and 35 nodes — and tells you whether you are on the path to your potential, or quietly heading toward dropout.
        </p>

        <div style={S.ctaRow}>
          <button style={S.btnPrimary} onClick={() => navigate(user ? '/quiz' : '/register')}>
            Start Free Assessment →
          </button>
          <button style={S.btnSecondary} onClick={() => document.getElementById('how').scrollIntoView({ behavior:'smooth' })}>
            How it works
          </button>
        </div>

        <div style={S.stats}>
          {[['35', 'Diagnostic Nodes'], ['7', 'Life Layers'], ['8', 'Personality Types'], ['10+', 'Indian Languages']].map(([n, l]) => (
            <div key={l} style={S.stat}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>

        <div id="how" style={S.cards}>
          {[
            { icon:'🧠', title:'PECMS Framework', desc:'Physical, Emotional, Cognitive, Moral, Spiritual — mapped across 7 developmental layers.' },
            { icon:'🎯', title:'Dropout Risk Score', desc:'Know your risk percentage before it becomes a reality. Early awareness saves futures.' },
            { icon:'🌍', title:'Your Language', desc:'See your personality type in Hindi, Sanskrit, Tamil, Telugu, Bengali and 6 more languages.' },
            { icon:'🔒', title:'Your Data, Your Choice', desc:'We never sell your data. You own your diagnostic. Always.' },
          ].map(c => (
            <div key={c.title} style={S.card}>
              <div style={S.cardIcon}>{c.icon}</div>
              <div style={S.cardTitle}>{c.title}</div>
              <div style={S.cardDesc}>{c.desc}</div>
            </div>
          ))}
        </div>

        <div style={S.crisis}>
          🆘 If you are struggling and need immediate support:<br />
          <strong style={{ color:'#F9FAFB' }}>iCall: 9152987821</strong> &nbsp;|&nbsp;
          <strong style={{ color:'#F9FAFB' }}>Tele-MANAS: 14416</strong><br />
          Free, confidential, 24/7
        </div>
      </div>

      <footer style={S.footer}>
        Sakha v1.0 — Built by Young Tulip × PECMS Framework by Kunaal Jaiswal &nbsp;|&nbsp;
        <span style={{ color:'#6366F1' }}>skunaaljaiswal.com</span>
      </footer>
    </div>
  )
}
