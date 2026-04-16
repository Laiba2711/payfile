import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../../components/ui/Card';

const AdminIncomeChart = ({ chartData }) => {
  return (
    <Card className="p-8 min-h-[450px]">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-payfile-maroon flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-payfile-gold" />
                Income stats (14 Days)
            </h3>
        </div>
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5D0E12" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#5D0E12" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#999" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        className="font-black uppercase tracking-widest"
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    />
                    <YAxis 
                        stroke="#999" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        className="font-black"
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                        itemStyle={{ color: '#5D0E12', fontWeight: '900' }}
                        labelStyle={{ color: '#999', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="btc" 
                        stroke="#5D0E12" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                        name="BTC Income"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="usdt" 
                        stroke="#D4AF37" 
                        strokeWidth={4}
                        fillOpacity={0.1} 
                        fill="#D4AF37" 
                        name="USDT Income"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </Card>
  );
};

export default AdminIncomeChart;
