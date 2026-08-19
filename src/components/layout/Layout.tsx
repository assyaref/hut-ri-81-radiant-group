import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canSpin = !user || hasRole('OPERATOR');
  const canAdmin = !user || hasRole('ADMIN');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user ?? undefined} onLogout={handleLogout} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user?.role}
        canSpin={canSpin}
        canAdmin={canAdmin}
      />
      <main
        className={`transition-all duration-300 lg:ml-64 p-4 md:p-8 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {children}
      </main>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex fixed left-64 bottom-8 transform -translate-x-full bg-navy-800 text-white p-2 rounded-r-lg hover:bg-navy-700 transition-all duration-300 z-50"
        style={{ left: sidebarCollapsed ? '80px' : '256px' }}
      >
        {sidebarCollapsed ? '→' : '←'}
      </button>
    </div>
  );
};

export default Layout;