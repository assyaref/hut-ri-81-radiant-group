import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import NominationTable from '../components/nominations/NominationTable';
import NominationForm from '../components/nominations/NominationForm';
import type { NominationPayload } from '../components/nominations/NominationForm';
import NominationCard from '../components/nominations/NominationCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Competition, Nomination } from '../types/hutRi';
import api from '../services/api';

function NominationsPage() {
  const { hasRole } = useAuth();
  const { notify } = useToast();
  const canManage = hasRole('ADMIN');

  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [nomRes, compRes] = await Promise.all([api.getNominations(), api.getCompetitions()]);
      if (nomRes.success) setNominations(Array.isArray(nomRes.data) ? nomRes.data : []);
      else setError(nomRes.message);
      if (compRes.success) setCompetitions(Array.isArray(compRes.data) ? compRes.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat nominasi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!statusFilter) return nominations;
    return nominations.filter((n) => n.status === statusFilter);
  }, [nominations, statusFilter]);

  const handleSubmit = async (data: NominationPayload) => {
    const res = await api.createNomination(data);
    if (res.success) {
      notify('success', 'Nominasi ditambahkan.');
      setFormOpen(false);
      load();
    } else {
      notify('error', res.message);
    }
  };

  const handleConfirm = async (id: string) => {
    const res = await api.confirmNomination(id);
    if (res.success) { notify('success', 'Nominasi dikonfirmasi.'); load(); }
    else notify('error', res.message);
  };

  const handleReject = async (id: string) => {
    const res = await api.rejectNomination(id);
    if (res.success) { notify('success', 'Nominasi ditolak.'); load(); }
    else notify('error', res.message);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 print-hide">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Nominasi Pemenang</h1>
          <p className="text-gray-500">Kelola nominasi dan konfirmasi pemenang perlombaan.</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <button className="btn-outline-small" onClick={() => window.print()}>🖨️ Cetak</button>
          {canManage && <Button onClick={() => setFormOpen(true)}>+ Tambah Nominasi</Button>}
        </div>
      </div>

      <div className="print-only">
        <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">DAFTAR NOMINASI HUT RI KE-81</h2>
        <div className="print-grid">
          {filtered.map((n) => <NominationCard key={n.id} nomination={n} />)}
        </div>
      </div>

      <Card className="mb-6 print-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="filter-label" htmlFor="n-status">Status</label>
            <select id="n-status" className="input-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="NOMINATED">Terinominasi</option>
              <option value="CONFIRMED">Terkonfirmasi</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card><LoadingState label="Memuat nominasi…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="Belum ada nominasi" description="Belum ada nominasi yang tercatat." /></Card>
      ) : (
        <Card className="p-0">
          <NominationTable
            nominations={filtered}
            onConfirm={handleConfirm}
            onReject={handleReject}
            canManage={canManage}
          />
        </Card>
      )}

      {canManage && (
        <NominationForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} competitions={competitions} />
      )}
    </Layout>
  );
}

export default NominationsPage;
