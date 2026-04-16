import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-8 h-8 text-payfile-gold" />,
    title: 'Decentralized',
    desc: 'Your files are stored on a decentralized node network, ensuring no single point of failure.',
    gradient: 'from-payfile-amber/5 to-payfile-gold/5',
  },
  {
    icon: <Lock className="w-8 h-8 text-payfile-gold" />,
    title: 'Secure',
    desc: 'End-to-end encryption and multi-factor authentication keep your data safe.',
    gradient: 'from-payfile-maroon/5 to-payfile-amber/5',
  },
  {
    icon: <Zap className="w-8 h-8 text-payfile-gold" />,
    title: 'Fast',
    desc: "Lightning-fast uploads and downloads powered by our high-performance cloud architecture.",
    gradient: 'from-payfile-gold/5 to-payfile-maroon/5',
  },
];

const Features = () => {
  return (
    <section className="py-28 bg-payfile-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-payfile-cream/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-payfile-amber text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Why Choose Us
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-payfile-maroon tracking-tight">
            Why Choose PayFile?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative p-10 rounded-[40px] bg-gradient-to-br ${feature.gradient} border border-payfile-gold/10 group overflow-hidden hover:border-payfile-gold/40 transition-all duration-500`}
            >
              {/* Card glow on hover */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

              {/* Icon ring */}
              <div className="relative w-20 h-20 rounded-3xl bg-payfile-maroon text-payfile-gold flex items-center justify-center mb-8 shadow-xl shadow-payfile-maroon/20 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-black mb-4 text-payfile-maroon group-hover:text-payfile-amber transition-colors">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              
              <div className="mt-10 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-payfile-gold" />
                  <div className="w-1.5 h-1.5 rounded-full bg-payfile-gold opacity-50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-payfile-gold opacity-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
