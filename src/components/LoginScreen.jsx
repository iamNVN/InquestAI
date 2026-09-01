import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import LanguageDropdown from './LanguageDropdown';

export default function LoginScreen() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="animate-fade-in" style={{
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
      position: 'relative'
    }}>
      
      {/* Top Navigation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '2rem 4rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', boxSizing: 'border-box', zIndex: 50 }}>
        <LanguageDropdown />
      </div>

      <div style={{
        background: 'rgba(15, 10, 10, 0.65)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 184, 114, 0.3)',
        borderRadius: '20px',
        padding: '3.5rem 2.5rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(212, 184, 114, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem'
      }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 10px rgba(212, 184, 114, 0.6))' }}>
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
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', color: '#d4b872', margin: 0, letterSpacing: '2px', textShadow: '0 0 10px rgba(212, 184, 114, 0.3)' }}>{t('inquest')}</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#aaa', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('subtitle')}</p>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleLogin}
            style={{
              background: '#fff',
              border: 'none',
              color: '#333',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>
          
          <button 
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ccc',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: 0.8
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="M2 6l10 7 10-7"></path></svg>
            Continue with Outlook
          </button>
        </div>
      </div>
    </div>
  );
}
