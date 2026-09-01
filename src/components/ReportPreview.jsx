import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

export default function ReportPreview() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="app-container" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, backdropFilter: 'blur(5px)'}}>
      <div className="premium-panel" style={{background: '#f4f1ea', color: '#222', maxWidth: '800px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        <div className="flex-between mb-2" style={{borderBottom: '2px solid #ddd', paddingBottom: '1rem'}}>
          <div className="flex-center" style={{gap: '1rem'}}>
             <div className="logo-icon" style={{borderColor: '#222', color: '#222', margin: 0, width: '50px', height: '50px'}}>⚖</div>
             <div>
               <h2 style={{margin: 0, color: '#222', letterSpacing: '1px'}}>{t('inquest_report')}</h2>
               <p style={{margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#555'}}>{t('ai_investigation_report')}</p>
             </div>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
             <div style={{background: 'var(--red-crimson)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', textAlign: 'center'}}>
               <h3 style={{margin: 0, fontSize: '1.2rem'}}>{t('guilty')}</h3>
               <p style={{margin: 0, fontSize: '0.7rem'}}>{t('stat_phishing')}</p>
             </div>
             <button onClick={() => navigate(-1)} style={{background: 'transparent', border: 'none', fontSize: '1.5rem', color: '#555', cursor: 'pointer'}}>&times;</button>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '3rem', marginTop: '2rem'}}>
          <div style={{flex: 1.5}}>
             <h4 style={{borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', color: '#555', fontSize: '0.9rem', letterSpacing: '1px'}}>{t('summary')}</h4>
             <p style={{fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', fontWeight: 500}}>{t('summary_text')}</p>
             
             <h4 style={{borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', color: '#555', fontSize: '0.9rem', letterSpacing: '1px'}}>{t('key_findings')}</h4>
             <ul style={{listStyle: 'none', fontSize: '0.95rem', lineHeight: '2.5', padding: 0}}>
               <li style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee'}}>
                 <span><span style={{color: 'green', marginRight: '10px'}}>✓</span> {t('finding_1')}</span>
                 <span style={{color: 'var(--red-crimson)'}}>⊗</span>
               </li>
               <li style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee'}}>
                 <span><span style={{color: 'green', marginRight: '10px'}}>✓</span> {t('finding_2')}</span>
                 <span style={{color: 'var(--red-crimson)'}}>⊗</span>
               </li>
               <li style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee'}}>
                 <span><span style={{color: 'green', marginRight: '10px'}}>✓</span> {t('finding_3')}</span>
                 <span style={{color: 'var(--red-crimson)'}}>⊗</span>
               </li>
               <li style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee'}}>
                 <span><span style={{color: 'green', marginRight: '10px'}}>✓</span> {t('finding_4')}</span>
                 <span style={{color: 'var(--red-crimson)'}}>⊗</span>
               </li>
             </ul>
          </div>

          <div style={{flex: 1}}>
             <h4 style={{borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', color: '#555', fontSize: '0.9rem', letterSpacing: '1px'}}>{t('select_language')}</h4>
             <select style={{width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: 'Inter'}}>
               <option>{t('english')}</option>
               <option>{t('hindi')} (Hindi)</option>
               <option>{t('tamil')} (Tamil)</option>
               <option>বাংলা (Bengali)</option>
               <option>मराठी (Marathi)</option>
               <option>తెలుగు (Telugu)</option>
               <option>ಕನ್ನಡ (Kannada)</option>
             </select>

             <h4 style={{borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', color: '#555', fontSize: '0.9rem', letterSpacing: '1px'}}>RECOMMENDATIONS</h4>
             <ul style={{fontSize: '0.9rem', paddingLeft: '1.2rem', lineHeight: '1.8', color: '#444'}}>
               <li>Do not click on any links</li>
               <li>Do not share any personal information</li>
               <li>Report this email to your organization</li>
               <li>If you already clicked, run recovery steps</li>
             </ul>
          </div>
        </div>

        <div className="flex-center mt-2" style={{gap: '1rem', marginTop: '3rem'}}>
           <button style={{background: 'var(--red-crimson)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center'}}>
             📄 {t('download_pdf')}
           </button>
           <button style={{background: '#333', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center'}}>
             📝 {t('download_report')}
           </button>
        </div>
      </div>
    </div>
  );
}
