import axios from 'axios';

const authClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

export const login = (email, password) =>
  authClient.post('/auth/login', { email, password });

export const register = (data) =>
  authClient.post('/auth/register', data);

export const logout = () =>
  authClient.post('/auth/logout');

export const getMe = () =>
  authClient.get('/auth/me');

export const requestPasswordReset = (email) =>
  authClient.post('/auth/forgot-password/request', { email });

export const resendPasswordReset = (email) =>
  authClient.post('/auth/forgot-password/resend', { email });

export const verifyPasswordReset = (payload) =>
  authClient.post('/auth/forgot-password/verify', payload);
