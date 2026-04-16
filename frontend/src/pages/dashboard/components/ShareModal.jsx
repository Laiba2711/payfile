import React from 'react';
import { Share2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const ShareModal = ({ 
    isOpen, 
    onClose, 
    shareFile, 
    shareExpiry, 
    setShareExpiry, 
    sharePassword, 
    setSharePassword, 
    generatedLink, 
    handleGenerateShareLink,
    showToast
}) => {
  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    showToast('Link copied to clipboard!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share File"
      description={`Generate a temporary access link for ${shareFile?.name}`}
    >
        <div className="space-y-6">
            {!generatedLink ? (
            <>
                <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry (Days)</label>
                <input
                    type="number"
                    className="w-full bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-sm font-black text-payfile-maroon outline-none focus:border-payfile-gold/50"
                    value={shareExpiry}
                    onChange={(e) => setShareExpiry(e.target.value)}
                />
                </div>

                <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Document Password (Optional)</label>
                <input
                    type="text"
                    placeholder="Leave blank for no password"
                    className="w-full bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-sm font-black text-payfile-maroon outline-none focus:border-payfile-gold/50"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                />
                </div>

                <Button variant="primary" className="w-full py-4 font-bold" onClick={handleGenerateShareLink}>
                Generate Link
                </Button>
            </>
            ) : (
            <div className="space-y-4">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Access URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="flex-1 bg-payfile-cream/50 border border-payfile-maroon/10 rounded-2xl px-5 py-4 text-xs text-gray-500 outline-none truncate"
                        />
                        <button onClick={copyLink} className="p-4 bg-payfile-gold text-white rounded-2xl hover:bg-payfile-amber transition-all shadow-lg shadow-payfile-gold/20">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    </Modal>
  );
};

export default ShareModal;
