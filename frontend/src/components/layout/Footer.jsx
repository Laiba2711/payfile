import React from 'react';

const Footer = () => {
  return (
    <footer className="py-20 bg-payfile-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-payfile-green flex items-center justify-center font-bold text-black text-xl">
                P
              </div>
              <span className="text-xl font-bold tracking-tight">PayFile</span>
            </div>
            <p className="text-slate-500 max-w-sm">
              Upload, share, and sell files via Bitcoin. Decentralized storage on the Internet Computer blockchain.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-payfile-green transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-payfile-green transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-payfile-green transition-colors">Internet Computer</a></li>
              <li><a href="#" className="hover:text-payfile-green transition-colors">Bitcoin</a></li>
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
