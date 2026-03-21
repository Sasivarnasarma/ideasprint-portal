import { useState, useRef, useEffect } from 'react';
import { submissionAPI } from '../api/submission';
import { useSubmission } from '../context/SubmissionContext';

const SubmissionStage1 = ({ onNext }) => {
    const { submissionData, updateSubmissionData } = useSubmission();
    const [email, setEmail] = useState('');

    useEffect(() => {
        setEmail(submissionData.pendingEmail || submissionData.email || '');
    }, [submissionData.pendingEmail, submissionData.email]);
    const [error, setError] = useState('');
    const [fieldError, setFieldError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const turnstileRef = useRef(null);
    const widgetIdRef = useRef(null);

    // Turnstile initialization
    useEffect(() => {
        const renderWidget = () => {
            if (window.turnstile && turnstileRef.current && widgetIdRef.current === null) {
                widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
                    callback: (token) => setTurnstileToken(token),
                    'expired-callback': () => setTurnstileToken(null),
                    theme: 'dark',
                });
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            const interval = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(interval);
                    renderWidget();
                }
            }, 200);
            return () => clearInterval(interval);
        }

        return () => {
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, []);

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError('');
        setFieldError('');
    };

    const handleBlur = (e) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
            setFieldError('Please enter a valid email address');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setFieldError('This field is required');
            return;
        }

        if (fieldError) {
            setError('Please fix the errors above');
            return;
        }

        if (!turnstileToken) {
            setError('Please complete the CAPTCHA verification.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await submissionAPI.sendOTP(email, turnstileToken);
            updateSubmissionData({
                pendingEmail: email,
                captchaSessionToken: response.captcha_session_token,
                verificationToken: '' // reset on new email
            });
            onNext();
        } catch (err) {
            setError(err.response?.data?.detail || 'Verification failed. Please try again.');
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.reset(widgetIdRef.current);
                setTurnstileToken(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stage-content">
            <div className="stage-header">
                <div className="stage-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                </div>
                <h2>Submit Your Proposal</h2>
                <p>Enter your team leader's registered email</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your registered email"
                        maxLength={50}
                        required
                    />
                    {fieldError && <span className="field-error">{fieldError}</span>}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div ref={turnstileRef} className="turnstile-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}></div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Sending OTP...
                        </>
                    ) : (
                        <>
                            Continue
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SubmissionStage1;
