import React, { useState, useEffect } from 'react';

export default function LiveHearingScreen({ onHearingComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const [prosecutionStrength, setProsecutionStrength] = useState(50);
  const defenseStrength = 100 - Math.round(prosecutionStrength);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const [transcript, setTranscript] = useState([
    { time: '00:00:00', speaker: 'Judge', text: 'Court is now in session. The Prosecution may present their case.' }
  ]);

  useEffect(() => {
    let currentElapsed = 0;
    const timer = setInterval(() => {
      currentElapsed++;
      setElapsed(currentElapsed);

      setProsecutionStrength(prev => Math.min(95, Math.max(5, prev + (Math.random() * 10 - 5))));

      if (Math.random() > 0.6) {
        const isPros = Math.random() > 0.5;
        const speaker = isPros ? 'Prosecution' : 'Defense';
        const text = isPros
          ? ["Domain is a typosquat of PayPal...", "Redirects to suspicious IP...", "Urgency keywords detected..."][Math.floor(Math.random() * 3)]
          : ["SSL certificate is valid...", "Sender has good reputation...", "No malicious attachments found..."][Math.floor(Math.random() * 3)];

        setTranscript(prev => [...prev, { time: formatTime(currentElapsed), speaker, text }]);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (elapsed >= 30) {
      onHearingComplete();
    }
  }, [elapsed, onHearingComplete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem 4rem', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>

      {/* Main Content Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, padding: '0 4rem', marginTop: '8vh' }}>

        {/* Prosecution Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '320px' }}>
          <div style={{
            background: 'rgba(10,5,5,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 50, 50, 0.3)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,0,0,0.05)'
          }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%', border: '2px solid rgba(255,50,50,0.6)',
              margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255,0,0,0.3)', background: 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(0,0,0,0) 100%)'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ff3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h4 style={{ fontFamily: "'Cinzel', serif", color: '#d4b872', fontSize: '1.1rem', margin: '0 0 0.75rem 0', letterSpacing: '1px' }}>THE PROSECUTION</h4>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>Arguing why this email might be  <span style={{ color: '#ff3333', fontWeight: 600 }}>PHISHING</span></p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#ccc', letterSpacing: '1px' }}>
              <span>STRENGTH OF CASE</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(prosecutionStrength)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${prosecutionStrength}%`, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)', transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>
        </div>

        {/* Defense Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '320px' }}>
          <div style={{
            background: 'rgba(5,10,15,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(50, 150, 255, 0.3)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(50,150,255,0.05)'
          }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%', border: '2px solid rgba(50,150,255,0.6)',
              margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(50,150,255,0.3)', background: 'radial-gradient(circle, rgba(50,150,255,0.2) 0%, rgba(0,0,0,0) 100%)'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3296ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h4 style={{ fontFamily: "'Cinzel', serif", color: '#d4b872', fontSize: '1.1rem', margin: '0 0 0.75rem 0', letterSpacing: '1px' }}>THE DEFENSE</h4>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>Arguing why this email might be <span style={{ color: '#3296ff', fontWeight: 600 }}>LEGITIMATE</span></p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#ccc', letterSpacing: '1px' }}>
              <span>STRENGTH OF CASE</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(defenseStrength)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${defenseStrength}%`, height: '100%', background: '#3296ff', boxShadow: '0 0 10px rgba(50,150,255,0.8)', transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Panels Row */}
      <div style={{ display: 'flex', gap: '2rem', width: '100%', padding: '0 4rem', boxSizing: 'border-box' }}>

        {/* Live Argument (Left) */}
        <div style={{
          flex: 6,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h5 style={{ fontFamily: "'Inter', sans-serif", color: '#d4b872', margin: '0 0 1.5rem 0', letterSpacing: '1px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            LIVE ARGUMENT
          </h5>
          <div style={{ fontSize: '1.2rem', fontFamily: "'Inter', sans-serif", color: '#fff', lineHeight: '1.6' }}>
            {transcript.length > 0 && (
              <>
                <span style={{ color: transcript[transcript.length - 1].speaker === 'Prosecution' ? '#ff3333' : transcript[transcript.length - 1].speaker === 'Defense' ? '#3296ff' : '#d4b872', fontWeight: 600, marginRight: '0.5rem' }}>
                  {transcript[transcript.length - 1].speaker}:
                </span>
                {transcript[transcript.length - 1].text}
              </>
            )}
          </div>
        </div>

        {/* Hearing Transcript (Right) */}
        <div style={{
          flex: 4,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          height: '200px' // fixed height for scrolling
        }}>
          <h5 style={{ fontFamily: "'Inter', sans-serif", color: '#fff', margin: '0 0 1rem 0', letterSpacing: '1px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            HEARING TRANSCRIPT
          </h5>
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '1rem' }} className="custom-scrollbar">
            {transcript.map((item, i) => (
              <div key={i} style={{ fontSize: '0.85rem', fontFamily: "'Inter', sans-serif", color: '#aaa', lineHeight: '1.5' }}>
                <span style={{ color: '#666', marginRight: '0.75rem', fontFamily: "monospace" }}>{item.time}</span>
                <span style={{ color: item.speaker === 'Prosecution' ? '#ff3333' : item.speaker === 'Defense' ? '#3296ff' : '#d4b872', fontWeight: 600 }}>{item.speaker}</span>
                <span style={{ color: '#fff' }}> {item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
