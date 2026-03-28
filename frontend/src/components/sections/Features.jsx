import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-payfile-green" />,
      title: 'Decentralized',
      desc: 'Your files are stored on the Internet Computer blockchain, ensuring no single point of failure.',
    },
    {
      icon: <Lock className="w-8 h-8 text-payfile-green" />,
      title: 'Secure',
      desc: 'End-to-end encryption and Internet Identity authentication keep your data safe.',
    },
    {
      icon: <Zap className="w-8 h-8 text-payfile-green" />,
      title: 'Fast',
      desc: 'Lightning-fast uploads and downloads powered by the Internet Computer\'s web-speed blockchain.',
    },
  ];

  return (
    <section className="py-24 bg-payfile-slate">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose PayFile?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-payfile-green/10 transition-all">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
