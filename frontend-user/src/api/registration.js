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

export const registrationAPI = {
  sendOTP: async (email, turnstileToken) => {
    const response = await api.post('/otp/send', {
      email,
      turnstile_token: turnstileToken,
      purpose: 'registration'
    });
    return response.data;
  },

  resendOTP: async (email, captchaSessionToken) => {
    const response = await api.post('/otp/resend', {
      email,
      captcha_session_token: captchaSessionToken,
      purpose: 'registration'
    });
    return response.data;
  },

  verifyOTP: async (email, otp, captchaSessionToken) => {
    const response = await api.post('/otp/verify', {
      email,
      otp,
      captcha_session_token: captchaSessionToken,
      purpose: 'registration'
    });
    return response.data;
  },

  register: async (registrationData) => {
    const response = await api.post('/registration/register', registrationData);
    return response.data;
  },
};

export default api;
