import React from 'react';
import { Users, ShoppingBag, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import Card from '../../../components/ui/Card';

const AdminStatsGrid = ({ stats }) => {
  const cards = [
    { 
        title: 'Total Registered Users', 
        value: stats?.totalUsers || 0, 
        icon: Users, 
        color: 'text-payfile-maroon', 
        bg: 'bg-payfile-maroon/5', 
        trend: '+12%' 
    },
    { 
        title: 'Successful Transactions', 
        value: stats?.totalSales || 0, 
        icon: ShoppingBag, 
        color: 'text-payfile-gold', 
        bg: 'bg-payfile-gold/5', 
        trend: '+8%' 
    },
    { 
        title: 'Total Revenue', 
        value: (
            <div className="flex flex-col gap-1">
                <span className="text-xl font-black">{stats?.totalBtcRevenue || 0} <span className="text-[10px] text-payfile-gold">BTC</span></span>
                <span className="text-xl font-black">{stats?.totalUsdtRevenue || 0} <span className="text-[10px] text-payfile-amber">USDT</span></span>
            </div>
        ), 
        icon: TrendingUp, 
        color: 'text-payfile-amber', 
        bg: 'bg-payfile-amber/5', 
        trend: '+15%' 
    },
    { 
        title: 'Total Commissions (5%)', 
        value: (
            <div className="flex flex-col gap-1">
                <span className="text-xl font-black text-green-700">{stats?.totalBtcCommission || 0} <span className="text-[10px] text-gray-400">BTC</span></span>
                <span className="text-xl font-black text-green-700">{stats?.totalUsdtCommission || 0} <span className="text-[10px] text-gray-400">USDT</span></span>
            </div>
        ), 
        icon: DollarSign, 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        trend: '+20%' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden group hover:border-payfile-gold/40 hover:shadow-2xl hover:shadow-payfile-maroon/5 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-7 h-7 ${card.color}`} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full tracking-widest">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {card.trend}
            </div>
          </div>

          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{card.title}</p>
          <div className="mt-1 tracking-tight">{card.value}</div>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsGrid;
