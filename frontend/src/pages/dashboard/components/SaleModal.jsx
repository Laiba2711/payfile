import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const SaleModal = ({ 
    isOpen, 
    onClose, 
    saleFile, 
    salePrice, 
    setSalePrice, 
    currency, 
    setCurrency, 
    network, 
    setNetwork, 
    btcAddress, 
    setBtcAddress, 
    handleCreateListing 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sell File"
      description={`Set your price and address for ${saleFile?.name}`}
      maxWidth="max-w-xl"
    >
        <form className="space-y-6" onSubmit={handleCreateListing}>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. 0.001"
                        className="w-full bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-sm font-black text-payfile-maroon outline-none focus:border-payfile-gold/50"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                    <select
                        className="w-full bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-sm font-black text-payfile-maroon outline-none appearance-none cursor-pointer"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="BTC">BTC</option>
                        <option value="USDT">USDT</option>
                    </select>
                </div>
            </div>

            {currency === 'USDT' && (
                <div className="space-y-3 animate-fade-in">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">USDT Network</label>
                    <div className="flex gap-4">
                        <div className="flex-1 py-4 rounded-2xl text-xs font-black bg-payfile-maroon text-white border border-payfile-maroon text-center cursor-default">
                            TRC20 (Tron)
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{currency} Payout Address {currency === 'USDT' ? `(${network})` : ''}</label>
                <input
                    type="text"
                    required
                    placeholder={currency === 'BTC' ? "bc1q..." : "T..."}
                    className="w-full bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-sm font-black text-payfile-maroon outline-none focus:border-payfile-gold/50"
                    value={btcAddress}
                    onChange={(e) => setBtcAddress(e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-payfile-maroon transition-colors">Cancel</button>
                <Button type="submit" variant="primary" className="px-10 font-black">Create Listing</Button>
            </div>
        </form>
    </Modal>
  );
};

export default SaleModal;
