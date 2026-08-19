import type { Winner } from '../../types/hutRi';
import Badge from '../ui/Badge';

interface WinnerTableProps {
  winners: Winner[];
  onSelect: (winner: Winner) => void;
}

function formatTime(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function WinnerTable({ winners, onSelect }: WinnerTableProps) {
  if (winners.length === 0) {
    return <div className="text-center py-10 text-gray-500">Belum ada pemenang.</div>;
  }
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Departemen</th>
            <th>Kode</th>
            <th>Hadiah</th>
            <th>Waktu</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {winners.map((w) => (
            <tr key={w.id}>
              <td className="font-medium text-navy-900">🏆 {w.participantName}</td>
              <td>{w.department}</td>
              <td className="font-mono text-red-600">{w.uniqueCode}</td>
              <td className="font-semibold text-amber-600">{w.prizeName}</td>
              <td>{formatTime(w.wonAt)}</td>
              <td><Badge variant="success">{w.status}</Badge></td>
              <td>
                <button className="btn-link" onClick={() => onSelect(w)}>Detail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WinnerTable;