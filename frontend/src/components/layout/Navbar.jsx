import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = ({ isLoggedIn = false, onLogout, user }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-payfile-green flex items-center justify-center font-bold text-black text-xl">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">PayFile</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
          {isLoggedIn ? (
            <>
              <span className="text-slate-500 text-sm">Hello, {user?.firstName}</span>
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors underline-offset-8 decoration-payfile-green decoration-2">Dashboard</Link>
              <Button variant="secondary" onClick={onLogout} className="flex items-center gap-2 border-white/10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/faq" className="text-slate-300 hover:text-white transition-colors">FAQ</Link>
              <Link to="/login">
                <Button variant="primary" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
