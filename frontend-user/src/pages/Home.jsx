import { Link } from 'react-router-dom';
import logo from '../assets/images/ideasprint-logo.webp';

const Home = () => {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
                    <div className="logo" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                        <img src={logo} alt="ideasprint" className="logo-img" style={{ maxWidth: '250px' }} />
                    </div>
                    
                    <h1 style={{ color: 'var(--color-text)', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>
                        ideasprint 2026 Portal
                    </h1>
                    
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        Select the portal you wish to access below.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', width: '100%' }}>
                        <Link to="/register" style={{ width: '100%', textDecoration: 'none' }}>
                            <button className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}>
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <polyline points="17 11 19 13 23 9" />
                                </svg>
                                Register Team
                            </button>
                        </Link>

                        <Link to="/submission" style={{ width: '100%', textDecoration: 'none' }}>
                            <button className="btn-secondary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Submit Proposal
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Background decorative elements matching the theme */}
                <div className="auth-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>
            </div>

            {/* Floating Home Button Back to Main Website */}
            <a
                href="https://ideasprint.hackx.lk/"
                className="floating-home-btn"
                title="Back to Home"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(4, 35, 30, 0.7)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid var(--glass-border)',
                    color: 'white',
                    textDecoration: 'none',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    zIndex: 100
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(3, 199, 179, 0.4)';
                    e.currentTarget.style.color = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.color = 'white';
                }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '24px', height: '24px' }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </a>
        </div>
    );
};

export default Home;
