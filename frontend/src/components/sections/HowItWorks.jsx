import React from 'react';
import { Upload, Share2, Bitcoin, Download } from 'lucide-react';
import Card from '../ui/Card';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="w-6 h-6 text-payfile-gold" />,
      title: '1. Upload',
      desc: 'Sign in with Secure Digital Identity and upload your files to decentralized storage.',
    },
    {
      icon: <Share2 className="w-6 h-6 text-payfile-gold" />,
      title: '2. Share',
      desc: 'Generate secure share links with optional expiry dates for your files.',
    },
    {
      icon: <Bitcoin className="w-6 h-6 text-payfile-gold" />,
      title: '3. Sell',
      desc: 'Create listings to sell your files for Bitcoin with custom pricing.',
    },
    {
      icon: <Download className="w-6 h-6 text-payfile-gold" />,
      title: '4. Download',
      desc: 'Access your files anytime, anywhere with fast and reliable downloads.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-payfile-white relative">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-payfile-cream/30 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
            <p className="text-payfile-amber text-[10px] font-black uppercase tracking-[0.4em] mb-4">Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-payfile-maroon tracking-tight">How It Works</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="group border-payfile-maroon/5 hover:border-payfile-gold/30 hover:shadow-2xl hover:shadow-payfile-maroon/5 transition-all duration-500 rounded-[32px] p-8">
              <div className="w-14 h-14 rounded-2xl bg-payfile-maroon/5 flex items-center justify-center mb-8 border border-payfile-maroon/5 group-hover:bg-payfile-maroon group-hover:scale-110 transition-all duration-300">
                {React.cloneElement(step.icon, { className: 'w-7 h-7 text-payfile-gold group-hover:text-payfile-gold transition-colors' })}
              </div>
              <h3 className="text-xl font-black text-payfile-maroon mb-4">{step.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                {step.desc}
              </p>
              <div className="mt-8 flex items-center gap-2">
                  <div className="w-8 h-1 bg-payfile-gold/20 rounded-full" />
                  <span className="text-[10px] font-black text-payfile-gold opacity-0 group-hover:opacity-100 transition-opacity">STEP {index + 1}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
