import React from 'react';
import { Upload, Share2, Bitcoin, Download } from 'lucide-react';
import Card from '../ui/Card';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="w-6 h-6 text-payfile-green" />,
      title: '1. Upload',
      desc: 'Sign in with Internet Identity and upload your files to decentralized storage.',
    },
    {
      icon: <Share2 className="w-6 h-6 text-payfile-green" />,
      title: '2. Share',
      desc: 'Generate secure share links with optional expiry dates for your files.',
    },
    {
      icon: <Bitcoin className="w-6 h-6 text-payfile-green" />,
      title: '3. Sell',
      desc: 'Create listings to sell your files for Bitcoin with custom pricing.',
    },
    {
      icon: <Download className="w-6 h-6 text-payfile-green" />,
      title: '4. Download',
      desc: 'Access your files anytime, anywhere with fast and reliable downloads.',
    },
  ];

  return (
    <section className="py-24 bg-payfile-black">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="group">
              <div className="w-12 h-12 rounded-lg bg-payfile-green/10 flex items-center justify-center mb-6 border border-payfile-green/20 group-hover:bg-payfile-green/20 transition-all">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
