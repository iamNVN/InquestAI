import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import LanguageDropdown from './LanguageDropdown';

export default function DashboardScreen({ onBack, onSignOut }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  const path = location.pathname;
  let activeTab = 'Dashboard';
  if (path === '/mycases') activeTab = 'My Cases';
  else if (path === '/myreports') activeTab = 'Reports';
  else if (path === '/support') activeTab = 'Support';

  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowSupportModal(null);
      setIsClosingModal(false);
    }, 200);
  };

  const navItems = [
    { id: 'Dashboard', path: '/dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { id: 'My Cases', path: '/mycases', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { id: 'Reports', path: '/myreports', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { id: 'Support', path: '/support', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> }
  ];

  const recentCases = [
    { id: 'CASE-24-0519', date: 'May 19, 2025', subject: 'Urgent: Verify Your Account', sender: 'security@update-alert.com', status: 'Completed', verdict: 'PHISHING', confidence: 92, iconColor: '#ff3333' },
    { id: 'CASE-24-0518', date: 'May 18, 2025', subject: 'Invoice Attached', sender: 'billing@company.com', status: 'Completed', verdict: 'LEGITIMATE', confidence: 78, iconColor: '#3296ff' },
    { id: 'CASE-24-0517', date: 'May 17, 2025', subject: 'Update Your Password', sender: 'admin@secure-login.net', status: 'Completed', verdict: 'PHISHING', confidence: 96, iconColor: '#ff3333' },
    { id: 'CASE-24-0516', date: 'May 16, 2025', subject: 'Meeting Schedule', sender: 'hr@company.com', status: 'Completed', verdict: 'LEGITIMATE', confidence: 65, iconColor: '#d4b872' },
    { id: 'CASE-24-0515', date: 'May 15, 2025', subject: 'Your Payment Failed', sender: 'billing@secure-pay.net', status: 'In Progress', verdict: null, confidence: null, iconColor: '#ff3333' },
  ];

  const renderCasesTable = (casesList, title, showViewAll) => (
    <div style={{
      flex: 1,
      background: 'rgba(15, 10, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(212,184,114,0.15)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#d4b872', margin: 0, fontSize: '1rem', fontWeight: 500, fontFamily: "'Cinzel', serif" }}>{title}</h3>
        {showViewAll && (
          <button style={{
            background: 'transparent',
            border: '1px solid rgba(212,184,114,0.3)',
            color: '#d4b872',
            padding: '0.35rem 0.6rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }} onClick={() => navigate('/mycases')} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            {t('view_all_cases')}
          </button>
        )}
      </div>

      <div style={{ padding: '0.75rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '45px 140px 2fr 120px 150px 120px 40px', padding: '0.25rem 0.75rem', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          <div></div>
          <div>{t('case_id')}</div>
          <div>{t('subject_sender')}</div>
          <div>{t('verdict_table')}</div>
          <div>{t('confidence_table')}</div>
          <div>{t('last_updated')}</div>
          <div></div>
        </div>

        {casesList.map((caseItem, idx) => (
          <div key={idx} style={{
            display: 'grid',
            gridTemplateColumns: '45px 140px 2fr 120px 150px 120px 40px',
            alignItems: 'center',
            padding: '0.6rem 0.75rem',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${caseItem.iconColor}40`, background: `${caseItem.iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {caseItem.verdict === 'PHISHING' || caseItem.iconColor === '#ff3333' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={caseItem.iconColor} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path></svg>
              ) : caseItem.verdict === 'LEGITIMATE' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={caseItem.iconColor} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={caseItem.iconColor} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              )}
            </div>
            <div>
              <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '0.15rem' }}>{caseItem.id}</div>
              <div style={{ color: '#666', fontSize: '0.7rem' }}>{caseItem.date}</div>
            </div>
            <div style={{ paddingRight: '1rem' }}>
              <div style={{ color: '#fff', fontSize: '0.8rem', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{caseItem.subject}</div>
              <div style={{ color: '#888', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{caseItem.sender}</div>
            </div>
            <div style={{ color: caseItem.verdict === 'PHISHING' ? '#ff3333' : caseItem.verdict === 'LEGITIMATE' ? '#3296ff' : '#666', fontSize: '0.7rem', fontWeight: 600 }}>
              {caseItem.verdict || '---'}
            </div>
            <div>
              {caseItem.confidence ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#ccc', fontSize: '0.75rem' }}>{caseItem.confidence}%</span>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', maxWidth: '60px' }}>
                    <div style={{ width: `${caseItem.confidence}%`, height: '100%', background: caseItem.verdict === 'PHISHING' ? '#ff3333' : '#3296ff' }}></div>
                  </div>
                </div>
              ) : (
                <span style={{ color: '#666', fontSize: '0.75rem' }}>---</span>
              )}
            </div>
            <div>
              <div style={{ color: '#aaa', fontSize: '0.7rem', marginBottom: '0.1rem' }}>{caseItem.date}</div>
              <div style={{ color: '#666', fontSize: '0.65rem' }}>{idx === 0 ? '10:30 AM' : idx === 1 ? '04:15 PM' : idx === 2 ? '09:45 AM' : idx === 3 ? '02:20 PM' : '11:05 AM'}</div>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
              {openDropdownIdx === idx && (
                <div style={{ position: 'absolute', right: '0', top: '20px', background: 'rgba(20,15,10,0.95)', border: '1px solid rgba(212,184,114,0.3)', borderRadius: '8px', zIndex: 50, boxShadow: '0 5px 15px rgba(0,0,0,0.5)', minWidth: '130px', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <button onClick={() => { setOpenDropdownIdx(null); navigate(`/court/${caseItem.id}`); }} style={{ background: 'transparent', border: 'none', color: '#ddd', padding: '0.4rem 0.6rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem', borderRadius: '4px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>{t('view_hearing')}</button>
                  <button onClick={() => { setOpenDropdownIdx(null); navigate(`/report/${caseItem.id}`); }} style={{ background: 'transparent', border: 'none', color: '#ddd', padding: '0.4rem 0.6rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem', borderRadius: '4px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>{t('view_report')}</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button style={{ width: '26px', height: '26px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#666', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;</button>
        <button style={{ width: '26px', height: '26px', background: 'rgba(212,184,114,0.15)', border: '1px solid rgba(212,184,114,0.3)', color: '#d4b872', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</button>
        <button style={{ width: '26px', height: '26px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#888', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</button>
        <button style={{ width: '26px', height: '26px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#666', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&gt;</button>
      </div>
    </div>
  );

  const renderReportsList = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
      {recentCases.map((caseItem, idx) => (
        <div key={idx} style={{
          background: 'rgba(15, 10, 10, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212,184,114,0.2)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#d4b872', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>{caseItem.id} {t('final_report')}</div>
              <div style={{ color: '#aaa', fontSize: '0.75rem' }}>{t('generated')} {caseItem.date}</div>
            </div>
            <div style={{
              background: caseItem.verdict === 'PHISHING' ? 'rgba(255,51,51,0.1)' : caseItem.verdict === 'LEGITIMATE' ? 'rgba(50,150,255,0.1)' : 'rgba(255,255,255,0.05)',
              color: caseItem.verdict === 'PHISHING' ? '#ff3333' : caseItem.verdict === 'LEGITIMATE' ? '#3296ff' : '#aaa',
              border: `1px solid ${caseItem.verdict === 'PHISHING' ? 'rgba(255,51,51,0.3)' : caseItem.verdict === 'LEGITIMATE' ? 'rgba(50,150,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
              padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600
            }}>{caseItem.verdict || t('pending')}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button onClick={() => navigate(`/report/${caseItem.id}`)} style={{ flex: 1, padding: '0.6rem', background: 'rgba(212,184,114,0.15)', border: '1px solid rgba(212,184,114,0.3)', color: '#d4b872', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.15)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {t('preview')}
            </button>
            <button style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {t('download_pdf')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSupportForm = () => (
    <div style={{
      flex: 1,
      background: 'rgba(15, 10, 10, 0.75)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(212,184,114,0.2)',
      borderRadius: '16px',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      overflowY: 'auto'
    }}>
      <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{t('report_issue')}</h2>
      <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '2.5rem' }}>{t('report_issue_desc')}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
        <div>
          <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.6rem' }}>{t('issue_type')}</label>
          <select style={{ width: '100%', padding: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}>
            <option>{t('incorrect_verdict')}</option>
            <option>{t('system_bug')}</option>
            <option>{t('feature_request')}</option>
            <option>{t('other')}</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.6rem' }}>{t('case_id_optional')}</label>
          <input type="text" placeholder="e.g. CASE-24-0519" style={{ width: '100%', padding: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.6rem' }}>{t('description')}</label>
          <textarea placeholder={t('describe_problem')} style={{ width: '100%', height: '160px', padding: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', resize: 'none', outline: 'none' }}></textarea>
        </div>
        <button style={{
          alignSelf: 'flex-start',
          background: 'linear-gradient(90deg, #b89547 0%, #d4b872 50%, #e8d08c 100%)',
          border: 'none',
          color: '#111',
          padding: '0.85rem 2rem',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(212,184,114,0.3)',
          marginTop: '1rem',
          transition: 'all 0.2s'
        }} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}>
          {t('submit_ticket')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes slideDown {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(20px) scale(0.95); }
          }
        `}
      </style>
      <div className="animate-fade-in" style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0,0,0,0.5) 100%)', // Lighter top, darker bottom
        backdropFilter: 'blur(3px)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden' // strictly 100vh
      }}>
        {/* LEFT SIDEBAR */}
        <div style={{
          width: '240px',
          background: 'linear-gradient(180deg, rgba(15, 10, 5, 0.95) 0%, rgba(5, 5, 5, 0.98) 100%)',
          borderRight: '1px solid rgba(212, 184, 114, 0.1)',
          padding: '2rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0,0,0,0.8)'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', cursor: 'pointer', paddingLeft: '0.5rem' }} onClick={onBack}>
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 5px rgba(212, 184, 114, 0.3))' }}>
              <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 L50 5 Z" stroke="#d4b872" strokeWidth="3" fill="transparent" />
              <path d="M50 10 L80 23 V50 C80 71 50 88 50 88 C50 88 20 71 20 50 V23 L50 10 Z" stroke="#d4b872" strokeWidth="1" fill="transparent" />
              <rect x="48.5" y="25" width="3" height="38" fill="#d4b872" />
              <path d="M43 63 H57" stroke="#d4b872" strokeWidth="3" />
              <path d="M46 66 H54" stroke="#d4b872" strokeWidth="2.5" />
              <path d="M28 35 H72" stroke="#d4b872" strokeWidth="2.5" />
            </svg>
            <div>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: '#d4b872', margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>INQUEST</h2>
              <p style={{ margin: 0, color: '#d4b872', fontSize: '0.4rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('ai_phishing_investigation')}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map(navItem => (
              <Link
                key={navItem.id}
                to={navItem.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.8rem 1rem',
                  background: activeTab === navItem.id ? 'linear-gradient(90deg, rgba(212,184,114,0.15) 0%, rgba(212,184,114,0) 100%)' : 'transparent',
                  borderLeft: activeTab === navItem.id ? '3px solid #d4b872' : '3px solid transparent',
                  color: activeTab === navItem.id ? '#d4b872' : '#999',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => { if (activeTab !== navItem.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#ddd'; } }}
                onMouseOut={(e) => { if (activeTab !== navItem.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#999'; } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1rem', color: '#d4b872' }}>{navItem.icon}</span>
                  <span style={{ fontWeight: 500 }}>{t(navItem.id.toLowerCase().replace(' ', '_'))}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 0.75rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 184, 114, 0.2)', border: '1px solid rgba(212, 184, 114, 0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4b872', fontWeight: 600, fontSize: '0.85rem'
              }}>N</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, color: '#fff', fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Nivethaa S.</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.65rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>nivethaa.s@gmail.com</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(212, 184, 114, 0.2)',
              borderRadius: '8px',
              color: '#d4b872',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
              justifyContent: 'center'
            }} onClick={onSignOut || onBack} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 184, 114, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              {t('sign_out')}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div key={activeTab} className="animate-fade-in" style={{ flex: 1, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', position: 'relative' }}>

          {/* Top Controls */}
          <div style={{ position: 'absolute', top: '2rem', right: '2.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
            }}>
              {t('need_help')}
            </button>
            <LanguageDropdown />
          </div>

          {activeTab === 'Dashboard' && (
            <>
              <div>
                <h1 style={{ color: '#d4b872', margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 400, fontFamily: "'Cinzel', serif" }}>
                  {t('welcome_back')} <span style={{ fontSize: '1.4rem' }}>👋</span>
                </h1>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>{t('dashboard_subtitle')}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: t('total_cases'), value: '24', trend: t('stat_trend_month'), trendUp: true, color: '#d4b872', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b872" strokeWidth="2"><path d="M21 8v13H3V8"></path><path d="M16 8V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"></path><line x1="8" y1="14" x2="16" y2="14"></line></svg> },
                  { label: t('stat_phishing'), value: '14', trend: t('stat_trend_month'), trendUp: true, color: '#ff3333', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3333" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
                  { label: t('stat_legitimate'), value: '10', trend: t('stat_trend_month'), trendUp: true, color: '#3296ff', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3296ff" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> }
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'rgba(15, 10, 10, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid rgba(212,184,114,0.15)`,
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${stat.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'none' }}>{stat.label}</div>
                        <div style={{ color: stat.color === '#d4b872' ? '#fff' : stat.color, fontSize: '1.6rem', fontWeight: 500, lineHeight: 1 }}>{stat.value}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b872" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                      {stat.trend}
                    </div>
                  </div>
                ))}
              </div>

              {renderCasesTable(recentCases, t('recent_cases'), true)}
            </>
          )}

          {activeTab === 'My Cases' && (
            <>
              <div>
                <h1 style={{ color: '#d4b872', margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 400, fontFamily: "'Cinzel', serif" }}>
                  {t('my_cases')}
                </h1>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>{t('my_cases_subtitle')}</p>
              </div>
              {renderCasesTable(recentCases, t('all_cases'), false)}
            </>
          )}

          {activeTab === 'Reports' && (
            <>
              <div>
                <h1 style={{ color: '#d4b872', margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 400, fontFamily: "'Cinzel', serif" }}>
                  {t('reports')}
                </h1>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>{t('reports_subtitle')}</p>
              </div>
              {renderReportsList()}
            </>
          )}

          {activeTab === 'Support' && (
            <>
              <div>
                <h1 style={{ color: '#d4b872', margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 400, fontFamily: "'Cinzel', serif" }}>
                  {t('support')}
                </h1>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>{t('support_subtitle')}</p>
              </div>
              {renderSupportForm()}
            </>
          )}

        </div>



        {/* Support Center Modal */}
        {showSupportModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
            animation: isClosingModal ? 'fadeOut 0.2s ease-in forwards' : 'fadeIn 0.2s ease-out'
          }} onClick={handleCloseModal}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(25,20,15,0.95) 0%, rgba(10,5,5,0.98) 100%)',
              border: '1px solid rgba(212, 184, 114, 0.3)',
              borderRadius: '16px', padding: '2.5rem',
              width: '450px', maxWidth: '90%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              position: 'relative',
              animation: isClosingModal ? 'slideDown 0.2s cubic-bezier(0.4, 0, 1, 1) forwards' : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={(e) => e.stopPropagation()}>

              {showSupportModal === 'how-it-works' && (
                <>
                  <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: '0 0 1rem 0' }}>How It Works</h2>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Inquest AI analyzes your incoming emails in real-time. By utilizing advanced natural language processing and metadata analysis, our engine evaluates the intent and origin of each message.
                  </p>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                    Suspicious emails are flagged as <span style={{ color: '#ff3333', fontWeight: 'bold' }}>PHISHING</span> with a confidence score, and a full mock courtroom hearing is generated to explain the verdict.
                  </p>
                </>
              )}

              {showSupportModal === 'contact' && (
                <>
                  <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: '0 0 1rem 0' }}>Contact Support</h2>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Our AI experts are available 24/7 to assist with your investigations.
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '0.85rem' }}>Email: <span style={{ color: '#d4b872' }}>support@inquest.ai</span></p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '0.85rem' }}>Phone: <span style={{ color: '#d4b872' }}>+1 (800) 555-0199</span></p>
                    <p style={{ margin: 0, color: '#fff', fontSize: '0.85rem' }}>Live Chat: <span style={{ color: '#d4b872' }}>Available in Dashboard</span></p>
                  </div>
                </>
              )}

              {showSupportModal === 'report' && (
                <>
                  <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: '0 0 1rem 0' }}>Report an Issue</h2>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Found a bug or disagree with a verdict? Let us know so we can improve the AI engine.
                  </p>
                  <textarea
                    placeholder="Describe the issue you encountered..."
                    style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '0.75rem', marginBottom: '2rem', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', resize: 'none' }}
                  />
                </>
              )}

              {showSupportModal === 'upgrade' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4b872" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: 0 }}>Inquest Pro</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                    {[
                      { title: 'Unlimited Investigations', desc: 'Scan and verify unlimited emails daily.' },
                      { title: 'Advanced AI Engine', desc: 'Access to the latest GPT-4o powered courtroom analysis.' },
                      { title: 'Priority 24/7 Support', desc: 'Direct line to our human experts.' },
                      { title: 'Custom API Access', desc: 'Integrate Inquest directly into your workflow.' }
                    ].map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" style={{ marginTop: '2px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <div>
                          <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.15rem' }}>{feat.title}</div>
                          <div style={{ color: '#aaa', fontSize: '0.75rem' }}>{feat.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button onClick={handleCloseModal} style={{
                width: '100%', padding: '0.75rem', background: 'rgba(212,184,114,0.15)',
                border: '1px solid rgba(212,184,114,0.3)', borderRadius: '8px',
                color: '#d4b872', cursor: 'pointer', fontSize: '0.9rem',
                transition: 'all 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.15)'}>
                {showSupportModal === 'report' ? 'Submit Report' : showSupportModal === 'upgrade' ? 'Continue to Payment' : 'Close'}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
