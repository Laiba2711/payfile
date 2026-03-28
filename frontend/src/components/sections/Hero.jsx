import React from 'react';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden hero-bg">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-payfile-green/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
          Upload, share, and <span className="text-payfile-green">sell</span> <br className="hidden md:block" />
          files via Bitcoin
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
          Decentralized file storage and Bitcoin marketplace on the <br className="hidden md:block" />
          Internet Computer blockchain.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" className="w-full sm:w-auto px-10 py-4 text-lg">
            Get Started
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto px-10 py-4 text-lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
