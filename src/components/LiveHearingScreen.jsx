import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// ElevenLabs voice IDs - verified free tier defaults
const VOICES = {
  judge:      'pNInz6obpgDQGcFmaJgB', // Adam - authoritative, standard
  prosecutor: 'ErXwobaYiN019PkySvjV', // Antoni - strong, clear
  defense:    'MF3mGyEYCl7XYWbV9V6O', // Elli - distinct, clear female voice
};

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_KEY || '';

// Fallback to browser's native TTS if ElevenLabs fails
function fallbackTTS(text, role) {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) return resolve();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a different voice depending on role
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (role === 'judge') utterance.voice = voices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male')) || voices[0];
      if (role === 'prosecutor') utterance.voice = voices.find(v => v.name.includes('Google US English')) || voices[0];
      if (role === 'defense') utterance.voice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK English Female')) || voices[0];
    }
    
    utterance.rate = 1.0;
    utterance.pitch = role === 'judge' ? 0.6 : (role === 'prosecutor' ? 1.0 : 1.2);
    
    // If Web Speech API fails or is blocked, ensure we at least wait an estimated reading time
    // so the text doesn't just flash on screen for 1 second.
    const estimatedReadingMs = Math.max(2500, text.length * 60);
    
    utterance.onend = resolve;
    utterance.onerror = () => setTimeout(resolve, estimatedReadingMs);
    window.speechSynthesis.speak(utterance);
  });
}

async function speakElevenLabs(text, speaker) {
  if (!ELEVENLABS_API_KEY) return fallbackTTS(text, speaker); // skip to fallback if no key configured
  const voiceId = VOICES[speaker.toLowerCase()] || VOICES.judge;
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
      }),
    });
    
    if (!res.ok) {
      console.warn(`ElevenLabs API error: ${res.status}. Using fallback TTS.`);
      return fallbackTTS(text, speaker);
    }
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    return new Promise(resolve => {
      const estimatedReadingMs = Math.max(2500, text.length * 60);
      
      audio.onended = resolve;
      audio.onerror = () => setTimeout(resolve, estimatedReadingMs);
      audio.play().catch(e => {
        console.warn('Audio play blocked/failed:', e);
        fallbackTTS(text, speaker).then(() => setTimeout(resolve, estimatedReadingMs)); // fallback with delay
      });
    });
  } catch (e) {
    console.warn('ElevenLabs TTS failed:', e);
    return fallbackTTS(text, speaker);
  }
}

