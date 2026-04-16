import React from 'react';
import { FileText } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const SaleSummary = ({ sale }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-payfile-gold" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">File Summary</h3>
      </div>

      {sale.file?.mimeType?.startsWith('image/') ? (
        <div className="relative w-full h-48 bg-payfile-cream/50 rounded-3xl overflow-hidden border border-payfile-gold/20 flex items-center justify-center group mb-4">
          <img 
            src={`/api/files/public/preview/${sale.file._id}`} 
            alt="File Preview" 
            className="w-full h-full object-cover blur-sm opacity-50 transition-all duration-300 group-hover:blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-payfile-white/80 to-transparent flex flex-col justify-end p-4 items-center">
            <span className="bg-payfile-maroon text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl">Purchase to Unlock HQ</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-40 bg-payfile-cream/10 rounded-3xl overflow-hidden border border-dashed border-payfile-maroon/20 flex flex-col items-center justify-center mb-4">
          <div className="w-16 h-16 bg-payfile-gold/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <span className="text-xl font-black text-payfile-gold">
              {sale.file?.name?.split('.').pop()?.toUpperCase() || 'FILE'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Premium Digital File</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 bg-payfile-cream/10 rounded-3xl p-6 border border-payfile-gold/10">
        <div className="flex justify-between items-center py-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name:</span>
          <span className="text-sm font-black text-payfile-maroon truncate max-w-[200px]">{sale.file?.name}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-t border-payfile-maroon/5 pt-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size:</span>
          <span className="text-sm font-bold text-gray-600">{formatFileSize(sale.file?.size)}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-t border-payfile-maroon/5 pt-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added:</span>
          <span className="text-sm font-bold text-gray-600">{formatDate(sale.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default SaleSummary;
