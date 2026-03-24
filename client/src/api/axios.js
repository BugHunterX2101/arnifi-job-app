import axios from 'axios';
import { store } from '../store/index.js';

// In production on Netlify, /api/* is rewritten to /.netlify/functions/api/*
// In development with `netlify dev`, same proxy works automatically
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Handle 401 — clear stale auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sovereign_token');
      localStorage.removeItem('sovereign_user');
    }
    return Promise.reject(error);
  }
);

export default api;
