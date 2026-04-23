import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import FAQPage from './pages/FAQPage';
import PurchasePage from './pages/PurchasePage';
import CheckoutPage from './pages/CheckoutPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BitcoinNetwork from './pages/BitcoinNetwork';
import SharedDownloadPage from './pages/SharedDownloadPage';
import Navbar from './components/layout/Navbar';
import { ConfirmProvider } from './context/ConfirmContext';


// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHistory from './pages/admin/AdminHistory';
import AdminSettings from './pages/admin/AdminSettings';

// Auth routes where the Navbar should NOT appear
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/admin/login'];
// Routes starting with /admin should also hide the main Navbar
const isAdminPage = (path) => path.startsWith('/admin');

// Wrapper component to use useNavigate / useLocation
const AppContent = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (userData, token, redirectTo = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // If there's a redirect target (e.g. from a purchase listing), go there first
    if (redirectTo) {
      navigate(redirectTo);
    } else if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isLoggedIn = !!user;
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const hideMainNavbar = isAuthPage || isAdminPage(location.pathname);

  return (
    <div className="min-h-screen bg-payfile-white text-maroon selection:bg-payfile-amber/20 selection:text-payfile-maroon">
      {/* Hide Navbar on auth/admin pages */}
      {!hideMainNavbar && (
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/listing/:saleId" element={<PurchasePage />} />
        <Route path="/checkout/:tokenId" element={<CheckoutPage />} />
        <Route path="/download/:fileId" element={<SharedDownloadPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/bitcoin" element={<BitcoinNetwork />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route path="/admin" element={<AdminLayout user={user} onLogout={handleLogout} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </Router>
  );

}

export default App;