export default function LiveHearingScreen({ caseID, verdict, confidence, onHearingComplete }) {
  useDocumentTitle('Inquest AI | Live Hearing');
  const { t } = useLanguage();
  const [elapsed, setElapsed] = useState(0);
  
  // Parse confidence safely — DB may store it as string "HIGH" from old records
  const confNum = parseFloat(confidence);
  const confScore = isNaN(confNum) ? 88 : confNum;

  // Target final prosecution strength based on verdict
  const targetStrength = verdict === 'PHISHING'
    ? Math.max(70, confScore)
    : verdict === 'LEGITIMATE'
      ? Math.min(30, 100 - confScore)
      : 50;

  const [prosecutionStrength, setProsecutionStrength] = useState(50);
  const [showStamp, setShowStamp] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const videoRef = useRef(null);
  const defenseStrength = 100 - Math.round(prosecutionStrength);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const [transcript, setTranscript] = useState([
    { time: '00:00:00', speaker: 'Judge', text: t('court_session') }
  ]);

  useEffect(() => {
    let currentElapsed = 0;
    const timer = setInterval(() => {
      currentElapsed++;
      setElapsed(currentElapsed);
    }, 1000);

    if (caseID) {
      let replayTimeout;
      fetch(`/api/investigate/${caseID}/hearing`)
        .then(res => res.json())
        .then(async data => {
          if (data && data.length > 0) {
            let index = 0;
            const total = data.length;

            // Each step nudges strength toward the target
            const stepSize = () => {
              const remaining = targetStrength - prosecutionStrength;
              return remaining / Math.max(1, total - index);
            };


            const pushNext = async () => {
              if (index < total) {
                const d = data[index];
                const speaker = d.agent.charAt(0).toUpperCase() + d.agent.slice(1);
                setTranscript(prev => [...prev, {
                  time: formatTime(index * 3 + 1),
                  speaker,
                  text: d.statement
                }]);

                // Move strength toward target proportionally
                const progress = (index + 1) / total;
                const newStrength = 50 + (targetStrength - 50) * progress;
                const noise = (Math.random() - 0.5) * 8;
                setProsecutionStrength(Math.max(5, Math.min(95, newStrength + noise)));

                index++;

                // AWAIT audio — next argument only starts after this one finishes speaking
                await speakElevenLabs(d.statement, speaker);
                
                // Brief pause between arguments before next one
                await new Promise(r => setTimeout(r, 600));
                pushNext();
              } else {
                // Snap to real final value
                setProsecutionStrength(targetStrength);
                if (videoRef.current) videoRef.current.pause();
                setShowStamp(true);
                replayTimeout = setTimeout(() => onHearingComplete(), 1000);
              }
            };
            replayTimeout = setTimeout(pushNext, 1000);
          }

        })
        .catch(console.error);

      // TTS Queue to prevent overlap during live SSE streaming
      let ttsPromise = Promise.resolve();
      
      const eventSource = new EventSource(`/api/investigate/${caseID}/stream`);
      eventSource.addEventListener('adversarial_update', (e) => {
        const payload = JSON.parse(e.data);
        
        // Queue the TTS so it plays sequentially and UI updates synchronously
        ttsPromise = ttsPromise.then(async () => {
          setActiveSpeaker(payload.role);
          
          setTranscript(prev => [...prev, {
            time: formatTime(currentElapsed),
            speaker: payload.role.charAt(0).toUpperCase() + payload.role.slice(1),
            text: payload.statement
          }]);
          if (payload.role === 'prosecutor') setProsecutionStrength(prev => Math.min(95, prev + 15));
          if (payload.role === 'defense') setProsecutionStrength(prev => Math.max(5, prev - 15));
          
          await speakElevenLabs(payload.statement, payload.role);
          await new Promise(r => setTimeout(r, 600)); // Natural gap
          
          setActiveSpeaker(null);
        });
      });
      
      eventSource.addEventListener('verdict_ready', () => {
        // Wait for all queued audio to finish before transitioning
        ttsPromise.then(() => {
          if (videoRef.current) videoRef.current.pause();
          setShowStamp(true);
          setTimeout(() => onHearingComplete(), 1000);
          eventSource.close();
        });
      });

      return () => {
        clearInterval(timer);
        clearTimeout(replayTimeout);
        eventSource.close();
      };
    }
    return () => clearInterval(timer);
  }, [caseID]);


  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1,
          top: 0,
          left: 0
        }}
      >
        <source src="/background/courtroom.mp4" type="video/mp4" />
      </video>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem 4rem', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>

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
            <div className={activeSpeaker === 'prosecutor' ? 'speaking-prosecutor' : ''} style={{
              width: '70px', height: '70px', borderRadius: '50%', border: '2px solid rgba(255,50,50,0.6)',
              margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255,0,0,0.3)', background: 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(0,0,0,0) 100%)'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ff3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h4 style={{ fontFamily: "'Cinzel', serif", color: activeSpeaker === 'prosecutor' ? '#ff3333' : '#d4b872', fontSize: '1.1rem', margin: '0 0 0.75rem 0', letterSpacing: '1px', transition: 'color 0.3s' }}>{t('prosecution')}</h4>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>{t('arguing_phishing')} <span style={{ color: '#ff3333', fontWeight: 600 }}>{t('phishing')}</span></p>
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
              <span>{t('strength')}</span>
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
            <div className={activeSpeaker === 'defense' ? 'speaking-defense' : ''} style={{
              width: '70px', height: '70px', borderRadius: '50%', border: '2px solid rgba(50,150,255,0.6)',
              margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(50,150,255,0.3)', background: 'radial-gradient(circle, rgba(50,150,255,0.2) 0%, rgba(0,0,0,0) 100%)'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3296ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h4 style={{ fontFamily: "'Cinzel', serif", color: activeSpeaker === 'defense' ? '#3296ff' : '#d4b872', fontSize: '1.1rem', margin: '0 0 0.75rem 0', letterSpacing: '1px', transition: 'color 0.3s' }}>{t('defense')}</h4>
            <p style={{ fontFamily: "'Inter', sans-serif", color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>{t('arguing_legitimate')} <span style={{ color: '#3296ff', fontWeight: 600 }}>{t('legitimate')}</span></p>
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
              <span>{t('strength')}</span>
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
            {t('live_argument')}
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
            {t('hearing_transcript')}
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

      {/* Rubber Stamp Overlay */}
      {showStamp && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          pointerEvents: 'none'
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '8rem',
            fontWeight: 800,
            color: verdict === 'PHISHING' ? '#ff3333' : '#2ecc71',
            border: `10px solid ${verdict === 'PHISHING' ? '#ff3333' : '#2ecc71'}`,
            padding: '1rem 3rem',
            borderRadius: '20px',
            transform: 'rotate(-15deg)',
            textShadow: '0 0 30px rgba(0,0,0,0.8)',
            boxShadow: `0 0 50px ${verdict === 'PHISHING' ? 'rgba(255,0,0,0.5)' : 'rgba(46,204,113,0.5)'}, inset 0 0 20px ${verdict === 'PHISHING' ? 'rgba(255,0,0,0.3)' : 'rgba(46,204,113,0.3)'}`,
            animation: 'stampIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            opacity: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(5px)'
          }}>
            {verdict === 'PHISHING' ? 'GUILTY' : 'NOT GUILTY'}
          </div>
          <style>
            {`
              @keyframes stampIn {
                0% { transform: rotate(-15deg) scale(3); opacity: 0; }
                100% { transform: rotate(-15deg) scale(1); opacity: 0.9; }
              }
            `}
          </style>
        </div>
      )}
      <style>
        {`
          @keyframes pulseRed {
            0% { box-shadow: 0 0 20px rgba(255,0,0,0.3); transform: scale(1); }
            50% { box-shadow: 0 0 40px rgba(255,0,0,0.6); transform: scale(1.05); }
            100% { box-shadow: 0 0 20px rgba(255,0,0,0.3); transform: scale(1); }
          }
          @keyframes pulseBlue {
            0% { box-shadow: 0 0 20px rgba(50,150,255,0.3); transform: scale(1); }
            50% { box-shadow: 0 0 40px rgba(50,150,255,0.6); transform: scale(1.05); }
            100% { box-shadow: 0 0 20px rgba(50,150,255,0.3); transform: scale(1); }
          }
        `}
      </style>
    </div>
    </>
  );
}
