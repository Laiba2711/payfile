import React from 'react';
import { XCircle } from 'lucide-react';
import Card from './Card';

const Modal = ({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-payfile-maroon/20 backdrop-blur-sm animate-fade-in">
      <Card className={`w-full ${maxWidth} bg-white p-8 relative shadow-2xl border-payfile-gold/20`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-payfile-maroon p-2 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        {title && <h2 className="text-2xl font-black text-payfile-maroon mb-2">{title}</h2>}
        {description && <p className="text-sm text-gray-500 mb-8 font-medium">{description}</p>}

        {children}
      </Card>
    </div>
  );
};

export default Modal;
