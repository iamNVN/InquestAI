import React from 'react';
import LanguageDropdown from './LanguageDropdown';
import { useLanguage } from '../LanguageContext';

const HeaderLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 5px rgba(212, 184, 114, 0.5))' }}>
      <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 L50 5 Z" stroke="#d4b872" strokeWidth="3" fill="transparent" />
      <rect x="48.5" y="25" width="3" height="38" fill="#d4b872" />
      <path d="M43 63 H57" stroke="#d4b872" strokeWidth="2.5" />
      <path d="M46 66 H54" stroke="#d4b872" strokeWidth="2" />
      <path d="M28 35 H72" stroke="#d4b872" strokeWidth="2" />
      <path d="M28 35 L22 52 H34 L28 35 Z" stroke="#d4b872" strokeWidth="1.5" fill="transparent" />
      <path d="M22 52 Q28 58 34 52" stroke="#d4b872" strokeWidth="1.5" fill="transparent" />
      <path d="M72 35 L66 52 H78 L72 35 Z" stroke="#d4b872" strokeWidth="1.5" fill="transparent" />
      <path d="M66 52 Q72 58 78 52" stroke="#d4b872" strokeWidth="1.5" fill="transparent" />
    </svg>
    <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', color: '#d4b872', margin: 0, letterSpacing: '1px', textShadow: '0 0 10px rgba(212, 184, 114, 0.3)' }}>INQUEST</h1>
  </div>
);

// We will use the provided png images for the scale icon

export default function VerdictScreen({ onViewHearing, onGenerateReport, isFinal, verdict = 'guilty' }) {
  const { t } = useLanguage();
  const isGuilty = verdict === 'guilty';
  const iconSrc = isGuilty ? '/background/guilty_scale.png' : '/background/safe_scale.png';
  const glowColor = isGuilty ? 'rgba(255,0,0,0.15)' : 'rgba(46,204,113,0.15)';
  const verdictText = isGuilty ? t('guilty') : t('safe');
  const verdictColor = isGuilty ? '#ff3333' : '#2ecc71';
  const shadowColor = isGuilty ? 'rgba(255, 0, 0, 0.6)' : 'rgba(46, 204, 113, 0.6)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      padding: '2rem'
    }}>

      {/* Top Navigation Bar */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '3rem',
        right: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20
      }}>
        <HeaderLogo />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e0e0e0',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>{t('need_help')}</button>
          <LanguageDropdown />
        </div>
      </div>

      {/* Main Verdict Card */}
      <div style={{
        background: 'rgba(15, 10, 10, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 184, 114, 0.3)',
        borderRadius: '20px',
        padding: '6px',
        width: '100%',
        maxWidth: '750px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(212, 184, 114, 0.05)',
        position: 'relative',
        zIndex: 10,
        marginBottom: '2rem'
      }}>
        <div style={{
          border: '1px solid rgba(212, 184, 114, 0.15)',
          borderRadius: '14px',
          padding: '2rem 2rem 0rem 2rem',
          textAlign: 'center',
          position: 'relative'
        }}>

          {/* Subtle Red Glow at top of card */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '100px',
            background: `radial-gradient(ellipse, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
            pointerEvents: 'none',
            borderRadius: '16px'
          }}></div>

          <img 
            src={iconSrc} 
            alt="Verdict Icon" 
            style={{ 
              width: '110px', 
              height: '110px', 
              objectFit: 'contain', 
              margin: '0 auto 0.5rem auto',
              display: 'block'
            }} 
          />

          <h3 style={{
            fontFamily: "'Cinzel', serif",
            color: '#d4b872',
            fontSize: '1rem',
            letterSpacing: '3px',
            margin: '0 0 0.5rem 0',
            fontWeight: 600
          }}>
            {isFinal ? t('final_judgement') : t('the_court_verdict')}
          </h3>

          <h1 style={{
            fontFamily: "'Cinzel', serif",
            color: verdictColor,
            fontSize: '4.5rem',
            margin: '0 0 1rem 0',
            fontWeight: 600,
            letterSpacing: '2px',
            textShadow: `0 0 25px ${shadowColor}, 0 4px 10px rgba(0,0,0,0.8)`
          }}>
            {verdictText}
          </h1>

          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: 400,
            margin: '0 0 2rem 0'
          }}>
            {t('this_email_is_a')} <span style={{ fontWeight: 600 }}>{isGuilty ? t('phishing_attempt') : t('safe_attempt')}</span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#ccc' }}>{t('confidence')}: 92%</span>
            <div style={{ width: '220px', height: '9px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex', gap: '3px' }}>
              <div style={{ flex: 1, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 1, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 1, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 1, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 1, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 1, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 0.2, height: '100%', background: '#ff3333', boxShadow: '0 0 10px rgba(255,0,0,0.8)' }}></div>
              <div style={{ flex: 0.8, height: '100%', background: 'transparent' }}></div>
            </div>
          </div>

          {/* Reason Box */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(212, 184, 114, 0.15)',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            marginBottom: '2.5rem'
          }}>
            <h4 style={{
              fontFamily: "'Inter', sans-serif",
              color: '#d4b872',
              fontSize: '0.85rem',
              letterSpacing: '2px',
              margin: '0 0 1rem 0'
            }}>
              {t('reason')}
            </h4>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: '#e0e0e0',
              fontSize: '1rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              {isFinal
                ? t('verdict_reason_final')
                : t('verdict_reason_default')}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '750px', zIndex: 10 }}>
        <button
          onClick={onViewHearing}
          style={{
            flex: 1,
            background: 'linear-gradient(180deg, rgba(160, 120, 50, 0.5) 0%, rgba(80, 50, 10, 0.8) 100%)',
            border: '2px solid rgba(212, 184, 114, 0.3)',
            color: '#fff',
            padding: '1.1rem',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.05rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 15px rgba(212, 184, 114, 0.15)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
        >
          {isFinal ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b872" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b872" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 13.5V16.5l-4 4-4-4V13.5"></path><path d="M2 13.5h20"></path><path d="M12 2L12 9"></path><path d="M8 5h8"></path></svg>
          )}
          {isFinal ? t('replay_hearing') : t('view_hearing')}
        </button>

        <button
          onClick={onGenerateReport}
          style={{
            flex: 1,
            background: 'linear-gradient(180deg, rgba(60, 80, 110, 0.5) 0%, rgba(20, 30, 45, 0.8) 100%)',
            backdropFilter: 'blur(4px)',
            border: '2px solid rgba(100, 140, 200, 0.4)',
            color: '#fff',
            padding: '1.1rem',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.05rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0c0e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          {t('generate_report')}
        </button>
      </div>
    </div>
  );
}
