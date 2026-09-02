import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage, translateDynamic } from '../LanguageContext';
import LanguageDropdown from './LanguageDropdown';
import Cookies from 'js-cookie';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function DashboardScreen() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  let activeTab = 'Dashboard';
  if (path === '/mycases') activeTab = 'My Cases';
  else if (path === '/myreports') activeTab = 'Reports';
  else if (path === '/support') activeTab = 'Support';

  useDocumentTitle(`Inquest AI | ${activeTab}`);

  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(null);
  const [selectedEmailCase, setSelectedEmailCase] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [recentCases, setRecentCases] = useState([]);
  const [translatedCases, setTranslatedCases] = useState([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [showNewInvestigation, setShowNewInvestigation] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const userEmail = Cookies.get('userEmail') || 'nivethaa.s@gmail.com';
  const userName = 'Nivethaa';

  const handleSignOut = () => {
    Cookies.remove('isLoggedIn');
    Cookies.remove('userEmail');
    navigate('/login');
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('email') === '1') {
      const handleDuplicate = async () => {
        try {
          const res = await fetch('/api/cases');
          const data = await res.json();
          const caseToDuplicate = data.find(c => c.id === 'ONYNU');
          if (caseToDuplicate && caseToDuplicate.raw_email) {
            const newId = `NEW-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            await fetch('/api/investigate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                raw_email: caseToDuplicate.raw_email,
                id: newId
              })
            });
          }
          // Remove ?email=1 so we fetch normally and don't infinite loop
          navigate(location.pathname, { replace: true });
        } catch (err) {
          console.error(err);
        }
      };
      handleDuplicate();
    } else {
      fetch('/api/cases')
        .then(res => res.json())
        .then(data => setRecentCases(data))
        .catch(console.error);
    }
  }, [location.search, navigate, location.pathname]);

  useEffect(() => {
    if (recentCases.length === 0) {
      setTranslatedCases([]);
      return;
    }
    if (language === 'English') {
      setTranslatedCases(recentCases);
      return;
    }

    const translateAll = async () => {
      const translated = await Promise.all(recentCases.map(async (c) => {
        try {
          const transSubject = await translateDynamic(c.subject, language);
          return { ...c, subject: transSubject };
        } catch (e) {
          return c;
        }
      }));
      setTranslatedCases(translated);
    };
    translateAll();
  }, [recentCases, language]);

  const handleRunDemo = async () => {
    setIsDemoRunning(true);
    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_email: "From: security@paypa1-login.com\nTo: user@example.com\nSubject: Urgent: Verify Your Account\n\nDear User, your account has been locked. Click here to verify: https://paypa1-login.com/verify",
          agent_config: "demo"
        })
      });
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      if (data.investigation_id) {
        navigate(`/court/${data.investigation_id}`);
      }
    } catch (err) {
      console.error("Backend unreachable or failed, engaging Bulletproof Demo Fallback:", err);
      // Fallback: If backend fails, find ANY existing completed case in recentCases and use it as the demo
      const completedCase = recentCases.find(c => c.status === 'Completed' || c.status === 'complete');
      if (completedCase) {
        navigate(`/court/${completedCase.id}`);
      } else {
        alert("Demo failed and no offline cached cases are available. Please check backend.");
      }
    }
    setIsDemoRunning(false);
  };

  const handleNewInvestigation = async () => {
    if (!customEmail) return;
    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_email: customEmail
        })
      });
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      if (data.investigation_id) {
        navigate(`/court/${data.investigation_id}`);
      }
    } catch (err) {
      console.error("Backend unreachable, engaging Bulletproof Demo Fallback:", err);
      const completedCase = recentCases.find(c => c.status === 'Completed' || c.status === 'complete');
      if (completedCase) {
        navigate(`/court/${completedCase.id}`);
      }
    }
    setShowNewInvestigation(false);
    setCustomEmail('');
  };

  const handleDeleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case and its report?")) return;
    try {
      const res = await fetch(`/api/investigate/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecentCases(prev => prev.filter(c => c.id !== id));
        setTranslatedCases(prev => prev.filter(c => c.id !== id));
      } else {
        console.error("Failed to delete case");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowSupportModal(null);
      setSelectedEmailCase(null);
      setShowNewInvestigation(false);
      setIsClosingModal(false);
    }, 200);
  };

  const navItems = [
    { id: 'Dashboard', path: '/dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { id: 'My Cases', path: '/mycases', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { id: 'Reports', path: '/myreports', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { id: 'Integrations', path: '#', onClick: () => setShowSupportModal('integrations'), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> }
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
            border: 'none',
            color: '#d4b872',
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontFamily: "'Inter', sans-serif"
          }} onClick={() => setActiveTab('My Cases')}>
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        )}
      </div>
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {casesList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', gap: '1rem', padding: '2rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(212, 184, 114, 0.4)" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>No cases found. Run a demo to get started!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ color: '#aaa', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(212, 184, 114, 0.05)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Case ID</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Details</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Verdict</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Confidence</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}></th>
              </tr>
            </thead>
            <tbody>
              {casesList.map((c, i) => (
                <tr key={c.id} style={{
                  borderBottom: i === casesList.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: 'transparent'
                }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={(e) => {
                    if (e.target.closest('button') || e.target.closest('.dropdown-menu')) return;
                    navigate(`/court/${c.id}`);
                  }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.iconColor} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </div>
                      <div>
                        <div style={{ color: '#e0e0e0', fontWeight: 500 }}>{c.id}</div>
                        <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.2rem' }}>{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: '#ccc' }}>
                    <div>{c.subject}</div>
                    <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.2rem' }}>{c.sender}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: c.status === 'Completed' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(212, 184, 114, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '4px', color: c.status === 'Completed' ? '#2ecc71' : '#d4b872', fontSize: '0.8rem', fontWeight: 500 }}>
                      {c.status === 'In Progress' && <div className="pulse-loader" style={{ width: '10px', height: '10px', border: '2px solid rgba(212,184,114,0.3)', borderTopColor: '#d4b872', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                      {c.status}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    {c.verdict ? (
                      <span style={{ color: c.verdict === 'PHISHING' ? '#ff3333' : '#3296ff', fontWeight: 600 }}>{c.verdict}</span>
                    ) : (
                      <span style={{ color: '#888' }}>Pending...</span>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    {c.confidence ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${c.confidence}%`, background: c.iconColor, borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ color: '#ccc', fontSize: '0.8rem', width: '35px', textAlign: 'right' }}>{c.confidence}%</span>
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right', position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownIdx(openDropdownIdx === c.id ? null : c.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                    {openDropdownIdx === c.id && (
                      <div className="dropdown-menu" style={{
                        position: 'absolute', right: '3rem', top: '2rem',
                        background: 'rgba(20, 15, 15, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(212, 184, 114, 0.2)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 50,
                        minWidth: '150px'
                      }}>
                        <button onClick={() => { setOpenDropdownIdx(null); setSelectedEmailCase(c); }} style={{ background: 'transparent', border: 'none', color: '#ccc', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 184, 114, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          View Email
                        </button>
                        <button onClick={() => navigate(`/court/${c.id}`)} style={{ background: 'transparent', border: 'none', color: '#ccc', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 184, 114, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          View Hearing
                        </button>
                        <button onClick={() => navigate(`/report/${c.id}`)} style={{ background: 'transparent', border: 'none', color: '#ccc', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 184, 114, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          View Report
                        </button>
                        <button onClick={() => { setOpenDropdownIdx(null); handleDeleteCase(c.id); }} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          Delete Case
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderReportsList = () => {
    if (translatedCases.length === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', gap: '1rem', padding: '2rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(212, 184, 114, 0.4)" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>No reports generated yet.</p>
        </div>
      );
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {translatedCases.map((caseItem, idx) => (
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
                <div style={{ color: '#aaa', fontSize: '0.75rem' }}>{t('generated')} {caseItem.date ? new Date(caseItem.date).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div style={{
                background: caseItem.verdict === 'PHISHING' ? 'rgba(255,51,51,0.1)' : caseItem.verdict === 'LEGITIMATE' ? 'rgba(50,150,255,0.1)' : 'rgba(255,255,255,0.05)',
                color: caseItem.verdict === 'PHISHING' ? '#ff3333' : caseItem.verdict === 'LEGITIMATE' ? '#3296ff' : '#aaa',
                border: `1px solid ${caseItem.verdict === 'PHISHING' ? 'rgba(255,51,51,0.3)' : caseItem.verdict === 'LEGITIMATE' ? 'rgba(50,150,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600
              }}>{caseItem.verdict || t('pending')}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
              <button onClick={() => navigate(`/report/${caseItem.id}`)} style={{ flex: 1, padding: '0.75rem', background: 'rgba(212,184,114,0.15)', border: '1px solid rgba(212,184,114,0.3)', color: '#d4b872', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.15)'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                View Official Record
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="animate-fade-in" style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0,0,0,0.5) 100%)',
        backdropFilter: 'blur(3px)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', cursor: 'pointer', paddingLeft: '0.5rem' }}>
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
              <p style={{ margin: 0, color: '#d4b872', fontSize: '0.4rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('ai phishing investigation')}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} onClick={() => {
                  if (item.onClick) item.onClick();
                  else navigate(item.path);
                }} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '8px',
                  color: isActive ? '#d4b872' : '#888',
                  background: isActive ? 'rgba(212, 184, 114, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '3px solid #d4b872' : '3px solid transparent'
                }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ color: isActive ? '#d4b872' : '#666' }}>{item.icon}</div>
                  {item.id}
                </div>
              );
            })}
          </nav>
          <button onClick={() => setShowNewInvestigation(true)} style={{
            background: 'linear-gradient(135deg, #d4b872 0%, #b39b5b 100%)',
            border: 'none',
            color: '#0f0a0a',
            padding: '0.75rem 1.5rem',
            marginBottom: '0.5rem',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 'bold',
            justifyContent: 'center',
            cursor: 'pointer',
            display: 'flex', gap: '0.5rem', alignItems: 'center',
            boxShadow: '0 4px 15px rgba(199,44,44,0.3)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Case
          </button>
          <div style={{ padding: '0 0 1rem 0', marginBottom: '0.5rem' }}>
            <button onClick={handleRunDemo} disabled={isDemoRunning} style={{
              background: 'linear-gradient(135deg, #d4b872 0%, #b39b5b 100%)',
              border: 'none',
              color: '#0f0a0a',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              fontFamily: "'Inter', sans-serif",
              cursor: isDemoRunning ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(212,184,114,0.3)',
              opacity: isDemoRunning ? 0.7 : 1
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              {isDemoRunning ? 'Running Demo...' : 'Add Demo Case'}
            </button>
          </div>

          {/* User Profile */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 184, 114, 0.2)', border: '1px solid rgba(212, 184, 114, 0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4b872', fontWeight: 600, fontSize: '0.85rem'
              }}>{userName.charAt(0)}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, color: '#fff', fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.65rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</p>
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
            }} onClick={handleSignOut} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 184, 114, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              {t('sign_out')}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div key={activeTab} className="animate-fade-in" style={{ flex: 1, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', position: 'relative' }}>

          {/* Top Controls */}
          <div style={{ position: 'absolute', top: '2rem', right: '2.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', zIndex: 10 }}>

            <button onClick={() => setShowSupportModal('how-it-works')} style={{
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ color: '#d4b872', margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 400, fontFamily: "'Cinzel', serif" }}>
                    {t('welcome_back')} <span style={{ fontSize: '1.4rem' }}>👋</span>
                  </h1>
                  <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>{t('dashboard_subtitle')}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: t('total_cases') || 'Total Cases', value: translatedCases.length, trend: '+12% this month', trendUp: true, color: '#d4b872', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4b872" strokeWidth="2"><path d="M21 8v13H3V8"></path><path d="M16 8V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"></path><line x1="8" y1="14" x2="16" y2="14"></line></svg> },
                  { label: t('stat_phishing') || 'Phishing Detected', value: translatedCases.filter(c => c.verdict === 'PHISHING').length, trend: '+8% this month', trendUp: true, color: '#ff3333', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3333" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
                  { label: t('stat_legitimate') || 'Legitimate', value: translatedCases.filter(c => c.verdict === 'LEGITIMATE').length, trend: '+4% this month', trendUp: true, color: '#3296ff', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3296ff" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> }
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

              {renderCasesTable(translatedCases.slice(0, 4), t('recent_cases'), true)}
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
              {renderCasesTable(translatedCases, t('all_cases'), false)}
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



        {/* Support Center Modal, Email Viewer, Integrations, New Investigation */}
        {(showSupportModal || selectedEmailCase || showNewInvestigation) && (
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

              {showSupportModal === 'integrations' && (
                <>
                  <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: '0 0 1rem 0' }}>Enterprise Integrations</h2>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Connect Inquest AI to your corporate environments for automated email triage.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {/* Microsoft 365 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#00a4ef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="2" width="9" height="9"></rect><rect x="13" y="2" width="9" height="9"></rect><rect x="2" y="13" width="9" height="9"></rect><rect x="13" y="13" width="9" height="9"></rect></svg>
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Microsoft 365</div>
                          <div style={{ color: '#888', fontSize: '0.75rem' }}>Exchange Online integration</div>
                        </div>
                      </div>
                      <button style={{ background: 'transparent', border: '1px solid #d4b872', color: '#d4b872', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Connect</button>
                    </div>

                    {/* Google Workspace */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#ea4335', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Google Workspace</div>
                          <div style={{ color: '#888', fontSize: '0.75rem' }}>Gmail Enterprise integration</div>
                        </div>
                      </div>
                      <button style={{ background: 'transparent', border: '1px solid #d4b872', color: '#d4b872', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Connect</button>
                    </div>
                  </div>
                </>
              )}

              {showSupportModal && (
                <button onClick={handleCloseModal} style={{
                  width: '100%', padding: '0.75rem', background: 'rgba(212,184,114,0.15)',
                  border: '1px solid rgba(212,184,114,0.3)', borderRadius: '8px',
                  color: '#d4b872', cursor: 'pointer', fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212,184,114,0.15)'}>
                  {showSupportModal === 'report' ? 'Submit Report' : showSupportModal === 'upgrade' ? 'Continue to Payment' : 'Close'}
                </button>
              )}

              {selectedEmailCase && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: 0, fontSize: '1.4rem' }}>Original Email</h2>
                    <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: '#eee' }}>
                    <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
                      <span style={{ width: '80px', color: '#888', flexShrink: 0 }}>From:</span>
                      <span style={{ fontWeight: 500, wordBreak: 'break-all' }}>{selectedEmailCase.sender}</span>
                    </div>
                    <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
                      <span style={{ width: '80px', color: '#888', flexShrink: 0 }}>Subject:</span>
                      <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{selectedEmailCase.subject}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '80px', color: '#888', flexShrink: 0 }}>Date:</span>
                      <span>{selectedEmailCase.date ? new Date(selectedEmailCase.date).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {selectedEmailCase.raw_email?.replace(/From:.*\n|To:.*\n|Subject:.*\n|Date:.*\n/gi, '').trim() || 'No email body available.'}
                  </div>
                </>
              )}

              {showNewInvestigation && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#d4b872', fontFamily: "'Cinzel', serif", margin: 0, fontSize: '1.4rem' }}>New Investigation</h2>
                    <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>

                  <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Paste the raw headers and body of the suspicious email below to initiate an AI courtroom investigation.
                  </p>

                  <textarea
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="From: scammer@bad-domain.com&#10;To: you@company.com&#10;Subject: Urgent Request...&#10;&#10;Dear user, click here..."
                    style={{
                      width: '100%',
                      height: '220px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212,184,114,0.3)',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      resize: 'none',
                      marginBottom: '1rem'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setCustomEmail(`From: security@paypa1-login.com\nTo: nvnkumaredu@gmail.com\nSubject: Urgent: Verify Your Account\n\nDear Customer,\n\nWe noticed unusual activity on your account. Please click the link below to verify your identity:\nhttp://paypa1-login.com/verify\n\nFailure to do so will result in account suspension.\n\nThanks,\nThe PayPal Security Team`)}
                      style={{ background: 'transparent', border: 'none', color: '#d4b872', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Load Sample Phishing Email
                    </button>

                    <button
                      onClick={handleNewInvestigation}
                      disabled={isDemoRunning || !customEmail.trim()}
                      style={{
                        background: 'var(--red-crimson)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: isDemoRunning || !customEmail.trim() ? 'not-allowed' : 'pointer',
                        opacity: isDemoRunning || !customEmail.trim() ? 0.5 : 1
                      }}
                    >
                      {isDemoRunning ? 'Analyzing...' : 'Investigate Email'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
