import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [guest, setGuest] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [password, setPassword] = useState('');

  const handleGmailLogin = () => {
    // Simulate Gmail login
    onLogin({ user: 'gmail' });
  };

  const handleOutlookLogin = () => {
    // Simulate Outlook login
    onLogin({ user: 'outlook' });
  };

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    // Simulate password-based login
    onLogin({ user: 'password', email, password });
  };

  const handleGuestLogin = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    onLogin({ user: 'guest', name, email });
  };

  return (
    <div className="login-bg">
      <form className="login-box" onSubmit={showPasswordLogin ? handlePasswordLogin : handleGuestLogin}>
        <img src="/iris inst logo.png" alt="iRIS Instant Logo" className="login-logo" />
        <div className="login-title">AI Powered XBRL Generation</div>
        
        {!showPasswordLogin && (
          <>
            <button type="button" className="login-gmail" onClick={handleGmailLogin}>
              Login with Gmail
            </button>
            
            <button type="button" className="login-outlook" onClick={handleOutlookLogin}>
              Login with Outlook
            </button>
            
            <button 
              type="button" 
              className="login-password" 
              onClick={() => setShowPasswordLogin(true)}
            >
              Login with Password
            </button>
          </>
        )}
        
        {!showPasswordLogin && (
          <>
            <div className="login-or">or continue as guest</div>
            <input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="login-guest">Continue as Guest</button>
          </>
        )}
        
        {showPasswordLogin && (
          <>
            <div className="login-credentials">Enter your credentials</div>
            <input
              type="email"
              placeholder="Your Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-guest">Login</button>
            <button 
              type="button" 
              className="login-back" 
              onClick={() => setShowPasswordLogin(false)}
            >
              Back to Options
            </button>
          </>
        )}
      </form>
      <div className="login-bg-title">AI Powered XBRL Generation</div>
    </div>
  );
}

export default Login;