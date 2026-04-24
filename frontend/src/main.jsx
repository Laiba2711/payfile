import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Baseline axios config. In local dev VITE_API_URL is empty and Vite's dev
// server proxies /api → backend (see vite.config.js). In production (Render
// static site), VITE_API_URL is the full backend origin (https://...) so
// requests like axios.get('/api/files') become cross-origin calls to the
// backend service instead of hitting the SPA rewrite on the frontend's own
// domain.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Automatically attaches the JWT token stored in localStorage to every request.
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
