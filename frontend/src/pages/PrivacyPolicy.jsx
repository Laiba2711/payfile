import React from 'react';
import { Shield, Lock, Eye, Cloud, RefreshCw, Smartphone } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-payfile-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-payfile-maroon/5 border border-payfile-maroon/10 mb-6">
            <Shield className="w-4 h-4 text-payfile-maroon" />
            <span className="text-[10px] font-black uppercase tracking-widest text-payfile-maroon">Legal Framework</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-payfile-maroon tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto italic">
            Last updated: April 14, 2026. Your data security on the SatoshiBin Network is our highest priority.
          </p>
        </div>

        <div className="space-y-16 relative">
          {/* Section 1 */}
          <section className="animate-fade-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center text-payfile-gold shadow-lg shadow-payfile-maroon/20">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">1. Information We Collect</h2>
            </div>
            <div className="prose prose-payfile max-w-none text-gray-600 leading-relaxed font-medium">
              <p className="mb-4">To provide a secure and efficient marketplace on the SatoshiBin Distributed Network, we collect the following types of information:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                <li className="p-6 rounded-3xl bg-payfile-cream/50 border border-payfile-maroon/5 flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-payfile-gold mt-1.5 shrink-0" />
                  <div>
                    <strong className="block text-payfile-maroon mb-1">Account Information</strong>
                    Legal names, email addresses, and encrypted password hashes used for identity verification.
                  </div>
                </li>
                <li className="p-6 rounded-3xl bg-payfile-cream/50 border border-payfile-maroon/5 flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-payfile-gold mt-1.5 shrink-0" />
                  <div>
                    <strong className="block text-payfile-maroon mb-1">Financial Identifiers</strong>
                    Bitcoin wallet addresses provided for seller payouts and transaction hashes generated during purchase.
                  </div>
                </li>
                <li className="p-6 rounded-3xl bg-payfile-cream/50 border border-payfile-maroon/5 flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-payfile-gold mt-1.5 shrink-0" />
                  <div>
                    <strong className="block text-payfile-maroon mb-1">File Metadata</strong>
                    Information about your shared assets, including filenames, sizes, and distribution logs on our private cloud.
                  </div>
                </li>
                <li className="p-6 rounded-3xl bg-payfile-cream/50 border border-payfile-maroon/5 flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-payfile-gold mt-1.5 shrink-0" />
                  <div>
                    <strong className="block text-payfile-maroon mb-1">Technical Data</strong>
                    IP addresses, session tokens (JWT), and browser identifiers used to maintain secure digital logins.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="animate-fade-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-gold flex items-center justify-center text-payfile-maroon shadow-lg shadow-payfile-gold/20">
                <Cloud className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">2. Blockchain Transparency</h2>
            </div>
            <div className="prose prose-payfile max-w-none text-gray-600 leading-relaxed font-medium p-8 rounded-[40px] bg-payfile-maroon text-payfile-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-payfile-gold/10 blur-3xl rounded-full" />
              <p className="mb-4 relative z-10">
                SatoshiBin operates on the Bitcoin protocol. By using our service, you acknowledge that all Bitcoin transactions are inherently public and recorded on a distributed ledger.
              </p>
              <p className="relative z-10 text-payfile-gold/80 font-bold italic">
                While your SatoshiBin account is private, your Bitcoin transaction history is permanent and visible on the network.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="animate-fade-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center text-payfile-gold shadow-lg shadow-payfile-maroon/20">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">3. Data Security & Node Storage</h2>
            </div>
            <div className="prose prose-payfile max-w-none text-gray-600 leading-relaxed font-medium">
              <p className="mb-4">We employ high-grade cryptographic standards to protect your assets:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-payfile-gold/10 rounded-3xl hover:border-payfile-gold/30 transition-colors">
                    <RefreshCw className="w-8 h-8 text-payfile-gold mx-auto mb-4" />
                    <h4 className="text-payfile-maroon font-black uppercase text-[10px] tracking-widest mb-2">Hashing</h4>
                    <p className="text-xs">Passwords are salted and hashed using Bcrypt-12.</p>
                </div>
                <div className="text-center p-6 border border-payfile-gold/10 rounded-3xl hover:border-payfile-gold/30 transition-colors">
                    <Shield className="w-8 h-8 text-payfile-gold mx-auto mb-4" />
                    <h4 className="text-payfile-maroon font-black uppercase text-[10px] tracking-widest mb-2">Settlement</h4>
                    <p className="text-xs">End-to-end encrypted payout settlement processing.</p>
                </div>
                <div className="text-center p-6 border border-payfile-gold/10 rounded-3xl hover:border-payfile-gold/30 transition-colors">
                    <Smartphone className="w-8 h-8 text-payfile-gold mx-auto mb-4" />
                    <h4 className="text-payfile-maroon font-black uppercase text-[10px] tracking-widest mb-2">Identity</h4>
                    <p className="text-xs">Secure digital identity management for all sessions.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="animate-fade-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-payfile-maroon flex items-center justify-center text-payfile-gold shadow-lg shadow-payfile-maroon/20">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-payfile-maroon uppercase tracking-tight">4. Third-Party Disclosures</h2>
            </div>
            <div className="prose prose-payfile max-w-none text-gray-600 leading-relaxed font-medium">
              <p className="mb-6">We only share data with essential infrastructure partners to maintain network performance:</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 rounded-2xl border border-payfile-maroon/5 bg-white">
                    <span className="font-bold text-payfile-maroon uppercase text-xs tracking-widest">Payment Infrastructure</span>
                    <span className="text-sm font-medium">Bitcart API Network</span>
                </div>
                <div className="flex items-center justify-between p-6 rounded-2xl border border-payfile-maroon/5 bg-white">
                    <span className="font-bold text-payfile-maroon uppercase text-xs tracking-widest">Transactional Communication</span>
                    <span className="text-sm font-medium">Brevo SMTP Engine</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="animate-fade-up-delay-1">
            <div className="p-10 rounded-[40px] bg-payfile-cream border border-payfile-gold/20 text-center">
              <h3 className="text-xl font-black text-payfile-maroon uppercase tracking-tight mb-4">Questions regarding policy?</h3>
              <p className="text-gray-500 mb-8 max-w-lg mx-auto">Our security team is ready to assist with any inquiries regarding the SatoshiBin Network's data infrastructure.</p>
              <a href="mailto:support@payfile.network" className="inline-block px-10 py-4 bg-payfile-maroon text-payfile-gold rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-payfile-maroon-dark transition-all shadow-xl shadow-payfile-maroon/20">Contact Node Admin</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
