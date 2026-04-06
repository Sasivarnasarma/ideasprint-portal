import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAuthAPI = {
  login: async (username, password, turnstileToken) => {
    const response = await api.post('/admin/auth/login', {
      username,
      password,
      turnstile_token: turnstileToken,
    });
    return response.data;
  },

  register: async (username, password, turnstileToken) => {
    const response = await api.post('/admin/auth/register', {
      username,
      password,
      turnstile_token: turnstileToken,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/admin/auth/me');
    return response.data;
  },
};

export const adminDashboardAPI = {
  getMetrics: async () => {
    const response = await api.get('/admin/dashboard/metrics');
    return response.data;
  },
  getTeams: async () => {
    const response = await api.get('/admin/teams');
    return response.data;
  },
  getTeamDetails: async (teamId) => {
    const response = await api.get(`/admin/teams/${teamId}`);
    return response.data;
  },
  getAdmins: async () => {
    const response = await api.get('/admin/admins');
    return response.data;
  },
  approveAdmin: async (adminId) => {
    const response = await api.post(`/admin/admins/${adminId}/approve`);
    return response.data;
  },
  deleteAdmin: async (adminId) => {
    const response = await api.delete(`/admin/admins/${adminId}`);
    return response.data;
  },
};

export default api;
