import React from 'react';
import { Loader2 } from 'lucide-react';

// Hooks
import useAdminDashboard from '../../hooks/useAdminDashboard';

// Components
import AdminStatsGrid from './components/AdminStatsGrid';
import AdminIncomeChart from './components/AdminIncomeChart';
import AdminOverviewCard from './components/AdminOverviewCard';
import VerifyPurchaseSection from './components/VerifyPurchaseSection';

const AdminDashboard = () => {
  const d = useAdminDashboard();

  if (d.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-payfile-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-payfile-maroon tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">System statistics and manual controls.</p>
        </div>
        <div className="flex gap-3">
            <div className="px-4 py-2 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">System Online</span>
            </div>
        </div>
      </div>

      <AdminStatsGrid stats={d.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2 min-w-0 h-full">
            <AdminIncomeChart chartData={d.chartData} />
        </div>
        <div className="lg:col-span-1 h-full">
            <AdminOverviewCard 
                handleDownloadReport={d.handleDownloadReport} 
                downloading={d.downloading} 
            />
        </div>
      </div>

      <VerifyPurchaseSection 
        searchTokenId={d.searchTokenId}
        setSearchTokenId={d.setSearchTokenId}
        handleCheckToken={d.handleCheckToken}
        checkingToken={d.checkingToken}
        purchaseDetails={d.purchaseDetails}
        handleConfirmPayment={d.handleConfirmPayment}
        confirmingPayment={d.confirmingPayment}
        handleRetryPayout={d.handleRetryPayout}
        retryingPayout={d.retryingPayout}
      />
    </div>
  );
};

export default AdminDashboard;
