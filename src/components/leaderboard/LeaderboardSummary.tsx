import type { LeaderboardEntry } from '../../types/hutRi';

interface LeaderboardSummaryProps {
  entries: LeaderboardEntry[];
}

function LeaderboardSummary({ entries }: LeaderboardSummaryProps) {
  const competitions = new Set(entries.map((e) => e.competitionId)).size;
  const ties = entries.filter((e) => e.tie).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="stat-mini">
        <span className="stat-mini-value">{entries.length}</span>
        <span className="stat-mini-label">Total Entri</span>
      </div>
      <div className="stat-mini">
        <span className="stat-mini-value">{competitions}</span>
        <span className="stat-mini-label">Perlombaan</span>
      </div>
      <div className="stat-mini">
        <span className="stat-mini-value">{ties}</span>
        <span className="stat-mini-label">Seri Terdeteksi</span>
      </div>
    </div>
  );
}

export default LeaderboardSummary;
