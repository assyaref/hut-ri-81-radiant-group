import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import AdminNav from './AdminNav';
import { LoadingState, ErrorState } from '../../components/ui/Feedback';
import type { EventSettings } from '../../types/hutRi';
import api from '../../services/api';

function SettingsPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const result = await api.getSettings();
        if (result.success) setSettings(result.data);
        else setError(result.message);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Gagal memuat pengaturan.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 mb-1">Pengaturan Event</h1>
        <p className="text-gray-500">Konfigurasi acara (SUPERADMIN).</p>
      </div>
      <AdminNav />

      <Card>
        {isLoading ? (
          <LoadingState label="Memuat pengaturan…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Nama Event', value: settings.eventName },
              { label: 'Organisasi', value: settings.organization },
              { label: 'Tagline', value: settings.tagline },
              { label: 'Durasi Sesi (detik)', value: settings.sessionTtlSeconds },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                <p className="font-semibold text-navy-900">{s.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        <p className="text-xs text-gray-400 mt-6">
          Pengaturan ini dibaca dari backend Google Apps Script dan disimpan di spreadsheet / konfigurasi server.
          Tidak ada kredensial yang diekspos ke frontend.
        </p>
      </Card>
    </Layout>
  );
}

export default SettingsPage;