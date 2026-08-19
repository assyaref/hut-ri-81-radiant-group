import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PrizeTable from '../components/prizes/PrizeTable';
import PrizeForm from '../components/prizes/PrizeForm';
import PrizeDetailModal from '../components/prizes/PrizeDetailModal';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Prize } from '../types/hutRi';
import api from '../services/api';

function PrizesPage() {
  const { hasRole } = useAuth();
  const { notify } = useToast();
  const canManage = hasRole('ADMIN');

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prize | null>(null);
  const [detail, setDetail] = useState<Prize | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Prize | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await api.getPrizes();
      if (result.success) setPrizes(Array.isArray(result.data) ? result.data : []);
      else setError(result.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat hadiah.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: Prize) => { setEditing(p); setFormOpen(true); };

  const handleSubmit = async (data: { name: string; description: string; quantity: number }) => {
    setIsSaving(true);
    try {
      const result = editing
        ? await api.updatePrize({ id: editing.id, ...data })
        : await api.createPrize(data);
      if (result.success) {
        notify('success', editing ? 'Hadiah diperbarui.' : 'Hadiah ditambahkan.');
        setFormOpen(false);
        load();
      } else {
        notify('error', result.message);
      }
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Gagal menyimpan hadiah.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const result = await api.deletePrize(deleteTarget.id);
      if (result.success) {
        notify('success', 'Hadiah dihapus.');
        setDeleteTarget(null);
        load();
      } else {
        notify('error', result.message);
      }
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Gagal menghapus hadiah.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Manajemen Hadiah</h1>
          <p className="text-gray-500">Kelola hadiah untuk spin draw HUT RI Ke-81.</p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>+ Tambah Hadiah</Button>
        )}
      </div>

      {isLoading ? (
        <Card><LoadingState label="Memuat hadiah…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : prizes.length === 0 ? (
        <Card><EmptyState title="Belum ada hadiah" description="Tambahkan hadiah untuk mulai spin draw." /></Card>
      ) : (
        <Card className="p-0">
          <PrizeTable
            prizes={prizes}
            onDetail={setDetail}
            onEdit={canManage ? openEdit : undefined}
            onDelete={canManage ? setDeleteTarget : undefined}
            canManage={canManage}
          />
        </Card>
      )}

      <PrizeForm open={formOpen} initial={editing} isSaving={isSaving} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <PrizeDetailModal prize={detail} onClose={() => setDetail(null)} />

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-body text-center py-6">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Hapus Hadiah</h3>
              <p className="text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>?
              </p>
              <div className="flex gap-3 justify-center">
                <button className="btn-outline-small" onClick={() => setDeleteTarget(null)}>Batal</button>
                <button className="btn-danger-small" onClick={confirmDelete}>Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default PrizesPage;