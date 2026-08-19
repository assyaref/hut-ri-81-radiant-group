import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ScoreTable from '../components/scoring/ScoreTable';
import ScoreForm from '../components/scoring/ScoreForm';
import type { ScorePayload } from '../components/scoring/ScoreForm';
import ScoreHistory from '../components/scoring/ScoreHistory';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../context/ToastContext';
import type { Competition, CompetitionParticipant, Score, ScoreHistory as ScoreHistoryType, Team } from '../types/hutRi';
import api from '../services/api';

function ScoringPage() {
  const { notify } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [participants, setParticipants] = useState<CompetitionParticipant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [history, setHistory] = useState<ScoreHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  const current = competitions.find((c) => c.id === selectedId) || null;

  const loadCompetitions = useCallback(async () => {
    const res = await api.getCompetitions();
    if (res.success) {
      const list = Array.isArray(res.data) ? res.data : [];
      setCompetitions(list);
      const running = list.find((c) => c.status === 'RUNNING');
      if (running) setSelectedId(running.id);
    }
  }, []);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  const loadScores = useCallback(async () => {
    if (!selectedId) return;
    setError('');
    try {
      const [cpRes, teamsRes, scoresRes] = await Promise.all([
        api.getCompetitionParticipants(selectedId),
        api.getTeams(selectedId),
        api.getScores(selectedId),
      ]);
      if (cpRes.success) setParticipants(Array.isArray(cpRes.data) ? cpRes.data : []);
      if (teamsRes.success) setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      if (scoresRes.success) setScores(Array.isArray(scoresRes.data) ? scoresRes.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat skor.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) loadScores();
  }, [loadScores, selectedId]);

  const loadHistory = async () => {
    if (!selectedId) return;
    const res = await api.getScoreHistory(selectedId);
    if (res.success) setHistory(Array.isArray(res.data) ? res.data : []);
  };

  const handleSubmit = async (data: ScorePayload, reason: string) => {
    if (editingScore) {
      const res = await api.updateScore(editingScore.id, data, reason);
      if (res.success) { notify('success', 'Skor diperbarui.'); loadScores(); }
      else notify('error', res.message);
    } else {
      const res = await api.saveScore(data);
      if (res.success) { notify('success', 'Skor disimpan.'); loadScores(); }
      else notify('error', res.message);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Input Skor</h1>
          <p className="text-gray-500">Kelola skor perlombaan yang sedang berjalan.</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="filter-label" htmlFor="sc-comp">Perlombaan</label>
            <select id="sc-comp" className="input-control" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Pilih perlombaan…</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}{c.status === 'RUNNING' ? ' (Berjalan)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card><LoadingState label="Memuat skor…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={loadScores} /></Card>
      ) : !current ? (
        <Card><EmptyState title="Pilih perlombaan" description="Pilih perlombaan untuk mengelola skor." /></Card>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={loadHistory}>Riwayat Skor</Button>
            {current.status === 'RUNNING' && (
              <Button onClick={() => { setEditingScore(null); setFormOpen(true); }}>+ Tambah Skor</Button>
            )}
          </div>
          <Card className="p-0">
            <ScoreTable scores={scores} onEdit={(s) => { setEditingScore(s); setFormOpen(true); }} canManage />
          </Card>
          {history.length > 0 && (
            <Card>
              <h3 className="font-bold text-navy-900 mb-4">Riwayat Skor</h3>
              <ScoreHistory history={history} />
            </Card>
          )}
        </div>
      )}

      {current && (
        <ScoreForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingScore(null); }}
          onSubmit={handleSubmit}
          competition={current}
          participants={participants}
          teams={teams}
          editingScore={editingScore}
        />
      )}
    </Layout>
  );
}

export default ScoringPage;
