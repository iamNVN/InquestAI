import { useState, useEffect, useRef } from 'react';

const SCRIPT = [
  { time: 2, speaker: 'Judge', text: 'Court is now in session. The Prosecution may present their case.' },
  { time: 5, speaker: 'Prosecution', text: 'Your Honor, the domain is a typosquat of PayPal. It uses a "1" instead of "l".' },
  { time: 10, speaker: 'Defense', text: 'Lookalike domains alone are not enough. The email could be from a legitimate security partner using a similar domain.' },
  { time: 15, speaker: 'Prosecution', text: 'However, the SSL certificate is invalid and redirects to a suspicious IP address.' },
  { time: 20, speaker: 'Defense', text: 'The sender hostname might be misconfigured. We lack definitive proof of intent.' },
  { time: 25, speaker: 'Prosecution', text: 'The language manipulates urgency, asking for immediate credential input. It is clearly deceptive.' },
  { time: 28, speaker: 'Judge', text: 'I have heard enough. The evidence heavily weighs in favor of the Prosecution.' },
];

export default function LiveHearingScreen({ onHearingComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const [prosecutorScore, setProsecutorScore] = useState(10);
  const [defenseScore, setDefenseScore] = useState(10);
  const [transcript, setTranscript] = useState([]);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev < 30 ? prev + 1 : 30);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (elapsed >= 30) {
      onHearingComplete();
    }
  }, [elapsed, onHearingComplete]);

  useEffect(() => {
    const newLines = SCRIPT.filter(s => s.time === elapsed);
    if (newLines.length > 0) {
      setTranscript(prev => [...prev, ...newLines]);
      
      // Update scores dynamically based on the speaker
      newLines.forEach(line => {
        if (line.speaker === 'Prosecution') {
           setProsecutorScore(prev => Math.min(prev + 25, 87));
           setDefenseScore(prev => Math.max(prev - 5, 22));
        } else if (line.speaker === 'Defense') {
           setDefenseScore(prev => Math.min(prev + 15, 45));
           setProsecutorScore(prev => Math.max(prev - 2, 76));
        }
      });
    }
  }, [elapsed]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="app-container">
      <div className="premium-panel" style={{maxWidth: '1200px'}}>
        <div className="flex-between mb-2">
          <button className="btn-secondary" onClick={onHearingComplete} style={{fontSize: '0.9rem', padding: '0.5rem 1rem'}}>← Back to Verdict</button>
          <h2 className="gold-text m-0">⚖ THE HEARING ⚖</h2>
          <span style={{color: 'var(--red-crimson)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{width: '10px', height: '10px', borderRadius: '50%', background: 'var(--red-crimson)', display: 'inline-block', boxShadow: '0 0 8px var(--red-crimson)'}}></span>
            LIVE HEARING
          </span>
        </div>

        <div className="flex-center mb-2" style={{marginTop: '2rem'}}>
          <div className="text-center" style={{background: 'rgba(0,0,0,0.6)', padding: '1rem 3rem', borderRadius: '8px', border: '1px solid var(--panel-border)'}}>
            <h4 className="gold-text mb-0">THE JUDGE</h4>
            <p className="text-muted" style={{fontSize: '0.9rem', marginTop: '0.2rem'}}>Veritas AI</p>
          </div>
        </div>

        <div className="hearing-layout" style={{marginBottom: '2rem'}}>
          <div className="side-panel prosecutor-panel">
            <div className="text-center mb-2">
              <div className="logo-icon mx-auto" style={{borderColor: 'var(--blue-prosecutor)', color: 'var(--blue-prosecutor)'}}>👨‍💼</div>
              <h3 style={{color: 'var(--blue-prosecutor)'}}>THE PROSECUTION</h3>
              <p className="text-muted mb-1" style={{fontSize: '0.9rem'}}>Arguing why this email is <span style={{color: 'var(--red-crimson)', fontWeight: 'bold'}}>PHISHING</span></p>
            </div>
            
            <div className="mt-2" style={{background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px'}}>
              <div className="flex-between text-muted mb-1" style={{fontSize: '0.85rem'}}>
                <span>STRENGTH OF CASE</span>
                <span style={{color: '#fff', fontSize: '1.2rem'}}>{prosecutorScore}%</span>
              </div>
              <div className="progress-bar-container" style={{height: '12px'}}>
                <div className="progress-bar prosecutor-bar" style={{width: `${prosecutorScore}%`}}></div>
              </div>
            </div>
          </div>

          <div className="side-panel defense-panel">
             <div className="text-center mb-2">
              <div className="logo-icon mx-auto" style={{borderColor: 'var(--blue-defense)', color: 'var(--blue-defense)'}}>👩‍💼</div>
              <h3 style={{color: 'var(--blue-defense)'}}>THE DEFENSE</h3>
              <p className="text-muted mb-1" style={{fontSize: '0.9rem'}}>Arguing why this email might be <span style={{color: '#fff', fontWeight: 'bold'}}>LEGITIMATE</span></p>
            </div>

            <div className="mt-2" style={{background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px'}}>
              <div className="flex-between text-muted mb-1" style={{fontSize: '0.85rem'}}>
                <span>STRENGTH OF CASE</span>
                <span style={{color: '#fff', fontSize: '1.2rem'}}>{defenseScore}%</span>
              </div>
              <div className="progress-bar-container" style={{height: '12px'}}>
                <div className="progress-bar defense-bar" style={{width: `${defenseScore}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', gap: '2rem'}}>
           <div style={{flex: 2}}>
              <h4 className="gold-text mb-1">LIVE ARGUMENT</h4>
              <div style={{background: 'rgba(0,0,0,0.6)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', minHeight: '120px', display: 'flex', alignItems: 'center'}}>
                 {transcript.length > 0 ? (
                    <p style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                      <span className={`speaker-${transcript[transcript.length-1].speaker.toLowerCase()}`} style={{marginRight: '0.5rem'}}>{transcript[transcript.length-1].speaker.toUpperCase()}:</span>
                      {transcript[transcript.length-1].text}
                    </p>
                 ) : (
                    <p className="text-muted" style={{fontStyle: 'italic'}}>Waiting for hearing to commence...</p>
                 )}
              </div>
           </div>

           <div style={{flex: 1}}>
             <h4 className="text-muted mb-1" style={{fontSize: '0.9rem'}}>HEARING TRANSCRIPT</h4>
             <div className="transcript-box" style={{height: '120px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.8)'}}>
                {transcript.map((t, i) => (
                  <div key={i} className="transcript-line" style={{fontSize: '0.8rem'}}>
                    <span style={{color: '#555', marginRight: '8px'}}>10:24:{t.time.toString().padStart(2, '0')}</span>
                    <span className={`speaker-${t.speaker.toLowerCase()}`} style={{marginRight: '5px'}}>{t.speaker}</span>
                    <span style={{color: '#ccc'}}>{t.text.substring(0, 30)}...</span>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
