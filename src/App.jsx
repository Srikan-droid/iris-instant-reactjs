import React, { useState, useEffect, useRef } from 'react';
import UploadForm from './components/UploadForm';
import FilingHistory from './components/FilingHistory';
import Login from './components/Login';
import Profile from './components/Profile';
import { fetchFilingHistory, uploadFiling, downloadFile, clearUserData } from './api';
import './App.css';

const mandates = ["ACFR", "SBC", "MBRS"];

function getStatusCounts(history) {
  return history.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function App() {
  const [history, setHistory] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [mandate, setMandate] = useState(mandates[0]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // Load user session from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('userSession');
    const savedView = localStorage.getItem('currentView');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setMandate(userData.mandate || mandates[0]);
      } catch (error) {
        console.error('Error parsing saved user session:', error);
        localStorage.removeItem('userSession');
      }
    }
    
    // Restore the last viewed page
    if (savedView && (savedView === 'dashboard' || savedView === 'history' || savedView === 'profile')) {
      setView(savedView);
    }
  }, []);

  // Save user session to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userSession', JSON.stringify(user));
    } else {
      localStorage.removeItem('userSession');
    }
  }, [user]);

  // Save current view to localStorage when view changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentView', view);
    }
  }, [view, user]);

  // Load user-specific filing history when user changes
  useEffect(() => {
    if (user) {
      const userEmail = getUserEmail();
      fetchFilingHistory(userEmail).then(setHistory);
    } else {
      setHistory([]);
    }
  }, [user, refresh]);

  // Add form resubmission warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if user is logged in and on a page with forms
      if (user && (view === 'dashboard')) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Any unsaved changes will be lost.';
        return 'Are you sure you want to leave? Any unsaved changes will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, view]);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleUpload = async (details, file) => {
    try {
      const userEmail = getUserEmail();
      if (!userEmail) {
        throw new Error('User email not found');
      }
      await uploadFiling(details, file, userEmail);
      setRefresh(r => !r);
    } catch (error) {
      console.error('Upload error in handleUpload:', error);
      throw error; // Re-throw to be caught by UploadForm
    }
  };

  const handleDownload = async (id) => {
    const userEmail = getUserEmail();
    await downloadFile(id, userEmail);
  };

  const handleLogout = () => {
    // Only clear user-specific data for guest users, preserve authenticated user data
    if (user && user.user === 'guest') {
      const userEmail = getUserEmail();
      clearUserData(userEmail);
    }
    
    setUser(null);
    setView('dashboard');
    setShowUserDropdown(false);
    setHistory([]);
    localStorage.removeItem('userSession');
    localStorage.removeItem('currentView');
  };

  const getUserEmail = () => {
    if (!user) return '';
    if (user.user === 'guest') return user.email;
    if (user.user === 'gmail') return 'user@gmail.com';
    if (user.user === 'outlook') return 'user@outlook.com';
    if (user.user === 'password') return user.email;
    return 'user@gmail.com'; // Default fallback
  };

  const statusCounts = getStatusCounts(history);

  if (!user) {
    return <Login onLogin={u => { setUser(u); setMandate(u.mandate || mandates[0]); }} />;
  }

  // Handler for clicking a status tile
  const handleTileClick = () => setView('history');

  return (
    <div className="app-container">
      <nav className="navbar">
        <img src="/iris inst logo.png" alt="iRIS Instant Logo" className="iris-logo large" />
        <div className="nav-links">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
                  <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>File History</button>
        </div>
        <div className="user-info" ref={userDropdownRef}>
          <button 
            className="user-button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            👤 {getUserEmail()}
          </button>
          {showUserDropdown && (
            <div className="user-dropdown">
              <button onClick={() => { setView('profile'); setShowUserDropdown(false); }}>View Profile</button>
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </nav>
      {view === 'dashboard' && (
        <>
          <div className="ai-powered-title gradient-text">AI Powered XBRL Generation</div>
          <div className="dashboard-status-cards">
            <div className="status-card processing" onClick={handleTileClick} tabIndex={0} role="button" aria-label="View Processing Filings">
              <div className="status-label">Processing</div>
              <div className="status-count">{statusCounts['Processing'] || 0}</div>
            </div>
            <div className="status-card completed" onClick={handleTileClick} tabIndex={0} role="button" aria-label="View Completed Filings">
              <div className="status-label">Completed</div>
              <div className="status-count">{statusCounts['Completed'] || 0}</div>
            </div>
          </div>
          <UploadForm onUpload={handleUpload} />
        </>
      )}
      {view === 'history' && (
        <>
          <div className="ai-powered-title gradient-text">AI Powered XBRL Generation</div>
          <FilingHistory history={history} onDownload={handleDownload} />
        </>
      )}
      {view === 'profile' && (
        <Profile user={user} />
      )}
    </div>
  );
}

export default App;