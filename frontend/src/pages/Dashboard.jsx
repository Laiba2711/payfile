import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Footer from '../components/layout/Footer';

// Hooks
import useDashboard from '../hooks/useDashboard';

// Components
import DashboardHeader from './dashboard/components/DashboardHeader';
import StatsGrid from './dashboard/components/StatsGrid';
import UploadSection from './dashboard/components/UploadSection';
import FileTable from './dashboard/components/FileTable';
import SalesGrid from './dashboard/components/SalesGrid';
import ShareModal from './dashboard/components/ShareModal';
import SaleModal from './dashboard/components/SaleModal';

const Dashboard = () => {
  const d = useDashboard();

  return (
    <div className="min-h-screen bg-payfile-white pt-32 pb-20 text-payfile-maroon">
      <div className="max-w-7xl mx-auto px-6">
        
        <DashboardHeader firstName={d.userData.firstName} />

        <StatsGrid stats={d.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <UploadSection 
                    handleUpload={d.handleUpload}
                    handleFileChange={d.handleFileChange}
                    selectedFile={d.selectedFile}
                    expiry={d.expiry}
                    setExpiry={d.setExpiry}
                    uploading={d.uploading}
                    progress={d.progress}
                />
            </div>

            <div className="lg:col-span-8">
                <FileTable 
                    files={d.files}
                    handleDownload={d.handleDownload}
                    handleShareClick={(file) => d.setShareFile(file) || d.setShowShareModal(true)}
                    handleSaleClick={(file) => d.setSaleFile(file) || d.setShowSaleModal(true)}
                    handleDelete={d.handleDelete}
                />
            </div>
        </div>

        <SalesGrid 
            sales={d.sales} 
            showToast={d.showToast} 
        />
      </div>

      <Footer />

      {/* Modals */}
      <ShareModal 
        isOpen={d.showShareModal}
        onClose={d.closeShareModal}
        shareFile={d.shareFile}
        shareExpiry={d.shareExpiry}
        setShareExpiry={d.setShareExpiry}
        sharePassword={d.sharePassword}
        setSharePassword={d.setSharePassword}
        generatedLink={d.generatedLink}
        handleGenerateShareLink={d.handleGenerateShareLink}
        showToast={d.showToast}
      />

      <SaleModal 
        isOpen={d.showSaleModal}
        onClose={d.closeSaleModal}
        saleFile={d.saleFile}
        salePrice={d.salePrice}
        setSalePrice={d.setSalePrice}
        currency={d.currency}
        setCurrency={d.setCurrency}
        network={d.network}
        setNetwork={d.setNetwork}
        btcAddress={d.btcAddress}
        setBtcAddress={d.setBtcAddress}
        handleCreateListing={d.handleCreateListing}
      />

      {/* Toast Notification */}
      {d.toast.visible && (
        <div className="fixed bottom-10 right-10 z-[200] animate-toast-in">
          <div className="bg-white border-2 border-payfile-gold/20 px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-payfile-gold/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-payfile-gold" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                    {d.toast.type === 'success' ? 'Success' : 'Error'}
                  </p>
                  <p className="text-sm font-black text-payfile-maroon">{d.toast.message}</p>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
