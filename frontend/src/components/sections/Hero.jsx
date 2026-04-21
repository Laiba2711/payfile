import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-40 pb-20 md:pt-52 md:pb-40 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-payfile-white/80 via-transparent to-payfile-white" />
      </div>

      {/* Legacy Orbs for depth */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-payfile-gold/5 rounded-full blur-[130px] pointer-events-none animate-orb-drift" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.1] animate-fade-down text-payfile-maroon">
          Upload, share &amp;{' '}
          <span className="shimmer-text">sell</span>{' '}
          <br className="hidden sm:block" />
          files via Bitcoin
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 leading-relaxed animate-fade-up">
          Decentralized file storage and Bitcoin marketplace on the{' '}
          <br className="hidden md:block" />
          Distributed High-Speed Network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
          <Button
            variant="primary"
            className="w-full sm:w-auto px-10 py-4 text-lg glow-gold font-black shadow-xl"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto px-10 py-4 text-lg font-black"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </Button>
        </div>

        {/* Stats row - Optimized for mobile */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-12 max-w-2xl mx-auto animate-fade-up">
          {[
            { value: '100%', label: 'Decentralized' },
            { value: '₿', label: 'Bitcoin Native' },
            { value: 'E2E', label: 'Encrypted' },
          ].map((stat) => (
            <div key={stat.label} className="text-center min-w-[80px]">
              <div className="text-xl md:text-2xl font-black text-payfile-gold drop-shadow-sm">{stat.value}</div>
              <div className="text-[9px] md:text-xs text-gray-400 mt-1 uppercase tracking-[0.2em] font-black">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-payfile-white to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
