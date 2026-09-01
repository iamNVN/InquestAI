export default function VerdictScreen({ onViewHearing, onGenerateReport, isFinal }) {
  return (
    <div className="app-container">
      <div className="premium-panel text-center">
        <div className="logo-icon mb-1">⚖</div>
        <h3 className="gold-text mb-2">INQUEST</h3>
        
        <p className="text-muted mb-1" style={{fontWeight: 600, letterSpacing: '2px'}}>{isFinal ? 'FINAL JUDGEMENT' : 'THE COURT VERDICT'}</p>
        <h1 className="red-text mb-1" style={{fontSize: '3.5rem'}}>GUILTY</h1>
        <h2 className="mb-2" style={{fontWeight: 400}}>This email is a PHISHING attempt</h2>
        
        <div className="flex-center mb-2">
          <span style={{marginRight: '1rem', fontWeight: 600}}>Confidence: 92%</span>
          <div style={{width: '200px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden'}}>
            <div style={{width: '92%', height: '100%', background: 'var(--red-crimson)', boxShadow: '0 0 10px var(--red-glow)'}}></div>
          </div>
        </div>

        {!isFinal && (
          <div style={{background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)'}}>
            <h4 className="text-muted mb-1" style={{letterSpacing: '1px'}}>REASON</h4>
            <p style={{lineHeight: '1.6', fontSize: '1.1rem'}}>The sender is using a lookalike domain, the link redirects to a suspicious website, and the content intentionally creates urgency to trick you.</p>
          </div>
        )}

        {isFinal && (
           <div style={{background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)'}}>
             <p style={{lineHeight: '1.6', fontSize: '1.1rem', fontStyle: 'italic'}}>The court finds the prosecution has proven the intent to deceive beyond reasonable doubt.</p>
           </div>
        )}

        {isFinal && <h4 className="mb-1 mt-2 text-muted">What would you like to do next?</h4>}
        
        <div className="flex-center" style={{gap: '1rem', marginTop: '1rem'}}>
          {!isFinal ? (
            <>
              <button className="btn-primary" onClick={onViewHearing} style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>⚖ View Hearing</button>
              <button className="btn-secondary" onClick={onGenerateReport} style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>📄 Generate Report</button>
            </>
          ) : (
            <>
               <button className="btn-secondary" onClick={() => window.location.reload()} style={{padding: '1rem 1.5rem'}}>✉ Investigate Another Email</button>
               <button className="btn-secondary" onClick={onGenerateReport} style={{padding: '1rem 1.5rem'}}>📄 Generate New Report</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
