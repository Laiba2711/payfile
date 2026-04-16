import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyBtn = ({ text, label = '' }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border
        ${copied
          ? 'bg-green-50 border-green-200 text-green-600'
          : 'bg-payfile-cream text-payfile-maroon border-payfile-maroon/10 hover:border-payfile-gold/30 hover:text-payfile-gold'
        }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label || 'Copy'}
    </button>
  );
};

export default CopyBtn;
