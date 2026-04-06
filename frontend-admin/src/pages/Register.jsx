import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAuthAPI } from '../api/admin';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const turnstileRef = useRef(null);
    const widgetIdRef = useRef(null);

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
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!turnstileToken) {
            setError('Please complete the CAPTCHA verification.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await adminAuthAPI.register(formData.username, formData.password, turnstileToken);
            setSuccessMessage(response.message || 'Registration successful. Please wait for approval.');

            setFormData({ username: '', password: '', confirmPassword: '' });
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.reset(widgetIdRef.current);
                setTurnstileToken(null);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed.');
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.reset(widgetIdRef.current);
                setTurnstileToken(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="center-wrapper">
            <div className="auth-card" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'white' }}>Admin Registration</h2>
                    <p style={{ color: '#aaa', marginTop: '10px' }}>Register to become an admin</p>
                </div>

                {successMessage ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ color: '#00ff88', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{successMessage}</div>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#B8C2C0', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter desired username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#B8C2C0', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    required
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#B8C2C0', cursor: 'pointer', padding: '5px' }}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#B8C2C0', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    required
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#B8C2C0', cursor: 'pointer', padding: '5px' }}
                                >
                                    {showConfirmPassword ? (
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div ref={turnstileRef} style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}></div>

                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
                            {isLoading ? 'Wait...' : 'Register'}
                        </button>
                    </form>
                )}

                {!successMessage && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)' }}>Login</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
