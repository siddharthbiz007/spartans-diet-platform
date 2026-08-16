import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || '';
  };

  const isTabActive = (tabName, defaultPath = false) => {
    const activeTab = getActiveTab();
    if (defaultPath && !activeTab && location.pathname === '/dashboard') return true;
    return activeTab === tabName;
  };

  const getAvatarLetter = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar" style={{ padding: '0 4rem' }}>
      <Link to="/" className="nav-brand" style={{ fontSize: '1.8rem', letterSpacing: '1px', color: 'var(--primary-color)' }}>
        AYUVA
      </Link>

      <div className="nav-links" style={{ gap: '2.5rem' }}>
        {/* Guest Links */}
        {!user && (
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
        )}

        {/* Client User Links */}
        {user && user.role === 'client' && (
          <>
            <Link to="/dashboard?tab=plan" className={`nav-link ${isTabActive('plan', true) ? 'active' : ''}`}>
              My Plan
            </Link>
            <Link to="/dashboard?tab=dinacharya" className={`nav-link ${isTabActive('dinacharya') ? 'active' : ''}`}>
              Dinacharya
            </Link>
            <Link to="/dashboard?tab=progress" className={`nav-link ${isTabActive('progress') ? 'active' : ''}`}>
              Progress
            </Link>
            <Link to="/dashboard?tab=messages" className={`nav-link ${isTabActive('messages') ? 'active' : ''}`}>
              Messages
            </Link>
          </>
        )}

        {/* Dietitian User Links */}
        {user && user.role === 'dietitian' && (
          <>
            <Link to="/dashboard?tab=overview" className={`nav-link ${isTabActive('overview', true) ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/dashboard?tab=clients" className={`nav-link ${isTabActive('clients') ? 'active' : ''}`}>
              Clients
            </Link>
            <Link to="/dashboard?tab=aiplans" className={`nav-link ${isTabActive('aiplans') ? 'active' : ''}`}>
              AI Plans
            </Link>
            <Link to="/dashboard?tab=appointments" className={`nav-link ${isTabActive('appointments') ? 'active' : ''}`}>
              Appointments
            </Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary-color)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 700,
                fontSize: '1rem',
                border: '2px solid var(--secondary-color)',
                letterSpacing: 0,
                userSelect: 'none'
              }}
              title={user.name}
            >
              {getAvatarLetter()}
            </div>
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--text-muted)', 
                display: 'flex', 
                alignItems: 'center',
                padding: '0.25rem'
              }}
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Sign In / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}
