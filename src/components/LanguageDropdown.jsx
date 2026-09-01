import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { language: selectedLang, setLanguage: setSelectedLang, t } = useLanguage();
  const dropdownRef = useRef(null);

  const languages = [
    'English',
    'Tamil',
    'Hindi',
    'Malayalam',
    'Telugu',
    'Kannada',
    'Marathi',
    'Bengali'
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#e0e0e0',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s',
          height: '100%'
        }}
      >
        {selectedLang}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'rgba(15, 10, 10, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 184, 114, 0.2)',
          borderRadius: '8px',
          padding: '0.5rem',
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          zIndex: 100,
          maxHeight: '300px',
          overflowY: 'auto'
        }} className="custom-scrollbar">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => { setSelectedLang(lang); setIsOpen(false); }}
              style={{
                background: selectedLang === lang ? 'rgba(212, 184, 114, 0.15)' : 'transparent',
                border: 'none',
                color: selectedLang === lang ? '#d4b872' : '#ccc',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (selectedLang !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={(e) => { if (selectedLang !== lang) e.currentTarget.style.background = 'transparent' }}
            >
              {lang}
            </button>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
          <div style={{
            color: '#666',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontFamily: "'Inter', sans-serif",
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            {t('more_languages')}
          </div>
        </div>
      )}
    </div>
  );
}
