import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminLayout = ({ user, onLogout }) => {
  // Check if user is logged in and is an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex bg-payfile-white min-h-screen">
      <AdminSidebar onLogout={onLogout} />
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
