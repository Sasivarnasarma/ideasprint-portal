import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterStage1 from '../components/RegisterStage1';
import RegisterStage2 from '../components/RegisterStage2';
import RegisterStage3 from '../components/RegisterStage3';
import logo from '../assets/images/ideasprint-logo.webp';

const Register = () => {
    const [searchParams] = useSearchParams();
    const { registrationStage, updateRegistrationStage } = useAuth();
    const [currentStage, setCurrentStage] = useState(1);
    const [direction, setDirection] = useState('forward');

    useEffect(() => {
        const stageParam = searchParams.get('stage');
        if (stageParam) {
            setCurrentStage(parseInt(stageParam, 10));
        } else if (registrationStage > 1 && registrationStage < 4) {
            setCurrentStage(registrationStage);
        }
    }, [searchParams, registrationStage]);

    const goToNextStage = () => {
        setDirection('forward');
        const next = Math.min(currentStage + 1, 3);
        setCurrentStage(next);
        updateRegistrationStage(next);
    };

    const goToPrevStage = () => {
        setDirection('backward');
        const prev = Math.max(currentStage - 1, 1);
        setCurrentStage(prev);
        updateRegistrationStage(prev);
    };

    const goToStage = (stage) => {
        setDirection(stage > currentStage ? 'forward' : 'backward');
        setCurrentStage(stage);
        updateRegistrationStage(stage);
    };

    const renderStage = () => {
        switch (currentStage) {
            case 1:
                return <RegisterStage1 onNext={goToNextStage} onSkipToStage3={() => goToStage(3)} />;
            case 2:
                return <RegisterStage2 onNext={goToNextStage} onBack={goToPrevStage} />;
            case 3:
                return <RegisterStage3 onBack={() => goToStage(1)} />;
            default:
                return <RegisterStage1 onNext={goToNextStage} />;
        }
    };

    return (
        <div className="auth-page register-page">
            <div className="auth-container register-container">
                <div className="auth-card register-card">
                    <div className="register-header" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="logo" style={{ marginTop: '0.5rem' }}>
                            <img src={logo} alt="ideasprint" className="logo-img" />
                        </div>


                        <div className="progress-indicator">
                            <div className={`progress-step ${currentStage >= 1 ? 'active' : ''} ${currentStage > 1 ? 'completed' : ''}`}>
                                <div className="step-number">
                                    {currentStage > 1 ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    ) : '1'}
                                </div>
                                <span className="step-label">Details</span>
                            </div>
                            <div className={`progress-line ${currentStage > 1 ? 'active' : ''}`}></div>
                            <div className={`progress-step ${currentStage >= 2 ? 'active' : ''} ${currentStage > 2 ? 'completed' : ''}`}>
                                <div className="step-number">
                                    {currentStage > 2 ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    ) : '2'}
                                </div>
                                <span className="step-label">Verify</span>
                            </div>
                            <div className={`progress-line ${currentStage > 2 ? 'active' : ''}`}></div>
                            <div className={`progress-step ${currentStage >= 3 ? 'active' : ''}`}>
                                <div className="step-number">3</div>
                                <span className="step-label">Team</span>
                            </div>
                        </div>
                    </div>


                    <div className={`stage-wrapper ${direction}`}>
                        <div className={`stage-slide stage-${currentStage}`}>
                            {renderStage()}
                        </div>
                    </div>
                </div>

                <div className="auth-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>
            </div>


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

export default Register;
