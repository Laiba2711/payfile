import React from 'react';
import { Loader2 } from 'lucide-react';
import CopyBtn from './CopyBtn';

const PaymentInfo = ({ payment, network }) => {
  const qrTarget = payment?.paymentUrl ?? payment?.address ?? '';
  const qrUrl = qrTarget ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrTarget)}&margin=12` : '';

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-[32px] border-2 border-payfile-gold/20 bg-payfile-maroon/5 p-8 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Total Amount</p>
            <div className="flex items-baseline justify-center gap-3 mb-6">
                <span className="text-5xl font-black tracking-tighter text-payfile-maroon">
                    {payment.amount}
                </span>
                <span className="text-xl font-black text-payfile-gold">{payment.currency}</span>
            </div>
            <div className="flex justify-center">
                <CopyBtn text={String(payment.amount)} label="Copy Amount" />
            </div>
        </div>

        <div className="rounded-[32px] border border-payfile-maroon/5 bg-payfile-cream/10 overflow-hidden">
            <div className="flex justify-center py-10 bg-white border-b border-payfile-maroon/5">
            <div className="p-4 rounded-[32px] bg-white border border-payfile-gold/10 shadow-xl shadow-payfile-gold/10">
                <img src={qrUrl} alt="QR" width={200} className="block rounded-2xl" />
            </div>
            </div>
            <div className="p-8 space-y-6">
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {payment?.currency} Payment Address {network ? `(${network})` : ''}
                    </p>
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-payfile-maroon/10 shadow-inner">
                        <code className="flex-1 text-[11px] text-payfile-maroon font-black break-all leading-relaxed">
                            {payment.address}
                        </code>
                        <CopyBtn text={payment.address} />
                    </div>
                </div>

                <div className="flex items-center gap-3 py-4 px-6 bg-white rounded-2xl border border-payfile-gold/10">
                    <div className="flex gap-1.5 pt-0.5">
                        {Array.from({ length: payment.required }).map((_, i) => (
                            <div key={i} className={`w-6 h-2 rounded-full transition-all duration-700 ${i < payment.confirmations ? 'bg-payfile-amber' : 'bg-gray-100'}`} />
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pt-0.5">
                        {payment.confirmations}/{payment.required} Confirmations
                    </span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 py-4 bg-payfile-cream/30 rounded-2xl border border-payfile-maroon/5">
            <Loader2 className="w-4 h-4 text-payfile-gold animate-spin" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Waiting for payment...</span>
        </div>
    </div>
  );
};

export default PaymentInfo;
