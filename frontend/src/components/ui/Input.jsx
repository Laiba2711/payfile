import React from 'react';

const Input = ({ label, type = 'text', placeholder, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-payfile-green/50 transition-colors text-white placeholder:text-slate-600"
        {...props}
      />
    </div>
  );
};

export default Input;
