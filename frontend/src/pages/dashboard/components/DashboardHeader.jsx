import React from 'react';

const DashboardHeader = ({ firstName }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-down">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-payfile-maroon">Dashboard</h1>
        <p className="text-gray-500 mt-2 font-medium">Welcome back, {firstName}. Track your earnings and files.</p>
      </div>
      <div className="flex items-center gap-4">
          <div className="px-5 py-2 bg-payfile-cream rounded-2xl border border-payfile-gold/20 flex flex-col items-end">
              <span className="text-[10px] font-bold text-payfile-gold uppercase tracking-widest">Platform Status</span>
              <span className="text-xs font-black text-payfile-maroon flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live & Secure
              </span>
          </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
