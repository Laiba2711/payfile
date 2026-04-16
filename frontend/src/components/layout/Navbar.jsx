import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = ({ isLoggedIn = false, onLogout, user }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-payfile-maroon/5 animate-fade-down">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div 
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-payfile-maroon to-payfile-maroon-dark flex items-center justify-center font-bold text-payfile-gold text-lg shadow-lg shadow-payfile-maroon/20 group-hover:scale-105 transition-transform duration-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            P
          </div>
          <span 
            className="brand-logo text-xl font-extrabold tracking-tight text-payfile-maroon group-hover:text-payfile-gold transition-colors duration-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PayFile
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-payfile-maroon transition-colors duration-200 font-semibold"
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <span className="text-gray-400 text-sm">Hello, {user?.firstName}</span>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-payfile-maroon transition-colors duration-200 font-semibold"
              >
                Dashboard
              </Link>
              <Button
                variant="secondary"
                onClick={onLogout}
                className="min-w-[100px]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/faq"
                className="text-gray-600 hover:text-payfile-maroon transition-colors duration-200 font-semibold"
              >
                FAQ
              </Link>
              <Link to="/login">
                <Button variant="primary" className="min-w-[100px]">
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
