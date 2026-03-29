import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Pricing from '../components/sections/Pricing';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-payfile-black pt-20">
      <Pricing />
      <Footer />
    </div>
  );
};

export default PricingPage;
