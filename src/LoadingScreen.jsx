export default function LoadingScreen({ message = 'Analysing your pattern...' }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: 'linear-gradient(135deg, #6366F1, #EC4899)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 28,
        animation: 'pulse 2s ease infinite'
      }}>S</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 99,
            background: i === 0 ? '#6366F1' : i === 1 ? '#EC4899' : '#6366F1',
            animation: `pulse 1.2s ease ${i * 0.2}s infinite`
          }} />
        ))}
      </div>

      <p style={{ color: '#94A3B8', fontSize: 16, fontWeight: 600 }}>{message}</p>
      <p style={{ color: '#475569', fontSize: 13, marginTop: 8 }}>
        Mapping your PECMS × 7-Layer profile...
      </p>
    </div>
  )
}
