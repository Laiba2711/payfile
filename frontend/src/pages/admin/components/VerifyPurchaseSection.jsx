import React from 'react';
import { ShoppingBag, Loader2, CheckCircle2, Info, Users, DollarSign, AlertTriangle, RefreshCcw } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const VerifyPurchaseSection = ({
  searchTokenId,
  setSearchTokenId,
  handleCheckToken,
  checkingToken,
  purchaseDetails,
  handleConfirmPayment,
  confirmingPayment,
  handleRetryPayout,
  retryingPayout
}) => {
  return (
    <Card className="p-6 md:p-10 border-payfile-maroon/5 shadow-2xl">
        <div className="mb-10 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-payfile-maroon tracking-tight flex items-center gap-3">
                    <ShoppingBag className="w-7 h-7 text-payfile-gold" />
                    Verify Purchase
                </h2>
                <p className="text-gray-500 mt-2 font-medium">Verify transactions and manually confirm purchases if needed.</p>
            </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Token ID</label>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter Token ID"
                className="flex-1 bg-payfile-cream/30 border border-payfile-maroon/10 rounded-2xl px-6 py-4 outline-none focus:border-payfile-gold/50 transition-all text-payfile-maroon font-black uppercase"
                value={searchTokenId}
                onChange={(e) => setSearchTokenId(e.target.value.toUpperCase())}
              />
              <Button
                variant="primary"
                className="px-12 font-black py-4 h-[60px]"
                onClick={handleCheckToken}
                disabled={checkingToken}
              >
                {checkingToken ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Check Token'}
              </Button>
            </div>
          </div>

          {purchaseDetails && (
            <div className="animate-fade-in space-y-8 bg-payfile-cream/20 border border-payfile-gold/20 rounded-[32px] p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-payfile-gold/20 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-7 h-7 text-payfile-gold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-payfile-maroon">{purchaseDetails.file?.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5 font-bold">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">ID: {purchaseDetails.tokenId}</span>
                        <div className="w-1.5 h-1.5 bg-payfile-gold rounded-full" />
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{purchaseDetails.seller?.email}</span>
                        <div className="w-1.5 h-1.5 bg-payfile-gold rounded-full" />
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                            purchaseDetails.sale?.currency === 'BTC' ? 'bg-payfile-gold/5 text-payfile-gold border-payfile-gold/10' : 'bg-payfile-amber/5 text-payfile-amber border-payfile-amber/10'
                        }`}>
                            {purchaseDetails.sale?.network || 'BTC'}
                        </span>
                    </div>
                  </div>
                </div>
                <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                  purchaseDetails.status === 'confirmed' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-payfile-amber/10 text-payfile-amber border-payfile-amber/20'
                }`}>
                  {purchaseDetails.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8 bg-white rounded-3xl border border-payfile-maroon/5">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Price</p>
                  <p className="text-3xl font-black text-payfile-maroon">{purchaseDetails.sale?.price} <span className="text-payfile-gold text-sm tracking-tighter">{purchaseDetails.sale?.currency}</span></p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Payout Address</p>
                  <p className="text-[12px] font-black font-mono text-payfile-maroon/70 break-all bg-payfile-cream/30 p-4 rounded-xl border border-payfile-maroon/5">{purchaseDetails.sale?.address}</p>
                </div>
              </div>

              {purchaseDetails.status === 'pending' ? (
                <div className="flex flex-col md:flex-row gap-6">
                    <Button
                        variant="primary"
                        onClick={handleConfirmPayment}
                        disabled={confirmingPayment}
                        className="flex-1 py-5 shadow-xl shadow-payfile-amber/20"
                    >
                        {confirmingPayment ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                        Confirm Payment
                    </Button>
                    <div className="flex-1 p-6 rounded-[24px] bg-payfile-amber/5 border border-payfile-amber/10 text-payfile-maroon/60 text-[11px] font-semibold flex items-start gap-4 leading-relaxed">
                        <Info className="w-6 h-6 text-payfile-amber shrink-0" />
                        <span>Warning: Only confirm if you have manually verified the payment on the blockchain.</span>
                    </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 py-8 bg-green-50 border border-green-100 rounded-3xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600 animate-pulse" />
                    <span className="text-xs font-black text-green-700 uppercase tracking-widest">Payment Confirmed</span>
                  </div>

                  {/* Payout Status Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        purchaseDetails.sellerPayoutProcessed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-payfile-maroon/5 border-payfile-maroon/10 text-payfile-maroon/50'
                    }`}>
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Seller Payout</span>
                        </div>
                        {purchaseDetails.sellerPayoutProcessed ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    </div>

                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        purchaseDetails.adminPayoutProcessed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-payfile-maroon/5 border-payfile-maroon/10 text-payfile-maroon/50'
                    }`}>
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Admin Payout</span>
                        </div>
                        {purchaseDetails.adminPayoutProcessed ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    </div>
                  </div>

                  {!purchaseDetails.payoutsProcessed && (
                    <div className="p-6 bg-payfile-maroon rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="w-6 h-6 text-payfile-gold" />
                            <div>
                                <p className="text-xs font-black text-payfile-gold uppercase tracking-widest">Incomplete Distribution</p>
                                <p className="text-[10px] text-white/70 font-medium">One or more payouts failed to process automatically.</p>
                            </div>
                        </div>
                        <Button 
                            variant="primary" 
                            className="bg-payfile-gold text-payfile-maroon hover:bg-white w-full md:w-auto px-8"
                            onClick={handleRetryPayout}
                            disabled={retryingPayout}
                        >
                            {retryingPayout ? <Loader2 className="w-4 h-4 animate-spin text-payfile-maroon" /> : <RefreshCcw className="w-4 h-4 text-payfile-maroon" />}
                            Retry Payouts
                        </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
    </Card>
  );
};

export default VerifyPurchaseSection;
