import React from 'react';
import { Gavel, Scale, AlertCircle, FileText, Settings, ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-payfile-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-payfile-maroon/5 border border-payfile-maroon/10 mb-6">
            <Gavel className="w-4 h-4 text-payfile-maroon" />
            <span className="text-[10px] font-black uppercase tracking-widest text-payfile-maroon">Legal Governance</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-payfile-maroon tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            By accessing the PayFile Network, you agree to comply with our localized settlement protocols and marketplace standards.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section className="p-10 rounded-[40px] bg-payfile-cream/50 border border-payfile-maroon/5 animate-fade-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center text-payfile-gold shadow-lg shadow-payfile-maroon/20">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">1. Usage of Service</h2>
            </div>
            <div className="prose prose-payfile text-gray-600 leading-relaxed font-medium">
              <p className="mb-4">
                PayFile is a distributed digital marketplace. Users are granted a limited license to upload, distribute, and sell legitimate digital assets via our Bitcoin-native protocol. 
              </p>
              <p>
                You must be of legal age in your jurisdiction to engage in Bitcoin settlements.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-10 rounded-[40px] bg-white border border-payfile-maroon/5 animate-fade-up-delay-1 shadow-xl shadow-payfile-maroon/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-gold flex items-center justify-center text-payfile-maroon shadow-lg shadow-payfile-gold/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">2. Fee Structure & Settlement</h2>
            </div>
            <div className="prose prose-payfile text-gray-600 leading-relaxed font-medium">
              <p className="mb-4">
                PayFile provides the infrastructure for secure file exchange and Bitcoin invoicing. In exchange for these services:
              </p>
              <div className="bg-payfile-maroon p-8 rounded-3xl text-payfile-white mb-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-payfile-gold/20 blur-3xl rounded-full" />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-payfile-gold/80 mb-1">Marketplace Fee</p>
                        <p className="text-3xl font-black">5.0% flat fee</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-payfile-gold/80 mb-1">Payout Currency</p>
                        <p className="text-xl font-black">Bitcoin (BTC)</p>
                    </div>
                </div>
              </div>
              <p>
                All fees are automatically deducted from the final sale amount during the localized settlement process and distributed to the network administration wallet.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-10 rounded-[40px] bg-payfile-cream/50 border border-payfile-maroon/5 animate-fade-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center text-payfile-gold shadow-lg shadow-payfile-maroon/20">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">3. Seller Responsibilities</h2>
            </div>
            <div className="prose prose-payfile text-gray-600 leading-relaxed font-medium">
              <p className="mb-4">Sellers on the PayFile Network must ensure that all content uploaded:</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-3 items-center">
                    <ShieldCheck className="w-5 h-5 text-payfile-gold shrink-0" />
                    <span>Does not infringe on any third-party intellectual property or copyrights.</span>
                </li>
                <li className="flex gap-3 items-center">
                    <ShieldCheck className="w-5 h-5 text-payfile-gold shrink-0" />
                    <span>Is not deceptive, malicious, or part of a fraudulent scheme.</span>
                </li>
                <li className="flex gap-3 items-center">
                    <ShieldCheck className="w-5 h-5 text-payfile-gold shrink-0" />
                    <span>Is accurately described in the listing metadata.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-10 rounded-[40px] bg-white border border-payfile-maroon/5 animate-fade-up-delay-1 shadow-xl shadow-payfile-maroon/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center text-payfile-gold shadow-lg shadow-payfile-maroon/20">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">4. Network Governance</h2>
            </div>
            <div className="prose prose-payfile text-gray-600 leading-relaxed font-medium">
              <p>
                As a distributed service, PayFile reserves the right to modify its localized high-speed protocol without prior notice to optimize the stability of the Bitcoin settlement engine.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-20 text-center border-t border-payfile-maroon/5 pt-10">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Questions? Please Contact</p>
          <a href="mailto:legal@payfile.network" className="text-payfile-maroon font-black hover:text-payfile-gold transition-colors underline underline-offset-8 decoration-payfile-gold/30">legal@payfile.network</a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
