export default function Home() {
  return (
    <main style={{minHeight: '100vh', background: '#080C10', color: '#E2EAF4', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: '500', marginBottom: '1rem'}}>
          Hackers<span style={{color: '#4A8CFF'}}>Harbor</span>
        </h1>
        <p style={{color: '#5A6E85', fontSize: '1.1rem', marginBottom: '2rem'}}>
          Navigate your coding journey
        </p>
        <a href="#" style={{background: '#1549C2', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none'}}>
          Get started free
        </a>
      </div>
    </main>
  )
}