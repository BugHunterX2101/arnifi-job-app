import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { setStore } from './api/axios.js';
import App from './App.jsx';
import './index.css';

// Give the axios interceptor a reference to the Redux store so it can
// dispatch logout() on 401 responses, keeping UI state consistent.
setStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
