import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-28 md:pt-52 md:pb-40 overflow-hidden">
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
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.08] animate-fade-up text-payfile-maroon">
          Upload, share &amp;{' '}
          <span className="shimmer-text">sell</span>{' '}
          <br className="hidden md:block" />
          files via Bitcoin
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed animate-fade-up-delay-1">
          Decentralized file storage and Bitcoin marketplace on the{' '}
          <br className="hidden md:block" />
          Distributed High-Speed Network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
          <Button
            variant="primary"
            className="w-full sm:w-auto px-10 py-4 text-lg glow-gold"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto px-10 py-4 text-lg"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-up-delay-2">
          {[
            { value: '100%', label: 'Decentralized' },
            { value: '₿', label: 'Bitcoin Native' },
            { value: 'E2E', label: 'Encrypted' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gradient-gold">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{stat.label}</div>
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
