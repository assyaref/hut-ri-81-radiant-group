import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import AdminNav from './admin/AdminNav';
import { LoadingState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import type { EventSettings } from '../types/hutRi';
import api from '../services/api';

function AdminPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    api.getSettings().then((r) => {
      if (r.success) setSettings(r.data);
    }).catch(() => { /* ignore */ });
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 mb-1">Administration</h1>
        <p className="text-gray-500">Kelola pengguna, pengaturan, dan aktivitas sistem.</p>
      </div>
      <AdminNav />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 text-white flex items-center justify-center text-xl">👤</div>
            <div>
              <p className="text-gray-500 text-sm">Anda masuk sebagai</p>
              <p className="font-bold text-navy-900">{user?.name}</p>
              <p className="text-xs text-amber-600 font-semibold">{user?.role}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-xl">🎯</div>
            <div>
              <p className="text-gray-500 text-sm">Event</p>
              <p className="font-bold text-navy-900">{settings ? settings.eventName : 'HUT RI KE-81'}</p>
              <p className="text-xs text-gray-500">{settings ? settings.organization : 'Radiant Group'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white flex items-center justify-center text-xl">🛡️</div>
            <div>
              <p className="text-gray-500 text-sm">Mode Akses</p>
              <p className="font-bold text-navy-900">Role-based</p>
              <p className="text-xs text-gray-500">Token session aman</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Statistik Sistem</h2>
        {settings ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Event', value: settings.eventName },
              { label: 'Organisasi', value: settings.organization },
              { label: 'Tagline', value: settings.tagline },
              { label: 'Sesi (detik)', value: settings.sessionTtlSeconds },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="font-semibold text-navy-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <LoadingState label="Memuat pengaturan…" />
        )}
      </Card>
    </Layout>
  );
}

export default AdminPage;