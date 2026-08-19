import type { Participant } from '../../types/hutRi';
import Badge from '../ui/Badge';

interface ParticipantTableProps {
  participants: Participant[];
  onSelect: (participant: Participant) => void;
}

function formatTime(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ParticipantTable({ participants, onSelect }: ParticipantTableProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">Tidak ada peserta yang cocok.</div>
    );
  }
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Departemen</th>
            <th>Kode Unik</th>
            <th>Status</th>
            <th>Waktu Daftar</th>
            <th>Waktu Check-in</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td className="font-medium text-navy-900">{p.name}</td>
              <td>{p.department}</td>
              <td className="font-mono text-red-600">{p.uniqueCode}</td>
              <td>
                <Badge variant={p.status === 'CHECKED_IN' ? 'success' : 'warning'}>
                  {p.status}
                </Badge>
              </td>
              <td>{formatTime(p.registeredAt)}</td>
              <td>{formatTime(p.checkedInAt)}</td>
              <td>
                <button className="btn-link" onClick={() => onSelect(p)} aria-label={`Detail ${p.name}`}>
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ParticipantTable;