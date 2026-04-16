import React from 'react';
import { FileText } from 'lucide-react';

const formatSize = (bytes) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const CheckoutFileInfo = ({ fileName, fileSize }) => {
  return (
    <div className="flex items-start gap-4 p-5 rounded-3xl bg-payfile-cream/30 border border-payfile-maroon/5">
      <div className="w-12 h-12 rounded-2xl bg-white border border-payfile-gold/20 flex items-center justify-center shrink-0 shadow-sm">
        <FileText className="w-6 h-6 text-payfile-gold" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-payfile-maroon truncate block">{fileName}</p>
        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
          {fileSize ? formatSize(fileSize) : 'Unknown Size'}
        </p>
      </div>
    </div>
  );
};

export default CheckoutFileInfo;
