import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white/2 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-payfile-green/20 hover:bg-white/3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
