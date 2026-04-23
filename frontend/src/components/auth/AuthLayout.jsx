import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-[100svh] bg-payfile-white flex items-center justify-center overflow-hidden selection:bg-payfile-gold/30 p-4">
      {/* Form Section - Simple Centered Layout */}
      <div className="w-full max-w-[480px] relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-payfile-maroon/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-payfile-gold/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        
        {/* Subtle Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-center mb-8 sm:mb-10 animate-fade-down w-full">
            <div className="inline-flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="relative group-hover:rotate-[360deg] transition-transform duration-1000">
                <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                  <circle cx="50" cy="50" r="48" fill="#800000" stroke="#4A0E1B" strokeWidth="1" />
                  <g transform="translate(50, 50) scale(1.05) translate(-50, -50)" filter="url(#goldGlowAuth)">
                    <path d="M48 10 V90 M40 15 C75 15, 75 40, 50 45 C25 50, 25 80, 60 85 M50 45 C75 45, 75 75, 50 85" stroke="#FFD700" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <circle cx="50" cy="50" r="48" fill="url(#glassLayerAuthPalette)" />
                  <defs>
                    <filter id="goldGlowAuth" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="glassLayerAuthPalette" x1="0" y1="0" x2="100" y2="100">
                      <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="white" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-payfile-maroon group-hover:text-payfile-gold transition-colors duration-300 font-brand">
                SatoshiBin
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-payfile-maroon mb-2 tracking-tight animate-fade-up">
              {title}
            </h1>
            <p className="text-payfile-maroon/60 font-semibold text-sm tracking-wide animate-fade-up [animation-delay:0.1s]">
              {subtitle}
            </p>
          </div>

          <div className="w-full glass p-6 sm:p-10 border border-payfile-maroon/5 shadow-[0_32px_64px_-16px_rgba(128,0,0,0.1)] rounded-[40px] relative animate-fade-up [animation-delay:0.2s]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[inherit]" />
            {children}
          </div>
          
          <p className="text-center mt-8 text-[10px] text-payfile-maroon/40 font-black uppercase tracking-[0.25em] animate-fade-up [animation-delay:0.3s]">
            &copy; {new Date().getFullYear()} SatoshiBin. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
