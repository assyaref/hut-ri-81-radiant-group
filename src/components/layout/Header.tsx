import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AuthUser, Role } from '../../types/hutRi';

interface HeaderProps {
  onMenuClick: () => void;
  user?: AuthUser;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const roleBadge: Record<Role, string> = {
    SUPERADMIN: 'bg-yellow-500/20 text-yellow-300',
    ADMIN: 'bg-red-500/20 text-red-300',
    OPERATOR: 'bg-green-500/20 text-green-300',
    VIEWER: 'bg-gray-500/20 text-gray-300',
  };

  return (
    <header className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-4 py-4 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-navy-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-xl font-bold shadow-lg">
              🇮🇩
            </div>
            <div className="hidden sm:block">
              <p className="text-yellow-400 font-bold text-sm">RADIANT GROUP</p>
              <p className="text-xs text-gray-300">HUT RI KE-81</p>
            </div>
          </div>
        </div>

        {user && (
          <div className="hidden md:flex items-center gap-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadge[user.role] || 'bg-gray-500/20 text-gray-300'}`}>
              {user.role}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isActive('/login')) return;
                onLogout();
              }}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              Keluar
            </button>
          </div>
        )}

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-navy-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-navy-700 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="block w-full text-left px-4 py-3 rounded-lg bg-red-600 text-white font-medium"
              >
                Keluar
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="block w-full text-left px-4 py-3 rounded-lg bg-red-600 text-white font-medium"
            >
              Masuk
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;