import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bitcoin, Coins, ShieldCheck, ArrowLeft, RefreshCw, Zap, XCircle 
} from 'lucide-react';

// UI
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Hooks
import useCheckout from '../hooks/useCheckout';

// Components
import StatusBadge from './checkout/components/StatusBadge';
import CheckoutFileInfo from './checkout/components/CheckoutFileInfo';
import PaymentInfo from './checkout/components/PaymentInfo';
import ConfirmationState from './checkout/components/ConfirmationState';

const CheckoutPage = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  
  const {
    loading,
    refreshing,
    error,
    fetchData,
    handleDownload,
    payment,
    isConfirmed,
    isExpired,
    displayStatus,
    fileName,
    fileSize,
    data
  } = useCheckout(tokenId);

  if (loading) {
    return (
      <div className="min-h-screen bg-payfile-white flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-payfile-gold/20 border-t-payfile-gold animate-spin" />
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Loading...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-payfile-white flex flex-col items-center justify-center gap-8 px-6">
        <XCircle className="w-16 h-16 text-payfile-maroon/20" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-payfile-maroon mb-2">Checkout Error</h2>
          <p className="text-gray-500 text-sm font-medium">{error}</p>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-payfile-cream text-payfile-maroon font-black text-xs uppercase tracking-widest hover:bg-payfile-maroon hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-payfile-white text-payfile-maroon">
      <div className="relative max-w-xl mx-auto px-6 py-20 pt-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 animate-fade-down">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-payfile-maroon text-[10px] font-black uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => fetchData(false)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-payfile-gold transition-colors">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Main Checkout Card */}
        <Card className="rounded-[40px] border-payfile-maroon/5 bg-white shadow-2xl overflow-hidden animate-fade-up">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-payfile-maroon/5 bg-payfile-cream/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center shadow-lg shadow-payfile-maroon/20">
                {payment?.currency === 'BTC' ? (
                  <Bitcoin className="w-6 h-6 text-payfile-gold" />
                ) : (
                  <Coins className="w-6 h-6 text-payfile-gold" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">Checkout</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  Ref: {tokenId.slice(0, 12)}... {data?.purchase?.sale?.network ? `(${data.purchase.sale.network})` : ''}
                </p>
              </div>
            </div>
            <StatusBadge status={displayStatus} />
          </div>

          <div className="p-8 space-y-8">
            <CheckoutFileInfo fileName={fileName} fileSize={fileSize} />

            {isConfirmed ? (
              <ConfirmationState handleDownload={handleDownload} />
            ) : isExpired ? (
              <div className="text-center py-12 space-y-6">
                  <XCircle className="w-16 h-16 text-red-100 mx-auto" />
                  <div>
                      <h2 className="text-2xl font-black">Expired</h2>
                      <p className="text-gray-500 text-sm mt-3 font-medium">This payment session has expired.</p>
                  </div>
                  <Button variant="secondary" onClick={() => navigate(-1)} className="w-full">
                      Try Again
                  </Button>
              </div>
            ) : payment ? (
              <PaymentInfo payment={payment} network={data?.purchase?.sale?.network} />
            ) : null}
          </div>

          {/* Footer Badges */}
          <div className="px-8 py-5 border-t border-payfile-maroon/5 bg-payfile-cream/10 flex items-center justify-around">
            <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-help">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-help">
              <Zap className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Fast Delivery</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
