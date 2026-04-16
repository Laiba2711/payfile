import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, History, Settings, LogOut, Shield } from 'lucide-react';

const AdminSidebar = ({ onLogout }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: History, label: 'History', path: '/admin/history' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="w-72 bg-white border-r border-payfile-maroon/5 flex flex-col h-screen sticky top-0 shadow-2xl shadow-payfile-maroon/5">
      <div className="p-10">
        <div className="flex items-center gap-4 px-2 mb-12 group cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-12 h-12 bg-gradient-to-br from-payfile-maroon to-payfile-maroon-dark rounded-2xl flex items-center justify-center shadow-xl shadow-payfile-maroon/20 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-payfile-gold" />
          </div>
          <div>
            <h1 
              className="text-xl font-black text-payfile-maroon tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >Pay<span className="text-payfile-gold">File</span></h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-payfile-maroon text-payfile-gold shadow-lg shadow-payfile-maroon/20'
                    : 'text-gray-500 hover:text-payfile-maroon hover:bg-payfile-cream/50'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-10 pt-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group border border-transparent hover:border-red-100"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
