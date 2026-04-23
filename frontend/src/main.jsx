import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// ── Global Axios Auth Interceptor ──────────────────────────────────────────
// Automatically attaches the JWT token stored in localStorage to every request.
// This means protected API calls (like POST /api/purchases) will always include
// the Authorization header without needing to set it manually in each hook.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
