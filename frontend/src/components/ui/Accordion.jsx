import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`rounded-3xl border transition-all duration-300 ${
                isOpen ? 'bg-payfile-cream/30 border-payfile-gold/30 shadow-lg shadow-payfile-maroon/5' : 'bg-white border-payfile-maroon/5 hover:border-payfile-gold/20'
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between text-left p-6 group focus:outline-none"
            >
              <span className={`text-lg font-black transition-colors ${
                  isOpen ? 'text-payfile-maroon' : 'text-payfile-maroon/80 group-hover:text-payfile-maroon'
              }`}>
                {item.question}
              </span>
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isOpen ? 'bg-payfile-maroon text-payfile-gold rotate-180' : 'bg-payfile-cream text-payfile-maroon group-hover:bg-payfile-gold group-hover:text-white'
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-8">
                <div className="w-12 h-1 bg-payfile-gold/20 rounded-full mb-4" />
                <p className="text-gray-500 font-medium leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
