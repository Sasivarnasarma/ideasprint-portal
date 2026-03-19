import { useState, useRef, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const RegisterStage1 = ({ onNext, onSkipToStage3 }) => {
    const { registrationData, updateRegistrationData } = useAuth();
    const [formData, setFormData] = useState({
        name: registrationData.name || '',
        email: registrationData.pendingEmail || registrationData.email || '',
        phone: registrationData.phone || '',
        imNumber: registrationData.imNumber || '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const turnstileRef = useRef(null);
    const widgetIdRef = useRef(null);

    const originalEmail = useRef(registrationData.email);

    const needsCaptcha = !registrationData.verificationToken || formData.email !== originalEmail.current;

    useEffect(() => {
        if (!needsCaptcha) {
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
            setTurnstileToken(null);
            return;
        }

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
    }, [needsCaptcha]);

    const validateField = (name, value) => {
        if (!value.trim()) {
            return `This field is required`;
        }

        switch (name) {
            case 'phone':
                if (!/^07\d{8}$/.test(value)) {
                    return 'Phone number must be exactly 10 digits and start with 07';
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                break;
            case 'imNumber':
                if (!/^IM\/202\d\/\d{3}$/.test(value)) {
                    return 'IM Number must follow format IM/202x/xxx';
                }
                break;
            default:
                break;
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'name') {
            newValue = newValue.replace(/[0-9]/g, '');
        } else if (name === 'imNumber') {
            newValue = newValue.toUpperCase();
            if (newValue.length === 7 && formData.imNumber.length === 6 && !newValue.endsWith('/')) {
                newValue += '/';
            }
            const parts = newValue.split('/');
            if (parts.length === 3 && parts[2].length > 3) {
                return;
            }
        }

        setFormData({ ...formData, [name]: newValue });
        setError('');

        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
    };

    const handleFocus = (e) => {
        const { name } = e.target;
        if (name === 'imNumber' && !formData.imNumber) {
            setFormData({ ...formData, imNumber: 'IM/202' });
        } else if (name === 'phone' && !formData.phone) {
            setFormData({ ...formData, phone: '07' });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = validateField(name, value);
        setFieldErrors({ ...fieldErrors, [name]: errorMsg });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const errors = {};
        let hasErrors = false;
        Object.keys(formData).forEach(key => {
            const errorMsg = validateField(key, formData[key]);
            if (errorMsg) {
                errors[key] = errorMsg;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setFieldErrors(errors);
            setError('Please fix the errors above');
            return;
        }



        setIsLoading(true);

        try {
            const emailChanged = formData.email !== originalEmail.current;
            const hasVerifiedToken = !!registrationData.verificationToken;

            if (!emailChanged && hasVerifiedToken) {
                updateRegistrationData({
                    name: formData.name,
                    phone: formData.phone,
                    imNumber: formData.imNumber
                });
                onSkipToStage3();
            } else {
                if (!turnstileToken) {
                    setError('Please complete the CAPTCHA verification.');
                    setIsLoading(false);
                    return;
                }
                if (emailChanged) {
                    updateRegistrationData({ verificationToken: '', captchaSessionToken: '' });
                }
                const response = await authAPI.sendOTP(formData.email, turnstileToken);
                updateRegistrationData({
                    pendingEmail: formData.email,
                    name: formData.name,
                    phone: formData.phone,
                    imNumber: formData.imNumber,
                    captchaSessionToken: response.captcha_session_token
                });
                onNext();
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <h2>Register your team</h2>
                <p>Enter your details to get started as a team leader</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your name"
                        maxLength={35}
                        required
                    />
                    {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your email"
                        maxLength={50}
                        required
                    />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g. 0712345678"
                        maxLength={10}
                        required
                    />
                    {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="imNumber">IM Number</label>
                    <input
                        type="text"
                        id="imNumber"
                        name="imNumber"
                        value={formData.imNumber}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="IM/202x/xxx"
                        title="Format: IM/202x/xxx"
                        required
                    />
                    {fieldErrors.imNumber && <span className="field-error">{fieldErrors.imNumber}</span>}
                </div>

                {error && <div className="error-message">{error}</div>}

                {needsCaptcha && (
                    <div ref={turnstileRef} className="turnstile-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}></div>
                )}

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

export default RegisterStage1;
