import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className="admin-layout"
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'transparent', position: 'relative' }}
    >
      <div className="mobile-header">
        <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'white', letterSpacing: '1px' }}>
          <span style={{ color: 'var(--color-accent)' }}>ADMIN</span> PORTAL
        </h1>
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '28px', height: '28px' }}
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        className="admin-main-content"
        style={{ marginLeft: '280px', flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
