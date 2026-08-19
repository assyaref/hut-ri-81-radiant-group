import type { ScoreHistory as ScoreHistoryItem } from '../../types/hutRi';

interface ScoreHistoryProps {
  history: ScoreHistoryItem[];
}

function formatTime(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ScoreHistory({ history }: ScoreHistoryProps) {
  if (history.length === 0) {
    return <div className="text-center py-8 text-gray-500">Belum ada riwayat skor.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Skor Lama</th>
            <th>Skor Baru</th>
            <th>Diubah Oleh</th>
            <th>Alasan</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{formatTime(h.changedAt)}</td>
              <td>{h.previousScore ?? '—'}</td>
              <td className="font-semibold text-navy-900">{h.newScore ?? '—'}</td>
              <td>{h.changedBy}</td>
              <td>{h.reason || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScoreHistory;
