import React from 'react';
import { Bitcoin, Zap, Globe, Shield, Cpu, Layers } from 'lucide-react';
import Button from '../components/ui/Button';

const BitcoinNetwork = () => {
  return (
    <div className="min-h-screen bg-payfile-white">
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-payfile-gold/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-payfile-gold/10 border border-payfile-gold/20 mb-8 animate-fade-down">
            <Bitcoin className="w-5 h-5 text-payfile-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-payfile-maroon">Native Bitcoin Protocol</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-payfile-maroon tracking-tighter mb-8 leading-none animate-fade-up">
            The Speed of <br/><span className="text-payfile-gold">True Settlement.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto text-xl leading-relaxed mb-12 animate-fade-up-delay-1">
            SatoshiBin is built on the most secure financial protocol on Earth. Discover how our distributed nodes enable near-instant digital content monetization.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-up-delay-1">
            <a href="/register">
                <Button variant="primary" className="px-12 py-5 text-sm uppercase tracking-widest font-black rounded-2xl">Start Selling Now</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-payfile-cream/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[40px] bg-white border border-payfile-maroon/5 card-hover shadow-xl shadow-payfile-maroon/5">
              <Zap className="w-12 h-12 text-payfile-gold mb-8" />
              <h3 className="text-2xl font-black text-payfile-maroon mb-4 tracking-tight">Instant Invoicing</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Localized settlement ensures that Bitcoin invoices are generated and confirmed via the lightning-capable SatoshiBin Node network in seconds.
              </p>
            </div>
            <div className="p-10 rounded-[40px] bg-white border border-payfile-maroon/5 card-hover shadow-xl shadow-payfile-maroon/5">
              <Globe className="w-12 h-12 text-payfile-gold mb-8" />
              <h3 className="text-2xl font-black text-payfile-maroon mb-4 tracking-tight">Global Payouts</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Receive funds anywhere in the world. Our protocol bypasses traditional borders, sending your earnings directly to your secure cold or hot wallet.
              </p>
            </div>
            <div className="p-10 rounded-[40px] bg-white border border-payfile-maroon/5 card-hover shadow-xl shadow-payfile-maroon/5">
              <Shield className="w-12 h-12 text-payfile-gold mb-8" />
              <h3 className="text-2xl font-black text-payfile-maroon mb-4 tracking-tight">Unrivaled Security</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                By leveraging the Bitcoin blockchain, your transactions are protected by the world's most powerful decentralized computing network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
                <div className="absolute inset-0 bg-payfile-maroon rounded-[60px] rotate-3 shadow-2xl opacity-5" />
                <div className="relative bg-white border border-payfile-maroon/5 p-12 rounded-[60px] shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers className="w-64 h-64 text-payfile-maroon" />
                    </div>
                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-payfile-maroon/5 flex items-center justify-center text-payfile-maroon font-black">01</div>
                            <h4 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">Decentralized Auth</h4>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-payfile-gold/5 flex items-center justify-center text-payfile-gold font-black">02</div>
                            <h4 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">Localized Settlement</h4>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-payfile-maroon/5 flex items-center justify-center text-payfile-maroon font-black">03</div>
                            <h4 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">Encrypted Payouts</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-payfile-maroon tracking-tight mb-8">
                The Protocol of the <br/><span className="text-payfile-gold">Digital Frontier.</span>
              </h2>
              <div className="space-y-6 text-gray-500 font-medium text-lg leading-relaxed">
                <p>
                  Built on the principle of peer-to-peer electronic cash, SatoshiBin eliminates the middlemen. Every file sold is a direct interaction between creator and consumer.
                </p>
                <div className="flex items-start gap-4 p-6 bg-payfile-cream rounded-3xl border border-payfile-gold/20">
                    <Cpu className="w-6 h-6 text-payfile-maroon mt-1 shrink-0" />
                    <p className="text-sm font-bold text-payfile-maroon/80">
                        Our nodes run the Bitcart API stack, ensuring your storefront is always accessible, even if central servers go offline.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center bg-payfile-white border-2 border-payfile-gold/20 p-20 rounded-[60px] shadow-2xl shadow-payfile-gold/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-payfile-cream/50 to-transparent pointer-events-none" />
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-payfile-maroon mb-8">Ready to join the network?</h2>
                <p className="text-gray-600 font-medium mb-10 max-w-lg mx-auto">
                    Take control of your content and your payments. Open your SatoshiBin store in under 2 minutes.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <a href="/register">
                      <Button variant="primary" className="px-12 py-5 font-black uppercase text-xs tracking-[0.2em] bg-payfile-maroon text-white hover:bg-payfile-maroon-dark">Launch Store</Button>
                    </a>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default BitcoinNetwork;
