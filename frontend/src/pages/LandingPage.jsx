import React from 'react';
import Hero from '../components/sections/Hero';
import HowItWorks from '../components/sections/HowItWorks';
import Features from '../components/sections/Features';
import Pricing from '../components/sections/Pricing';
import FAQ from '../components/sections/FAQ';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="bg-payfile-black">
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
