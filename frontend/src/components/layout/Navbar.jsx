import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = ({ isLoggedIn = false, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-payfile-maroon/5 animate-fade-down">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative group-hover:scale-110 transition-all duration-500">
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              
              {/* Official Theme Maroon Coin Body */}
              <circle cx="50" cy="50" r="48" fill="#800000" stroke="#4A0E1B" strokeWidth="1" />
              
              {/* Coin Detailing */}
              <g opacity="0.4" stroke="#FFD700" strokeWidth="0.5">
                <circle cx="50" cy="50" r="42" fill="none" />
                <path d="M50 5 V15 M50 85 V95 M5 50 H15 M85 50 H95" />
              </g>

              {/* Golden Monogram */}
              <g transform="translate(50, 50) scale(1.05) translate(-50, -50)" filter="url(#goldGlowNav)">
                <path
                  d="M48 10 V90 
                     M40 15 C75 15, 75 40, 50 45 
                     C25 50, 25 80, 60 85 
                     M50 45 C75 45, 75 75, 50 85"
                  stroke="#FFD700"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
              
              {/* Crystal Glass Layer */}
              <circle cx="50" cy="50" r="48" fill="url(#glassLayerNavPalette)" />
              
              {/* Shimmer (animation removed) */}
              <path
                d="M15 50 A35 35 0 0 1 50 15"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.6"
              />

              <defs>
                <filter id="goldGlowNav" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="glassLayerNavPalette" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.02" />
                </linearGradient>
              </defs>

            </svg>

            <div className="absolute inset-0 bg-payfile-gold/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <span
            className="brand-logo text-xl font-extrabold tracking-tight text-payfile-maroon group-hover:text-payfile-gold transition-colors duration-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SatoshiBin
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-payfile-maroon transition-colors duration-200 font-semibold"
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <span className="text-gray-400 text-sm">
                Hello, {user?.firstName}
              </span>

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

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-payfile-maroon hover:bg-payfile-maroon/5 rounded-xl transition-colors"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-payfile-maroon/5 animate-fade-down">
          <div className="px-6 py-8 flex flex-col gap-6">
            <Link
              to="/"
              className="text-lg font-bold text-gray-600 hover:text-payfile-maroon transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-lg font-bold text-gray-600 hover:text-payfile-maroon transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="pt-4 border-t border-payfile-maroon/5">
                   <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Account</p>
                   <Button
                    variant="secondary"
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/faq"
                  className="text-lg font-bold text-gray-600 hover:text-payfile-maroon transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <div className="pt-4 border-t border-payfile-maroon/5">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center py-4">
                      Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;