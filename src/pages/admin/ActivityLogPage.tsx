import { useCallback, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import AdminNav from './AdminNav';
import Badge from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Feedback';
import type { ActivityLog } from '../../types/hutRi';
import api from '../../services/api';

function formatTime(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await api.getActivityLogs(100);
      if (result.success) setLogs(Array.isArray(result.data) ? result.data : []);
      else setError(result.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat log aktivitas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 mb-1">Log Aktivitas</h1>
        <p className="text-gray-500">Riwayat aktivitas pengguna dan sistem.</p>
      </div>
      <AdminNav />

      {isLoading ? (
        <Card><LoadingState label="Memuat log…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : logs.length === 0 ? (
        <Card><EmptyState title="Belum ada aktivitas" description="Log aktivitas akan muncul setelah ada aktivitas." /></Card>
      ) : (
        <Card className="p-0">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aksi</th>
                  <th>Modul</th>
                  <th>Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap">{formatTime(l.timestamp)}</td>
                    <td className="font-medium text-navy-900">{l.userName || 'Sistem'}</td>
                    <td><Badge variant="warning">{l.action}</Badge></td>
                    <td className="text-gray-600">{l.module}</td>
                    <td>{l.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Layout>
  );
}

export default ActivityLogPage;