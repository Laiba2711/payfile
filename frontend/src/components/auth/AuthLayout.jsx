import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-payfile-black flex flex-col items-center justify-center p-6 hero-bg">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded bg-payfile-green flex items-center justify-center font-bold text-black text-2xl">
              P
            </div>
            <span className="text-2xl font-bold tracking-tight">PayFile</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-slate-400">{subtitle}</p>
        </div>

        <div className="glass border border-white/5 rounded-3xl p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
