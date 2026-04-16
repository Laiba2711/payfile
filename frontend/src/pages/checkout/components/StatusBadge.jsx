import React from 'react';

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: { label: 'Confirmed', cls: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500' },
    pending:   { label: 'Pending',  cls: 'bg-payfile-amber/10 text-payfile-amber border-payfile-amber/20', dot: 'bg-payfile-amber animate-pulse' },
    expired:   { label: 'Expired',   cls: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
  };
  const { label, cls, dot } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
