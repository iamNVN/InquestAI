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

export default function VerdictScreen({ onViewHearing, onGenerateReport, isFinal, verdict = 'guilty', confidence, reason }) {
  const { t } = useLanguage();
  const isPending = verdict === 'pending';
  const isGuilty = verdict === 'guilty';
  const iconSrc = isPending ? '' : (isGuilty ? '/background/guilty_scale.png' : '/background/safe_scale.png');
  const glowColor = isPending ? 'rgba(212,184,114,0.15)' : (isGuilty ? 'rgba(255,0,0,0.15)' : 'rgba(46,204,113,0.15)');
  const verdictText = isPending ? 'Hearing in Progress...' : (isGuilty ? t('guilty') : t('safe'));
  const verdictColor = isPending ? '#d4b872' : (isGuilty ? '#ff3333' : '#2ecc71');
  const shadowColor = isPending ? 'rgba(212, 184, 114, 0.6)' : (isGuilty ? 'rgba(255, 0, 0, 0.6)' : 'rgba(46, 204, 113, 0.6)');

  return (
    <>
      <video
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
        <source src="/background/2.mp4" type="video/mp4" />
      </video>
      <div className="animate-fade-in" style={{
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
          background: 'rgba(0, 0, 0, 0.5)',
          // backdropFilter: 'blur(24px)',
          // WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212, 184, 114, 0.35)',
          borderRadius: '20px',
          padding: '6px',
          width: '100%',
          maxWidth: '750px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(212, 184, 114, 0.05)',
          position: 'relative',
          zIndex: 10,
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'transparent',
            border: '1px solid rgba(212, 184, 114, 0.12)',
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

            {isPending ? (
              <div style={{ padding: '2rem 0' }}>
                <div className="pulse-loader" style={{ margin: '0 auto', width: '50px', height: '50px', border: '3px solid rgba(212,184,114,0.2)', borderTopColor: '#d4b872', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <img
                src={iconSrc}
                alt="Scale"
                style={{
                  height: '140px',
                  objectFit: 'contain',
                  filter: `drop-shadow(0 10px 20px ${shadowColor})`,
                  animation: 'float 4s ease-in-out infinite'
                }}
              />
            )}

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

            {/* Only show verdict details when NOT pending */}
            {!isPending && (
              <>
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
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#ccc' }}>{t('confidence')}: {confidence ?? 92}%</span>
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
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 184, 114, 0.2)',
                  borderRadius: '12px',
                  padding: '1.75rem 2rem',
                  marginBottom: '2.5rem'
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#d4b872',
                    fontSize: '0.85rem',
                    letterSpacing: '2px',
                    marginBottom: '0.75rem',
                    fontWeight: 600
                  }}>{t('reason')}</div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#e0e0e0',
                    fontSize: '0.95rem',
                    lineHeight: 1.6
                  }}>
                    {reason || t('verdict_reason_default')}
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '750px', zIndex: 10 }}>
          <button
            onClick={onViewHearing}
            disabled={isPending}
            style={{
              flex: 1,
              background: isPending ? 'rgba(30,30,30,0.8)' : 'rgba(100, 66, 39, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(212, 184, 114, 0.6)',
              color: isPending ? '#888' : '#fff',
              padding: '1.1rem',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if (!isPending) e.currentTarget.style.filter = 'brightness(1.2)' }}
            onMouseOut={(e) => { if (!isPending) e.currentTarget.style.filter = 'brightness(1)' }}
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
            disabled={isPending}
            style={{
              flex: 1,
              background: isPending ? 'rgba(20,25,35,0.7)' : 'rgba(30, 50, 80, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(100, 140, 200, 0.6)',
              color: isPending ? '#555' : '#fff',
              padding: '1.1rem',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if (!isPending) e.currentTarget.style.filter = 'brightness(1.2)'}}
            onMouseOut={(e) => { if (!isPending) e.currentTarget.style.filter = 'brightness(1)'}}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isPending ? "#555" : "#a0c0e0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {t('generate_report')}
          </button>
        </div>
      </div>
    </>
  );
}
