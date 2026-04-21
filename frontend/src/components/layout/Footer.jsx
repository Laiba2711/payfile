import React from 'react';

const Footer = () => {
  return (
    <footer className="py-20 bg-payfile-cream/30 border-t border-payfile-maroon/5 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="relative group-hover:scale-110 transition-all duration-500">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Official Theme Maroon Coin Body */}
                <circle cx="50" cy="50" r="48" fill="#800000" stroke="#4A0E1B" strokeWidth="1" />
                
                {/* Coin Detailing */}
                <g opacity="0.4" stroke="#FFD700" strokeWidth="0.5">
                  <circle cx="50" cy="50" r="42" fill="none" />
                  <path d="M50 5 V15 M50 85 V95 M5 50 H15 M85 50 H95" />
                </g>

                {/* Golden Monogram */}
                <g transform="translate(50, 50) scale(1.05) translate(-50, -50)" filter="url(#goldGlowFooter)">
                  <path d="M48 10 V90 M40 15 C75 15, 75 40, 50 45 C25 50, 25 80, 60 85 M50 45 C75 45, 75 75, 50 85" stroke="#FFD700" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
                
                {/* Crystal Glass Layer */}
                <circle cx="50" cy="50" r="48" fill="url(#glassLayerFooterPalette)" />
                
                <defs>
                  <filter id="goldGlowFooter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="glassLayerFooterPalette" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
              <span 
                className="brand-logo text-xl font-extrabold tracking-tight text-payfile-maroon"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >SatoshiBin</span>
            </div>
            <p className="text-gray-500 font-medium max-w-sm leading-relaxed">
              Secure digital identity and localized settlement on the SatoshiBin Distributed Network. 
              The ultimate high-speed Bitcoin marketplace.
            </p>
          </div>
          
          <div>
            <h4 className="text-payfile-maroon font-black uppercase text-[14px] tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <li><a href="/terms" className="hover:text-payfile-maroon transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-payfile-maroon transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-payfile-maroon font-black uppercase text-[14px] tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <li><a href="/faq" className="hover:text-payfile-maroon transition-colors">Documentation</a></li>
              <li><a href="/bitcoin" className="hover:text-payfile-maroon transition-colors">Bitcoin Network</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-slate-600 text-sm pt-8 border-t border-white/5">
          © 2026 SatoshiBin. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
