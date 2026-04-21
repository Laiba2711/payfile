import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Wallet, ShieldCheck, Info, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';


const AdminSettings = () => {
  const [settings, setSettings] = useState({
    adminBtcAddress: '',
    adminUsdtAddress: '',
    adminUsdtTrc20Address: '',
    adminUsdtErc20Address: '',
    commissionRate: 0.05,
    btcWalletId: '',
    usdtTrc20WalletId: '',
    usdtErc20WalletId: ''
  });
  const [syncStatus, setSyncStatus] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.status === 'success') {
          setSettings(response.data.data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setSyncStatus([]);
    try {
      const response = await axios.patch('/api/admin/settings', settings, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.status === 'success') {
        setSuccess(true);
        if (response.data.data.bitcartSync) {
          setSyncStatus(response.data.data.bitcartSync);
        }
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-payfile-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10 animate-fade-up">
      <div>
        <h1 className="text-4xl font-black text-payfile-maroon tracking-tight">Admin Settings</h1>
        <p className="text-gray-500 mt-2 font-medium">Configure payout addresses and commission rates.</p>
      </div>

      <Card className="p-10 border-payfile-maroon/5 shadow-2xl relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-payfile-gold/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-start gap-5 p-6 bg-payfile-maroon rounded-[24px] mb-12 shadow-xl shadow-payfile-maroon/20">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="w-6 h-6 text-payfile-gold" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-white tracking-tight">Security Notice</p>
            <p className="text-[12px] text-white/60 font-medium leading-relaxed">
                Ensure all payout addresses are correct. Commission funds will be sent directly to these addresses. 
                Incorrect addresses may lead to permanent loss of funds.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <Wallet className="w-4 h-4 text-payfile-gold" />
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Admin BTC Address</label>
              </div>
              <input
                type="text"
                value={settings.adminBtcAddress}
                onChange={(e) => setSettings({ ...settings, adminBtcAddress: e.target.value })}
                className="w-full bg-payfile-cream/30 border border-payfile-maroon/10 rounded-2xl py-4 px-6 text-payfile-maroon font-black font-mono text-sm focus:outline-none focus:border-payfile-gold/50 transition-all shadow-inner"
                placeholder="Enter BTC address"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <Wallet className="w-4 h-4 text-payfile-amber" />
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Admin USDT TRC20 Address</label>
              </div>
              <input
                type="text"
                value={settings.adminUsdtTrc20Address}
                onChange={(e) => setSettings({ ...settings, adminUsdtTrc20Address: e.target.value })}
                className="w-full bg-payfile-cream/30 border border-payfile-maroon/10 rounded-2xl py-4 px-6 text-payfile-maroon font-black font-mono text-sm focus:outline-none focus:border-payfile-gold/50 transition-all shadow-inner"
                placeholder="Enter TRC20 address (T...)"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <Wallet className="w-4 h-4 text-payfile-gold/80" />
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Admin USDT ERC20 Address</label>
              </div>
              <input
                type="text"
                value={settings.adminUsdtErc20Address}
                onChange={(e) => setSettings({ ...settings, adminUsdtErc20Address: e.target.value })}
                className="w-full bg-payfile-cream/30 border border-payfile-maroon/10 rounded-2xl py-4 px-6 text-payfile-maroon font-black font-mono text-sm focus:outline-none focus:border-payfile-gold/50 transition-all shadow-inner"
                placeholder="Enter ERC20 address (0x...)"
                required
              />
            </div>
          </div>

          <div className="pt-10 border-t border-payfile-maroon/5 space-y-10">
            <div>
              <h3 className="text-sm font-black text-payfile-maroon uppercase tracking-widest mb-6">Bitcart Wallet Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">BTC Wallet ID</label>
                  <input
                    type="text"
                    value={settings.btcWalletId}
                    onChange={(e) => setSettings({ ...settings, btcWalletId: e.target.value })}
                    className="w-full bg-payfile-cream/10 border border-payfile-maroon/5 rounded-2xl py-4 px-6 text-payfile-maroon font-black font-mono text-xs focus:outline-none focus:border-payfile-gold/30 transition-all"
                    placeholder="Bitcart BTC Wallet ID"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">USDT TRC20 Wallet ID</label>
                  <input
                    type="text"
                    value={settings.usdtTrc20WalletId}
                    onChange={(e) => setSettings({ ...settings, usdtTrc20WalletId: e.target.value })}
                    className="w-full bg-payfile-cream/10 border border-payfile-maroon/5 rounded-2xl py-4 px-6 text-payfile-maroon font-black font-mono text-xs focus:outline-none focus:border-payfile-gold/30 transition-all"
                    placeholder="Bitcart TRC20 Wallet ID"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">USDT ERC20 Wallet ID</label>
                  <input
                    type="text"
                    value={settings.usdtErc20WalletId}
                    onChange={(e) => setSettings({ ...settings, usdtErc20WalletId: e.target.value })}
                    className="w-full bg-payfile-cream/10 border border-payfile-maroon/5 rounded-2xl py-4 px-6 text-payfile-maroon font-black font-mono text-xs focus:outline-none focus:border-payfile-gold/30 transition-all"
                    placeholder="Bitcart ERC20 Wallet ID"
                  />
                </div>
              </div>
            </div>
          </div>


          <div className="pt-10 border-t border-payfile-maroon/5">
            <div className="flex items-center justify-between gap-8 flex-col md:flex-row">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 ml-1">
                      <ShieldCheck className="w-4 h-4 text-payfile-gold" />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Commission Rate</label>
                    </div>
                    <div className="relative w-full max-w-[240px]">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={settings.commissionRate}
                        onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
                        className="w-full bg-payfile-cream/30 border border-payfile-maroon/10 rounded-2xl py-5 px-6 text-payfile-maroon font-black text-3xl focus:outline-none focus:border-payfile-gold/50 transition-all"
                        required
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-payfile-gold font-black text-xl">%</span>
                    </div>
                </div>
                <div className="flex-1 p-6 rounded-3xl bg-payfile-cream/50 border border-payfile-maroon/5 border-dashed">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-payfile-amber" />
                        <span className="text-[10px] font-black text-payfile-maroon uppercase tracking-widest">Info</span>
                    </div>
                    <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
                        The current commission rate is <strong className="text-payfile-maroon">{(settings.commissionRate * 100).toFixed(1)}%</strong>. 
                        This commission is taken from every successful sale on the platform.
                    </p>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-6">
            <Button
              type="submit"
              disabled={saving}
              className="py-5 px-10 text-xs font-black uppercase tracking-widest shadow-2xl shadow-payfile-maroon/20"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : success ? 'Settings Saved' : 'Save Changes'}
            </Button>
            {success && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[10px] text-green-600 font-extrabold uppercase tracking-widest">
                    Settings updated successfully
                  </span>
                </div>
                {syncStatus.length > 0 && (
                  <div className="flex flex-col gap-1 ml-5">
                    {syncStatus.map((sync, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${sync.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className={`text-[9px] font-bold ${sync.status === 'success' ? 'text-green-500/70' : 'text-red-500/70'} uppercase tracking-[0.1em]`}>
                          Bitcart {sync.label}: {sync.status === 'success' ? 'Synced' : `Error: ${sync.message}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </form>
      </Card>
    </div>
  );
};

export default AdminSettings;
