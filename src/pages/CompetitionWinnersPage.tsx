import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Competition, CompetitionWinner, LeaderboardEntry } from '../types/hutRi';
import api from '../services/api';

function formatTime(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CompetitionWinnersPage() {
  const { hasRole } = useAuth();
  const { notify } = useToast();
  const canManage = hasRole('ADMIN');

  const [winners, setWinners] = useState<CompetitionWinner[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [competitionId, setCompetitionId] = useState('');
  const [position, setPosition] = useState(1);
  const [candidateKey, setCandidateKey] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [winRes, compRes, lbRes] = await Promise.all([
        api.getCompetitionWinners(),
        api.getCompetitions(),
        api.getLeaderboard(),
      ]);
      if (winRes.success) setWinners(Array.isArray(winRes.data) ? winRes.data : []);
      else setError(winRes.message);
      if (compRes.success) setCompetitions(Array.isArray(compRes.data) ? compRes.data : []);
      if (lbRes.success) setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat pemenang.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const candidates = useMemo(
    () => leaderboard.filter((e) => e.competitionId === competitionId),
    [leaderboard, competitionId],
  );

  const handleConfirm = async () => {
    if (!competitionId || !candidateKey) return;
    const entry = candidates.find((c) => `${c.isTeam ? 'team' : 'participant'}:${c.id}` === candidateKey);
    if (!entry) return;
    const res = await api.confirmCompetitionWinner(
      competitionId,
      entry.isTeam ? null : entry.id,
      entry.isTeam ? entry.id : null,
      position,
      `JUARA_${position}`,
      entry.timeMs != null ? null : entry.score,
    );
    if (res.success) {
      notify('success', 'Pemenang dikonfirmasi.');
      setFormOpen(false);
      setCompetitionId('');
      setCandidateKey('');
      setPosition(1);
      load();
    } else {
      notify('error', res.message);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 print-hide">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Pemenang Perlombaan</h1>
          <p className="text-gray-500">Daftar pemenang perlombaan (berbasis performa).</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <button className="btn-outline-small" onClick={() => window.print()}>🖨️ Cetak</button>
          {canManage && <Button onClick={() => setFormOpen(true)}>+ Konfirmasi Pemenang</Button>}
        </div>
      </div>

      {isLoading ? (
        <Card><LoadingState label="Memuat pemenang…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : winners.length === 0 ? (
        <Card><EmptyState title="Belum ada pemenang" description="Belum ada pemenang perlombaan yang dikonfirmasi." /></Card>
      ) : (
        <Card className="p-0">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Posisi</th>
                  <th>Nama / Tim</th>
                  <th>Perlombaan</th>
                  <th>Kategori</th>
                  <th>Skor</th>
                  <th>Dikonfirmasi</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <span className="text-xl">{w.position === 1 ? '🥇' : w.position === 2 ? '🥈' : w.position === 3 ? '🥉' : `#${w.position}`}</span>
                    </td>
                    <td className="font-medium text-navy-900">{w.participantName || w.teamName || '—'}</td>
                    <td>{w.competitionName || w.competitionId}</td>
                    <td>{w.category}</td>
                    <td className="font-semibold">{w.score ?? '—'}</td>
                    <td>{formatTime(w.confirmedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={formOpen} title="Konfirmasi Pemenang" onClose={() => setFormOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="filter-label" htmlFor="cw-comp">Perlombaan</label>
            <select id="cw-comp" className="input-control" value={competitionId} onChange={(e) => { setCompetitionId(e.target.value); setCandidateKey(''); }}>
              <option value="">Pilih perlombaan…</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="filter-label" htmlFor="cw-pos">Posisi</label>
            <select id="cw-pos" className="input-control" value={position} onChange={(e) => setPosition(Number(e.target.value))}>
              <option value={1}>Juara 1</option>
              <option value={2}>Juara 2</option>
              <option value={3}>Juara 3</option>
            </select>
          </div>
          <div>
            <label className="filter-label" htmlFor="cw-cand">Kandidat (dari leaderboard)</label>
            <select id="cw-cand" className="input-control" value={candidateKey} onChange={(e) => setCandidateKey(e.target.value)}>
              <option value="">Pilih kandidat…</option>
              {candidates.map((c) => (
                <option key={`${c.isTeam ? 'team' : 'participant'}:${c.id}`} value={`${c.isTeam ? 'team' : 'participant'}:${c.id}`}>
                  {c.isTeam ? '👥' : '👤'} {c.name} — {c.score ?? '—'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleConfirm} disabled={!competitionId || !candidateKey}>Konfirmasi</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default CompetitionWinnersPage;
