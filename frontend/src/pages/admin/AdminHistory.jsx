import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  History, DollarSign, ExternalLink, Calendar,
  Loader2, User, Landmark, CheckCircle2, AlertTriangle,
  RefreshCcw, Users
} from 'lucide-react';
import Card from '../../components/ui/Card';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const PayoutBadge = ({ done, label, icon: Icon }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${
    done
      ? 'bg-green-50 text-green-700 border-green-100'
      : 'bg-amber-50 text-amber-600 border-amber-100'
  }`}>
    <Icon className="w-3 h-3" />
    {label}
    {done ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
  </div>
);

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/history', getHeaders());
      if (response.data.status === 'success') {
        setHistory(response.data.data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleRetry = async (tokenId) => {
    setRetryingId(tokenId);
    try {
      const res = await axios.post(`/api/admin/retry-payout/${tokenId}`, {}, getHeaders());
      if (res.data.status === 'success') {
        const { payoutsProcessed, sellerPayoutProcessed, adminPayoutProcessed } = res.data.data;
        setHistory(prev =>
          prev.map(item =>
            item.tokenId === tokenId
              ? { ...item, payoutsProcessed, sellerPayoutProcessed, adminPayoutProcessed }
              : item
          )
        );
        showToast(
          payoutsProcessed
            ? `✅ Payouts fully processed for ${tokenId}`
            : `⚠️ Partially processed — check Bitcart dashboard`,
          payoutsProcessed
        );
      }
    } catch (err) {
      showToast(`❌ Retry failed: ${err.response?.data?.message || err.message}`, false);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-sm font-black text-white transition-all ${
          toast.ok ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-payfile-maroon tracking-tight">Commission Logs</h1>
          <p className="text-gray-500 mt-2 font-medium">Audit trail of all system-generated revenue and payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); fetchHistory(); }}
            className="p-3 rounded-2xl border border-payfile-maroon/10 bg-payfile-cream/30 hover:bg-payfile-cream/60 transition-colors"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4 text-payfile-maroon" />
          </button>
          <div className="px-5 py-2.5 bg-payfile-maroon rounded-2xl flex items-center gap-3 shadow-xl shadow-payfile-maroon/20">
            <Landmark className="w-5 h-5 text-payfile-gold" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">Automated Settlements</span>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-payfile-maroon/5 p-0 shadow-2xl shadow-payfile-maroon/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-payfile-cream/30 border-b border-payfile-maroon/5">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Network</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Origin Seller</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Revenue</th>
                <th className="px-8 py-6 text-[10px] font-black text-payfile-maroon uppercase tracking-[0.2em]">Admin Cut (5%)</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payout Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payout Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-10 py-24 text-center">
                    <Loader2 className="w-10 h-10 text-payfile-maroon animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading...</p>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-payfile-cream/50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-payfile-maroon/5">
                      <History className="w-10 h-10 text-payfile-maroon/20" />
                    </div>
                    <p className="text-gray-500 font-bold">No commission records found.</p>
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const allDone = item.payoutsProcessed;
                  const isRetrying = retryingId === item.tokenId;
                  return (
                    <tr key={item.id} className="border-t border-payfile-maroon/5 group hover:bg-payfile-cream/10 transition-colors">
                      {/* Token ID */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black font-mono text-gray-400 group-hover:text-payfile-maroon transition-colors">
                            {item.tokenId}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-payfile-gold/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>

                      {/* Network */}
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          item.currency === 'BTC'
                            ? 'bg-payfile-gold/5 text-payfile-gold border-payfile-gold/10'
                            : 'bg-payfile-amber/5 text-payfile-amber border-payfile-amber/10'
                        }`}>
                          {item.network || 'Mainnet'}
                        </span>
                      </td>

                      {/* Seller */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-payfile-maroon/5 border border-payfile-maroon/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-payfile-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-payfile-maroon">
                              {item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : 'N/A'}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold tracking-widest">
                              {item.seller?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-black text-payfile-maroon">
                          <DollarSign className="w-4 h-4 text-payfile-gold" />
                          {item.price} <span className="text-[10px] text-payfile-gold uppercase tracking-[0.1em]">{item.currency}</span>
                        </div>
                      </td>

                      {/* Commission */}
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-payfile-maroon text-payfile-gold shadow-lg shadow-payfile-maroon/10 text-sm font-black">
                          +{item.commission} <span className="text-[10px] font-bold opacity-60 uppercase">{item.currency}</span>
                        </div>
                      </td>

                      {/* Payout Status */}
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <PayoutBadge done={item.sellerPayoutProcessed} label="Seller" icon={Users} />
                          <PayoutBadge done={item.adminPayoutProcessed}  label="Admin"  icon={DollarSign} />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-500">
                          <Calendar className="w-4 h-4 text-payfile-gold" />
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Retry Button */}
                      <td className="px-8 py-6">
                        {allDone ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> Done
                          </div>
                        ) : (
                          <button
                            id={`retry-${item.tokenId}`}
                            onClick={() => handleRetry(item.tokenId)}
                            disabled={isRetrying}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-payfile-maroon text-payfile-gold text-[10px] font-black uppercase tracking-widest hover:bg-payfile-maroon/80 disabled:opacity-50 transition-all shadow-lg shadow-payfile-maroon/20"
                          >
                            {isRetrying
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <RefreshCcw className="w-3.5 h-3.5" />
                            }
                            {isRetrying ? 'Retrying...' : 'Retry'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminHistory;
