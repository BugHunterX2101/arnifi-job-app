import axios from 'axios';

// NOTE: store is imported lazily to avoid circular dependency at module init time.
// We call getStore() only inside interceptors (at request time, not import time).
let _store = null;
export function setStore(store) {
  _store = store;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = _store?.getState().auth.token;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Handle 401 — clear stale auth from both localStorage AND Redux store
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sovereign_token');
      localStorage.removeItem('sovereign_user');
      // Dispatch logout to clear Redux state so UI reflects signed-out state
      if (_store) {
        // Lazy import avoids circular dep: axios <- authSlice <- axios
        import('../store/authSlice.js').then(({ logout }) => {
          _store.dispatch(logout());
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
