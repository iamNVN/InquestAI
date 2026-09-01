import React, { useState } from 'react';
import LanguageDropdown from './LanguageDropdown';

const ShieldScaleLogo = () => (
  <svg width="65" height="65" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.75rem', filter: 'drop-shadow(0px 0px 10px rgba(212, 184, 114, 0.4))' }}>
    {/* Outer Shield */}
    <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 L50 5 Z" stroke="#d4b872" strokeWidth="2.5" fill="transparent" />
    <path d="M50 10 L80 23 V50 C80 71 50 88 50 88 C50 88 20 71 20 50 V23 L50 10 Z" stroke="#d4b872" strokeWidth="1" fill="transparent" />
    {/* Scale Pillar */}
    <rect x="48.5" y="25" width="3" height="38" fill="#d4b872" />
    <path d="M43 63 H57" stroke="#d4b872" strokeWidth="2.5" />
    <path d="M46 66 H54" stroke="#d4b872" strokeWidth="2" />
    {/* Beam */}
    <path d="M28 35 H72" stroke="#d4b872" strokeWidth="2" />
    {/* Left Scale */}
    <path d="M28 35 L22 52 H34 L28 35 Z" stroke="#d4b872" strokeWidth="1" fill="transparent" />
    <path d="M22 52 Q28 58 34 52" stroke="#d4b872" strokeWidth="1.5" fill="transparent" />
    {/* Right Scale */}
    <path d="M72 35 L66 52 H78 L72 35 Z" stroke="#d4b872" strokeWidth="1" fill="transparent" />
    <path d="M66 52 Q72 58 78 52" stroke="#d4b872" strokeWidth="1.5" fill="transparent" />
  </svg>
);

const FeatureItem = ({ icon, title, description }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
    padding: '0 1rem'
  }}>
    <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '1px solid rgba(212, 184, 114, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <span style={{ color: '#d4b872', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
    </div>
    <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#f0f0f0', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{title}</h4>
    <p style={{ fontFamily: 'Inter, sans-serif', color: '#888', fontSize: '0.75rem', lineHeight: '1.4', maxWidth: '200px', margin: '0 auto' }}>{description}</p>
  </div>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export default function LandingScreen({ onForward }) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      padding: '2rem',
      textAlign: 'center',
      zIndex: 10,
      position: 'relative',
      background: 'radial-gradient(circle at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)'
    }}>

      {/* Top Navigation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '2rem 4rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', boxSizing: 'border-box', zIndex: 50 }}>
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
        }}>Dashboard</button>
        <LanguageDropdown />
      </div>

      {/* Top Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', marginTop: '5rem' }}>
        <ShieldScaleLogo />
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '2.8rem',
          color: '#d4b872',
          margin: '0 0 0.3rem 0',
          letterSpacing: '1px',
          textShadow: '0 0 25px rgba(212, 184, 114, 0.4), 0 2px 5px rgba(0,0,0,0.8)',
          fontWeight: 600
        }}>
          INQUEST
        </h1>
        <h4 style={{
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '4px',
          color: '#c4a867',
          fontSize: '0.7rem',
          margin: 0,
          fontWeight: 600,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)'
        }}>
          AI PHISHING INVESTIGATION
        </h4>
      </div>

      {/* Main Content Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
        <h2 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '2rem',
          color: '#ffffff',
          marginBottom: '0.75rem',
          fontWeight: 400,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap'
        }}>
          Forward. We investigate. You stay safe.
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          color: '#ccc',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)'
        }}>
          Forward any suspicious email to our secure address.
        </p>

        {/* Email Box */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(20,15,5,0.7) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212, 184, 114, 0.5)',
          borderRadius: '12px',
          padding: '1.75rem 2.5rem',
          width: '100%',
          maxWidth: '650px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(212, 184, 114, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: '#aaa',
            letterSpacing: '1px',
            marginBottom: '0.75rem',
            fontWeight: 600
          }}>
            OUR COURTROOM EMAIL
          </p>
          <h3 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.8rem',
            color: '#ffffff',
            marginBottom: '1.5rem',
            fontWeight: 300,
            letterSpacing: '0.5px'
          }}>
            courtroom@inquest.ai
          </h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText('courtroom@inquest.ai');
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            style={{
              background: copied ? 'rgba(212, 184, 114, 0.2)' : 'rgba(0,0,0,0.4)',
              border: copied ? '1px solid rgba(212, 184, 114, 0.8)' : '1px solid rgba(212, 184, 114, 0.3)',
              color: '#d4b872',
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: copied ? '0 0 15px rgba(212, 184, 114, 0.4)' : '0 2px 10px rgba(0,0,0,0.3)',
              minWidth: '160px'
            }}
            onMouseOver={(e) => {
              if (copied) return;
              e.currentTarget.style.background = 'rgba(212, 184, 114, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(212, 184, 114, 0.6)';
            }}
            onMouseOut={(e) => {
              if (copied) return;
              e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
              e.currentTarget.style.borderColor = 'rgba(212, 184, 114, 0.3)';
            }}
          >
            {copied ? (
              <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Copied!
              </span>
            ) : (
              <>
                <CopyIcon />
                Copy Email Address
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2.5rem',
        maxWidth: '800px',
        width: '100%',
        marginBottom: '2.5rem',
        padding: '2rem',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 70%)'
      }}>
        <FeatureItem
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
          title="Reads emails in real-time"
          description="Instant analysis begins the moment we receive it."
        />
        <FeatureItem
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
          title="Courtroom-style verdict"
          description="Every claim is argued. Every verdict is justified."
        />
        <FeatureItem
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
          title="Reports in your language"
          description="Get clear reports in multiple languages."
        />
      </div>

      {/* Footer Note */}
      {/* <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100vw',
        background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 100%)',
        backdropFilter: 'blur(2px)',
        padding: '1rem 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#999',
        fontSize: '0.85rem',
        gap: '0.5rem',
        textShadow: '0 1px 2px rgba(0,0,0,1)'
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          border: '1px solid #999',
          borderRadius: '50%',
          fontSize: '0.65rem',
          fontWeight: 'bold',
          color: '#bbb'
        }}>
          i
        </span>
        <span style={{ letterSpacing: '0.5px' }}>You can also reply to the email with more information.</span>
      </div> */}

    </div>
  );
}
