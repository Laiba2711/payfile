import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const AdminOverviewCard = ({ handleDownloadReport, downloading }) => {
  return (
    <Card className="bg-payfile-maroon p-8 flex flex-col justify-between text-white border-none shadow-xl shadow-payfile-maroon/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-payfile-gold/10 blur-3xl rounded-full" />
        
        <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 text-payfile-gold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Overview</h3>
            <p className="text-xs text-white/80 font-medium leading-relaxed mb-8">
                Daily earnings from the 5% commission. 
                Payouts are processed automatically to your configured addresses.
            </p>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Rate</span>
                    <span className="text-lg font-black text-payfile-gold">5.0%</span>
                </div>
            </div>
        </div>

        <Button 
            variant="primary" 
            onClick={handleDownloadReport}
            disabled={downloading}
            className="w-full py-5 text-xs font-black uppercase tracking-widest"
        >
            {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Download Report
        </Button>
    </Card>
  );
};

export default AdminOverviewCard;
