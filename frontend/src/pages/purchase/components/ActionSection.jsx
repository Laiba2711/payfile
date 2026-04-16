import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ActionSection = ({ 
    tokenGenerated, 
    purchase, 
    isExpired, 
    handleGenerateToken, 
    handleDownload 
}) => {
  const navigate = useNavigate();

  if (!tokenGenerated) {
    return (
      <Button
        variant="primary"
        className="w-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-payfile-amber/20"
        onClick={handleGenerateToken}
        disabled={isExpired}
      >
        {isExpired ? 'Expired' : 'Buy Now'}
      </Button>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in border-2 border-payfile-gold/20 bg-payfile-cream/20 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${purchase.status === 'confirmed' ? 'bg-green-100' : 'bg-payfile-amber/10'}`}>
          <CheckCircle2 className={`w-6 h-6 ${purchase.status === 'confirmed' ? 'text-green-600' : 'text-payfile-amber'}`} />
        </div>
        <span className={`text-md font-black uppercase tracking-wider ${purchase.status === 'confirmed' ? 'text-green-600' : 'text-payfile-amber'}`}>
          {purchase.status === 'confirmed' ? 'Confirmed' : 'Pending'}
        </span>
      </div>
      
      <div className="space-y-6">
        {purchase.status === 'pending' ? (
          <>
            <p className="text-xs text-center text-gray-500 font-medium">Please complete the payment to access your file.</p>
            <Button
              variant="primary"
              className="w-full py-4 text-sm font-black flex items-center justify-center gap-3"
              onClick={() => navigate(`/checkout/${purchase.tokenId}`)}
            >
              Launch Checkout <ExternalLink className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-2xl border border-payfile-gold/10 shadow-sm animate-pulse">
              <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-payfile-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-payfile-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-payfile-gold animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Checking status...</span>
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h4 className="text-2xl font-black text-payfile-maroon tracking-tight">Success!</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Your file is ready for download</p>
            </div>
            <Button
              variant="primary"
              className="w-full py-5 flex items-center justify-center gap-4 text-sm font-black"
              onClick={handleDownload}
            >
              <Download className="w-6 h-6" />
              Download File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionSection;
