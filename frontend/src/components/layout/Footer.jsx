import React from 'react';

const Footer = () => {
  return (
    <footer className="py-20 bg-payfile-cream/30 border-t border-payfile-maroon/5 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.location.href = '/'}>
              <div 
                className="w-10 h-10 rounded-xl bg-payfile-maroon flex items-center justify-center font-bold text-payfile-gold text-xl shadow-lg shadow-payfile-maroon/10"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                P
              </div>
              <span 
                className="brand-logo text-xl font-extrabold tracking-tight text-payfile-maroon"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >PayFile</span>
            </div>
            <p className="text-gray-500 font-medium max-w-sm leading-relaxed">
              Secure digital identity and localized settlement on the PayFile Distributed Network. 
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
          © 2026 PayFile. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
