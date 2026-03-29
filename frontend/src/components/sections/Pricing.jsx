import React from 'react';
import Button from '../ui/Button';
import { Check } from 'lucide-react';

const Pricing = () => {
  const features = [
    'Upload files up to 2MB',
    'Generate shareable links',
    'Create Bitcoin sale listings',
    'Optional file expiry',
    'Decentralized storage',
  ];

  return (
    <section id="pricing" className="py-24 bg-payfile-black">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-slate-400 mb-16">Store your files on the blockchain with transparent, pay-as-you-go pricing.</p>
        
        <div className="max-w-md mx-auto p-12 rounded-[32px] bg-white/2 border border-payfile-green/30 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
          <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
          <p className="text-slate-500 mb-8">Perfect for getting started</p>
          
          <ul className="text-left space-y-4 mb-10">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-payfile-green shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button variant="primary" className="w-full py-4 text-center">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
