import React from 'react';
import { ShoppingBag, Bitcoin, Copy, ExternalLink } from 'lucide-react';
import Card from '../../../components/ui/Card';

const SalesGrid = ({ sales, showToast }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const copyListingLink = (saleId) => {
    navigator.clipboard.writeText(`${window.location.origin}/listing/${saleId}`);
    showToast('Link copied!');
  };

  return (
    <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-payfile-maroon" />
                <h2 className="text-2xl font-black">Sales</h2>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sales.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 bg-payfile-cream/20 rounded-3xl border border-dashed border-payfile-gold/20">
                    No active sales listings.
                </div>
            ) : (
                sales.map((sale) => (
                    <Card key={sale._id} className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-payfile-gold/5 blur-3xl rounded-full" />
                        
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-payfile-maroon/5 flex items-center justify-center text-payfile-maroon group-hover:bg-payfile-gold/10 transition-colors">
                                <Bitcoin className="w-6 h-6" />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                sale.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {sale.status}
                            </div>
                        </div>

                        <h4 className="font-bold text-lg mb-1 truncate text-payfile-maroon">{sale.file?.name}</h4>
                        <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>{formatDate(sale.createdAt)}</span>
                        </div>

                        <div className="border-t border-payfile-maroon/5 pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                <p className="text-2xl font-black text-payfile-maroon">{sale.price} <span className="text-payfile-gold text-xs">{sale.currency}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => copyListingLink(sale._id)}
                                    className="p-3 rounded-xl bg-payfile-cream text-payfile-maroon hover:bg-payfile-maroon hover:text-white transition-all"
                                    title="Copy Link"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => window.open(`/listing/${sale._id}`, '_blank')}
                                    className="p-3 rounded-xl bg-payfile-cream text-payfile-maroon hover:bg-payfile-maroon hover:text-white transition-all"
                                    title="View Listing"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    </div>
  );
};

export default SalesGrid;
