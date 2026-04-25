import React from 'react';
import Accordion from '../ui/Accordion';

const FAQ = () => {
  const items = [
    {
      question: 'What is SatoshiBin?',
      answer: 'SatoshiBin is a decentralized file storage and sharing platform built on a distributed node network. It allows you to upload, share, and even sell your files using Bitcoin.',
    },
    {
      question: 'How does Bitcoin payment work?',
      answer: 'SatoshiBin integrates with the Bitcoin network via our native high-speed protocol. You can set a price in BTC for your files, and users can purchase them directly.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, your data is encrypted and stored across multiple nodes on the SatoshiBin Distributed Network, ensuring high availability and protection against single points of failure.',
    },
    {
      question: 'What file types are supported?',
      answer: 'You can upload almost any file type to SatoshiBin, including images, videos (up to 500MB), documents, and archives. For security reasons, we do not allow executable files (.exe, .msi) or shell scripts (.sh, .bat).',
    },
    {
      question: 'How do I get started?',
      answer: 'Simply click "Get Started," sign in with your Secure Identity, and you can begin uploading your first files immediately.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-payfile-slate">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
        <Accordion items={items} />
      </div>
    </section>
  );
};

export default FAQ;
