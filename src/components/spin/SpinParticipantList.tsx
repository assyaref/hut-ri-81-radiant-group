import type { Participant } from '../../types/hutRi';
import Badge from '../ui/Badge';

interface SpinParticipantListProps {
  participants: Participant[];
  spinning: boolean;
  winnerName: string | null;
}

function SpinParticipantList({ participants, spinning, winnerName }: SpinParticipantListProps) {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Departemen</th>
            <th>Kode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => {
            const isWinner = winnerName === p.name;
            return (
              <tr key={p.id} className={spinning ? 'row-flash' : ''}>
                <td className="font-medium text-navy-900">
                  {isWinner && <span className="mr-1">🏆</span>}
                  {p.name}
                </td>
                <td>{p.department}</td>
                <td className="font-mono text-red-600">{p.uniqueCode}</td>
                <td><Badge variant="success">{p.status}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-500">Tidak ada peserta yang eligible.</div>
      )}
    </div>
  );
}

export default SpinParticipantList;