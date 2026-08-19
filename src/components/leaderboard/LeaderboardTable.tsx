import RankBadge from './RankBadge';
import Badge from '../ui/Badge';
import type { LeaderboardEntry } from '../../types/hutRi';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

function formatTime(ms: number): string {
  const seconds = ms / 1000;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(mins)}:${secs.toFixed(2).padStart(5, '0')}`;
}

function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada data peringkat.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Peringkat</th>
            <th>Nama / Tim</th>
            <th>Departemen</th>
            <th>Skor</th>
            <th>Perlombaan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.competitionId}-${entry.id}`}>
              <td>
                <div className="flex items-center gap-2">
                  <RankBadge rank={entry.rank} />
                </div>
              </td>
              <td className="font-medium text-navy-900">
                {entry.name}
                {entry.isTeam && <Badge variant="info" className="ml-2">Tim</Badge>}
              </td>
              <td>{entry.department || '—'}</td>
              <td className="font-semibold">
                {entry.timeMs != null ? formatTime(entry.timeMs) : `${entry.score ?? 0} poin`}
              </td>
              <td>{entry.competitionName}</td>
              <td>
                {entry.tie ? (
                  <Badge variant="warning">Seri</Badge>
                ) : (
                  <Badge variant="success">Final</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTable;
