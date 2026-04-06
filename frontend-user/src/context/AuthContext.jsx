import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [registrationStage, setRegistrationStage] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    email: '',
    pendingEmail: '',
    name: '',
    phone: '',
    imNumber: '',
    verificationToken: '',
    captchaSessionToken: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedStage = localStorage.getItem('registrationStage');
    const savedEmail = localStorage.getItem('registrationEmail');
    const savedPendingEmail = localStorage.getItem('registrationPendingEmail');
    const savedName = localStorage.getItem('registrationName');
    const savedPhone = localStorage.getItem('registrationPhone');
    const savedImNumber = localStorage.getItem('registrationImNumber');
    const savedVerificationToken = localStorage.getItem('verificationToken');
    const savedCaptchaSession = localStorage.getItem('captchaSessionToken');

    if (savedStage) {
      setRegistrationStage(parseInt(savedStage, 10));
    }
    if (
      savedEmail ||
      savedPendingEmail ||
      savedName ||
      savedPhone ||
      savedImNumber ||
      savedVerificationToken ||
      savedCaptchaSession
    ) {
      setRegistrationData({
        email: savedEmail || '',
        pendingEmail: savedPendingEmail || '',
        name: savedName || '',
        phone: savedPhone || '',
        imNumber: savedImNumber || '',
        verificationToken: savedVerificationToken || '',
        captchaSessionToken: savedCaptchaSession || '',
      });
    }
    setIsLoading(false);
  }, []);

  const updateRegistrationData = (data) => {
    const newData = { ...registrationData, ...data };
    setRegistrationData(newData);
    if (data.email !== undefined) localStorage.setItem('registrationEmail', data.email);
    if (data.pendingEmail !== undefined) localStorage.setItem('registrationPendingEmail', data.pendingEmail);
    if (data.name !== undefined) localStorage.setItem('registrationName', data.name);
    if (data.phone !== undefined) localStorage.setItem('registrationPhone', data.phone);
    if (data.imNumber !== undefined) localStorage.setItem('registrationImNumber', data.imNumber);
    if (data.verificationToken !== undefined) localStorage.setItem('verificationToken', data.verificationToken);
    if (data.captchaSessionToken !== undefined) localStorage.setItem('captchaSessionToken', data.captchaSessionToken);
  };

  const clearRegistrationData = () => {
    localStorage.removeItem('registrationStage');
    localStorage.removeItem('registrationEmail');
    localStorage.removeItem('registrationPendingEmail');
    localStorage.removeItem('registrationName');
    localStorage.removeItem('registrationPhone');
    localStorage.removeItem('registrationImNumber');
    localStorage.removeItem('verificationToken');
    localStorage.removeItem('captchaSessionToken');
    setRegistrationStage(1);
    setRegistrationData({
      email: '',
      pendingEmail: '',
      name: '',
      phone: '',
      imNumber: '',
      verificationToken: '',
      captchaSessionToken: '',
    });
  };

  const updateRegistrationStage = (stage) => {
    setRegistrationStage(stage);
    localStorage.setItem('registrationStage', stage.toString());
  };

  const value = {
    registrationStage,
    registrationData,
    isLoading,
    clearRegistrationData,
    updateRegistrationData,
    updateRegistrationStage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
