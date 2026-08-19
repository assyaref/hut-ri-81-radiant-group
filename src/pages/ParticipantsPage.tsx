import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import ParticipantFilter from '../components/participants/ParticipantFilter';
import ParticipantTable from '../components/participants/ParticipantTable';
import ParticipantDetailModal from '../components/participants/ParticipantDetailModal';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import type { Participant } from '../types/hutRi';
import api from '../services/api';

const PAGE_SIZE = 10;

function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Participant | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await api.getParticipants();
      if (result.success) {
        setParticipants(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat peserta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const departments = useMemo(
    () => Array.from(new Set(participants.map((p) => p.department).filter(Boolean))).sort(),
    [participants],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return participants.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.uniqueCode.toLowerCase().includes(q);
      const matchesDept = !department || p.department === department;
      const matchesStatus = !status || p.status === status;
      return matchesQuery && matchesDept && matchesStatus;
    });
  }, [participants, query, department, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Manajemen Peserta</h1>
          <p className="text-gray-500">Kelola seluruh peserta HUT RI Ke-81.</p>
        </div>
      </div>

      <Card className="mb-6">
        <ParticipantFilter
          query={query}
          onSearch={(q) => { setQuery(q); setPage(1); }}
          departments={departments}
          onDepartment={(d) => { setDepartment(d); setPage(1); }}
          statusValue={status}
          onStatus={(s) => { setStatus(s); setPage(1); }}
        />
      </Card>

      {isLoading ? (
        <Card><LoadingState label="Memuat peserta…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="Tidak ada peserta" description="Belum ada peserta yang terdaftar atau filter tidak cocok." /></Card>
      ) : (
        <>
          <Card className="p-0">
            <ParticipantTable participants={pageItems} onSelect={setSelected} />
          </Card>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </span>
            <div className="flex gap-2">
              <button className="btn-outline-small" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                ← Sebelumnya
              </button>
              <span className="px-3 py-1 text-navy-900 font-medium">Hal {safePage}/{totalPages}</span>
              <button className="btn-outline-small" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                Berikutnya →
              </button>
            </div>
          </div>
        </>
      )}

      <ParticipantDetailModal participant={selected} onClose={() => setSelected(null)} />
    </Layout>
  );
}

export default ParticipantsPage;