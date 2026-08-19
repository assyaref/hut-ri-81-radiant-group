import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import LeaderboardFilters from '../components/leaderboard/LeaderboardFilters';
import LeaderboardSummary from '../components/leaderboard/LeaderboardSummary';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import { LoadingState, ErrorState } from '../components/ui/Feedback';
import type { Competition, LeaderboardEntry } from '../types/hutRi';
import api from '../services/api';

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selected, setSelected] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [lbRes, compRes] = await Promise.all([api.getLeaderboard(), api.getCompetitions()]);
      if (lbRes.success) setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : []);
      else setError(lbRes.message);
      if (compRes.success) setCompetitions(Array.isArray(compRes.data) ? compRes.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat leaderboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!selected) return leaderboard;
    return leaderboard.filter((e) => e.competitionId === selected);
  }, [leaderboard, selected]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 print-hide">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Leaderboard</h1>
          <p className="text-gray-500">Peringkat peserta dan tim dalam setiap perlombaan.</p>
        </div>
        <button className="btn-outline-small" onClick={() => window.print()}>🖨️ Cetak</button>
      </div>

      <Card className="mb-6 print-hide">
        <LeaderboardFilters competitions={competitions} selected={selected} onSelect={setSelected} />
      </Card>

      {isLoading ? (
        <Card><LoadingState label="Memuat leaderboard…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : (
        <div className="space-y-6">
          <LeaderboardSummary entries={filtered} />
          <Card className="p-0">
            <LeaderboardTable entries={filtered} />
          </Card>
        </div>
      )}
    </Layout>
  );
}

export default LeaderboardPage;
