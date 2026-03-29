import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FAQ from '../components/sections/FAQ';

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-payfile-black pt-20">
      <FAQ />
      <Footer />
    </div>
  );
};

export default FAQPage;
