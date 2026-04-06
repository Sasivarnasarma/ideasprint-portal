import { useEffect } from 'react';
import logo from '../assets/images/ideasprint-logo.webp';

const RegistrationSuccessful = () => {
    useEffect(() => {
        localStorage.clear();
    }, []);

    return (
        <div className="auth-page register-page">
            <div className="auth-container register-container">
                <div className="auth-card register-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div className="logo" style={{ marginBottom: '1.5rem' }}>
                        <img src={logo} alt="ideasprint" className="logo-img" />
                    </div>

                    <div className="stage-header" style={{ marginBottom: '1.5rem' }}>
                        <div className="stage-icon" style={{ borderColor: 'var(--success)', color: 'var(--success)', boxShadow: '0 0 30px hsla(150, 80%, 40%, 0.4)', margin: '0 auto 0.5rem' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.1rem', color: '#ffffff', fontWeight: 'bold' }}>
                            Registration Successful!
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 1.5rem 0' }}>
                            Your team has been successfully registered.
                        </p>

                    </div>

                    <div className="dashboard-content" style={{ width: '100%' }}>
                        <div className="member-card" style={{ marginBottom: '2rem', padding: '1.5rem', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                            <div className="member-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                <span className="member-number" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Next Steps</span>
                            </div>
                            <p style={{ margin: '0.75rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>• Get ready for an amazing experience at ideasprint 2026!</p>
                            <p style={{ margin: '0.75rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>• Check your email for the confirmation.</p>
                            <p style={{ margin: '0.75rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>• Start brainstorming your project idea!</p>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={() => window.location.href = 'https://ideasprint.hackx.lk'}
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span>Return to Home</span>
                        </button>
                    </div>
                </div>


                <div className="auth-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccessful;
