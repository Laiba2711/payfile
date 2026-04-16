import React from 'react';
import { ShoppingBag, FileText, IndianRupee } from 'lucide-react';
import Card from '../../../components/ui/Card';

const StatsGrid = ({ stats }) => {
  const statItems = [
    { label: 'Total Sales', value: stats.totalSales, icon: ShoppingBag, color: 'text-payfile-maroon', bg: 'bg-payfile-maroon/5' },
    { label: 'Total Revenue', value: `${stats.totalRevenue} BTC`, icon: IndianRupee, color: 'text-payfile-amber', bg: 'bg-payfile-amber/5' },
    { label: 'Active Listings', value: stats.activeListings, icon: FileText, color: 'text-payfile-gold', bg: 'bg-payfile-gold/5' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {statItems.map((stat, i) => (
        <Card key={i} className="hover:border-payfile-gold/30 group animate-fade-up">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black mt-0.5 text-payfile-maroon">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
