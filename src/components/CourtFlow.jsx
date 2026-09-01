import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerdictScreen from './VerdictScreen';
import LiveHearingScreen from './LiveHearingScreen';

export default function CourtFlow() {
  const { caseID } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('VERDICT'); // VERDICT, HEARING, FINAL

  const handleViewHearing = () => setStep('HEARING');
  const handleHearingComplete = () => setStep('FINAL');
  const handleGenerateReport = () => navigate(`/report/${caseID || 'CASE-000'}`);

  if (step === 'HEARING') {
    return <LiveHearingScreen onHearingComplete={handleHearingComplete} />;
  }

  return (
    <VerdictScreen 
      isFinal={step === 'FINAL'}
      onViewHearing={handleViewHearing}
      onGenerateReport={handleGenerateReport}
    />
  );
}
