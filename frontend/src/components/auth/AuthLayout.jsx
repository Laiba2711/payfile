import React from 'react';

const AuthLayout = ({ children, title, subtitle, image, imagePosition = 'left' }) => {
  return (
    <div className="min-h-[100svh] bg-payfile-white flex flex-col lg:flex-row overflow-hidden selection:bg-payfile-gold/30">
      {/* Image Section - Senior Polish: Volumetric lighting & smooth entrance */}
      {image && imagePosition === 'left' && (
        <div className="hidden lg:block lg:w-[45%] xl:w-[55%] relative overflow-hidden group">
          <div className="absolute inset-0 bg-payfile-maroon-dark animate-pulse opacity-20" />
          <img 
            src={image} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-out scale-105 group-hover:scale-100" 
            alt="Secure Authentication" 
            loading="eager"
          />
          {/* Advanced Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-payfile-maroon/60 via-transparent to-payfile-gold/30 mix-blend-overlay opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-payfile-maroon/80 via-transparent to-transparent opacity-60" />
          
          {/* Volumetric Light Spot */}
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-payfile-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          {/* Brand Accent - Fluid Positioning */}
          <div className="absolute bottom-12 left-12 z-20 p-8 xl:p-10 rounded-[40px] bg-black/30 backdrop-blur-xl border border-white/10 max-w-sm animate-fade-up">
            <div className="h-1 w-16 bg-payfile-gold mb-6 rounded-full" />
            <h2 className="text-white text-3xl xl:text-5xl font-black tracking-tight leading-[1.1]">
              <span className="text-payfile-gold drop-shadow-md">Secure.</span> <br />
              <span className="text-payfile-gold drop-shadow-md">Decentralized.</span> <br />
              <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">Powerful.</span>
            </h2>
            <p className="text-white/70 mt-6 text-sm xl:text-base font-medium leading-relaxed">
              The future of Bitcoin-native file sharing on the SatoshiBin Distributed Network.
            </p>
          </div>
        </div>
      )}

      {/* Form Section - Mobile First: Responsive padding and fluid width */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24 relative overflow-y-auto custom-scrollbar">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-payfile-maroon/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-payfile-gold/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        
        {/* Subtle Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] pointer-events-none" />

        <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
          <div className="text-center mb-8 sm:mb-12 animate-fade-down w-full">
            <div className="inline-flex items-center gap-3 mb-8 group cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="relative group-hover:rotate-[360deg] transition-transform duration-1000">
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                  <circle cx="50" cy="50" r="48" fill="#800000" stroke="#4A0E1B" strokeWidth="1" />
                  <g opacity="0.4" stroke="#FFD700" strokeWidth="0.5">
                    <circle cx="50" cy="50" r="42" fill="none" />
                    <path d="M50 5 V15 M50 85 V95 M5 50 H15 M85 50 H95" />
                  </g>
                  <g transform="translate(50, 50) scale(1.05) translate(-50, -50)" filter="url(#goldGlowAuth)">
                    <path d="M48 10 V90 M40 15 C75 15, 75 40, 50 45 C25 50, 25 80, 60 85 M50 45 C75 45, 75 75, 50 85" stroke="#FFD700" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <circle cx="50" cy="50" r="48" fill="url(#glassLayerAuthPalette)" />
                  <path d="M15 50 A35 35 0 0 1 50 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7" className="animate-pulse" />
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
                <div className="absolute inset-0 bg-payfile-maroon/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-payfile-maroon group-hover:text-payfile-gold transition-colors duration-300 font-brand">
                SatoshiBin
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-payfile-maroon mb-3 tracking-tight animate-fade-up">
              {title}
            </h1>
            <p className="text-payfile-maroon/60 font-semibold text-sm sm:text-base tracking-wide animate-fade-up [animation-delay:0.1s]">
              {subtitle}
            </p>
          </div>

          <div className="w-full glass p-6 sm:p-10 border border-payfile-maroon/5 shadow-[0_32px_64px_-16px_rgba(128,0,0,0.1)] rounded-[32px] sm:rounded-[48px] relative animate-fade-up [animation-delay:0.2s]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[inherit]" />
            {children}
          </div>
          
          <p className="text-center mt-10 text-[11px] text-payfile-maroon/40 font-black uppercase tracking-[0.25em] animate-fade-up [animation-delay:0.3s]">
            &copy; {new Date().getFullYear()} SatoshiBin. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Image Section - Right Position (XL+ logic) */}
      {image && imagePosition === 'right' && (
        <div className="hidden lg:block lg:w-[45%] xl:w-[55%] relative overflow-hidden group">
          <div className="absolute inset-0 bg-payfile-maroon-dark animate-pulse opacity-20" />
          <img 
            src={image} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-out scale-105 group-hover:scale-100" 
            alt="Join SatoshiBin" 
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-bl from-payfile-maroon/60 via-transparent to-payfile-gold/30 mix-blend-overlay opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-payfile-maroon/80 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-12 right-12 z-20 p-8 xl:p-10 rounded-[40px] bg-black/30 backdrop-blur-xl border border-white/10 max-w-sm text-right animate-fade-up">
            <div className="h-1 w-16 bg-payfile-gold mb-6 rounded-full ml-auto" />
            <h2 className="text-white text-3xl xl:text-5xl font-black tracking-tight leading-[1.1]">
              <span className="text-white drop-shadow-md">Join the</span> <br />
              <span className="text-payfile-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">Network.</span>
            </h2>
            <p className="text-white/70 mt-6 text-sm xl:text-base font-medium leading-relaxed">
              Experience the power of secure, localized settlement on the high-speed distributed network.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
