import { createContext, useContext, useState, useEffect } from 'react';

const SubmissionContext = createContext(null);

export const useSubmission = () => {
    const context = useContext(SubmissionContext);
    if (!context) {
        throw new Error('useSubmission must be used within a SubmissionProvider');
    }
    return context;
};

export const SubmissionProvider = ({ children }) => {
    const [submissionStage, setSubmissionStage] = useState(1);
    const [submissionData, setSubmissionData] = useState({
        email: '',
        pendingEmail: '',
        verificationToken: '',
        captchaSessionToken: '',
        teamName: '',
        teamNo: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedStage = localStorage.getItem('submissionStage');
        const savedEmail = localStorage.getItem('submissionEmail');
        const savedPendingEmail = localStorage.getItem('submissionPendingEmail');
        const savedVerificationToken = localStorage.getItem('submissionVerificationToken');
        const savedCaptchaSession = localStorage.getItem('submissionCaptchaSessionToken');
        const savedTeamName = localStorage.getItem('submissionTeamName');
        const savedTeamNo = localStorage.getItem('submissionTeamNo');

        if (savedStage) {
            setSubmissionStage(parseInt(savedStage, 10));
        }
        if (savedEmail || savedPendingEmail || savedVerificationToken || savedCaptchaSession || savedTeamName || savedTeamNo) {
            setSubmissionData({
                email: savedEmail || '',
                pendingEmail: savedPendingEmail || '',
                verificationToken: savedVerificationToken || '',
                captchaSessionToken: savedCaptchaSession || '',
                teamName: savedTeamName || '',
                teamNo: savedTeamNo || ''
            });
        }
        setIsLoading(false);
    }, []);

    const updateSubmissionData = (data) => {
        const newData = { ...submissionData, ...data };
        setSubmissionData(newData);
        if (data.email !== undefined) localStorage.setItem('submissionEmail', data.email);
        if (data.pendingEmail !== undefined) localStorage.setItem('submissionPendingEmail', data.pendingEmail);
        if (data.verificationToken !== undefined) localStorage.setItem('submissionVerificationToken', data.verificationToken);
        if (data.captchaSessionToken !== undefined) localStorage.setItem('submissionCaptchaSessionToken', data.captchaSessionToken);
        if (data.teamName !== undefined) localStorage.setItem('submissionTeamName', data.teamName);
        if (data.teamNo !== undefined) localStorage.setItem('submissionTeamNo', data.teamNo);
    };

    const clearSubmissionData = () => {
        localStorage.removeItem('submissionStage');
        localStorage.removeItem('submissionEmail');
        localStorage.removeItem('submissionPendingEmail');
        localStorage.removeItem('submissionVerificationToken');
        localStorage.removeItem('submissionCaptchaSessionToken');
        localStorage.removeItem('submissionTeamName');
        localStorage.removeItem('submissionTeamNo');
        setSubmissionStage(1);
        setSubmissionData({ email: '', pendingEmail: '', verificationToken: '', captchaSessionToken: '', teamName: '', teamNo: '' });
    };

    const updateSubmissionStage = (stage) => {
        setSubmissionStage(stage);
        localStorage.setItem('submissionStage', stage.toString());
    };

    const value = {
        submissionStage,
        submissionData,
        isLoading,
        clearSubmissionData,
        updateSubmissionData,
        updateSubmissionStage,
    };

    return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
};

export default SubmissionContext;
