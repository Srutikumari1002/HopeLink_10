import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function Auth({ onAuthSuccess, addToast }) {
  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('hl_token', data.token);
      onAuthSuccess(data.user, data.token);
      addToast('Welcome back to HopeLink!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    if (regPassword.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('hl_token', data.token);
      onAuthSuccess(data.user, data.token);
      addToast('Account registered successfully! Welcome.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <main id="auth-view" className="view-section auth-view">
      <div className="auth-container">
        <div className="auth-card glass">
          {/* Auth Tabs */}
          <div className="auth-tabs">
            <button 
              className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`} 
              onClick={() => setAuthTab('login')}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`} 
              onClick={() => setAuthTab('register')}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {authTab === 'login' ? (
            <div className="auth-form-container active" id="login-form-box">
              <h2 className="auth-title">Welcome Back</h2>
              <p class="auth-desc">Log in to manage your pledges, active appointments, and emergency records.</p>
              <form id="login-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-envelope"></i>
                    <input 
                      type="email" 
                      id="login-email" 
                      required 
                      placeholder="name@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-lock"></i>
                    <input 
                      type="password" 
                      id="login-password" 
                      required 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Log In <i className="fa-solid fa-arrow-right-to-bracket"></i>
                </button>
              </form>
            </div>
          ) : (
            /* Register Form */
            <div className="auth-form-container active" id="register-form-box">
              <h2 className="auth-title">Join HopeLink</h2>
              <p class="auth-desc">Create a secure profile to start saving lives and scheduling health checks.</p>
              <form id="register-form" onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-user"></i>
                    <input 
                      type="text" 
                      id="reg-name" 
                      required 
                      placeholder="Jane Doe" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-envelope"></i>
                    <input 
                      type="email" 
                      id="reg-email" 
                      required 
                      placeholder="name@example.com" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-lock"></i>
                    <input 
                      type="password" 
                      id="reg-password" 
                      required 
                      placeholder="Min 6 characters" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Register Account <i className="fa-solid fa-user-plus"></i>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
