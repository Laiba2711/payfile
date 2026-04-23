import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bitcoin, Info, AlertCircle, Clock, ShieldCheck, Coins } from 'lucide-react';

// UI
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';
import Loader from '../components/ui/Loader';

// Hooks
import usePurchase from '../hooks/usePurchase';

// Components
import SaleSummary from './purchase/components/SaleSummary';

const PurchasePage = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();

  const {
    sale,
    loading,
    error,
    buyLoading,
    handleBuyNow,
  } = usePurchase(saleId);

  if (loading) {
    return <Loader variant="fullscreen" label="Loading Listing..." />;
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-payfile-white pt-32 pb-12 flex flex-col items-center">
        <Card className="max-w-md w-full p-8 border-payfile-maroon/20 bg-payfile-cream/10 text-center">
          <AlertCircle className="w-12 h-12 text-payfile-maroon mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Button variant="primary" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const isExpired = sale.expiresAt && new Date(sale.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-payfile-white pt-32 pb-20 text-payfile-maroon">
      <div className="max-w-2xl mx-auto px-6">
        <Card className="border-payfile-gold/10 bg-white overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-payfile-maroon/5 flex items-center justify-between bg-payfile-cream/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-payfile-gold/10 flex items-center justify-center">
                {sale.currency === 'USDT' ? (
                  <Coins className="w-6 h-6 text-payfile-gold" />
                ) : (
                  <Bitcoin className="w-6 h-6 text-payfile-gold" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">Buy File</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {sale.currency === 'BTC' ? 'Bitcoin' : `USDT (${sale.network})`} Marketplace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sale.currency === 'USDT' && (
                <span className="px-3 py-1 bg-payfile-amber/10 text-payfile-amber border border-payfile-amber/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {sale.network}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isExpired ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
              }`}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <SaleSummary sale={sale} />

            {/* Price Section */}
            <div className="py-10 text-center relative overflow-hidden rounded-3xl bg-payfile-maroon/5 border border-payfile-maroon/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-payfile-gold/30 to-transparent"></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">Price</p>
              <div className="flex flex-col items-center">
                <span className="text-6xl font-black text-payfile-maroon tracking-tighter mb-2">
                  {sale.totalPrice} <span className="text-payfile-gold text-2xl">{sale.currency}</span>
                </span>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-payfile-cream/5 rounded-3xl p-6 border border-payfile-gold/5 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-payfile-gold" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">How to Buy:</h4>
              </div>
              <ul className="space-y-4">
                {[
                  'Click "Buy Now" to start the process',
                  `Pay the requested amount in ${sale.currency === 'BTC' ? 'Bitcoin' : `USDT (${sale.network})`}`,
                  'Wait for payment confirmation',
                  'Download your file instantly'
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 text-xs font-semibold text-gray-600 leading-relaxed group">
                    <span className="w-6 h-6 rounded-full bg-payfile-gold/10 flex items-center justify-center text-payfile-gold text-[10px] font-black group-hover:bg-payfile-gold group-hover:text-white transition-all shrink-0">{i + 1}</span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wide animate-fade-in">
                {error}
              </div>
            )}

            {/* Buy Now Button */}
            <Button
              id="buy-now-btn"
              variant="primary"
              className="w-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-payfile-amber/20"
              onClick={handleBuyNow}
              disabled={isExpired || buyLoading}
              loading={buyLoading}
            >
              {isExpired ? 'Listing Expired' : buyLoading ? 'Preparing Payment...' : 'Buy Now'}
            </Button>
          </div>

          {/* Trust Footer */}
          <div className="px-8 py-6 bg-payfile-cream/10 border-t border-payfile-maroon/5 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-help">
              <ShieldCheck className="w-4 h-4 text-payfile-maroon" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure</span>
            </div>
            <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-help">
              <Clock className="w-4 h-4 text-payfile-maroon" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">P2P</span>
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PurchasePage;
