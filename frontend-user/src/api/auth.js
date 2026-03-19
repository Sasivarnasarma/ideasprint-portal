import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  sendOTP: async (email, turnstileToken) => {
    const response = await api.post('/auth/otp/send', {
      email,
      turnstile_token: turnstileToken,
    });
    return response.data;
  },

  resendOTP: async (email, captchaSessionToken) => {
    const response = await api.post('/auth/otp/resend', {
      email,
      captcha_session_token: captchaSessionToken,
    });
    return response.data;
  },

  verifyOTP: async (email, otp, captchaSessionToken) => {
    const response = await api.post('/auth/otp/verify', {
      email,
      otp,
      captcha_session_token: captchaSessionToken,
    });
    return response.data;
  },

  register: async (registrationData) => {
    const response = await api.post('/auth/register', registrationData);
    return response.data;
  },
};

export default api;
