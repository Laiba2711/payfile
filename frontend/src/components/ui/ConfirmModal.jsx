import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-payfile-maroon/20 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-md bg-white p-8 relative shadow-[0_32px_64px_-16px_rgba(128,0,0,0.2)] border-payfile-gold/20 animate-fade-up">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-payfile-maroon p-2 transition-all hover:rotate-90"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-payfile-maroon/5 rounded-3xl flex items-center justify-center mb-4 border border-payfile-gold/10">
            <AlertTriangle className="w-8 h-8 text-payfile-gold" />
          </div>
          <h2 className="text-2xl font-black text-payfile-maroon tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            className="flex-1 py-4 text-sm font-bold border-payfile-maroon/5 hover:bg-payfile-maroon/5"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            className="flex-1 py-4 text-sm font-bold shadow-xl shadow-payfile-maroon/10"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
