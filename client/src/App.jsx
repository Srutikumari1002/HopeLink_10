import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ReceiptModal from './components/ReceiptModal';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { API_BASE } from './config';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hl_token') || null);
  const [toasts, setToasts] = useState([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('pledge');
  const [modalData, setModalData] = useState(null);

  // Validate session on mount
  useEffect(() => {
    if (token) {
      checkUserSession();
    }
  }, [token]);

  const checkUserSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Session invalid');
      const userData = await res.json();
      setUser(userData);
      setCurrentView('dashboard');
    } catch (err) {
      console.warn('Session verification failed:', err.message);
      handleLogout();
    }
  };

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentView('dashboard');
    setDashboardTab('overview');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hl_token');
    setCurrentView('landing');
    addToast('Logged out successfully.', 'info');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto clear toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const navigateToDashboard = (tabId) => {
    if (!token) {
      addToast('Please sign in or register to access this section.', 'info');
      setCurrentView('auth');
      return;
    }
    setDashboardTab(tabId);
    setCurrentView('dashboard');
  };

  const handleViewReceipt = (type, data) => {
    setModalType(type);
    setModalData(data);
    setModalOpen(true);
  };

  return (
    <>
      {/* Toast Notification Container */}
      <div id="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} />
        ))}
      </div>

      {/* Header Navbar */}
      <Navbar 
        user={user} 
        logout={handleLogout} 
        navigateToDashboard={navigateToDashboard} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Dynamic View Rendering */}
      {currentView === 'landing' && (
        <Landing 
          onStartPledge={() => navigateToDashboard('pledge')}
          onStartSearch={() => navigateToDashboard('hospitals')}
        />
      )}

      {currentView === 'auth' && (
        <Auth 
          onAuthSuccess={handleAuthSuccess} 
          addToast={addToast}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          user={user}
          token={token}
          addToast={addToast}
          onViewReceipt={handleViewReceipt}
          defaultTab={dashboardTab}
        />
      )}

      {/* Printable PDF Receipt modal overlay */}
      <ReceiptModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        data={modalData}
        user={user}
      />
    </>
  );
}
