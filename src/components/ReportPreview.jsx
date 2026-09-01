import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

export default function ReportPreview() {
  const navigate = useNavigate();
  const { reportID } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    if (reportID) {
      fetch(`/api/investigate/${reportID}`)
        .then(res => res.json())
        .then(data => {
          if (!data.raw_email) {
            // Fallback for outdated running server that doesn't return raw_email in investigate endpoint
            fetch('/api/cases')
              .then(r => r.json())
              .then(cases => {
                const c = cases.find(x => x.id === reportID);
                setReportData({ ...data, raw_email: c ? c.raw_email : null });
              })
              .catch(() => setReportData(data));
          } else {
            setReportData(data);
          }
        })
        .catch(console.error);
    }
  }, [reportID]);

  // Use margins inside html2pdf, meaning the element should fill the width without internal padding
  const generatePDFOpt = () => ({
    margin:       10,
    filename:     `INQUEST_CASE_${reportID}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 800 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'legacy'] }
  });

  useEffect(() => {
    if (reportData && reportRef.current && !isGenerating) {
      handleOpenPdfNewTab();
    }
  }, [reportData]);

  const handleOpenPdfNewTab = () => {
    if (!reportData || !reportRef.current) return;
    setIsGenerating(true);
    const element = reportRef.current;
    
    html2pdf().set(generatePDFOpt()).from(element).outputPdf('blob').then(blob => {
      const url = URL.createObjectURL(blob);
      const pdfWindow = window.open(url, '_blank');
      if (!pdfWindow) {
        // Fallback if popup blocked
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setIsGenerating(false);
      // Immediately navigate back to the previous screen!
      navigate(-1);
    });
  };

  const handleDownload = () => {
    if (!reportData || !reportRef.current) return;
    setIsGenerating(true);
    const element = reportRef.current;
    
    html2pdf().set(generatePDFOpt()).from(element).save().then(() => {
      setIsGenerating(false);
    });
  };

  if (!reportData) return <div className="app-container" style={{ background: '#f4f1ea' }}>Loading...</div>;

  const isPhishing = reportData.verdict?.result === 'PHISHING' || reportData.verdict?.verdict === 'PHISHING';
  const confidenceStr = reportData.verdict?.confidence || 'HIGH';
  let confidence = confidenceStr;
  if (!isNaN(parseFloat(confidenceStr))) {
    confidence = parseFloat(confidenceStr) + '%';
  } else if (confidenceStr === 'HIGH') {
    confidence = 'HIGH';
  }
  const riskLevel = reportData.verdict?.risk_level || (isPhishing ? 'HIGH RISK' : 'LOW RISK');

  // Extract from raw email
  let sender = 'Unknown Sender';
  let subject = 'No Subject Provided';
  let url = 'N/A';
  
  if (reportData.raw_email) {
    const fromMatch = reportData.raw_email.match(/From:\s*(.*)/i);
    const subMatch = reportData.raw_email.match(/Subject:\s*(.*)/i);
    const urlMatch = reportData.raw_email.match(/https?:\/\/[^\s]+/i);
    if (fromMatch) sender = fromMatch[1];
    if (subMatch) subject = subMatch[1];
    if (urlMatch) url = urlMatch[0];
  }

  const primaryIndicator = reportData.verdict?.iocs?.[0] || (isPhishing ? 'Suspicious language & routing anomalies' : 'Verified sender authentication');
  
  // Dialogues mapping with robust fallbacks
  const prosecutionFallback = "The AI Prosecutor has reviewed the email headers, structural elements, and language patterns, concluding that the message exhibits characteristics consistent with a targeted phishing campaign designed to extract credentials.";
  const defenseFallback = "The Defense notes that urgent language and lookalike domains can sometimes be artifacts of legitimate third-party marketing services or misconfigured internal alerts. Further corroboration is required.";
  const judgeFallback = isPhishing 
    ? "The court finds that the preponderance of evidence—including suspicious URL routing and urgency markers—substantiates a malicious intent. The sender domain lacks sufficient reputation to override these indicators."
    : "The court determines that despite some irregular routing indicators, the communication aligns with known legitimate patterns for this sender. The risk is deemed acceptable.";

  const prosecutionStr = (reportData.dialogues && reportData.dialogues.length > 0) ? (reportData.dialogues.filter(d => d.agent === 'prosecutor').map(d => d.statement).join(' ') || prosecutionFallback) : prosecutionFallback;
  const defenseStr = (reportData.dialogues && reportData.dialogues.length > 0) ? (reportData.dialogues.filter(d => d.agent === 'defense').map(d => d.statement).join(' ') || defenseFallback) : defenseFallback;
  const judgeStr = (reportData.dialogues && reportData.dialogues.length > 0) ? (reportData.dialogues.filter(d => d.agent === 'judge').map(d => d.statement).join(' ') || judgeFallback) : judgeFallback;

  // Colors
  const darkNav = '#1a1d2e';
  const mainBorder = '#e0e0e0';
  const accentRed = '#9d2222';
  const paleBg = '#fafafa';
  const paleYellow = '#fdf8ec';

  return (
    <div className="app-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#111', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Loading Overlay visible to user */}
      <div style={{ textAlign: 'center', color: '#d4b872', fontFamily: "'Cinzel', serif" }}>
        <div className="pulse-loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(212,184,114,0.3)', borderTopColor: '#d4b872', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }}></div>
        <h2 style={{ letterSpacing: '2px', marginBottom: '0.5rem' }}>GENERATING OFFICIAL PDF RECORD</h2>
        <p style={{ color: '#888', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>Please wait. The PDF will open automatically in a new tab...</p>
      </div>

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm', background: '#fff' }}>
        
        {/* The actual printable area */}
        <div className="printable-report" ref={reportRef} style={{
          color: '#111',
          width: '100%',
          maxWidth: '800px',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          boxSizing: 'border-box',
          padding: '20mm', // This is for DOM display, html2pdf will ignore if we set margins in options
        }}>
          
          {/* Header line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #c79a5b', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>
            <div>INQUEST</div>
            <div style={{ color: '#888' }}>DIGITAL COURT • INVESTIGATION RECORD</div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ color: '#c79a5b', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '0.5rem' }}>INQUEST</div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#111', letterSpacing: '1px' }}>DIGITAL COURT OF CYBERSECURITY</h1>
            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>PHISHING INVESTIGATION REPORT • CASE {reportID}</div>
          </div>

          {/* 3 Columns Top Stats */}
          <div style={{ display: 'flex', border: '1px solid #c79a5b', marginBottom: '2rem', background: paleYellow }}>
            <div style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRight: '1px solid #e0c8a0', overflow: 'hidden' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ACCUSED COMMUNICATION</div>
              <div style={{ fontSize: '0.9rem', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sender}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subject}</div>
            </div>
            <div style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRight: '1px solid #e0c8a0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.2rem' }}>VERDICT</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isPhishing ? accentRed : '#2ecc71', letterSpacing: '1px' }}>{isPhishing ? 'PHISHING' : 'LEGITIMATE'}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#333', marginTop: '0.2rem', textTransform: 'uppercase' }}>{riskLevel} • {confidence} {confidence.includes('%') ? 'CONF.' : 'CONFIDENCE'}</div>
            </div>
            <div style={{ flex: 1, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem' }}>PRIMARY INDICATOR</div>
              <div style={{ fontSize: '0.9rem', color: '#333' }}>{primaryIndicator}</div>
            </div>
          </div>

          {/* Case Summary Table */}
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#111' }}>CASE SUMMARY</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <tbody>
              <tr>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', background: paleBg, width: '15%', fontWeight: 'bold', color: '#555' }}>FROM</td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', width: '35%', wordBreak: 'break-all' }}>{sender}</td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', background: paleBg, width: '15%', fontWeight: 'bold', color: '#555' }}>URL</td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', width: '35%', wordBreak: 'break-all' }}>{url}</td>
              </tr>
              <tr>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', background: paleBg, fontWeight: 'bold', color: '#555' }}>BRAND</td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem' }}>{reportData.verdict?.brand || (isPhishing ? 'Impersonated Service' : 'Verified Domain')}</td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', background: paleBg, fontWeight: 'bold', color: '#555' }}>STATUS</td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem' }}>Adjudicated</td>
              </tr>
            </tbody>
          </table>

          {/* The Email */}
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#c79a5b' }}>THE EMAIL</h3>
          <div style={{ fontSize: '0.9rem', color: '#333', marginBottom: '1.5rem', fontStyle: 'italic', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', wordBreak: 'break-word', maxHeight: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            “{reportData.raw_email || 'No email body available. Content analysis performed on metadata headers.'}”
          </div>

          {/* Exhibits */}
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#111', textTransform: 'uppercase' }}>Exhibits — Evidence Ledger</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: darkNav, color: '#fff' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '10%', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '60%', fontWeight: 500 }}>EVIDENCE</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '15%', fontWeight: 500 }}>CONF.</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '15%', fontWeight: 500 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {(reportData.ledger && reportData.ledger.length > 0) ? reportData.ledger.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#666' }}>{item.id}</td>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#333' }}>{item.summary}</td>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#666' }}>{item.confidence}%</td>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#666' }}>{item.status}</td>
                </tr>
              )) : (
                <tr>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#666' }}>A-01</td>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#333' }}>{primaryIndicator}</td>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#666' }}>{confidenceStr.includes('%') ? confidenceStr : confidenceStr + '%'}</td>
                  <td style={{ border: `1px solid ${mainBorder}`, padding: '0.75rem', color: '#666' }}>CORROBORATED</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Hearing */}
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#111' }}>HEARING</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem', pageBreakInside: 'avoid' }}>
            <thead>
              <tr style={{ background: paleYellow, color: '#a67b45' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '50%', fontWeight: 'bold', border: `1px solid ${mainBorder}` }}>PROSECUTION</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '50%', fontWeight: 'bold', border: `1px solid ${mainBorder}` }}>DEFENSE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', lineHeight: '1.5' }}>
                  {prosecutionStr}
                </td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', lineHeight: '1.5' }}>
                  {defenseStr}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Judge's Finding */}
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#111', pageBreakBefore: 'avoid' }}>JUDGE'S FINDING</h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#333', lineHeight: '1.6', pageBreakInside: 'avoid' }}>
            {judgeStr}
          </p>

          {/* Final Judgment */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem', pageBreakInside: 'avoid' }}>
            <thead>
              <tr style={{ background: darkNav, color: '#fff' }}>
                <th style={{ padding: '0.75rem', textAlign: 'center', width: '40%', fontWeight: 500, border: `1px solid ${darkNav}` }}>FINAL JUDGMENT</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '60%', fontWeight: 500, border: `1px solid ${darkNav}` }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: `1px solid #c79a5b`, padding: '1rem', textAlign: 'center', background: paleYellow }}>
                  <div style={{ color: isPhishing ? accentRed : '#2ecc71', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {isPhishing ? 'PHISHING' : 'LEGITIMATE'}<br/>
                    <span style={{fontSize: '0.8rem', color: '#666'}}>{riskLevel} • {confidence}</span>
                  </div>
                </td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', background: paleBg, lineHeight: '1.5' }}>
                  {reportData.verdict?.recommended_action || 'Do not open the URL. Report the message. Block the domain where appropriate. If credentials were entered, begin account recovery.'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Recovery Assistance */}
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#111', pageBreakBefore: 'avoid' }}>RECOVERY ASSISTANCE PLAN</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem', pageBreakInside: 'avoid' }}>
            <thead>
              <tr style={{ background: paleBg, color: '#111' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%', fontWeight: 'bold', border: `1px solid ${mainBorder}` }}>SCENARIO</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '70%', fontWeight: 'bold', border: `1px solid ${mainBorder}` }}>RECOMMENDED ACTION STEPS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', fontWeight: 600 }}>
                  If you still have account access:
                </td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', lineHeight: '1.6' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li>Immediately reset your password for the compromised service.</li>
                    <li>Enable Multi-Factor Authentication (MFA) or an Authenticator app.</li>
                    <li>Review active sessions and revoke any unrecognized devices.</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', fontWeight: 600 }}>
                  If you are locked out:
                </td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', lineHeight: '1.6' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li>Contact the IT Helpdesk or the platform's fraud department immediately.</li>
                    <li>Do NOT attempt to contact the attacker or reply to the email.</li>
                    <li>Provide this PDF report to the incident response team.</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', fontWeight: 600 }}>
                  If financial data was entered:
                </td>
                <td style={{ border: `1px solid ${mainBorder}`, padding: '1rem', color: '#333', verticalAlign: 'top', lineHeight: '1.6' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li>Call your bank or credit card provider to freeze the affected accounts.</li>
                    <li>Monitor credit reports for unauthorized inquiries.</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', lineHeight: '1.5' }}>
            <strong>INQUEST METHOD:</strong> Email ingestion → specialist investigation → evidence ledger → Prosecutor vs Defense → evidence verification → judgment → report.<br/>
            This is an AI-assisted cybersecurity decision-support record and not a substitute for professional incident-response, legal, financial, or law-enforcement procedures.
          </div>
        </div>
      </div>

      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body * {
              visibility: hidden;
            }
            .print-container {
              position: static !important;
              overflow: visible !important;
              background: #fff !important;
            }
            .printable-report, .printable-report * {
              visibility: visible;
            }
            .printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}
