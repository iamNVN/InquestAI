import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import VerdictScreen from './components/VerdictScreen';
import LiveHearingScreen from './components/LiveHearingScreen';
import ReportPreview from './components/ReportPreview';

function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    return window.location.pathname === '/court' ? 'VERDICT' : 'LANDING';
  }); // LANDING, VERDICT, HEARING, FINAL
  const [showReport, setShowReport] = useState(false);

  return (
    <>
      {currentScreen === 'LANDING' ? (
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
          <source src="/background/1.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            top: 0,
            left: 0,
            backgroundImage: currentScreen === 'HEARING' ? "url('/background/courtroom.png')" : "url('/background/2.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#000'
          }}
        />
      )}
      
      {currentScreen === 'LANDING' && (
        <LandingScreen onForward={() => setCurrentScreen('VERDICT')} />
      )}
      
      {currentScreen === 'VERDICT' && (
        <VerdictScreen 
          isFinal={false}
          onViewHearing={() => setCurrentScreen('HEARING')}
          onGenerateReport={() => setShowReport(true)}
        />
      )}
      
      {currentScreen === 'HEARING' && (
        <LiveHearingScreen onHearingComplete={() => setCurrentScreen('FINAL')} />
      )}

      {currentScreen === 'FINAL' && (
        <VerdictScreen 
          isFinal={true}
          onGenerateReport={() => setShowReport(true)}
        />
      )}

      {showReport && (
        <ReportPreview onClose={() => setShowReport(false)} />
      )}
    </>
  );
}

export default App;
