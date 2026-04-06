import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const submissionAPI = {
  sendOTP: async (email, turnstileToken) => {
    const response = await api.post('/otp/send', {
      email,
      turnstile_token: turnstileToken,
      purpose: 'submission',
    });
    return response.data;
  },

  resendOTP: async (email, captchaSessionToken) => {
    const response = await api.post('/otp/resend', {
      email,
      captcha_session_token: captchaSessionToken,
      purpose: 'submission',
    });
    return response.data;
  },

  verifyOTP: async (email, otp, captchaSessionToken) => {
    const response = await api.post('/otp/verify', {
      email,
      otp,
      captcha_session_token: captchaSessionToken,
      purpose: 'submission',
    });
    return response.data;
  },

  getPresignedUrl: async (verificationToken, teamNo, teamName) => {
    const response = await api.post('/submission/presigned-url', {
      verification_token: verificationToken,
      team_no: teamNo,
      team_name: teamName,
    });
    return response.data;
  },

  directUploadToR2: async (uploadUrl, file, onUploadProgress) => {
    const response = await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress,
    });
    return response;
  },

  submitProposal: async (data) => {
    const response = await api.post('/submission/submit', data);
    return response.data;
  },
};

export default api;
