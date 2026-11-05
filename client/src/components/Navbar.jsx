import React, { useState } from 'react';

export default function Navbar({ user, logout, navigateToDashboard, currentView, setCurrentView }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavClick = (viewName) => {
    setCurrentView(viewName);
    setDropdownOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo" onClick={() => handleNavClick('landing')}>
          <i className="fa-solid fa-heart-pulse logo-icon"></i>
          <span>Hope<span>Link</span></span>
        </div>
        <nav className="nav-menu">
          <span 
            className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => handleNavClick('landing')}
          >
            Home
          </span>
          <span 
            className={`nav-link ${currentView === 'dashboard' && currentView !== 'landing' ? 'active' : ''}`}
            onClick={() => navigateToDashboard('hospitals')}
          >
            Hospitals
          </span>
          <span 
            className={`nav-link`}
            onClick={() => navigateToDashboard('pledge')}
          >
            Pledge Organs
          </span>
          
          {!user ? (
            <button 
              className="btn btn-primary btn-auth" 
              onClick={() => handleNavClick('auth')}
            >
              Login / Sign Up
            </button>
          ) : (
            <div className="user-dropdown">
              <div className="avatar" onClick={toggleDropdown}>
                <i className="fa-solid fa-user"></i>
              </div>
              {dropdownOpen && (
                <div className="dropdown-content show">
                  <div className="dropdown-header">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <hr />
                  <button onClick={() => { handleNavClick('dashboard'); setDropdownOpen(false); }}>
                    <i className="fa-solid fa-chart-line"></i> Dashboard
                  </button>
                  <button onClick={() => { logout(); setDropdownOpen(false); }}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
