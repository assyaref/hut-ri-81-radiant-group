import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../ui/Feedback';
import type { Competition, CompetitionParticipant, Participant } from '../../types/hutRi';
import api from '../../services/api';

interface CompetitionParticipantsProps {
  competition: Competition;
  canManage: boolean;
}

function CompetitionParticipants({ competition, canManage }: CompetitionParticipantsProps) {
  const [participants, setParticipants] = useState<CompetitionParticipant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [cpRes, allRes] = await Promise.all([
        api.getCompetitionParticipants(competition.id),
        api.getParticipants(),
      ]);
      if (cpRes.success) setParticipants(Array.isArray(cpRes.data) ? cpRes.data : []);
      else setError(cpRes.message);
      if (allRes.success) setAllParticipants(Array.isArray(allRes.data) ? allRes.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat peserta.');
    } finally {
      setIsLoading(false);
    }
  }, [competition.id]);

  useEffect(() => {
    load();
  }, [load]);

  const departments = useMemo(
    () => Array.from(new Set(allParticipants.map((p) => p.department).filter(Boolean))).sort(),
    [allParticipants],
  );

  const registeredIds = useMemo(() => new Set(participants.map((cp) => cp.participantId)), [participants]);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allParticipants.filter((p) => {
      const notAdded = !registeredIds.has(p.id);
      const checkedIn = p.status === 'CHECKED_IN';
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.uniqueCode.toLowerCase().includes(q);
      const matchesDept = !department || p.department === department;
      return notAdded && checkedIn && matchesQ && matchesDept;
    });
  }, [allParticipants, registeredIds, query, department]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return participants.filter((cp) => {
      const name = cp.participant?.name || cp.participantId || '';
      const dept = cp.participant?.department || '';
      const matchesQ = !q || name.toLowerCase().includes(q);
      const matchesDept = !department || dept === department;
      return matchesQ && matchesDept;
    });
  }, [participants, query, department]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const res = await api.addCompetitionParticipant(competition.id, selectedId);
      if (res.success) {
        setSelectedId('');
        load();
      } else {
        setError(res.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menambah peserta.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (participantId: string) => {
    if (!confirm('Hapus peserta ini dari perlombaan?')) return;
    setBusy(true);
    try {
      const res = await api.removeCompetitionParticipant(competition.id, participantId);
      if (res.success) load();
      else setError(res.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus peserta.');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <LoadingState label="Memuat peserta perlombaan…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="filter-label" htmlFor="cp-search">Cari Peserta</label>
          <input
            id="cp-search"
            className="input-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nama atau kode…"
          />
        </div>
        <div>
          <label className="filter-label" htmlFor="cp-dept">Departemen</label>
          <select
            id="cp-dept"
            className="input-control"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <span className="text-sm text-gray-500">
            {participants.length} / {competition.maxParticipants} peserta
          </span>
        </div>
      </div>

      {canManage && competition.status !== 'FINISHED' && competition.status !== 'CANCELLED' && (
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-grow">
            <label className="filter-label" htmlFor="cp-add">Tambah Peserta (Check-in)</label>
            <select
              id="cp-add"
              className="input-control"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Pilih peserta…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.department}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleAdd} disabled={!selectedId || busy} size="sm">
            Tambah
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="Belum ada peserta" description="Belum ada peserta yang terdaftar pada perlombaan ini." />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Departemen</th>
                <th>Kode</th>
                <th>Status</th>
                {canManage && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((cp, index) => {
                const p = cp.participant;
                return (
                  <tr key={cp.id}>
                    <td>{index + 1}</td>
                    <td className="font-medium text-navy-900">{p?.name || cp.participantId}</td>
                    <td>{p?.department || '—'}</td>
                    <td className="font-mono text-red-600">{p?.uniqueCode || '—'}</td>
                    <td>
                      <span className={p?.status === 'CHECKED_IN' ? 'text-green-600' : 'text-gray-500'}>
                        {p?.status === 'CHECKED_IN' ? '✓ Check-in' : 'Terdaftar'}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <button className="btn-link" onClick={() => handleRemove(cp.participantId)} disabled={busy}>
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CompetitionParticipants;
