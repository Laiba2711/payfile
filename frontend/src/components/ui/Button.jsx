import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-payfile-green text-black hover:bg-payfile-green/90',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
    ghost: 'text-white hover:bg-white/5',
    outline: 'border border-payfile-green text-payfile-green hover:bg-payfile-green/10',
  };

  return (
    <button
      className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none block-inline text-center ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
