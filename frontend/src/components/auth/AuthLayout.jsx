import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-payfile-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Premium Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-payfile-gold/5 rounded-full blur-[120px] pointer-events-none animate-orb-drift" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-payfile-amber/5 rounded-full blur-[120px] pointer-events-none animate-orb-drift" style={{ animationDirection: 'reverse' }} />

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-payfile-maroon transition-all font-black text-[10px] uppercase tracking-widest group"
        style={{ zIndex: 10 }}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Card wrapper */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-payfile-maroon to-payfile-maroon-dark flex items-center justify-center font-bold text-payfile-gold text-2xl shadow-xl shadow-payfile-maroon/20 group-hover:scale-105 transition-all duration-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              P
            </div>
            <span 
              className="text-2xl font-black tracking-tight text-payfile-maroon group-hover:text-payfile-gold transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >PayFile</span>
          </div>
          <h1 className="text-4xl font-black mb-2 text-payfile-maroon tracking-tight">{title}</h1>
          <p className="text-gray-500 font-medium">{subtitle}</p>
        </div>

        <div
          className="rounded-[40px] p-10 bg-white border border-payfile-gold/20 shadow-2xl shadow-payfile-maroon/5 relative overflow-hidden"
        >
          {/* Internal glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-payfile-gold/5 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-payfile-maroon">End-to-End Encrypted Settlement</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
