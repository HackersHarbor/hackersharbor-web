export default function Home() {
  return (
    <div style={{background: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif'}}>
      
      <nav style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', borderBottom: '1px solid #E8EDF2', background: '#ffffff'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600', color: '#0F1923'}}>
        <img src="/logo.png" alt="HackersHarbor" style={{width: '48px', height: '48px'}} />
          Hackers<span style={{color: '#1549C2'}}>Harbor</span>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          {['Learn', 'Roadmaps', 'Practice', 'Projects', 'Community'].map((item) => (
            <a key={item} href="#" style={{fontSize: '14px', color: '#5A6E85', padding: '6px 12px', textDecoration: 'none'}}>{item}</a>
          ))}
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <a href="#" style={{fontSize: '14px', color: '#5A6E85', textDecoration: 'none', padding: '6px 12px'}}>Log in</a>
          <a href="#" style={{fontSize: '14px', color: '#ffffff', background: '#1549C2', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500'}}>Sign up</a>
        </div>
      </nav>

      <p style={{textAlign: 'center', padding: '40px', color: '#5A6E85'}}>Hero section coming next...</p>

    </div>
  )
}