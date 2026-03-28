import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border-b border-white/5 last:border-0 pb-4">
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between text-left py-2 hover:text-payfile-green transition-colors"
          >
            <span className="text-lg font-medium">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-40 mt-2 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-slate-400 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
