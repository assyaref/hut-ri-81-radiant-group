import type { Score } from '../../types/hutRi';

interface ScoreTableProps {
  scores: Score[];
  onEdit: (score: Score) => void;
  canManage: boolean;
}

function formatTime(ms: number): string {
  const seconds = ms / 1000;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(mins)}:${secs.toFixed(2).padStart(5, '0')}`;
}

function ScoreTable({ scores, onEdit, canManage }: ScoreTableProps) {
  if (scores.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada skor.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Peserta / Tim</th>
            <th>Metode</th>
            <th>Nilai</th>
            {canManage && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => {
            const name = score.participantName || score.teamName || score.participantId || score.teamId || '—';
            let value = '—';
            if (score.method === 'TIME' && score.timeMs != null) value = formatTime(score.timeMs);
            else if (score.method === 'RANK' && score.rank != null) value = `Peringkat ${score.rank} (${score.score ?? 0} poin)`;
            else if (score.score != null) value = `${score.score} poin`;
            return (
              <tr key={score.id}>
                <td>{index + 1}</td>
                <td className="font-medium text-navy-900">{name}</td>
                <td>{score.method}</td>
                <td>{value}</td>
                {canManage && (
                  <td>
                    <button className="btn-link" onClick={() => onEdit(score)}>Edit</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ScoreTable;
