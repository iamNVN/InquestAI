import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import CourtFlow from './components/CourtFlow';
import ReportPreview from './components/ReportPreview';
import { LanguageProvider } from './LanguageContext';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  // Report Preview has its own dark background style inline
  const isVideoBg = path === '/' || path === '/login' || path.startsWith('/court');
  const videoKey = (path === '/' || path === '/login') ? 'landing-vid' : 'verdict-vid';
  const videoSrc = (path === '/' || path === '/login') ? "/background/1.mp4" : "/background/2.mp4";

  return (
    <>
      {isVideoBg ? (
        <video
          key={videoKey}
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
          <source src={videoSrc} type="video/mp4" />
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
            backgroundImage: (path.startsWith('/dashboard') || path.startsWith('/my') || path.startsWith('/support')) ? "url('/background/dashboard.png')" : "url('/background/2.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#000'
          }}
        />
      )}

      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/mycases" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/myreports" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />

        <Route path="/court/:caseID" element={<CourtFlow />} />
        <Route path="/report/:reportID" element={<ReportPreview />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
