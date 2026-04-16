import React from 'react';
import Hero from '../components/sections/Hero';
import HowItWorks from '../components/sections/HowItWorks';
import Features from '../components/sections/Features';
import FAQ from '../components/sections/FAQ';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="bg-payfile-white">
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
