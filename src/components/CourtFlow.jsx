import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerdictScreen from './VerdictScreen';
import LiveHearingScreen from './LiveHearingScreen';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function CourtFlow() {
  const { caseID } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('VERDICT'); // VERDICT, HEARING, FINAL
  const [investigation, setInvestigation] = useState(null);

  useDocumentTitle(step === 'HEARING' ? 'Inquest AI | Live Hearing' : 'Inquest AI | Verdict');

  useEffect(() => {
    let interval;
    const fetchStatus = () => {
      fetch(`/api/investigate/${caseID}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setInvestigation(data);
          }
          if (data.status === 'complete') {
            clearInterval(interval);
          }
        })
        .catch(console.error);
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [caseID]);

  const handleViewHearing = () => setStep('HEARING');
  const handleHearingComplete = () => setStep('FINAL');
  const handleGenerateReport = () => navigate(`/report/${caseID || 'CASE-000'}`);

  return (
    <>
      <style>
        {`
          @keyframes courtFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <div style={{ animation: 'courtFadeIn 0.8s ease-out', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {step === 'HEARING' ? (
          <LiveHearingScreen 
            caseID={caseID}
            verdict={investigation?.verdict?.verdict}
            confidence={investigation?.verdict?.confidence}
            onHearingComplete={handleHearingComplete}
          />
        ) : (
          <VerdictScreen
            caseID={caseID}
            isFinal={step === 'FINAL'}
            onViewHearing={handleViewHearing}
            onGenerateReport={handleGenerateReport}
            verdict={investigation?.verdict?.verdict === 'PHISHING' ? 'guilty' : (investigation?.verdict?.verdict === 'LEGITIMATE' ? 'safe' : 'pending')}
            confidence={investigation?.verdict?.confidence}
            reason={investigation?.verdict?.summary}
          />
        )}
      </div>
    </>
  );
}
