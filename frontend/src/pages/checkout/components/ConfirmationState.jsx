import React from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ConfirmationState = ({ handleDownload }) => {
  return (
    <div className="animate-fade-up space-y-8 py-4">
        <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Payment Confirmed</h2>
            <p className="text-gray-500 text-xs font-medium max-w-[240px] mx-auto">
                Your payment has been verified. You can now download your file.
            </p>
        </div>
        <Button 
            variant="primary" 
            className="w-full py-5 text-sm font-black uppercase tracking-widest animate-bounce shadow-xl shadow-payfile-amber/20"
            onClick={handleDownload}
        >
            <Download className="w-6 h-6" /> Download Now
        </Button>
    </div>
  );
};

export default ConfirmationState;
