import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Bitcoin, Info, CheckCircle2, AlertCircle, Clock, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';

const PurchasePage = () => {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [saleId]);

  const fetchSaleDetails = async () => {
    try {
      const response = await axios.get(`/api/sales/public/${saleId}`);
      if (response.data.status === 'success') {
        setSale(response.data.data.sale);
      }
    } catch (err) {
      setError('Sale listing not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (tokenGenerated && purchase && purchase.status === 'pending') {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/purchases/status/${purchase.tokenId}`);
          if (response.data.data.status === 'confirmed') {
            setPurchase(prev => ({ ...prev, status: 'confirmed' }));
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 10000); // Poll every 10s
    }
    return () => clearInterval(interval);
  }, [tokenGenerated, purchase]);

  const handleGenerateToken = async () => {
    try {
      const response = await axios.post('/api/purchases', { saleId });
      if (response.data.status === 'success') {
        setPurchase(response.data.data.purchase);
        setTokenGenerated(true);
      }
    } catch (err) {
      setError('Failed to generate purchase token. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!purchase || purchase.status !== 'confirmed') return;
    
    try {
      // Use the public download endpoint with the token
      const downloadUrl = `/api/files/public/download/${sale.file._id}?token=${purchase.tokenId}`;
      
      // We can use a simple window.open or a link for native browser download experience
      // since the response is a file attachment
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to start download. Please try again.');
    }
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-payfile-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-payfile-green/20 border-t-payfile-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-payfile-black pt-32 pb-12 flex flex-col items-center">
        <Card className="max-w-md w-full p-8 border-red-500/20 bg-red-500/5 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'This sale listing may have been removed or expired.'}</p>
          <Button variant="primary" className="w-full" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const isExpired = sale.expiresAt && new Date(sale.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-payfile-black pt-32 pb-20 text-white selection:bg-payfile-green/30">
      <div className="max-w-2xl mx-auto px-6">
        {/* Main Purchase Card */}
        <Card className="border-white/10 bg-[#0a0a0a] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-payfile-green/10 flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-payfile-green" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">File Purchase</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Listed on {formatDate(sale.createdAt)}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              isExpired ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-payfile-green/10 text-payfile-green border-payfile-green/20'
            }`}>
              {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>

          <div className="p-8 space-y-8">
            {/* File Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-payfile-green" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">File Details</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 bg-black/40 rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filename:</span>
                  <span className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{sale.file?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Size:</span>
                  <span className="text-sm font-medium text-slate-300">{formatFileSize(sale.file?.size)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
                  <span className="text-sm font-medium text-slate-300">{sale.file?.mimeType}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded:</span>
                  <span className="text-sm font-medium text-slate-300">{formatDate(sale.file?.createdAt)}</span>
                </div>
                {sale.file?.expiresAt && (
                  <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">File Expires:</span>
                    <span className="text-sm font-medium text-red-400/80">{formatDate(sale.file?.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="py-10 text-center relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-payfile-green/20 to-transparent"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-3">Price</p>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white tracking-tighter mb-1">
                  {sale.totalPrice} <span className="text-payfile-green">{sale.currency}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">{sale.currency}</span>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-black/60 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-payfile-green" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">How to purchase:</h4>
              </div>
              <ul className="space-y-3">
                {[
                  'Click "Pay with Crypto" below',
                  'You will be redirected to BitCart checkout',
                  'Pay the listed amount in your preferred coin (BTC/USDT)',
                  'Once paid, return here to download your file'
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-400 leading-relaxed group">
                    <span className="text-payfile-green font-bold opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Result / Action Section */}
            {!tokenGenerated ? (
              <Button 
                variant="primary" 
                className="w-full py-4 bg-payfile-green hover:bg-payfile-green/90 text-black text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all"
                onClick={handleGenerateToken}
                disabled={isExpired}
              >
                {isExpired ? 'Listing Expired' : 'Pay with Crypto'}
              </Button>
            ) : (
              <div className="space-y-4 animate-fade-in border-2 border-payfile-green/20 bg-payfile-green/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className={`w-5 h-5 ${purchase.status === 'confirmed' ? 'text-payfile-green' : 'text-yellow-500'}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${purchase.status === 'confirmed' ? 'text-payfile-green' : 'text-yellow-500'}`}>
                    {purchase.status === 'confirmed' ? 'Payment Verified' : 'Purchase Token Generated'}
                  </span>
                </div>
                <div className="space-y-4">
                  {purchase.status === 'pending' ? (
                    <>
                      <div className="space-y-4">
                        <p className="text-xs text-center text-slate-400">Please complete the payment on BitCart to unlock your file.</p>
                        <Button 
                          variant="primary" 
                          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2 border border-white/5"
                          onClick={() => window.open(purchase.checkoutUrl, '_blank')}
                        >
                          Open Checkout <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-xl border border-white/5 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waiting for payment confirmation...</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <div className="p-6 bg-payfile-green/10 border border-payfile-green/20 rounded-2xl text-center last:space-y-4">
                        <CheckCircle2 className="w-12 h-12 text-payfile-green mx-auto mb-2" />
                        <h4 className="text-xl font-black text-white tracking-tight">Your file is ready!</h4>
                        <p className="text-xs text-slate-400">The payment has been verified.</p>
                      </div>
                      <Button 
                        variant="primary" 
                        className="w-full py-4 bg-payfile-green text-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                        onClick={handleDownload}
                      >
                        <Download className="w-5 h-5" />
                        Download Now
                      </Button>
                    </div>
                  )}
                  
                  {purchase.status === 'pending' && (
                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                      Your file will be available for download once the BitCart invoice is marked as complete. This page polls every 10s.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Trust Footer */}
          <div className="px-8 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Secure Transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Timed Access</span>
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PurchasePage;
