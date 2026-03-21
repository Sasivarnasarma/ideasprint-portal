import { useState, useRef, useEffect } from 'react';
import { submissionAPI } from '../api/submission';
import { useSubmission } from '../context/SubmissionContext';

const SubmissionStage2 = ({ onNext, onBack }) => {
    const { submissionData, updateSubmissionData } = useSubmission();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index, value) => {
        if (value.length > 1) {
            const pastedValues = value.slice(0, 6).split('');
            const newOtp = [...otp];
            pastedValues.forEach((val, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = val;
                }
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedValues.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            const emailToVerify = submissionData.pendingEmail;
            const response = await submissionAPI.verifyOTP(emailToVerify, otpCode, submissionData.captchaSessionToken);
            updateSubmissionData({
                email: emailToVerify,
                pendingEmail: '',
                verificationToken: response.verification_token,
                captchaSessionToken: '',
                teamName: response.team_name,
                teamNo: response.team_no,
                hasSubmitted: response.has_submitted
            });
            onNext();
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Captcha session expired. Redirecting to re-verify...');
                setTimeout(() => onBack(), 1500);
                return;
            }
            setError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || isResending) return;
        setIsResending(true);

        try {
            const emailToVerify = submissionData.pendingEmail;
            await submissionAPI.resendOTP(emailToVerify, submissionData.captchaSessionToken);
            setResendTimer(60);
            setError('');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Captcha session expired. Redirecting to re-verify...');
                setTimeout(() => onBack(), 1500);
                return;
            }
            setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
            if (err.response?.status === 429) {
                setResendTimer(60);
            } else {
                setResendTimer(5);
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="stage-content">
            <div className="stage-header">
                <div className="stage-icon otp-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h2>Verify Your Email</h2>
                <p>We've sent a 6-digit code to</p>
                <span className="email-highlight">{submissionData.pendingEmail}</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="otp-container">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="otp-input"
                            autoComplete="off"
                        />
                    ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify OTP
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>

                <button type="button" className="btn-secondary" onClick={onBack} disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Wrong Email? Go Back
                </button>

                <div className="resend-section">
                    <p>
                        Didn't receive the code?{' '}
                        {resendTimer > 0 ? (
                            <span className="resend-timer">Resend in {resendTimer}s</span>
                        ) : (
                            <button type="button" className="resend-btn" onClick={handleResend} disabled={isResending}>
                                {isResending ? 'Resending...' : 'Resend OTP'}
                            </button>
                        )}
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SubmissionStage2;
