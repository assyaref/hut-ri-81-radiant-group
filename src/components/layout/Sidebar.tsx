import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuItem, Role } from '../../types/hutRi';

interface SidebarProps {
  isCollapsed: boolean;
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  canSpin: boolean;
  canAdmin: boolean;
}

interface SidebarItem extends MenuItem {
  minRole?: Role;
}

interface MenuSection {
  title: string;
  items: SidebarItem[];
  visibleWhen: (role: Role) => boolean;
}

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  OPERATOR: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isOpen, onClose, role, canSpin, canAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sections: MenuSection[] = [
    {
      title: 'Utama',
      visibleWhen: () => true,
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: '📊' },
        { label: 'Registration', path: '/registration', icon: '📝' },
        { label: 'Check-in', path: '/checkin', icon: '✅' },
      ],
    },
    {
      title: 'Event',
      visibleWhen: () => true,
      items: [
        { label: 'Participants', path: '/participants', icon: '👥' },
        { label: 'Prizes', path: '/prizes', icon: '🎁' },
      ],
    },
    {
      title: 'Undian',
      visibleWhen: () => canSpin,
      items: [{ label: 'Spin Draw', path: '/spin', icon: '🎰' }],
    },
    {
      title: 'Hasil',
      visibleWhen: () => true,
      items: [{ label: 'Winners', path: '/winners', icon: '🏆' }],
    },
    {
      title: 'Kompetisi',
      visibleWhen: () => true,
      items: [
        { label: 'Competitions', path: '/competitions', icon: '🏁' },
        { label: 'Scoring', path: '/scoring', icon: '📈', minRole: 'OPERATOR' },
        { label: 'Leaderboard', path: '/leaderboard', icon: '🥇' },
        { label: 'Nominations', path: '/nominations', icon: '⭐', minRole: 'ADMIN' },
        { label: 'Competition Winners', path: '/competition-winners', icon: '🏅' },
        { label: 'Live Monitor', path: '/live-competition', icon: '📺' },
      ],
    },
    {
      title: 'Administrasi',
      visibleWhen: () => canAdmin,
      items: [{ label: 'Administration', path: '/admin', icon: '⚙️' }],
    },
  ];

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  const canSee = (item: SidebarItem) => {
    if (!item.minRole) return true;
    if (!role) return false;
    return ROLE_RANK[role] >= ROLE_RANK[item.minRole];
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-[73px] left-0 h-[calc(100vh-73px)] bg-white shadow-xl z-40 transition-all duration-300 overflow-y-auto ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <nav className="p-4 space-y-4">
          {sections.map((section) => {
            if (!role || !section.visibleWhen(role)) return null;
            const items = section.items.filter(canSee);
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                {!isCollapsed && (
                  <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {section.title}
                  </p>
                )}
                <div className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {!isCollapsed && <span>{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;