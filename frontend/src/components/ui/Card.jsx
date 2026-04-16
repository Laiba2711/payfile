import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const hasBg = className.includes('bg-');
  const hasBorder = className.includes('border-');
  
  return (
    <div
      className={`${!hasBg ? 'bg-payfile-white' : ''} ${
        !hasBorder ? 'border border-payfile-maroon/10' : ''
      } rounded-2xl p-6 transition-all duration-300 hover:border-payfile-gold/30 hover:shadow-xl hover:shadow-payfile-maroon/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
