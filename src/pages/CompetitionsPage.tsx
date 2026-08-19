import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CompetitionTable from '../components/competitions/CompetitionTable';
import CompetitionForm from '../components/competitions/CompetitionForm';
import CompetitionDetailModal from '../components/competitions/CompetitionDetailModal';
import { LoadingState, ErrorState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Competition } from '../types/hutRi';
import api from '../services/api';

function CompetitionsPage() {
  const { hasRole } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const canManage = hasRole('OPERATOR');

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [detail, setDetail] = useState<Competition | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await api.getCompetitions();
      if (result.success) setCompetitions(Array.isArray(result.data) ? result.data : []);
      else setError(result.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat perlombaan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return competitions.filter((c) => {
      const matchesQ = !q || c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesType = !typeFilter || c.type === typeFilter;
      return matchesQ && matchesStatus && matchesType;
    });
  }, [competitions, query, statusFilter, typeFilter]);

  const handleSubmit = async (data: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = editing
      ? await api.updateCompetition(editing.id, data)
      : await api.createCompetition(data);
    if (result.success) {
      notify('success', editing ? 'Perlombaan diperbarui.' : 'Perlombaan ditambahkan.');
      setFormOpen(false);
      setEditing(null);
      load();
    } else {
      notify('error', result.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus perlombaan ini?')) return;
    const result = await api.deleteCompetition(id);
    if (result.success) { notify('success', 'Perlombaan dihapus.'); load(); }
    else notify('error', result.message);
  };

  const handleStart = async (id: string) => {
    const result = await api.startCompetition(id);
    if (result.success) { notify('success', 'Perlombaan dimulai.'); load(); }
    else notify('error', result.message);
  };

  const handleFinish = async (id: string) => {
    const result = await api.finishCompetition(id);
    if (result.success) { notify('success', 'Perlombaan selesai.'); load(); }
    else notify('error', result.message);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Yakin ingin membatalkan perlombaan ini?')) return;
    const result = await api.cancelCompetition(id);
    if (result.success) { notify('success', 'Perlombaan dibatalkan.'); load(); }
    else notify('error', result.message);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Manajemen Perlombaan</h1>
          <p className="text-gray-500">Kelola seluruh perlombaan HUT RI Ke-81.</p>
        </div>
        {canManage && (
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>+ Tambah Perlombaan</Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="filter-label" htmlFor="c-search">Cari Perlombaan</label>
            <input
              id="c-search"
              className="input-control"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nama atau deskripsi…"
            />
          </div>
          <div>
            <label className="filter-label" htmlFor="c-status">Status</label>
            <select id="c-status" className="input-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="READY">Siap</option>
              <option value="RUNNING">Berjalan</option>
              <option value="FINISHED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
          <div>
            <label className="filter-label" htmlFor="c-type">Tipe</label>
            <select id="c-type" className="input-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Semua Tipe</option>
              <option value="INDIVIDUAL">Individu</option>
              <option value="GROUP">Kelompok</option>
              <option value="BOTH">Keduanya</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card><LoadingState label="Memuat perlombaan…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : (
        <Card className="p-0">
          <CompetitionTable
            competitions={filtered}
            onEdit={(c) => { setEditing(c); setFormOpen(true); }}
            onDelete={handleDelete}
            onStart={handleStart}
            onFinish={handleFinish}
            onCancel={handleCancel}
            onView={setDetail}
          />
        </Card>
      )}

      <CompetitionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        editingCompetition={editing}
      />
      <CompetitionDetailModal
        competition={detail}
        onClose={() => setDetail(null)}
        onOpenPage={(id) => navigate(`/competition/${id}`)}
      />
    </Layout>
  );
}

export default CompetitionsPage;