import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExamPage } from './pages/ExamPage';
import { ScorePage } from './pages/ScorePage';
import { CertificatePage } from './pages/CertificatePage';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { useSiteContent } from './hooks/useSiteContent';
import { getAdminToken, setAdminToken } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [adminToken, setAdminTokenState] = useState<string | null>(getAdminToken());

  const {
    content,
    isBackendConnected,
    refreshContent,
    updateContentLocally,
  } = useSiteContent();

  // Synchronize with URL hash for GitHub Pages routing safety
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (['home', 'exam', 'score', 'certificate', 'admin'].includes(hash)) {
        setCurrentTab(hash as NavTab);
      }
    };

    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    setAdminTokenState(token);
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminTokenState(null);
    handleSelectTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FD] text-[#30283A] font-['Sarabun']">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isBackendConnected={isBackendConnected}
        logoUrl={content.siteImages?.headerLogoUrl}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage content={content} onSelectTab={handleSelectTab} />
        )}

        {currentTab === 'exam' && <ExamPage content={content} />}

        {currentTab === 'score' && (
          <ScorePage
            content={content}
            isBackendConnected={isBackendConnected}
          />
        )}

        {currentTab === 'certificate' && (
          <CertificatePage
            content={content}
            isBackendConnected={isBackendConnected}
          />
        )}

        {currentTab === 'admin' && (
          <div>
            {adminToken ? (
              <AdminDashboard
                content={content}
                onUpdateContentLocally={updateContentLocally}
                onLogout={handleLogout}
                isBackendConnected={isBackendConnected}
                refreshContent={refreshContent}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={handleLoginSuccess}
                isBackendConnected={isBackendConnected}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        footer={content.footer}
        logoUrl={content.siteImages?.footerLogoUrl || content.siteImages?.headerLogoUrl}
      />
    </div>
  );
}
