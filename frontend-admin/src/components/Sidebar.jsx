import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    color: active ? 'var(--color-darkest)' : 'var(--text-primary)',
    backgroundColor: active ? 'var(--color-accent)' : 'transparent',
    textDecoration: 'none',
    fontWeight: active ? '700' : '500',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease',
    boxShadow: active ? '0 4px 15px rgba(3, 199, 179, 0.4)' : 'none',
  });

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''}`}
      style={{
        width: '280px',
        backgroundColor: 'var(--color-darkest)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'white', letterSpacing: '2px' }}>
          <span style={{ color: 'var(--color-accent)' }}>ADMIN</span> PORTAL
        </h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Logged in as <strong style={{ color: 'white' }}>{adminUser?.username}</strong>
        </p>
        <span
          style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'rgba(3, 199, 179, 0.1)',
            border: '1px solid var(--color-accent)',
            borderRadius: '4px',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            fontWeight: 'bold',
          }}
        >
          {adminUser?.role}
        </span>
      </div>

      <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link to="/dashboard" style={navItemStyle(isActive('/dashboard'))} onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '20px', height: '20px', marginRight: '12px' }}
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          Overview
        </Link>

        <Link to="/teams" style={navItemStyle(isActive('/teams'))} onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '20px', height: '20px', marginRight: '12px' }}
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Teams
        </Link>

        <Link to="/submissions" style={navItemStyle(isActive('/submissions'))} onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '20px', height: '20px', marginRight: '12px' }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Submissions
        </Link>

        <Link to="/admins" style={navItemStyle(isActive('/admins'))} onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '20px', height: '20px', marginRight: '12px' }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Administrators
        </Link>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={logout}
            className="btn-secondary"
            style={{ width: '100%', borderColor: '#e74c3c', color: '#e74c3c' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: '18px', height: '18px', marginRight: '8px' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
