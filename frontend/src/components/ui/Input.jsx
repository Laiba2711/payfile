import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type = 'text', placeholder, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[10px] font-black text-payfile-maroon/60 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`w-full bg-payfile-cream/30 border border-payfile-maroon/10 rounded-2xl px-5 py-4 outline-none focus:border-payfile-gold/50 focus:ring-4 focus:ring-payfile-gold/5 transition-all text-payfile-maroon font-medium placeholder:text-gray-400 ${
            isPassword ? 'pr-12' : ''
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-payfile-maroon/40 hover:text-payfile-maroon transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
