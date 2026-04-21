import React from 'react';
import Loader from './Loader';

const Button = ({ children, variant = 'primary', className = '', loading = false, disabled, ...props }) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-payfile-gold to-payfile-amber text-payfile-maroon-dark hover:from-payfile-amber hover:to-payfile-gold shadow-lg shadow-payfile-amber/20 hover:shadow-payfile-amber/40',
    secondary:
      'bg-payfile-cream text-payfile-maroon border border-payfile-maroon/20 hover:bg-white hover:border-payfile-amber/50',
    ghost: 'text-payfile-maroon hover:bg-payfile-cream',
    outline:
      'border border-payfile-gold text-payfile-maroon hover:bg-payfile-gold/10 hover:border-payfile-amber',
  };

  return (
    <button
      className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-250 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader variant="spinner" size="w-4 h-4" />
          <span className="opacity-80">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
