import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminLayout = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is logged in and is an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex bg-payfile-white min-h-screen">
      <AdminSidebar 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-6 bg-white border-b border-payfile-maroon/5 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-xl font-black text-payfile-maroon">Pay<span className="text-payfile-gold">File</span></h1>
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 bg-payfile-cream/50 rounded-2xl text-payfile-maroon"
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
