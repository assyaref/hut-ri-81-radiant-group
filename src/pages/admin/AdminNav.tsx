import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { label: 'Ringkasan', path: '/admin' },
  { label: 'Pengguna', path: '/admin/users', roles: 'SUPERADMIN' },
  { label: 'Pengaturan', path: '/admin/settings', roles: 'SUPERADMIN' },
  { label: 'Aktivitas', path: '/admin/activity' },
];

function AdminNav() {
  const location = useLocation();
  return (
    <nav className="flex flex-wrap gap-2 mb-6" aria-label="Navigasi administrasi">
      {TABS.map((tab) => {
        const active = tab.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(tab.path);
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={active ? 'admin-tab is-active' : 'admin-tab'}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default AdminNav;